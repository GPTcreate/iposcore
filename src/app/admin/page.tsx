'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { CrawlChannel, CrawlJobLog } from '@/types/admin';
import { INITIAL_CHANNELS, INITIAL_LOGS } from '@/data/mockAdmin';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import {
  Settings,
  Plus,
  Play,
  RotateCw,
  Video,
  BookOpen,
  CheckCircle,
  Send,
  Users,
  Database,
  Trash2,
  ExternalLink,
  Lock,
  LogOut,
  FileSpreadsheet,
  RefreshCw,
  Download,
  Eye,
  Mail,
  X,
  Share2,
  Copy,
  Check,
  Megaphone,
  Rss,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('iposcore_admin_auth');
      if (auth === 'true') {
        setTimeout(() => setIsAuthenticated(true), 0);
      }
    }
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '7788' || pinInput.trim() === 'admin2026') {
      setIsAuthenticated(true);
      setPinError(false);
      sessionStorage.setItem('iposcore_admin_auth', 'true');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('iposcore_admin_auth');
  };

  const [channels, setChannels] = useState<CrawlChannel[]>(INITIAL_CHANNELS);
  const [logs, setLogs] = useState<CrawlJobLog[]>(INITIAL_LOGS);
  const [isCrawling, setIsCrawling] = useState(false);
  const allIpos = React.useMemo(() => getAllEffectiveIpos(), []);
  const [selectedStock, setSelectedStock] = useState(allIpos[0]?.name || '멜콘');

  // 새 채널 추가 모달 폼 상태
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'YOUTUBE' | 'BLOG'>('YOUTUBE');
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [newReliability] = useState(5);

  // 실제 뉴스레터 구독자 및 동기화 상태
  interface SubscriberItem {
    id: string;
    email: string;
    status: 'PENDING' | 'ACTIVE' | 'CANCELLED';
    frequency: 'WEEKLY' | 'ALL';
    subscribedAt: string;
    verifiedAt?: string;
    unsubscribedAt?: string;
  }

  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [subStats, setSubStats] = useState({ total: 0, active: 0, pending: 0, cancelled: 0 });
  const [integrationStatus, setIntegrationStatus] = useState({
    googleSheetWebhookConfigured: false,
    resendConfigured: false,
    smtpConfigured: false,
  });
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);
  const [sheetsSyncLoading, setSheetsSyncLoading] = useState(false);
  const [sheetsSyncResult, setSheetsSyncResult] = useState<string | null>(null);
  const [showSheetsGuide, setShowSheetsGuide] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<'verification' | 'report' | 'unsubscribe'>('verification');
  const [weeklyCronLoading, setWeeklyCronLoading] = useState(false);
  const [weeklyCronResult, setWeeklyCronResult] = useState<string | null>(null);

  // 마케팅 & 바이럴 도구 상태
  const [marketingStock, setMarketingStock] = useState('377480'); // 기본값: 멜콘
  const [marketingPlatform, setMarketingPlatform] = useState<'TISTORY' | 'CAFE' | 'KAKAO' | 'SNS'>('TISTORY');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ configured: boolean } | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramResult, setTelegramResult] = useState<string | null>(null);

  // 방문자 통계 상태 (TODAY & TOTAL)
  const [visitorStats, setVisitorStats] = useState<{ today: number; total: number }>({ today: 0, total: 0 });

  // 신규 공모주 카드 자동 생성 & DART 동기화 상태
  const [adminIpoList, setAdminIpoList] = useState<any[]>(allIpos);
  const [dartSyncLoading, setDartSyncLoading] = useState(false);
  const [dartSyncResult, setDartSyncResult] = useState<string | null>(null);
  const [isAddingIpo, setIsAddingIpo] = useState(false);
  const [manualIpoLoading, setManualIpoLoading] = useState(false);
  const [manualIpoForm, setManualIpoForm] = useState({
    name: '',
    code: '',
    market: 'KOSDAQ',
    priceBandMin: 15000,
    priceBandMax: 18000,
    subscriptionStart: '',
    subscriptionEnd: '',
    underwriterName: '한국투자증권',
  });

  const fetchIpos = async () => {
    try {
      const res = await fetch('/api/ipo');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.ipos)) {
          setAdminIpoList(data.ipos);
        }
      }
    } catch {}
  };

  const handleSyncDart = async () => {
    setDartSyncLoading(true);
    setDartSyncResult(null);
    try {
      const res = await fetch('/api/ipo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-dart', days: 30, limit: 10 }),
      });
      const data = await res.json();
      if (res.ok) {
        setDartSyncResult(`🎉 ${data.message} (현재 총 ${data.totalIposCount || adminIpoList.length}개 운영 중)`);
        fetchIpos();
      } else {
        setDartSyncResult(`❌ 동기화 실패: ${data.error || '오류'}`);
      }
    } catch {
      setDartSyncResult('❌ 네트워크 요청 실패');
    } finally {
      setDartSyncLoading(false);
    }
  };

  const handleCreateManualIpo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIpoForm.name) return;
    setManualIpoLoading(true);
    try {
      const res = await fetch('/api/ipo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...manualIpoForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setDartSyncResult(`✨ ${data.ipo.name} (${data.ipo.code}) 카드가 생성되었습니다!`);
        setIsAddingIpo(false);
        setManualIpoForm({
          name: '',
          code: '',
          market: 'KOSDAQ',
          priceBandMin: 15000,
          priceBandMax: 18000,
          subscriptionStart: '',
          subscriptionEnd: '',
          underwriterName: '한국투자증권',
        });
        fetchIpos();
      } else {
        alert(data.error || '카드 생성 실패');
      }
    } catch {
      alert('네트워크 오류');
    } finally {
      setManualIpoLoading(false);
    }
  };

  const handleDeleteIpo = async (codeOrId: string, name: string) => {
    if (!confirm(`'${name}' 공모주 카드를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/ipo?code=${codeOrId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchIpos();
      } else {
        alert('기본 내장 종목은 삭제할 수 없거나 이미 삭제되었습니다.');
      }
    } catch {
      alert('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  // 오늘 날짜 기준 (KST) 신규 및 인증 구독자 계산
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
  const todaySubscribers = subscribers.filter((s) => s.subscribedAt && s.subscribedAt.startsWith(todayStr)).length;
  const todayVerified = subscribers.filter((s) => s.verifiedAt && s.verifiedAt.startsWith(todayStr)).length;

  const fetchVisitorStats = async () => {
    try {
      const res = await fetch('/api/visitors');
      if (res.ok) {
        const data = await res.json();
        setVisitorStats({ today: data.today || 0, total: data.total || 0 });
      }
    } catch {}
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/newsletter/admin');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        setSubStats(data.stats || { total: 0, active: 0, pending: 0, cancelled: 0 });
        setIntegrationStatus({
          googleSheetWebhookConfigured: data.googleSheetWebhookConfigured,
          resendConfigured: data.resendConfigured,
          smtpConfigured: data.smtpConfigured,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      fetchSubscribers();
      fetchVisitorStats();
      fetchTelegramStatus();
      fetchIpos();
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleCancelSubscriber = async (email: string) => {
    if (!confirm(`[${email}] 님의 구독을 수동으로 수신 취소(거부) 처리하시겠습니까?`)) return;
    try {
      const res = await fetch('/api/newsletter/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MANUAL_UNSUBSCRIBE', email }),
      });
      if (res.ok) {
        alert('수신 취소 처리가 완료되었습니다.');
        fetchSubscribers();
      }
    } catch {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  const handleVerifySubscriber = async (email: string) => {
    if (!confirm(`[${email}] 님을 수동으로 구독 승인(활성화) 처리하시겠습니까?`)) return;
    try {
      const res = await fetch('/api/newsletter/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MANUAL_VERIFY', email }),
      });
      if (res.ok) {
        alert('구독 활성화 처리가 완료되었습니다.');
        fetchSubscribers();
      }
    } catch {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress) return;
    setTestEmailLoading(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/newsletter/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND_TEST_EMAIL', testTo: testEmailAddress }),
      });
      const data = await res.json();
      setTestEmailResult(data.success ? `발송 성공 (${data.mode} 모드)` : '발송 실패');
    } catch {
      setTestEmailResult('발송 요청 에러');
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleTriggerWeeklyReport = async () => {
    if (!confirm('매주 월요일 09:35 KST 정기 공모주 핵심 리포트를 활성 구독자들에게 즉시 발송하시겠습니까?')) return;
    setWeeklyCronLoading(true);
    setWeeklyCronResult(null);
    try {
      const res = await fetch('/api/cron/newsletter?manual=true');
      const data = await res.json();
      if (data.success) {
        setWeeklyCronResult(`✅ 성공: ${data.message} (${data.sentCount}건 발송)`);
      } else {
        setWeeklyCronResult(`❌ 실패: ${data.error || '발송 실패'}`);
      }
    } catch {
      setWeeklyCronResult('❌ 네트워크 요청 에러');
    } finally {
      setWeeklyCronLoading(false);
    }
  };

  const fetchTelegramStatus = async () => {
    try {
      const res = await fetch('/api/marketing/telegram');
      if (res.ok) {
        const data = await res.json();
        setTelegramStatus(data);
      }
    } catch {}
  };

  const handleSendTelegram = async () => {
    setTelegramLoading(true);
    setTelegramResult(null);
    try {
      const res = await fetch('/api/marketing/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockCode: marketingStock }),
      });
      const data = await res.json();
      if (data.success) {
        setTelegramResult(data.isSimulated ? '✅ 텔레그램 가상 전송 완료 (환경변수 설정 대기 시뮬레이션)' : '✅ 텔레그램 채널로 실시간 브리핑 전송 성공!');
      } else {
        setTelegramResult(`❌ 전송 실패: ${data.error || '오류'}`);
      }
    } catch {
      setTelegramResult('❌ 네트워크 요청 실패');
    } finally {
      setTelegramLoading(false);
    }
  };

  const selectedIpoItem = allIpos.find((i) => i.code === marketingStock || i.id === marketingStock) || allIpos[0];

  const getMarketingCopy = () => {
    const ipo = selectedIpoItem;
    if (marketingPlatform === 'CAFE') {
      return `[공모주] 이번 주 ${ipo.name} 청약 경쟁률이랑 유통물량 체크해보셨나요?

안녕하세요! 이번 주 ${ipo.name}(${ipo.code}) 공모주 청약 준비하시는 분들 계신가요?

수요예측 결과 확정 공모가가 ${ipo.confirmedPrice > 0 ? ipo.confirmedPrice.toLocaleString() + '원' : '밴드 ' + ipo.priceBandMin.toLocaleString() + '~' + ipo.priceBandMax.toLocaleString() + '원'}이고, 기관 경쟁률은 ${ipo.institutionalCompetitionRate > 0 ? ipo.institutionalCompetitionRate + ':1' : '발표 대기'}로 나왔네요.
상장일 유통가능물량이 ${ipo.circulatingSupplyRate}% 수준이라 수급은 괜찮아 보입니다.

주관사는 ${ipo.underwriters.map(u => u.name).join(', ')}이고,
AI 종합 분석 점수는 ${ipo.scoreGrade}등급 (${ipo.aiScore}점)이네요.

증거금별 비례 몇 주 배정받을지는 아래 계산기에서 바로 무료로 돌려볼 수 있더라고요.
배정 수량 미리 체크해보실 분들 참고하세요!

👉 상세 리포트: https://iposcore.kr/ipo/${ipo.code}
👉 비례 배정 계산기: https://iposcore.kr/calculator`;
    }

    if (marketingPlatform === 'KAKAO') {
      return `📢 [공모주 알리미] ${ipo.name} (${ipo.market}) 실전 브리핑

• 확정 공모가: ${ipo.confirmedPrice > 0 ? ipo.confirmedPrice.toLocaleString() + '원' : '밴드 ' + ipo.priceBandMin.toLocaleString() + '원~'}
• 기관 경쟁률: ${ipo.institutionalCompetitionRate > 0 ? ipo.institutionalCompetitionRate + ':1' : '수요예측 발표 대기'}
• AI 투자 매력도: ${ipo.scoreGrade}등급 (${ipo.aiScore}점)
• 청약 기간: ${ipo.subscriptionStart} ~ ${ipo.subscriptionEnd}
• 주관사: ${ipo.underwriters.map(u => u.name).join(', ')}

💡 1초 비례 배정 계산기 & 전문가 여론 리포트:
👉 https://iposcore.kr/ipo/${ipo.code}`;
    }

    if (marketingPlatform === 'TISTORY') {
      const priceText = ipo.confirmedPrice > 0 ? `${ipo.confirmedPrice.toLocaleString()}원 (확정)` : `${ipo.priceBandMin.toLocaleString()}원 ~ ${ipo.priceBandMax.toLocaleString()}원 (희망밴드)`;
      const compText = ipo.institutionalCompetitionRate > 0 ? `${ipo.institutionalCompetitionRate}:1` : '수요예측 발표 대기';
      const underwritersText = ipo.underwriters.map(u => u.name).join(', ') || '미정';
      return `<!-- 티스토리 글쓰기 모드: [기본모드] 또는 [HTML모드]에 그대로 붙여넣기 하시면 됩니다 -->
<h2>📌 ${ipo.name} 공모주 청약 핵심 총정리 & 수요예측 결과</h2>
<p>안녕하세요! 2026년 공모주 투자 가이드입니다. 오늘은 주목받고 있는 <strong>${ipo.name} (${ipo.market})</strong>의 청약 일정과 DART 기관 수요예측 결과, 의무보유확약, AI 종합 점수를 일목요연하게 정리해 드립니다.</p>

<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

<h3>📊 1. 핵심 공모 개요</h3>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
  <thead>
    <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
      <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">항목</th>
      <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">내용</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #fdfdfd;">공모주명</td>
      <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>${ipo.name}</strong> (${ipo.code || '시장: ' + ipo.market})</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #fdfdfd;">공모가</td>
      <td style="padding: 10px; border: 1px solid #e2e8f0; color: #2563eb; font-weight: bold;">${priceText}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #fdfdfd;">청약 일정</td>
      <td style="padding: 10px; border: 1px solid #e2e8f0;">${ipo.subscriptionStart} ~ ${ipo.subscriptionEnd}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #fdfdfd;">환불일 / 상장일</td>
      <td style="padding: 10px; border: 1px solid #e2e8f0;">환불일: ${ipo.refundDate || '미정'} / 상장일: ${ipo.listingDate || '미정'}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background: #fdfdfd;">주관사</td>
      <td style="padding: 10px; border: 1px solid #e2e8f0;">${underwritersText}</td>
    </tr>
  </tbody>
</table>

<h3>🔍 2. DART 기관 수요예측 & 유통물량 분석</h3>
<ul style="line-height: 1.8; color: #334155;">
  <li><strong>기관 경쟁률:</strong> <span style="color: #dc2626; font-weight: bold;">${compText}</span></li>
  <li><strong>의무보유확약 비율:</strong> ${ipo.lockupCommitmentRate > 0 ? ipo.lockupCommitmentRate + '%' : '확인 중'}</li>
  <li><strong>상장일 유통가능물량 비율:</strong> ${ipo.circulatingSupplyRate}% (수급 부담 수준 체크 필수)</li>
  <li><strong>AI 종합 투자 매력도:</strong> <span style="background: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${ipo.scoreGrade}등급 (${ipo.aiScore}점 / 100점)</span></li>
</ul>

<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

<h3>🧮 3. 비례 배정 계산기 & 실시간 상세 분석 리포트</h3>
<p style="line-height: 1.7;">내 투자 증거금으로 몇 주를 배정받을 수 있는지, 실시간 청약 경쟁률 추이 및 전문가 유튜브·블로그 의견 요약은 아래 공식 리포트 페이지에서 무료로 즉시 확인하실 수 있습니다.</p>

<div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 0 0 8px 0; font-weight: bold; color: #166534;">💡 ${ipo.name} 실시간 리포트 바로가기</p>
  <p style="margin: 0;"><a href="https://iposcore.kr/ipo/${ipo.code}" target="_blank" rel="noopener noreferrer" style="color: #15803d; font-weight: bold; text-decoration: underline;">👉 ${ipo.name} DART 상세 공시 & AI 점수 리포트 보기 (클릭)</a></p>
  <p style="margin: 6px 0 0 0;"><a href="https://iposcore.kr/calculator" target="_blank" rel="noopener noreferrer" style="color: #15803d; font-weight: bold; text-decoration: underline;">👉 내 증거금 맞춤 비례배정 주수 실시간 계산기 (클릭)</a></p>
</div>

<p style="color: #64748b; font-size: 13px;">※ 본 포스팅은 공모주 정보 제공 목적이며 투자의 책임은 본인에게 있습니다.</p>`;
    }

    return `#공모주 #${ipo.name} 청약 일정 & 수요예측 결과 핵심 요약 🚀

1. 확정 공모가: ${ipo.confirmedPrice > 0 ? ipo.confirmedPrice.toLocaleString() + '원' : '밴드 상단 확인'}
2. 기관 경쟁률: ${ipo.institutionalCompetitionRate > 0 ? ipo.institutionalCompetitionRate + ':1' : '발표 대기'}
3. AI 종합 매력도: ${ipo.scoreGrade}등급 (${ipo.aiScore}점)

상장일 유통물량 분석과 비례 배정 예상 주수 계산기는 아래 링크에서 확인하세요 👇
https://iposcore.kr/ipo/${ipo.code}`;
  };

  const handleCopyMarketingText = () => {
    const text = getMarketingCopy();
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleTestSheetsSync = async () => {
    setSheetsSyncLoading(true);
    setSheetsSyncResult(null);
    try {
      const res = await fetch('/api/newsletter/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TEST_SHEETS_SYNC' }),
      });
      const data = await res.json();
      setSheetsSyncResult(data.message || (data.success ? '연동 성공' : '연동 실패'));
    } catch {
      setSheetsSyncResult('요청 에러');
    } finally {
      setSheetsSyncLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (subscribers.length === 0) {
      alert('다운로드할 구독자 데이터가 없습니다.');
      return;
    }
    const headers = ['이메일', '구독상태', '수신옵션', '신청일시', '인증/동의일시', '수신취소일시'];
    const rows = subscribers.map((s) => [
      s.email,
      s.status === 'ACTIVE' ? '구독중' : s.status === 'PENDING' ? '인증대기' : '수신취소',
      s.frequency === 'WEEKLY' ? '주간브리핑' : '실시간전체',
      s.subscribedAt ? new Date(s.subscribedAt).toLocaleString('ko-KR') : '',
      s.verifiedAt ? new Date(s.verifiedAt).toLocaleString('ko-KR') : '',
      s.unsubscribedAt ? new Date(s.unsubscribedAt).toLocaleString('ko-KR') : '',
    ]);

    const csvContent = '\uFEFF' + [headers, ...rows].map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `iposcore_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 채널 활성/비활성 토글
  const toggleChannelStatus = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, isActive: !ch.isActive } : ch))
    );
  };

  // 채널 삭제
  const deleteChannel = (id: string) => {
    if (confirm('이 채널을 크롤링 대상 목록에서 삭제하시겠습니까?')) {
      setChannels((prev) => prev.filter((ch) => ch.id !== id));
    }
  };

  // 새 채널 등록
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName || !newChannelUrl) return;

    const newChannel: CrawlChannel = {
      id: `ch-${Date.now()}`,
      name: newChannelName,
      type: newChannelType,
      identifier: newChannelUrl,
      url: newChannelUrl,
      isActive: true,
      reliabilityScore: newReliability,
      lastCrawledAt: '방금 등록 (대기중)',
      collectedCount: 0,
    };

    setChannels([newChannel, ...channels]);
    setNewChannelName('');
    setNewChannelUrl('');
    setIsAddingChannel(false);
  };

  // 방법 2 자동 스케줄러 (D-1 및 신규 예정 종목 선별) 실행 트리거
  const handleTriggerMethod2Check = async () => {
    setIsCrawling(true);
    try {
      const res = await fetch('/api/cron/update?manual=true');
      const data = await res.json();

      const newLog: CrawlJobLog = {
        id: `log-${Date.now()}`,
        targetStockName: data.processedCount > 0 ? `${data.processedCount}개 종목 선별 처리` : '대상 종목 없음',
        source: '방법 2 자동 파이프라인 (청약 예정 등록 시 1회 + 청약 전날 D-1 1회)',
        status: data.success ? 'SUCCESS' : 'FAILED',
        collectedCount: data.processedCount || 0,
        timestamp: new Date().toLocaleTimeString(),
        message: data.message || `처리 ${data.processedCount || 0}건 / 스킵 ${data.skippedCount || 0}건`,
      };
      setLogs([newLog, ...logs]);
      alert(`[방법 2 파이프라인 실행 완료]\n• 선별 처리: ${data.processedCount || 0}건 (청약 전날 D-1 및 신규 등록)\n• 불필요 스킵: ${data.skippedCount || 0}건 (비용 절감)\n• DART 공시 확인: ${data.dartFilingsCount || 0}건`);
    } catch (err) {
      console.error(err);
      alert('방법 2 파이프라인 실행 중 오류가 발생했습니다.');
    } finally {
      setIsCrawling(false);
    }
  };

  // 특정 종목 수동 강제 분석 트리거
  const handleTriggerCrawl = async () => {
    setIsCrawling(true);
    try {
      const res = await fetch(`/api/cron/update?manual=true&stock=${encodeURIComponent(selectedStock)}`);
      const data = await res.json();

      const newLog: CrawlJobLog = {
        id: `log-${Date.now()}`,
        targetStockName: selectedStock,
        source: `DART 공시 및 활성 채널 ${channels.filter((c) => c.isActive).length}곳`,
        status: data.success ? 'SUCCESS' : 'FAILED',
        collectedCount: data.dartFilingsCount || 8,
        timestamp: new Date().toLocaleTimeString(),
        message: data.message || `DART 실시간 공시 동기화 및 ${selectedStock} AI 점수 재산출 완료!`,
      };
      setLogs([newLog, ...logs]);
      alert(`[${selectedStock}] 수동 즉시 분석 및 AI 점수 재산출이 완료되었습니다!`);
    } catch (err) {
      console.error(err);
      alert('크롤링 파이프라인 동기화 중 오류가 발생했습니다.');
    } finally {
      setIsCrawling(false);
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        <Header />
        <main className="max-w-md mx-auto px-4 py-16 sm:py-24">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">관리자 보안 인증</h1>
            <p className="text-xs text-gray-500 mb-6">
              공모주 알리미 리포트 관리자 전용 제어 센터입니다.<br />
              관리자 보안 PIN 번호를 입력해 주세요.
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="보안 암호 (PIN)"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError(false);
                  }}
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-center text-base font-bold tracking-widest"
                />
                {pinError && (
                  <p className="text-xs text-rose-600 mt-2 font-medium">
                    인증 암호가 일치하지 않습니다. 다시 입력해주세요.
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                관리자 제어판 접속
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 상단 타이틀 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-300 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold">
                <Settings className="w-3.5 h-3.5" />
                <span>크롤링 파이프라인 제어 센터</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="관리자 로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              관리자 제어 센터
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              전문가 채널 화이트리스트 관리, 실시간 수동 크롤링, 뉴스레터 발송 제어
            </p>
          </div>

          {/* 주요 통계 카드 (방문자 & 구독자 TODAY & TOTAL) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* 방문자 통계 */}
            <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center min-w-[110px] relative group">
              <span className="text-[11px] font-bold text-amber-800 block flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-amber-600" />
                <span>오늘 방문 (Today)</span>
              </span>
              <span className="text-xl font-black text-amber-950">{visitorStats.today.toLocaleString()}명</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="text-[10px] text-amber-700">실시간 트래픽</span>
                <button
                  type="button"
                  onClick={fetchVisitorStats}
                  className="text-amber-800 hover:text-amber-950 text-[10px] underline ml-1 cursor-pointer"
                  title="새로고침"
                >
                  ↻
                </button>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-amber-50/60 border border-amber-200 text-center min-w-[110px]">
              <span className="text-[11px] font-bold text-amber-800 block flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-amber-600" />
                <span>누적 방문 (Total)</span>
              </span>
              <span className="text-xl font-black text-amber-950">{visitorStats.total.toLocaleString()}명</span>
              <span className="text-[10px] text-amber-700 block">총 누적 방문자</span>
            </div>

            {/* 뉴스레터 구독자 통계 */}
            <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-center min-w-[100px]">
              <span className="text-[11px] font-bold text-blue-700 block">오늘 구독</span>
              <span className="text-xl font-black text-blue-900">{todaySubscribers}건</span>
              <span className="text-[10px] text-blue-600 block">인증 {todayVerified}명</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-center min-w-[100px]">
              <span className="text-[11px] font-bold text-gray-500 block">누적 구독</span>
              <span className="text-xl font-black text-gray-900">{subStats.total}건</span>
              <span className="text-[10px] text-emerald-700 font-bold block">{subStats.active}명 활성</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-center min-w-[95px]">
              <span className="text-[11px] font-bold text-gray-500 block">공모주</span>
              <span className="text-xl font-black text-blue-700">{allIpos.length}종목</span>
              <span className="text-[10px] text-gray-500 block">DART 실시간</span>
            </div>
          </div>
        </div>

        {/* 1. 방법 2 자동화 정책 및 수동 트리거 섹션 */}
        <section className="p-6 rounded-xl bg-blue-900 text-white shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-800 text-blue-200 text-[11px] font-semibold mb-1 border border-blue-700">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>방법 2 파이프라인 가동 중</span>
              </div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-blue-300" />
                <span>지능형 2단계 자동 실행 정책 (D-1 & 청약 예정)</span>
              </h2>
              <p className="text-xs text-blue-200 mt-1 max-w-xl leading-relaxed">
                매일 무차별 실행하지 않고 <strong>① 청약 예정 신규 등록 시 1회</strong>, <strong>② 청약 전날(D-1) 수요예측 확정 시 1회</strong>만 정확히 실행하여 불필요한 LLM API 비용을 $0로 방어합니다.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTriggerMethod2Check}
                disabled={isCrawling}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isCrawling ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>파이프라인 선별 실행 중...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>방법 2 스케줄러 점검</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 bg-blue-950/80 p-1 rounded-xl border border-blue-800">
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-transparent text-white text-xs font-semibold focus:outline-hidden"
                >
                  {allIpos.map((ipo) => (
                    <option key={ipo.id} value={ipo.name} className="bg-neutral-900 text-white">
                      {ipo.name} ({ipo.market})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleTriggerCrawl}
                  disabled={isCrawling}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>선택 즉시분석</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 신규 공모주 카드 자동 생성 & DART 실시간 동기화 섹션 */}
        <section className="p-6 rounded-2xl bg-white border border-gray-300 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  신규 공모주 카드 자동 생성 & DART 실시간 동기화 ({adminIpoList.length}개 카드 운영 중)
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                금융감독원 전자공시(DART)에 새로운 증권신고서가 접수되면 자동으로 감지하여 메인 페이지와 상세 분석 카드를 즉시 생성합니다.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSyncDart}
                disabled={dartSyncLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dartSyncLoading ? 'animate-spin' : ''}`} />
                <span>{dartSyncLoading ? 'DART 공시 감지 & 카드 생성 중...' : '🚀 DART 신규 공모주 자동 감지 & 카드 생성'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddingIpo(!isAddingIpo)}
                className="px-3.5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 수동 직접 등록</span>
              </button>
            </div>
          </div>

          {/* DART 동기화 결과 메시지 */}
          {dartSyncResult && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs flex items-center justify-between">
              <span>{dartSyncResult}</span>
              <button onClick={() => setDartSyncResult(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 수동 등록 폼 (토글) */}
          {isAddingIpo && (
            <form onSubmit={handleCreateManualIpo} className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>새로운 공모주 수동 등록</span>
                </span>
                <span className="text-[11px] text-gray-500">* 등록 즉시 메인 페이지 및 분석 리포트에 자동 반영됩니다.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">종목명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 루미르"
                    value={manualIpoForm.name}
                    onChange={(e) => setManualIpoForm({ ...manualIpoForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">종목코드 (6자리, 비워두면 자동부여)</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="예: 474170"
                    value={manualIpoForm.code}
                    onChange={(e) => setManualIpoForm({ ...manualIpoForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">상장 시장</label>
                  <select
                    value={manualIpoForm.market}
                    onChange={(e) => setManualIpoForm({ ...manualIpoForm, market: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-hidden"
                  >
                    <option value="KOSDAQ">KOSDAQ</option>
                    <option value="KOSPI">KOSPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">대표 주관사</label>
                  <input
                    type="text"
                    placeholder="예: 한국투자증권"
                    value={manualIpoForm.underwriterName}
                    onChange={(e) => setManualIpoForm({ ...manualIpoForm, underwriterName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">희망 공모가 최소 (원)</label>
                  <input
                    type="number"
                    value={manualIpoForm.priceBandMin}
                    onChange={(e) => setManualIpoForm({ ...manualIpoForm, priceBandMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">희망 공모가 최대 (원)</label>
                  <input
                    type="number"
                    value={manualIpoForm.priceBandMax}
                    onChange={(e) => setManualIpoForm({ ...manualIpoForm, priceBandMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">청약 시작일 (선택)</label>
                  <input
                    type="date"
                    value={manualIpoForm.subscriptionStart}
                    onChange={(e) => setManualIpoForm({ ...manualIpoForm, subscriptionStart: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">청약 마감일 (선택)</label>
                  <input
                    type="date"
                    value={manualIpoForm.subscriptionEnd}
                    onChange={(e) => setManualIpoForm({ ...manualIpoForm, subscriptionEnd: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingIpo(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-300 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={manualIpoLoading}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {manualIpoLoading ? '카드 생성 중...' : '카드 즉시 생성'}
                </button>
              </div>
            </form>
          )}

          {/* 등록된 전체 공모주 카드 목록 테이블 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600 font-bold">
              <span>운영 중인 공모주 목록 ({adminIpoList.length}건)</span>
              <span>* 카드 클릭 시 실제 웹사이트 상세 리포트로 이동합니다.</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200 sticky top-0 bg-gray-100 z-10">
                  <tr>
                    <th className="px-3 py-2.5">상태</th>
                    <th className="px-3 py-2.5">종목명 (코드)</th>
                    <th className="px-3 py-2.5">시장</th>
                    <th className="px-3 py-2.5">공모가 (밴드/확정)</th>
                    <th className="px-3 py-2.5">청약 기간</th>
                    <th className="px-3 py-2.5">주관사</th>
                    <th className="px-3 py-2.5 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {adminIpoList.map((ipo) => (
                    <tr key={ipo.code || ipo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ipo.status === 'SUBSCRIPTION' ? 'bg-red-600 text-white' :
                          ipo.status === 'UPCOMING' ? 'bg-blue-700 text-white' :
                          ipo.status === 'WAITING_LISTING' ? 'bg-gray-800 text-white' : 'bg-gray-400 text-white'
                        }`}>
                          {ipo.status === 'SUBSCRIPTION' ? '청약중' :
                           ipo.status === 'UPCOMING' ? '청약예정' :
                           ipo.status === 'WAITING_LISTING' ? '상장대기' : '상장완료'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-bold text-gray-900">
                        <a href={`/ipo/${ipo.code}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 flex items-center gap-1">
                          <span>{ipo.name}</span>
                          <span className="text-gray-400 font-normal">({ipo.code})</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 font-medium">{ipo.market}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-800">
                        {ipo.confirmedPrice > 0
                          ? `${ipo.confirmedPrice.toLocaleString()}원`
                          : `${ipo.priceBandMin.toLocaleString()}~${ipo.priceBandMax.toLocaleString()}원`}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {ipo.subscriptionStart} ~ {ipo.subscriptionEnd?.slice(5) || ''}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 truncate max-w-[140px]">
                        {ipo.underwriters.map((u: any) => u.name).join(', ')}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteIpo(ipo.code, ipo.name)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                          title="카드 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. 크롤링 대상 채널 관리 (화이트리스트) */}
        <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>전문가 채널 화이트리스트 관리 ({channels.length}개소)</span>
              </h2>
              <p className="text-xs text-gray-500">
                무차별 크롤링이 아닌 엄선된 전문가 채널만 수집하여 저작권 리스크와 노이즈(어그로 영상)를 차단합니다.
              </p>
            </div>

            <button
              onClick={() => setIsAddingChannel(!isAddingChannel)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 채널 등록</span>
            </button>
          </div>

          {/* 채널 등록 폼 (토글) */}
          {isAddingChannel && (
            <form onSubmit={handleAddChannel} className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-blue-200 dark:border-blue-900 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-500 mb-1">채널명</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 공모주연구소"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">미디어 유형</label>
                  <select
                    value={newChannelType}
                    onChange={(e) => setNewChannelType(e.target.value as 'YOUTUBE' | 'BLOG')}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  >
                    <option value="YOUTUBE">YouTube 영상 자막</option>
                    <option value="BLOG">네이버/티스토리 블로그</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 mb-1">채널 URL / RSS 주소</label>
                  <input
                    type="text"
                    required
                    placeholder="https://youtube.com/@channel_id"
                    value={newChannelUrl}
                    onChange={(e) => setNewChannelUrl(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingChannel(false)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-gray-200 dark:bg-neutral-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white"
                >
                  추가 완료
                </button>
              </div>
            </form>
          )}

          {/* 채널 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-neutral-800 text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 rounded-l-lg">유형</th>
                  <th className="px-3 py-2.5">채널명</th>
                  <th className="px-3 py-2.5">신뢰도</th>
                  <th className="px-3 py-2.5">누적 수집</th>
                  <th className="px-3 py-2.5">최근 수집 시각</th>
                  <th className="px-3 py-2.5">상태</th>
                  <th className="px-3 py-2.5 rounded-r-lg text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {channels.map((ch) => (
                  <tr key={ch.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/40">
                    <td className="px-3 py-3 font-semibold">
                      {ch.type === 'YOUTUBE' ? (
                        <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                          <Video className="w-3.5 h-3.5" />
                          <span>YouTube</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Blog</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <a
                        href={ch.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-gray-900 dark:text-white hover:text-blue-600 flex items-center gap-1"
                      >
                        <span>{ch.name}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    </td>
                    <td className="px-3 py-3 text-amber-500 font-bold">
                      {'★'.repeat(ch.reliabilityScore)}
                    </td>
                    <td className="px-3 py-3 font-mono">{ch.collectedCount}건</td>
                    <td className="px-3 py-3 text-gray-400">{ch.lastCrawledAt}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => toggleChannelStatus(ch.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          ch.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-gray-400'
                        }`}
                      >
                        {ch.isActive ? '수집 활성 (ON)' : '일시 중지 (OFF)'}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => deleteChannel(ch.id)}
                        className="p-1 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="채널 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 주간 뉴스레터 & 구독자 관리 센터 */}
        <section className="p-6 rounded-2xl bg-white border border-gray-300 shadow-2xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-700" />
                <h2 className="text-lg font-bold text-gray-900">
                  뉴스레터 & 구독자 실시간 관리
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                구글 스프레드시트 실시간 동기화, 이메일 자동 발송, 가짜 메일 필터링 및 수신 거부(취소) 내역을 관리합니다.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowSheetsGuide(!showSheetsGuide)}
                className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>구글 시트 연동 가이드</span>
              </button>
              <button
                type="button"
                onClick={handleTestSheetsSync}
                disabled={sheetsSyncLoading}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {sheetsSyncLoading ? '시트 테스트 중...' : '시트 연동 테스트'}
              </button>
              <button
                type="button"
                onClick={fetchSubscribers}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>새로고침</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                title="모바일에서도 엑셀/CSV 파일로 즉시 다운로드"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV 다운로드</span>
              </button>
            </div>
          </div>

          {/* 구글 시트 연동 가이드 박스 */}
          {showSheetsGuide && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>구글 스프레드시트 1분 연동 방법 (무료)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSheetsGuide(false)}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  ✕ 닫기
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 leading-relaxed">
                <li>구글 드라이브에서 <strong>새 스프레드시트</strong>를 만듭니다.</li>
                <li>상단 메뉴 [확장 프로그램] → <strong>[Apps Script]</strong>를 클릭합니다.</li>
                <li>프로젝트 폴더의 <code>scripts/google-sheets-script.js</code> 코드를 복사해서 붙여넣습니다.</li>
                <li>우측 상단 <strong>[배포] → [새 배포]</strong> 선택 후, 유형을 <strong>&apos;웹 앱&apos;</strong>으로 지정합니다.</li>
                <li><strong>&apos;액세스 권한&apos;을 [모든 사용자(Anyone)]</strong>로 설정하고 배포합니다.</li>
                <li>발급된 <strong>웹 앱 URL</strong>을 Vercel 환경변수 <code>GOOGLE_SHEET_WEBHOOK_URL</code>에 등록하면 끝!</li>
              </ol>
            </div>
          )}

          {sheetsSyncResult && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{sheetsSyncResult}</span>
            </div>
          )}

          {/* 구독 통계 및 연동 상태 카드 4종 (TODAY & TOTAL 포함) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-bold">TODAY (오늘)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-200 text-blue-900 font-bold">당일</span>
              </div>
              <span className="text-2xl font-black text-blue-900 mt-1 block">{todaySubscribers}건</span>
              <span className="text-[10px] text-blue-600 mt-0.5 block">오늘 인증 완료 {todayVerified}명</span>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/80">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-bold">TOTAL (누적 전체)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-800 font-bold">전체</span>
              </div>
              <span className="text-2xl font-black text-gray-900 mt-1 block">{subStats.total}건</span>
              <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">정상 활성 {subStats.active}명</span>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60">
              <div className="flex items-center justify-between">
                <span className="text-amber-800 font-bold">인증 대기 (PENDING)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">대기</span>
              </div>
              <span className="text-2xl font-black text-amber-700 mt-1 block">{subStats.pending}명</span>
              <span className="text-[10px] text-amber-600 mt-0.5 block">메일 승인 대기</span>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60">
              <div className="flex items-center justify-between">
                <span className="text-rose-800 font-bold">수신 취소 (거부)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">취소</span>
              </div>
              <span className="text-2xl font-black text-rose-700 mt-1 block">{subStats.cancelled}명</span>
              <span className="text-[10px] text-rose-600 mt-0.5 block">발송 제외됨</span>
            </div>
          </div>

          {/* 시스템 연결 상태 인디케이터 */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 font-medium">구글 시트 연동:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${integrationStatus.googleSheetWebhookConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
                {integrationStatus.googleSheetWebhookConfigured ? '🟢 실시간 연동 중' : '⚪ 미설정 (웹훅 대기)'}
              </span>
            </div>
            <div className="h-3 w-px bg-gray-300 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 font-medium">이메일 발송기:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${integrationStatus.resendConfigured ? 'bg-emerald-100 text-emerald-800' : integrationStatus.smtpConfigured ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                {integrationStatus.resendConfigured ? '🟢 Resend API 활성' : integrationStatus.smtpConfigured ? '🟢 SMTP 활성' : '🟡 시뮬레이션 모드'}
              </span>
            </div>
          </div>

          {/* 테스트 메일 발송 및 템플릿 실시간 미리보기 도구 */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between text-xs pt-1">
            <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-2 items-center w-full lg:w-auto">
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="테스트 메일 수신할 이메일 주소 입력"
                className="w-full sm:w-80 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={testEmailLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {testEmailLoading ? '발송 중...' : '테스트 메일 1건 발송'}
              </button>
              {testEmailResult && (
                <span className="text-blue-700 font-semibold">{testEmailResult}</span>
              )}
            </form>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={handleTriggerWeeklyReport}
                disabled={weeklyCronLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-emerald-700" />
                <span>{weeklyCronLoading ? '발송 중...' : '월요일 09:35 리포트 즉시 발송'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-700" />
                <span>발송 메일 문구/디자인 미리보기 (3종)</span>
              </button>
            </div>
          </div>
          {weeklyCronResult && (
            <div className="text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-800">
              {weeklyCronResult}
            </div>
          )}

          {/* 발송 이메일 템플릿 실시간 미리보기 모달 */}
          {showEmailPreviewModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>발송 이메일 템플릿 실시간 미리보기</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      구독자에게 실제로 전송되는 HTML 이메일의 문구와 레이아웃을 확인합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmailPreviewModal(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 템플릿 탭 전환 */}
                <div className="flex border-b border-gray-200 bg-gray-100/90 p-2 gap-1.5 overflow-x-auto text-xs font-bold">
                  <button
                    onClick={() => setActivePreviewTemplate('verification')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      activePreviewTemplate === 'verification'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    1. 구독 확인 & 수신 동의
                  </button>
                  <button
                    onClick={() => setActivePreviewTemplate('report')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      activePreviewTemplate === 'report'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    2. 주간 공모주 리포트
                  </button>
                  <button
                    onClick={() => setActivePreviewTemplate('unsubscribe')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      activePreviewTemplate === 'unsubscribe'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    3. 수신 거부 완료 안내
                  </button>
                  <div className="ml-auto flex items-center shrink-0">
                    <a
                      href={`/api/newsletter/preview?template=${activePreviewTemplate}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-semibold px-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>새 탭에서 전체화면 보기</span>
                    </a>
                  </div>
                </div>

                {/* 실시간 iframe 뷰어 */}
                <div className="flex-1 p-3 sm:p-4 bg-gray-100 overflow-y-auto">
                  <iframe
                    src={`/api/newsletter/preview?template=${activePreviewTemplate}`}
                    className="w-full h-[500px] rounded-xl border border-gray-300 bg-white shadow-xs"
                    title="Email Template Preview"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 실제 구독자 목록 테이블 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-600" />
                <span>구독자 명단 ({subscribers.length}건)</span>
              </h3>
              <span className="text-[11px] text-gray-500">* 수신 거부된 회원은 발송 시 자동 제외됩니다.</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2.5">이메일 주소</th>
                    <th className="px-3 py-2.5">상태</th>
                    <th className="px-3 py-2.5">수신 옵션</th>
                    <th className="px-3 py-2.5">신청 일시</th>
                    <th className="px-3 py-2.5">인증/취소 일시</th>
                    <th className="px-3 py-2.5 text-right">상태 관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                        아직 등록된 구독자가 없습니다. 메인 페이지 하단 뉴스레터 배너에서 신청해보세요!
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 font-bold text-gray-900">
                          {sub.email}
                        </td>
                        <td className="px-3 py-2.5">
                          {sub.status === 'ACTIVE' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              구독 중
                            </span>
                          )}
                          {sub.status === 'PENDING' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                              동의 대기
                            </span>
                          )}
                          {sub.status === 'CANCELLED' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-200 text-gray-600 line-through">
                              수신 취소
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">
                          {sub.frequency === 'WEEKLY' ? '주간 브리핑만' : '실시간 전체'}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">
                          {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString('ko-KR') : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">
                          {sub.status === 'ACTIVE' && sub.verifiedAt
                            ? `동의: ${new Date(sub.verifiedAt).toLocaleDateString('ko-KR')}`
                            : sub.status === 'CANCELLED' && sub.unsubscribedAt
                            ? `취소: ${new Date(sub.unsubscribedAt).toLocaleDateString('ko-KR')}`
                            : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-right space-x-1">
                          {sub.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleVerifySubscriber(sub.email)}
                              className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] cursor-pointer"
                            >
                              수동 승인
                            </button>
                          )}
                          {sub.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => handleCancelSubscriber(sub.email)}
                              className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] cursor-pointer"
                            >
                              수신 취소
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. 밴 없는 자동 마케팅 & 바이럴 허브 (Zero-Ban Growth Hub) */}
        <section className="p-6 rounded-2xl bg-white border border-gray-300 shadow-2xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  밴 없는 자동 마케팅 & 바이럴 허브 (Zero-Ban Growth)
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                계정 정지(밴) 위험이 있는 무차별 스팸 매크로 대신, 공식 API 및 고품질 정보성 바이럴로 안전하게 방문자를 유입시킵니다.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                <Rss className="w-3.5 h-3.5" />
                <span>구글/네이버 RSS 피드 가동 중</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 1. 텔레그램 공식 봇 자동 브리핑 채널 연동 */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>1. 텔레그램 채널 자동 브리핑 봇</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${telegramStatus?.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
                  {telegramStatus?.configured ? '🟢 텔레그램 연동됨' : '⚪ 토큰 미설정 (시뮬레이션)'}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[11px]">
                공식 Bot API를 사용하여 청약 시작일과 D-1에 텔레그램 채널로 실시간 요약 카드를 자동 전송합니다. (밴 위험 0%, 주식 채널 구독자 자동 유입)
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <select
                  value={marketingStock}
                  onChange={(e) => setMarketingStock(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold focus:outline-hidden"
                >
                  {allIpos.map((i) => (
                    <option key={i.code} value={i.code}>
                      {i.name} ({i.status === 'SUBSCRIPTION' ? '청약중' : i.status === 'UPCOMING' ? '예정' : i.status === 'WAITING_LISTING' ? '상장대기' : '상장완료'})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSendTelegram}
                  disabled={telegramLoading}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {telegramLoading ? '전송 중...' : '📢 텔레그램 채널로 즉시 전송'}
                </button>
              </div>

              {telegramResult && (
                <div className="p-2 rounded bg-white border border-gray-200 text-gray-800 font-semibold text-[11px]">
                  {telegramResult}
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-white border border-gray-200 text-[10px] text-gray-500 leading-relaxed">
                💡 <strong>세팅 팁:</strong> 텔레그램에서 <code>@BotFather</code>로 봇을 만든 후, Vercel 환경변수에 <code>TELEGRAM_BOT_TOKEN</code>과 채널 ID인 <code>TELEGRAM_CHAT_ID</code>를 넣으면 실시간 자동 브리핑이 가동됩니다.
              </div>
            </div>

            {/* 2. 커뮤니티 밴 방지 바이럴 텍스트 1초 복사기 */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                  <Copy className="w-4 h-4 text-indigo-600" />
                  <span>2. 커뮤니티 밴 방지 바이럴 텍스트 1초 복사기</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                  스팸 필터 0% 회피
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[11px]">
                스팸 금지어가 없는 자연스러운 투자자 어조의 정보글입니다. 버튼 하나로 복사해 네이버 카페(월재연, 뽐뿌), 카톡 주식방에 붙여넣으면 강퇴 없이 강력한 유입이 발생합니다.
              </p>

              {/* 플랫폼 선택 탭 */}
              <div className="flex gap-1 bg-gray-200/80 p-1 rounded-lg font-bold text-[11px]">
                <button
                  type="button"
                  onClick={() => setMarketingPlatform('TISTORY')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${marketingPlatform === 'TISTORY' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  📝 티스토리 블로그용 (완성 서식)
                </button>
                <button
                  type="button"
                  onClick={() => setMarketingPlatform('CAFE')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${marketingPlatform === 'CAFE' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  네이버 카페/뽐뿌용 (정보글)
                </button>
                <button
                  type="button"
                  onClick={() => setMarketingPlatform('KAKAO')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${marketingPlatform === 'KAKAO' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  카톡 단톡방용 (3줄 브리핑)
                </button>
                <button
                  type="button"
                  onClick={() => setMarketingPlatform('SNS')}
                  className={`flex-1 py-1 rounded transition-colors cursor-pointer ${marketingPlatform === 'SNS' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  SNS/숏폼
                </button>
              </div>

              {/* 생성된 텍스트 미리보기 박스 */}
              <div className="relative">
                <textarea
                  readOnly
                  value={getMarketingCopy()}
                  rows={6}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-mono text-[11px] text-gray-800 focus:outline-hidden leading-relaxed resize-none"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  {marketingPlatform === 'TISTORY' && (
                    <a
                      href="https://www.tistory.com/member/blog"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>티스토리 글쓰기 열기</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyMarketingText}
                    className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                  >
                    {copyFeedback ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>1초 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 검색엔진 SEO & 유기적 유입 상태 안내 */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <strong className="text-indigo-950 font-bold block">
                🌐 네이버 & 구글 자동 검색 색인 피드 (밴 위험 0% 완전 유기적 트래픽)
              </strong>
              <p className="text-indigo-800 text-[11px]">
                새로운 공모주 카드가 등록될 때마다 네이버 서치어드바이저와 구글 검색엔진에 실시간으로 RSS가 공급됩니다.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/rss.xml"
                target="_blank"
                className="px-3 py-1.5 rounded-lg bg-white border border-indigo-300 text-indigo-700 font-bold text-[11px] hover:bg-indigo-50 transition-colors flex items-center gap-1"
              >
                <span>/rss.xml 피드 보기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/sitemap.xml"
                target="_blank"
                className="px-3 py-1.5 rounded-lg bg-white border border-indigo-300 text-indigo-700 font-bold text-[11px] hover:bg-indigo-50 transition-colors flex items-center gap-1"
              >
                <span>/sitemap.xml 보기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* 5. 최근 수집 및 파이프라인 작업 로그 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>크롤링 & AI 엔진 실행 로그 (실시간)</span>
          </h2>

          <div className="space-y-2 text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                    {log.targetStockName}
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-neutral-300">
                    {log.message}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                  <span>{log.source}</span>
                  <span>·</span>
                  <span className="font-mono">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
