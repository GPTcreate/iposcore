import React from 'react';
import Link from 'next/link';
import { IpoItem } from '@/types/ipo';
import ScoreBadge from './ScoreBadge';
import { Calendar, ChevronRight } from 'lucide-react';

interface IpoCardProps {
  ipo: IpoItem;
}

export default function IpoCard({ ipo }: IpoCardProps) {
  // 상태별 라벨 및 스타일 (단정하고 눈에 잘 띄는 스타일)
  const getStatusBadge = () => {
    switch (ipo.status) {
      case 'SUBSCRIPTION':
        return {
          text: '청약 진행 중',
          className: 'bg-red-600 text-white font-bold'
        };
      case 'UPCOMING':
        return {
          text: '청약 예정',
          className: 'bg-blue-700 text-white font-semibold'
        };
      case 'WAITING_LISTING':
        return {
          text: '상장 대기',
          className: 'bg-gray-700 text-white font-semibold'
        };
      case 'LISTED':
        return {
          text: '상장 완료',
          className: 'bg-gray-400 text-white font-medium'
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-2xs hover:border-blue-600 transition-colors flex flex-col justify-between">
      <div>
        {/* 상단: 상태 및 시장 구분, 점수 */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-1 rounded text-xs ${statusBadge.className}`}>
              {statusBadge.text}
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">
              {ipo.market}
            </span>
          </div>
          <ScoreBadge score={ipo.aiScore} grade={ipo.scoreGrade} size="sm" />
        </div>

        {/* 종목명 및 코드 (큰 글씨) */}
        <div className="mb-4">
          <Link href={`/ipo/${ipo.id}`}>
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-700 transition-colors flex items-center gap-2">
              <span>{ipo.name}</span>
              <span className="text-xs font-normal text-gray-500">({ipo.code})</span>
            </h3>
          </Link>
          <p className="text-xs text-gray-600 mt-1 line-clamp-1 font-medium">
            {ipo.aiSummary.headline}
          </p>
        </div>

        {/* 핵심 스펙 표 (정갈한 테이블 형태) */}
        <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-xs space-y-2 mb-4">
          <div className="flex justify-between items-center py-0.5 border-b border-gray-200/80 pb-1.5">
            <span className="text-gray-500 font-medium">확정 공모가</span>
            <span className="font-extrabold text-sm text-gray-900">
              {ipo.confirmedPrice > 0 ? (
                `${ipo.confirmedPrice.toLocaleString()}원`
              ) : (
                <span className="text-gray-600 font-semibold text-xs">
                  {ipo.priceBandMin.toLocaleString()} ~ {ipo.priceBandMax.toLocaleString()}원
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5 border-b border-gray-200/80 pb-1.5">
            <span className="text-gray-500 font-medium">기관 경쟁률</span>
            <span className="font-bold text-gray-900">
              {ipo.institutionalCompetitionRate > 0 ? (
                `${ipo.institutionalCompetitionRate.toLocaleString()} : 1`
              ) : (
                <span className="text-gray-400 font-normal">수요예측 발표 전</span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5 border-b border-gray-200/80 pb-1.5">
            <span className="text-gray-500 font-medium">청약 기간</span>
            <span className="font-semibold text-gray-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {ipo.subscriptionStart.slice(5)} ~ {ipo.subscriptionEnd.slice(5)}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-500 font-medium">주관 증권사</span>
            <span className="font-semibold text-gray-800 truncate max-w-[180px]">
              {ipo.underwriters.map(u => u.name).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* 하단 상세 리포트 버튼 */}
      <Link
        href={`/ipo/${ipo.id}`}
        className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-center bg-blue-50 hover:bg-blue-700 hover:text-white text-blue-700 border border-blue-200 transition-colors flex items-center justify-center gap-1"
      >
        <span>분석 요약 & 배정 계산기 보기</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
