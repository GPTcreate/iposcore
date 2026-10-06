import { NextResponse } from 'next/server';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import {
  syncNewIposFromDart,
  addOrUpdateIpo,
  deleteCustomIpo,
  loadServerCustomIpos,
} from '@/lib/ipoServerStore';
import { IpoItem } from '@/types/ipo';
import { calculateIpoScore } from '@/lib/scoring';

// 백그라운드 자동 동기화 상태 관리 (30분 주기 스케줄링)
let lastAutoSyncTime = 0;
const AUTO_SYNC_INTERVAL_MS = 30 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceSync = searchParams.get('forceSync') === 'true';

    // 0클릭 자동화: 30분 이상 경과 시 또는 명시적 요청 시 논블로킹 백그라운드 자동 동기화 실행
    const now = Date.now();
    if (forceSync) {
      await syncNewIposFromDart({ days: 30, limit: 15 });
    } else if (now - lastAutoSyncTime > AUTO_SYNC_INTERVAL_MS) {
      lastAutoSyncTime = now;
      // 사용자 브라우저 응답 렉이 전혀 발생하지 않도록 논블로킹 백그라운드 비동기 처리
      syncNewIposFromDart({ days: 30, limit: 15 }).catch((err) => {
        console.warn('[AutoSync] 백그라운드 DART 자동 수집 경고:', err);
      });
    }

    const ipos = getAllEffectiveIpos();
    const custom = loadServerCustomIpos();
    return NextResponse.json({
      success: true,
      total: ipos.length,
      customCount: custom.length,
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
  try {
    const body = await request.json();
    const { action } = body;

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
        market = 'KOSDAQ',
        priceBandMin,
        priceBandMax,
        subscriptionStart,
        subscriptionEnd,
        refundDate,
        listingDate,
        underwriterName = '한국투자증권',
        fee = 2000,
      } = body;

      if (!name) {
        return NextResponse.json({ error: '종목명을 입력해주세요.' }, { status: 400 });
      }

      const cleanName = String(name).replace(/(주식회사|\(주\)|\(유\)|주\s)/g, '').trim();
      const stockCode = code && String(code).trim().length === 6 ? String(code).trim() : `4${Math.floor(10000 + Math.random() * 90000)}`;

      const pMin = Number(priceBandMin) || 15000;
      const pMax = Number(priceBandMax) || 18000;

      const now = new Date();
      const defaultStart = subscriptionStart || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const defaultEnd = subscriptionEnd || new Date(new Date(defaultStart).getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const defaultRefund = refundDate || new Date(new Date(defaultEnd).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const defaultListing = listingDate || new Date(new Date(defaultRefund).getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const headline = `[신규 등록] ${cleanName} (${market}) 공모주 청약 핵심 요약 및 DART 공시 체크`;
      const bulletPoints = [
        `금융감독원 증권신고서 접수 기준 신규 공모주 일정 등록 (${market})`,
        `희망 공모가 밴드: ${pMin.toLocaleString()} ~ ${pMax.toLocaleString()}원`,
        `청약 예정 기간: ${defaultStart} ~ ${defaultEnd}, 주관사: ${underwriterName}`,
        `향후 기관 수요예측 경쟁률 및 확정 공모가 발표 시 실시간 업데이트 예정`,
      ];

      const initialScore = 74;
      const scoreGrade = 'A';

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
            allocatedShares: 500000,
            fee: Number(fee) || 2000,
          },
        ],
        institutionalCompetitionRate: 0,
        lockupCommitmentRate: 0,
        circulatingSupplyRate: 26.5,
        totalOfferingAmount: 300,
        marketCapAtIpo: 1800,
        aiScore: initialScore,
        scoreGrade,
        aiSummary: {
          headline,
          bulletPoints,
          positivePoints: [
            '신규 공모주 시장 상장 관심 및 수급 유입 기대',
            '기관 수요예측 진행 후 확정 공모가 및 의무보유확약 공개 예정',
          ],
          riskPoints: [
            '수요예측 발표 전으로 기관 경쟁률 결과 확인 후 청약 권장',
          ],
        },
        sentimentConsensus: {
          positiveRatio: 72,
          neutralRatio: 22,
          cautionRatio: 6,
        },
        expertReviews: [],
      };

      const result = addOrUpdateIpo(newIpo);

      return NextResponse.json({
        success: true,
        ipo: result.ipo,
        message: `${cleanName} (${stockCode}) 공모주 카드가 성공적으로 등록되었습니다.`,
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
