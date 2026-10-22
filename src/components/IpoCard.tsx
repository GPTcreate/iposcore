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
          className: 'bg-emerald-700 text-white font-bold'
        };
    }
  };

  const statusBadge = getStatusBadge();
  const isListedNonCancelled = !ipo.isCancelled && effectiveStatus === 'LISTED';

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

        {/* 1. 상장 완료 종목 전용: 실전 수익률 중심 카드 (불필요한 청약기간/주관사 대신 배치) */}
        {isListedNonCancelled ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-3.5 mb-3 space-y-2.5">
            {/* 공모가 및 상장일 헤더 */}
            <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-200/80">
              <span className="text-gray-600 font-medium">확정 공모가</span>
              <span className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  확정
                </span>
                <span>{ipo.confirmedPrice.toLocaleString()}원</span>
              </span>
            </div>

            {/* 시초가 & 종가 2컬럼 수익률 하이라이트 박스 */}
            <div className="grid grid-cols-2 gap-2">
              {/* 시초가 */}
              <div className="bg-white/95 rounded-lg border border-emerald-200 p-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 mb-1">
                  <span>상장일 시초가</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${
                      ipo.openingReturnRate && ipo.openingReturnRate > 0
                        ? 'text-rose-600 bg-rose-50 border-rose-200'
                        : ipo.openingReturnRate && ipo.openingReturnRate < 0
                        ? 'text-blue-600 bg-blue-50 border-blue-200'
                        : 'text-gray-700 bg-gray-50 border-gray-200'
                    }`}
                  >
                    {ipo.openingReturnRate !== undefined
                      ? (ipo.openingReturnRate > 0 ? `+${ipo.openingReturnRate.toFixed(1)}%` : `${ipo.openingReturnRate.toFixed(1)}%`)
                      : '집계 중'}
                  </span>
                </div>
                <div className="text-base font-black text-gray-900">
                  {ipo.openingPrice ? `${ipo.openingPrice.toLocaleString()}원` : '상장일 집계 중'}
                </div>
                {ipo.openingPrice && ipo.confirmedPrice > 0 && (
                  <div
                    className={`text-[10px] font-bold mt-1 ${
                      ipo.openingPrice >= ipo.confirmedPrice ? 'text-rose-600' : 'text-blue-600'
                    }`}
                  >
                    1주당 {ipo.openingPrice >= ipo.confirmedPrice ? '+' : ''}
                    {(ipo.openingPrice - ipo.confirmedPrice).toLocaleString()}원
                  </div>
                )}
              </div>

              {/* 종가 */}
              <div className="bg-white/95 rounded-lg border border-emerald-200 p-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 mb-1">
                  <span>상장일 종가</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${
                      ipo.closingReturnRate && ipo.closingReturnRate > 0
                        ? 'text-rose-600 bg-rose-50 border-rose-200'
                        : ipo.closingReturnRate && ipo.closingReturnRate < 0
                        ? 'text-blue-600 bg-blue-50 border-blue-200'
                        : 'text-gray-700 bg-gray-50 border-gray-200'
                    }`}
                  >
                    {ipo.closingReturnRate !== undefined
                      ? (ipo.closingReturnRate > 0 ? `+${ipo.closingReturnRate.toFixed(1)}%` : `${ipo.closingReturnRate.toFixed(1)}%`)
                      : '집계 중'}
                  </span>
                </div>
                <div className="text-base font-black text-gray-900">
                  {ipo.closingPrice ? `${ipo.closingPrice.toLocaleString()}원` : '장 마감 후 집계'}
                </div>
                {ipo.closingPrice && ipo.confirmedPrice > 0 && (
                  <div
                    className={`text-[10px] font-bold mt-1 ${
                      ipo.closingPrice >= ipo.confirmedPrice ? 'text-rose-600' : 'text-blue-600'
                    }`}
                  >
                    1주당 {ipo.closingPrice >= ipo.confirmedPrice ? '+' : ''}
                    {(ipo.closingPrice - ipo.confirmedPrice).toLocaleString()}원
                  </div>
                )}
              </div>
            </div>

            {/* 청약 당시 일반 경쟁률 & 상장일 */}
            <div className="pt-2 border-t border-emerald-200/80 text-xs space-y-1 text-gray-700">
              {ipo.generalCompetitionRate ? (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">일반 최종 경쟁률</span>
                  <span className="font-bold text-blue-800">
                    {ipo.generalCompetitionRate.toLocaleString()} : 1
                    {ipo.subscriptionResults?.proportionalCompetitionRate && (
                      <span className="ml-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1 py-0.5 rounded">
                        비례 {ipo.subscriptionResults.proportionalCompetitionRate.toLocaleString()}:1
                      </span>
                    )}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">상장일</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{ipo.listingDate || '-'}</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* 2. 일반 미상장/진행/철회 종목 스펙 표 */
          <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-xs space-y-2 mb-3">
            <div className="flex justify-between items-center py-0.5 border-b border-gray-200/80 pb-1.5">
              <span className="text-gray-500 font-medium">
                {ipo.confirmedPrice > 0 ? '확정 공모가' : '희망 공모가 (미확정)'}
              </span>
              <span className="font-extrabold text-sm text-gray-900">
                {ipo.isCancelled ? (
                  <span className="text-rose-600 font-bold text-xs">공모 취소 (철회)</span>
                ) : ipo.confirmedPrice > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">확정</span>
                    <span>{ipo.confirmedPrice.toLocaleString()}원</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">미확정</span>
                    <span className="text-gray-700 font-semibold text-xs">
                      {ipo.priceBandMin.toLocaleString()} ~ {ipo.priceBandMax.toLocaleString()}원
                    </span>
                  </span>
                )}
              </span>
            </div>

            {/* 일반 청약 마감 후 최종 경쟁률 (상장 대기 종목) */}
            {ipo.generalCompetitionRate && effectiveStatus === 'WAITING_LISTING' && (
              <div className="flex justify-between items-center py-1 border-b border-blue-200/90 pb-1.5 bg-blue-50/80 -mx-3 px-3">
                <span className="text-blue-900 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>일반 경쟁률</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-blue-700 text-sm">
                    {ipo.generalCompetitionRate.toLocaleString()} : 1
                  </span>
                  {ipo.subscriptionResults?.proportionalCompetitionRate && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-1.5 py-0.5 rounded">
                      비례 {ipo.subscriptionResults.proportionalCompetitionRate.toLocaleString()}:1
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center py-0.5 border-b border-gray-200/80 pb-1.5">
              <span className="text-gray-500 font-medium">기관 경쟁률</span>
              <span className="font-bold text-gray-900">
                {ipo.isCancelled ? (
                  <span className="text-gray-400 font-normal">철회로 미실시/미공개</span>
                ) : ipo.confirmedPrice > 0 && ipo.institutionalCompetitionRate > 0 ? (
                  `${ipo.institutionalCompetitionRate.toLocaleString()} : 1`
                ) : (
                  <span className="text-amber-700 font-medium text-xs bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    수요예측 전 (미확정)
                  </span>
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
        )}

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
      </div>

      {/* 하단 상세 리포트 버튼 */}
      <Link
        href={`/ipo/${ipo.code}`}
        className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-center bg-blue-50 hover:bg-blue-700 hover:text-white text-blue-700 border border-blue-200 transition-colors flex items-center justify-center gap-1"
      >
        <span>
          {isListedNonCancelled ? '실전 수익률 & 분석 리포트 보기' : '분석 요약 & 배정 계산기 보기'}
        </span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
