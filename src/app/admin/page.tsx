'use client';

import React, { useState } from 'react';
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
  XCircle,
  AlertCircle,
  Send,
  Users,
  Database,
  Trash2,
  ExternalLink
} from 'lucide-react';

export default function AdminPage() {
  const [channels, setChannels] = useState<CrawlChannel[]>(INITIAL_CHANNELS);
  const [logs, setLogs] = useState<CrawlJobLog[]>(INITIAL_LOGS);
  const [isCrawling, setIsCrawling] = useState(false);
  const [selectedStock, setSelectedStock] = useState(MOCK_IPOS[0].name);

  // 새 채널 추가 모달 폼 상태
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'YOUTUBE' | 'BLOG'>('YOUTUBE');
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [newReliability, setNewReliability] = useState(5);

  // 뉴스레터 발송 상태
  const [newsletterSending, setNewsletterSending] = useState(false);
  const [newsletterSent, setNewsletterSent] = useState(false);

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

  // 수동 크롤링 실행 트리거
  const handleTriggerCrawl = () => {
    setIsCrawling(true);

    setTimeout(() => {
      setIsCrawling(false);
      const newLog: CrawlJobLog = {
        id: `log-${Date.now()}`,
        targetStockName: selectedStock,
        source: `활성 채널 ${channels.filter((c) => c.isActive).length}곳 (유튜브/블로그)`,
        status: 'SUCCESS',
        collectedCount: Math.floor(Math.random() * 5) + 3,
        timestamp: new Date().toLocaleTimeString(),
        message: `최신 자막 및 글 추출 완료 → Gemini 2.5 감성 분석 및 ${selectedStock} AI 점수 재산출 완료!`,
      };
      setLogs([newLog, ...logs]);
      alert(`[${selectedStock}] 수동 크롤링 및 AI 점수 재산출이 완료되었습니다!`);
    }, 2000);
  };

  // 뉴스레터 발송 시뮬레이션
  const handleSendNewsletter = () => {
    if (!confirm('현재 등록된 142명의 구독자에게 이번 주 공모주 브리핑을 발송하시겠습니까?')) return;
    setNewsletterSending(true);
    setTimeout(() => {
      setNewsletterSending(false);
      setNewsletterSent(true);
      setTimeout(() => setNewsletterSent(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 상단 타이틀 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-300 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold mb-2">
              <Settings className="w-3.5 h-3.5" />
              <span>크롤링 파이프라인 제어 센터</span>
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

        {/* 3. 주간 뉴스레터 발송 제어 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>뉴스레터 발송 센터 (수신자: 142명)</span>
              </h2>
              <p className="text-xs text-gray-500">
                매주 월요일 아침 8시 자동 발송 외에, 긴급 공모주 속보나 테스트 메일을 즉시 발송할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/python_pipeline/weekly_newsletter_sample.html"
                target="_blank"
                className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-neutral-700 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 transition-colors"
              >
                메일 템플릿 미리보기
              </a>
              <button
                onClick={handleSendNewsletter}
                disabled={newsletterSending}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {newsletterSending ? (
                  <span>발송 진행 중...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>전체 구독자 발송</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {newsletterSent && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>142명의 구독자에게 이메일 브리핑 발송이 정상적으로 트리거되었습니다.</span>
            </div>
          )}
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
