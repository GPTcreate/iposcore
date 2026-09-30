import React from 'react';

interface ScoreBadgeProps {
  score: number;
  grade: 'S' | 'A' | 'B' | 'C';
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreBadge({ score, grade, size = 'md' }: ScoreBadgeProps) {
  const getGradeInfo = () => {
    switch (grade) {
      case 'S':
        return {
          label: '적극 청약 추천',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          badgeColor: 'bg-emerald-600 text-white',
        };
      case 'A':
        return {
          label: '청약 추천',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeColor: 'bg-blue-600 text-white',
        };
      case 'B':
        return {
          label: '선별 청약 (신중)',
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          badgeColor: 'bg-amber-600 text-white',
        };
      case 'C':
        return {
          label: '청약 유의 (패스 권장)',
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
        <span>{score}점</span>
        <span className="opacity-70">|</span>
        <span>{info.label}</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 sm:p-5 rounded-xl border ${info.borderColor} ${info.bgColor} flex flex-col items-center justify-center min-w-[200px]`}>
        <span className="text-xs font-semibold text-gray-500 mb-1">
          종합 투자 매력도 점수
        </span>
        <div className="flex items-baseline gap-1 my-0.5">
          <span className={`text-4xl sm:text-5xl font-black ${info.textColor}`}>{score}</span>
          <span className="text-sm font-bold text-gray-400">/ 100점</span>
        </div>
        <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${info.badgeColor}`}>
          등급 {grade} · {info.label}
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border ${info.bgColor} ${info.textColor} ${info.borderColor}`}>
      <span>종합 {score}점</span>
      <span>({info.label})</span>
    </span>
  );
}
