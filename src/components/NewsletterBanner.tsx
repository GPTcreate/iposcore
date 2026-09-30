'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle, Bell, ArrowRight, ShieldCheck } from 'lucide-react';

export default function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'WEEKLY' | 'ALL'>('ALL');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('정확한 이메일 주소를 입력해주세요.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, frequency }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || '신청이 정상 접수되었습니다. 다음 주 월요일 아침 브리핑을 보내드립니다.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || '신청 처리 중 문제가 발생했습니다.');
      }
    } catch {
      setStatus('error');
      setMessage('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <section id="newsletter-section" className="my-10 rounded-2xl border border-gray-300 bg-gray-50 p-6 sm:p-8">
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
          <Bell className="w-3.5 h-3.5 text-blue-700" />
          <span>청약 일정 놓치지 마세요</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          매주 월요일 아침, 이번 주 공모주 핵심 리포트를 무료로 받아보세요
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
          기관 수요예측 결과와 공모주 전문 유튜버들의 의견을 정리한 요약본을 보내드립니다.
        </p>

        {status === 'success' ? (
          <div className="p-5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex flex-col items-center gap-1.5">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <span className="font-bold text-base">알림 신청 완료</span>
            <p className="text-xs text-emerald-700">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소 입력 (예: name@naver.com)"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm focus:border-blue-600 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-5 py-2.5 rounded-lg font-bold text-sm bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50 cursor-pointer"
              >
                {status === 'loading' ? (
                  <span>접수 중...</span>
                ) : (
                  <>
                    <span>무료 신청하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* 수신 옵션 선택 */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value="ALL"
                  checked={frequency === 'ALL'}
                  onChange={() => setFrequency('ALL')}
                  className="text-blue-700 focus:ring-0"
                />
                <span>주간 브리핑 + 청약 D-1 알림 (추천)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value="WEEKLY"
                  checked={frequency === 'WEEKLY'}
                  onChange={() => setFrequency('WEEKLY')}
                  className="text-blue-700 focus:ring-0"
                />
                <span>주간 브리핑만</span>
              </label>
            </div>

            {status === 'error' && (
              <p className="text-xs text-rose-600 font-semibold">{message}</p>
            )}

            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>언제든지 클릭 한 번으로 수신 거부하실 수 있습니다.</span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
