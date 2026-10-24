'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function AdSenseLoader({ client }: { client: string }) {
  const pathname = usePathname();
  // Keep verification metadata global; load advertising only on substantive public content.
  const eligible = pathname === '/' || pathname === '/calculator' || /^\/guides\/[^/]+$/.test(pathname);
  if (process.env.NEXT_PUBLIC_ADSENSE_ADS_ENABLED !== 'true' || !eligible || !/^ca-pub-\d{16}$/.test(client)) return null;
  return <Script id="adsense-loader" strategy="afterInteractive" async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`} crossOrigin="anonymous" />;
}
