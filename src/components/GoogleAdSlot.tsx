'use client';

import React, { useEffect } from 'react';

interface GoogleAdSlotProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
  label?: string;
}

export default function GoogleAdSlot({
  slotId = '1234567890',
  format = 'auto',
  responsive = true,
  className = '',
  label = '광고'
}: GoogleAdSlotProps) {
  // 실제 애드센스 클라이언트 ID (환경변수 또는 등록된 퍼블리셔 ID)
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-4909665367366825';

  useEffect(() => {
    if (adClient && typeof window !== 'undefined') {
      try {
        // @ts-expect-error adsbygoogle is added by external adsense script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    }
  }, [adClient]);

  if (!adClient) {
    // 애드센스 승인 전/개발 환경용 세련된 플레이스홀더
    return (
      <div className={`my-6 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-900/50 p-4 text-center ${className}`}>
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-neutral-500 mb-2">
          <span>{label}</span>
          <span className="font-mono text-[10px]">Google AdSense Space</span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center space-y-1">
          <p className="text-sm font-medium text-gray-600 dark:text-neutral-300">
            구글 애드센스 광고 영역
          </p>
          <p className="text-xs text-gray-400 dark:text-neutral-500">
            (승인 후 `NEXT_PUBLIC_ADSENSE_CLIENT_ID` 설정 시 실제 광고가 송출됩니다)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-6 text-center overflow-hidden ${className}`}>
      <span className="block text-[10px] text-gray-400 mb-1">{label}</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
