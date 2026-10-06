import React from 'react';
import Link from 'next/link';
import { IpoItem } from '@/types/ipo';
import { getEffectiveIpoStatus } from '@/lib/ipoUtils';
import ScoreBadge from './ScoreBadge';
import { Calendar, ChevronRight } from 'lucide-react';

interface IpoCardProps {
  ipo: IpoItem;
}

export default function IpoCard({ ipo }: IpoCardProps) {
  const effectiveStatus = getEffectiveIpoStatus(ipo);

  // 상태별 라벨 및 스타일 (단정하고 눈에 잘 띄는 스타일)
  const getStatusBadge = () => {
    if (ipo.isCancelled) {
      return {
        text: '공모 취소',
        className: 'bg-rose-700 text-white font-bold'
      };
    }
    switch (effectiveStatus) {
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
          <ScoreBadge
            score={ipo.aiScore}
            grade={ipo.scoreGrade}
            size="sm"
            isPendingForecast={effectiveStatus === 'UPCOMING'}
          />
        </div>

        {/* 종목명 및 코드 (큰 글씨) */}
        <div className="mb-4">
          <Link href={`/ipo/${ipo.code}`}>
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
        <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-xs space-y-2 mb-3">
          <div className="flex justify-between items-center py-0.5 border-b border-gray-200/80 pb-1.5">
            <span className="text-gray-500 font-medium">확정 공모가</span>
            <span className="font-extrabold text-sm text-gray-900">
              {ipo.isCancelled ? (
                <span className="text-rose-600 font-bold text-xs">공모 취소 (철회)</span>
              ) : ipo.confirmedPrice > 0 ? (
                `${ipo.confirmedPrice.toLocaleString()}원`
              ) : (
                <span className="text-gray-600 font-semibold text-xs">
                  {ipo.priceBandMin.toLocaleString()} ~ {ipo.priceBandMax.toLocaleString()}원
                </span>
              )}
            </span>
          </div>

          {/* 일반 청약 마감 후 최종 경쟁률 (상장 대기 또는 상장 완료 종목) */}
          {ipo.generalCompetitionRate && (effectiveStatus === 'WAITING_LISTING' || effectiveStatus === 'LISTED') && (
            <div className="flex justify-between items-center py-1 border-b border-blue-200/90 pb-1.5 bg-blue-50/80 -mx-3 px-3">
              <span className="text-blue-900 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>일반 청약 경쟁률</span>
              </span>
              <span className="font-black text-blue-700 text-sm">
                {ipo.generalCompetitionRate.toLocaleString()} : 1
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-0.5 border-b border-gray-200/80 pb-1.5">
            <span className="text-gray-500 font-medium">기관 경쟁률</span>
            <span className="font-bold text-gray-900">
              {ipo.isCancelled ? (
                <span className="text-gray-400 font-normal">철회로 미실시/미공개</span>
              ) : ipo.institutionalCompetitionRate > 0 ? (
                `${ipo.institutionalCompetitionRate.toLocaleString()} : 1`
              ) : (
                <span className="text-gray-400 font-normal">수요예측 발표 전</span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5 border-b border-gray-200/80 pb-1.5">
            <span className="text-gray-500 font-medium">
              {effectiveStatus === 'WAITING_LISTING' ? '환불 / 상장' : '청약 기간'}
            </span>
            <span className="font-semibold text-gray-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {effectiveStatus === 'WAITING_LISTING' ? (
                <span>
                  환불 {ipo.refundDate.slice(5)} · 상장 <strong className="text-blue-700">{ipo.listingDate ? ipo.listingDate.slice(5) : '미정'}</strong>
                </span>
              ) : (
                <span>{ipo.subscriptionStart.slice(5)} ~ {ipo.subscriptionEnd.slice(5)}</span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-gray-500 font-medium">주관 증권사</span>
            <span className="font-semibold text-gray-800 truncate max-w-[180px]">
              {ipo.underwriters.map(u => u.name).join(', ')}
            </span>
          </div>
        </div>

        {/* 공모 취소/철회 종목 사유 안내 박스 */}
        {ipo.isCancelled && (
          <div className="rounded-lg border border-rose-200 bg-rose-50/90 p-2.5 mb-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-rose-700">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              <span>공모 철회 안내</span>
            </div>
            <p className="text-[11px] text-rose-900 mt-1 line-clamp-2 leading-relaxed">
              {ipo.cancelReason || '기관 수요예측 부진 및 시장 피드백으로 증권신고서를 철회했습니다.'}
            </p>
          </div>
        )}

        {/* 상장 완료 종목 실전 수익률 (시초가 & 종가, 정상 상장 종목만) */}
        {!ipo.isCancelled && effectiveStatus === 'LISTED' && (ipo.openingReturnRate !== undefined || ipo.closingReturnRate !== undefined) && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50/70 p-2.5 mb-3">
            <div className="flex justify-between items-center mb-1 text-[11px] font-bold text-emerald-900">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>상장일 실전 수익률</span>
              </span>
              <span className="text-[10px] text-gray-500 font-normal">공모가 대비</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/80">
              <div>
                <span className="text-[10px] text-gray-500 block font-medium">시초가 수익률</span>
                <span className={`text-sm font-black ${ipo.openingReturnRate && ipo.openingReturnRate > 0 ? 'text-rose-600' : ipo.openingReturnRate && ipo.openingReturnRate < 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                  {ipo.openingReturnRate && ipo.openingReturnRate > 0 ? `+${ipo.openingReturnRate.toFixed(1)}%` : `${ipo.openingReturnRate?.toFixed(1)}%`}
                </span>
                {ipo.openingPrice && (
                  <span className="text-[10px] text-gray-500 block">({ipo.openingPrice.toLocaleString()}원)</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 block font-medium">종가 수익률</span>
                <span className={`text-sm font-black ${ipo.closingReturnRate && ipo.closingReturnRate > 0 ? 'text-rose-600' : ipo.closingReturnRate && ipo.closingReturnRate < 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                  {ipo.closingReturnRate && ipo.closingReturnRate > 0 ? `+${ipo.closingReturnRate.toFixed(1)}%` : `${ipo.closingReturnRate?.toFixed(1)}%`}
                </span>
                {ipo.closingPrice && (
                  <span className="text-[10px] text-gray-500 block">({ipo.closingPrice.toLocaleString()}원)</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 상세 리포트 버튼 */}
      <Link
        href={`/ipo/${ipo.code}`}
        className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-center bg-blue-50 hover:bg-blue-700 hover:text-white text-blue-700 border border-blue-200 transition-colors flex items-center justify-center gap-1"
      >
        <span>분석 요약 & 배정 계산기 보기</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
