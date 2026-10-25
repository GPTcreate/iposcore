import React from 'react';
import type { ScoreBasis } from '../lib/scoring';

interface ScoreBadgeProps {
  score: number;
  grade: 'S' | 'A' | 'B' | 'C';
  size?: 'sm' | 'md' | 'lg';
  isPendingForecast?: boolean;
  isVerified?: boolean;
  basis?: ScoreBasis;
  sampleSize?: number;
}

export default function ScoreBadge({
  score,
  grade,
  size = 'md',
  isPendingForecast = false,
  isVerified = false,
  basis = 'QUANTITATIVE',
  sampleSize = 0,
}: ScoreBadgeProps) {
  const isHeld = !isVerified || isPendingForecast || basis === 'PENDING' || !Number.isFinite(score) || score < 0 || score > 100;
  const combined = basis === 'COMBINED' && Number.isFinite(sampleSize) && sampleSize > 0;
  const basisLabel = combined ? '공시+리뷰 참고점수' : '공시 참고점수';
  const getGradeInfo = () => {
    if (isHeld) {
      return {
        label: '산출 보류',
        textColor: 'text-slate-700',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        badgeColor: 'bg-slate-600 text-white',
      };
    }

    switch (grade) {
      case 'S':
        return {
          label: '85점 이상 구간',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          badgeColor: 'bg-emerald-600 text-white',
        };
      case 'A':
        return {
          label: '75~84점 구간',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeColor: 'bg-blue-600 text-white',
        };
      case 'B':
        return {
          label: '60~74점 구간',
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          badgeColor: 'bg-amber-600 text-white',
        };
      case 'C':
        return {
          label: '60점 미만 구간',
          textColor: 'text-rose-700',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          badgeColor: 'bg-rose-600 text-white',
        };
    }
  };

  const info = getGradeInfo();

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${info.bgColor} ${info.textColor} ${info.borderColor}`}>
        {!isHeld && <><span>{basisLabel} {score}점</span><span className="opacity-70">|</span></>}
        <span>{isHeld ? info.label : grade + ' 구간'}</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 sm:p-5 rounded-xl border ${info.borderColor} ${info.bgColor} flex flex-col items-center justify-center min-w-[200px]`}>
        <span className="text-xs font-semibold text-gray-500 mb-1">
          {basisLabel}
        </span>
        <div className="flex items-baseline gap-1 my-0.5">
          <span className={`${isHeld ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'} font-black ${info.textColor}`}>{isHeld ? '산출 보류' : score}</span>
          {!isHeld && <span className="text-sm font-bold text-gray-400">/ 100점</span>}
        </div>
        <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${info.badgeColor}`}>
          {isHeld ? '공식 자료 검토 및 필수 지표 확인 대기' : `${grade} · ${info.label}`}
        </div>
        {isHeld && (
          <p className="text-[11px] text-gray-500 mt-2 text-center leading-tight">
            공식 공시 검토와 수요예측 지표 확인 후<br />
            동일한 기준으로 계산합니다.
          </p>
        )}
        {!isHeld && <p className="text-[11px] text-gray-500 mt-2 text-center leading-relaxed">{combined ? `명시 입장 표본 ${sampleSize}개 반영` : '분류 표본 없음 · 공시 85점을 100점으로 환산'}<br />사이트 비교 기준 · 투자 추천 등급 아님</p>}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border ${info.bgColor} ${info.textColor} ${info.borderColor}`}>
      <span>{isHeld ? '산출 보류' : `${basisLabel} ${score}점`}</span>
      {!isHeld && <span>({info.label})</span>}
    </span>
  );
}
