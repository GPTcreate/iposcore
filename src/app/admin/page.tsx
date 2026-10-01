'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { CrawlChannel, CrawlJobLog } from '@/types/admin';
import { INITIAL_CHANNELS, INITIAL_LOGS } from '@/data/mockAdmin';
import { MOCK_IPOS } from '@/data/mockIpo';
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
  const [selectedStock, setSelectedStock] = useState(MOCK_IPOS[0].name);

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
    verificationToken: string;
    unsubscribeToken: string;
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

  const handleVerifySubscriber = async (token: string, email: string) => {
    if (!confirm(`[${email}] 님을 수동으로 구독 승인(활성화) 처리하시겠습니까?`)) return;
    try {
      const res = await fetch('/api/newsletter/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MANUAL_VERIFY', token }),
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

  // 수동 크롤링 & 실시간 점수 재산출 실행 트리거
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
      alert(`[${selectedStock}] DART 공시 동기화 및 AI 점수 재산출이 완료되었습니다!`);
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

          {/* 주요 통계 카드 */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-center">
              <span className="text-[11px] text-gray-500 block">등록 채널</span>
              <span className="text-lg font-black text-blue-700">{channels.length}개</span>
            </div>
            <div className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-center">
              <span className="text-[11px] text-gray-500 block">뉴스레터 구독자</span>
              <span className="text-lg font-black text-emerald-700">142명</span>
            </div>
          </div>
        </div>

        {/* 1. 수동 즉시 크롤링 & AI 점수 재산출 섹션 */}
        <section className="p-6 rounded-xl bg-blue-900 text-white shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-blue-300" />
                <span>원클릭 수동 크롤링 & 점수 재산출</span>
              </h2>
              <p className="text-xs text-blue-200 mt-1">
                종목을 선택하고 실행하시면 최신 전문가 유튜브/블로그 글을 즉시 수집하여 점수를 갱신합니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="px-3 py-2 rounded-lg bg-blue-950 border border-blue-700 text-white text-xs font-semibold focus:outline-hidden"
              >
                {MOCK_IPOS.map((ipo) => (
                  <option key={ipo.id} value={ipo.name} className="bg-neutral-900 text-white">
                    {ipo.name} ({ipo.market})
                  </option>
                ))}
              </select>

              <button
                onClick={handleTriggerCrawl}
                disabled={isCrawling}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isCrawling ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI 수집 및 분석 중...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>지금 즉시 실행</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* 2. 크롤링 대상 채널 관리 (화이트리스트) */}
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

          {/* 구독 통계 및 연동 상태 카드 4종 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/80">
              <span className="text-gray-500 block font-medium">총 신청 이메일</span>
              <span className="text-xl font-black text-gray-900 mt-0.5 block">{subStats.total}건</span>
              <span className="text-[10px] text-gray-400 mt-1 block">누적 등록</span>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
              <span className="text-emerald-800 block font-medium">정상 구독 중 (동의완료)</span>
              <span className="text-xl font-black text-emerald-700 mt-0.5 block">{subStats.active}명</span>
              <span className="text-[10px] text-emerald-600 mt-1 block">정기 발송 대상</span>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60">
              <span className="text-amber-800 block font-medium">동의 대기 (PENDING)</span>
              <span className="text-xl font-black text-amber-700 mt-0.5 block">{subStats.pending}명</span>
              <span className="text-[10px] text-amber-600 mt-1 block">메일 인증 대기</span>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60">
              <span className="text-rose-800 block font-medium">수신 취소 (거부)</span>
              <span className="text-xl font-black text-rose-700 mt-0.5 block">{subStats.cancelled}명</span>
              <span className="text-[10px] text-rose-600 mt-1 block">발송 제외됨</span>
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

          {/* 테스트 메일 즉시 발송 도구 */}
          <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-2 items-center text-xs">
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
                              onClick={() => handleVerifySubscriber(sub.verificationToken, sub.email)}
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

        {/* 4. 최근 수집 및 파이프라인 작업 로그 */}
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
