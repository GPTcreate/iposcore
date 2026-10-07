export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-SZCS9GN9SN';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// 페이지뷰 수동 전송 (필요 시)
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// 커스텀 이벤트 전송
export const event = (action: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};
