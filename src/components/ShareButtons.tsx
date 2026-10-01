'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonsProps {
  stockName: string;
  aiScore: number;
}

export default function ShareButtons({ stockName, aiScore }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `[공모주 분석] ${stockName} - 종합 ${aiScore}점`,
          text: `${stockName} 공모주 기관 수요예측 결과 및 전문가 AI 분석 요약을 확인해보세요.`,
          url: window.location.href,
        });
      } catch {
        // 취소된 경우 무시
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
        title="공유하기"
      >
        <Share2 className="w-3.5 h-3.5 text-blue-700" />
        <span>공유하기</span>
      </button>

      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
        title="링크 복사"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">복사 완료!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-gray-500" />
            <span>링크 복사</span>
          </>
        )}
      </button>
    </div>
  );
}
