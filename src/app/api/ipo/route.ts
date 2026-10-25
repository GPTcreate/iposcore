import { NextResponse } from 'next/server';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import {
  syncNewIposFromDart,
  addOrUpdateIpo,
  deleteCustomIpo,
  loadServerCustomIpos,
} from '@/lib/ipoServerStore';
import { syncListingReturnsForIpos } from '@/lib/stockPriceCrawler';
import { crossCheckAndSyncIpos } from '@/lib/crossCheckSync';
import { IpoItem } from '@/types/ipo';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { isPublicIpo, toPublicIpo } from '@/lib/publicIpo';
import { loadServerReviewArchive } from '@/lib/reviewArchiveServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceSync = searchParams.get('forceSync') === 'true';

    // 명시적 forceSync 요청 시에만 실행 (정기 동기화는 일 1회 Vercel Cron /api/cron/update 에서 전담)
    const auth = verifyAdminRequest(request);
    if (forceSync && !auth.authorized) {
      return NextResponse.json({ error: '동기화에는 관리자 권한이 필요합니다.' }, { status: 401 });
    }
    if (forceSync) {
      await syncNewIposFromDart({ days: 30, limit: 15 });
      await syncListingReturnsForIpos();
      await crossCheckAndSyncIpos();
    }

    const custom = loadServerCustomIpos();
    loadServerReviewArchive();
    const allIpos = getAllEffectiveIpos();
    const ipos = auth.authorized ? allIpos : allIpos.filter(isPublicIpo).map(toPublicIpo);
    return NextResponse.json({
      success: true,
      total: ipos.length,
      ...(auth.authorized ? { customCount: custom.length } : {}),
      ipos,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '데이터 조회 실패' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    // 1-1. 상장일 실전 체결가(시초가/종가) 거래소 자동 크롤링 동기화
    if (action === 'sync-prices') {
      const forceAll = Boolean(body.forceAll);
      const targetCode = body.targetCode ? String(body.targetCode).trim() : undefined;
      const result = await syncListingReturnsForIpos({ forceAll, targetCode });
      return NextResponse.json(result);
    }

    // 1-2. 외부 포털 2중 교차 검증 (DART + 38커뮤니케이션) 자가 치유 동기화
    if (action === 'sync-crosscheck') {
      const result = await crossCheckAndSyncIpos();
      return NextResponse.json(result);
    }

    // 1-2. 개별 종목 실전 시초가·종가 수동 수정/입력
    if (action === 'update-returns') {
      const { code, openingPrice, closingPrice } = body;
      if (!code) {
        return NextResponse.json({ error: '종목코드를 입력해주세요.' }, { status: 400 });
      }

      const all = getAllEffectiveIpos();
      const target = all.find((i) => i.code === code || i.id === code);
      if (!target) {
        return NextResponse.json({ error: '해당 종목을 찾을 수 없습니다.' }, { status: 404 });
      }

      const open = Number(openingPrice) || 0;
      const close = Number(closingPrice) || 0;
      const confirmed = target.confirmedPrice || 1;

      const openRate = Number((((open - confirmed) / confirmed) * 100).toFixed(1));
      const closeRate = Number((((close - confirmed) / confirmed) * 100).toFixed(1));

      const updated: IpoItem = {
        ...target,
        status: 'LISTED',
        openingPrice: open,
        openingReturnRate: openRate,
        closingPrice: close,
        closingReturnRate: closeRate,
      };

      if (updated.aiSummary) {
        const signOpen = openRate > 0 ? `+${openRate}%` : `${openRate}%`;
        const signClose = closeRate > 0 ? `+${closeRate}%` : `${closeRate}%`;
        updated.aiSummary.headline = `${target.name} 상장 완료! 시초가 ${open.toLocaleString()}원(${signOpen}), 종가 ${close.toLocaleString()}원(${signClose}) 기록`;
      }

      const result = addOrUpdateIpo(updated);
      return NextResponse.json({
        success: true,
        ipo: result.ipo,
        message: `${target.name} (${code}) 실전 시초가/종가 데이터가 저장되었습니다.`,
      });
    }

    // 1. DART 전자공시 실시간 자동 동기화 (신규 공모주 감지 & 카드 자동 생성)
    if (action === 'sync-dart') {
      const days = typeof body.days === 'number' ? body.days : 30;
      const limit = typeof body.limit === 'number' ? body.limit : 15;

      const syncResult = await syncNewIposFromDart({ days, limit });
      const currentAll = getAllEffectiveIpos();

      return NextResponse.json({
        success: true,
        ...syncResult,
        totalIposCount: currentAll.length,
      });
    }

    // 2. 수동 직접 등록 (어드민 또는 사용자 요청)
    if (action === 'create' || !action) {
      const {
        name,
        code,
        market,
        priceBandMin,
        priceBandMax,
        subscriptionStart,
        subscriptionEnd,
        refundDate,
        listingDate,
        underwriterName,
        fee,
      } = body;

      const validDate = (value: unknown): value is string => typeof value === 'string'
        && /^\d{4}-\d{2}-\d{2}$/.test(value)
        && Number.isFinite(Date.parse(value))
        && new Date(value).toISOString().slice(0, 10) === value;
      if (typeof name !== 'string' || !name.trim() || typeof code !== 'string' || !/^\d{6}$/.test(code)
        || !['KOSPI', 'KOSDAQ'].includes(market)
        || typeof underwriterName !== 'string' || !underwriterName.trim()
        || !Number.isFinite(Number(priceBandMin)) || Number(priceBandMin) <= 0
        || !Number.isFinite(Number(priceBandMax)) || Number(priceBandMax) < Number(priceBandMin)
        || fee === undefined || !Number.isFinite(Number(fee)) || Number(fee) < 0
        || !validDate(subscriptionStart) || !validDate(subscriptionEnd) || !validDate(refundDate)
        || subscriptionStart > subscriptionEnd || subscriptionEnd > refundDate
        || (listingDate && (!validDate(listingDate) || listingDate < refundDate))) {
        return NextResponse.json({ error: '확인된 종목명·6자리 코드·시장·공모밴드·주관사·수수료·청약/환불일을 입력하세요. 없는 값은 자동 생성하지 않습니다.' }, { status: 400 });
      }
      const cleanName = name.replace(/(주식회사|\(주\)|\(유\)|주\s)/g, '').trim();
      const stockCode = code;
      const pMin = Number(priceBandMin);
      const pMax = Number(priceBandMax);
      const defaultStart = subscriptionStart;
      const defaultEnd = subscriptionEnd;
      const defaultRefund = refundDate;
      const defaultListing = listingDate || undefined;

      const newIpo: IpoItem = {
        id: cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || `ipo-${stockCode}`,
        name: cleanName,
        code: stockCode,
        market: market === 'KOSPI' ? 'KOSPI' : 'KOSDAQ',
        status: 'UPCOMING',
        subscriptionStart: defaultStart,
        subscriptionEnd: defaultEnd,
        refundDate: defaultRefund,
        listingDate: defaultListing,
        priceBandMin: pMin,
        priceBandMax: pMax,
        confirmedPrice: 0,
        underwriters: [
          {
            name: underwriterName,
            allocatedShares: 0,
            fee: Number(fee),
          },
        ],
        institutionalCompetitionRate: 0,
        lockupCommitmentRate: 0,
        circulatingSupplyRate: 0,
        totalOfferingAmount: 0,
        marketCapAtIpo: 0,
        aiScore: 0,
        scoreGrade: 'C',
        dataQuality: { status: 'unverified' },
        aiSummary: {
          headline: '원문 확인 대기',
          bulletPoints: [],
          positivePoints: [],
          riskPoints: ['공식 원문과 수치 검토를 마치기 전에는 공개하지 않습니다.'],
        },
        sentimentConsensus: { positiveRatio: 0, neutralRatio: 0, cautionRatio: 0 },
        expertReviews: [],
      };

      const result = addOrUpdateIpo(newIpo);

      return NextResponse.json({
        success: true,
        ipo: result.ipo,
        message: `${cleanName} (${stockCode}) 검증 대기 자료로 저장되었습니다. 공개 전 원문과 수치를 검토해야 합니다.`,
      });
    }

    return NextResponse.json({ error: '유효하지 않은 action 파라미터입니다.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '작업 처리 중 오류 발생' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const idOrCode = searchParams.get('id') || searchParams.get('code');

    if (!idOrCode) {
      return NextResponse.json({ error: '삭제할 종목 코드 또는 ID가 필요합니다.' }, { status: 400 });
    }

    const deleted = deleteCustomIpo(idOrCode);
    if (!deleted) {
      return NextResponse.json({ error: '해당 커스텀 종목을 찾을 수 없거나 삭제할 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '정상적으로 삭제되었습니다.' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '삭제 처리 중 오류 발생' },
      { status: 500 }
    );
  }
}
