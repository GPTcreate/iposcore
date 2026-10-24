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
  slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID,
  format = 'auto',
  responsive = true,
  className = '',
  label = '광고'
}: GoogleAdSlotProps) {
  // 실제 애드센스 클라이언트 ID (환경변수 또는 등록된 퍼블리셔 ID)
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-4909665367366825';
  const [isNativeApp, setIsNativeApp] = React.useState(false);
  const configured = process.env.NEXT_PUBLIC_ADSENSE_ADS_ENABLED === 'true'
    && !!slotId && /^\d{10}$/.test(slotId) && slotId !== '1234567890';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCapacitor = Boolean(
        (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
      );
      if (isCapacitor) {
        setIsNativeApp(true);
        return; // 앱(네이티브 웹뷰) 환경에서는 웹 애드센스 호출 억제 (구글 정책 보호)
      }

      if (adClient && configured) {
        try {
          // @ts-expect-error adsbygoogle is added by external adsense script
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
          console.error('AdSense push error:', err);
        }
      }
    }
  }, [adClient, configured]);

  if (isNativeApp || !configured) {
    // 네이티브 앱 환경에서는 인앱 배너 전용 자리 표시
    return null;
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
