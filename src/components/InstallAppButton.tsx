'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // 1. 이미 앱(standalone)으로 실행 중인지 검사
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // 2. iOS Safari 감지
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // 3. Android / Chrome / Edge 등의 PWA 설치 이벤트 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsSupported(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Safari의 경우 안내 버튼으로 지원
    if (isIosDevice) {
      setIsSupported(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // PWA 프롬프트가 아직 준비되지 않은 일반 브라우저 환경에서는 즐겨찾기 또는 안내
      alert('스마트폰 브라우저 메뉴(⋮)에서 [홈 화면에 추가] 또는 [앱 설치]를 누르시면 앱으로 설치됩니다.');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsSupported(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('앱 설치 프롬프트 오류:', err);
    }
  };

  // 이미 설치되어 앱으로 보고 있거나 지원되지 않는 환경이면 렌더링 안 함
  if (isStandalone || !isSupported) {
    return null;
  }

  return (
    <>
      {/* 헤더의 세련되고 조용한 원클릭 앱 설치 버튼 (팝업 없음) */}
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
        title="홈 화면에 추가하여 앱처럼 편리하게 이용하기"
      >
        <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="hidden sm:inline">앱 설치</span>
        <span className="sm:hidden">앱</span>
      </button>

      {/* iOS Safari 사용자를 위한 단정하고 깔끔한 안내 모달 (버튼 클릭 시에만 노출) */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                  공
                </div>
                <h3 className="font-bold text-gray-900 text-sm">아이폰에 앱 설치하기</h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <p className="leading-relaxed">
                  사파리(Safari) 화면 맨 하단의 <strong className="text-gray-900">[공유 버튼 <Share className="w-3 h-3 inline text-blue-600" />]</strong>을 탭합니다.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <p className="leading-relaxed">
                  메뉴를 아래로 내려 <strong className="text-gray-900">[홈 화면에 추가]</strong>를 누르시면 스마트폰 바탕화면에 앱 아이콘이 바로 생성됩니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
