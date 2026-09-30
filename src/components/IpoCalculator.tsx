'use client';

import React, { useState, useId } from 'react';
import { Calculator, HelpCircle } from 'lucide-react';

interface IpoCalculatorProps {
  initialPrice?: number;
  initialCompetitionRate?: number;
  initialRefundDays?: number;
  stockName?: string;
}

export default function IpoCalculator({
  initialPrice = 28000,
  initialCompetitionRate = 1200,
  initialRefundDays = 2,
  stockName = '뉴로로보틱스'
}: IpoCalculatorProps) {
  const depositInputId = useId();
  const priceInputId = useId();
  const compInputId = useId();
  const daysInputId = useId();
  const loanInputId = useId();
  const feeInputId = useId();
  const returnInputId = useId();

  // 사용자 입력 상태
  const [depositAmount, setDepositAmount] = useState<number>(30000000); // 3,000만원 기본
  const [targetPrice, setTargetPrice] = useState<number>(initialPrice || 25000);
  const [expectedCompetition, setExpectedCompetition] = useState<number>(
    initialCompetitionRate > 0 ? Math.round(initialCompetitionRate * 2) : 2000
  );
  const [refundDays, setRefundDays] = useState<number>(initialRefundDays);
  const [loanInterestRate, setLoanInterestRate] = useState<number>(5.5);
  const [applicationFee, setApplicationFee] = useState<number>(2000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(80);

  // 계산 로직
  const oneShareDeposit = Math.round(targetPrice * expectedCompetition * 0.5);
  const calculatedProportionalShares = oneShareDeposit > 0 ? depositAmount / oneShareDeposit : 0;
  const guaranteedProportionalShares = Math.floor(calculatedProportionalShares);
  const fiveDownSixUpProbability = calculatedProportionalShares - guaranteedProportionalShares;

  const estimatedEqualShares = 1;
  const totalEstimatedShares = guaranteedProportionalShares + (fiveDownSixUpProbability >= 0.6 ? 1 : 0) + estimatedEqualShares;

  const loanInterestCost = Math.round((depositAmount * (loanInterestRate / 100) / 365) * refundDays);
  const totalCost = loanInterestCost + applicationFee;
  const profitPerShare = Math.round(targetPrice * (expectedReturnRate / 100));
  const grossProfit = totalEstimatedShares * profitPerShare;
  const netProfit = grossProfit - totalCost;

  const handleQuickAmount = (amount: number) => {
    setDepositAmount(amount);
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
          <Calculator className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {stockName} 공모주 비례 청약 계산기
          </h3>
          <p className="text-xs text-gray-500">
            투자 금액을 입력하시면 예상 배정 주수와 대출 이자를 제외한 실제 순수익을 계산해 드립니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* 입력 영역 */}
        <div className="space-y-4">
          <div>
            <label htmlFor={depositInputId} className="block text-xs font-bold text-gray-700 mb-1">
              청약 증거금 (투자 금액)
            </label>
            <div className="relative">
              <input
                id={depositInputId}
                type="number"
                step="1000000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 font-bold text-base focus:border-blue-600 focus:outline-hidden"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                원
              </span>
            </div>
            {/* 금액 빠른 선택 */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[5000000, 10000000, 30000000, 50000000, 100000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                    depositAmount === amt
                      ? 'bg-blue-700 text-white border-blue-700 font-bold'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {(amt / 10000).toLocaleString()}만원
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={priceInputId} className="block text-xs font-semibold text-gray-600 mb-1">
                확정 공모가 (원)
              </label>
              <input
                id={priceInputId}
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold"
              />
            </div>
            <div>
              <label htmlFor={compInputId} className="block text-xs font-semibold text-gray-600 mb-1">
                예상 청약 경쟁률 (:1)
              </label>
              <input
                id={compInputId}
                type="number"
                value={expectedCompetition}
                onChange={(e) => setExpectedCompetition(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label htmlFor={daysInputId} className="block text-gray-600 mb-1 font-semibold">환불일수</label>
              <select
                id={daysInputId}
                value={refundDays}
                onChange={(e) => setRefundDays(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium"
              >
                <option value={2}>2일 (평일)</option>
                <option value={4}>4일 (주말포함)</option>
              </select>
            </div>
            <div>
              <label htmlFor={loanInputId} className="block text-gray-600 mb-1 font-semibold">마통 금리 (연%)</label>
              <input
                id={loanInputId}
                type="number"
                step="0.1"
                value={loanInterestRate}
                onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium"
              />
            </div>
            <div>
              <label htmlFor={feeInputId} className="block text-gray-600 mb-1 font-semibold">청약 수수료</label>
              <input
                id={feeInputId}
                type="number"
                step="500"
                value={applicationFee}
                onChange={(e) => setApplicationFee(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-700 font-semibold mb-1">
              <label htmlFor={returnInputId}>상장 당일 기대 수익률</label>
              <span className="font-bold text-blue-700">+{expectedReturnRate}%</span>
            </div>
            <input
              id={returnInputId}
              type="range"
              min="0"
              max="300"
              step="10"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              className="w-full accent-blue-700"
            />
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>0% (본전)</span>
              <span>100% (따블)</span>
              <span>200%</span>
              <span>300% (따따블)</span>
            </div>
          </div>
        </div>

        {/* 결과 영역 (차분하고 정돈된 회색/흰색 박스) */}
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-gray-300 pb-3">
              <span className="text-xs text-gray-500 font-bold block mb-1">
                계산 결과 요약
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-gray-800">
                  총 예상 배정 주수
                </span>
                <span className="text-2xl font-black text-blue-800">
                  약 {totalEstimatedShares}주
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                (균등 {estimatedEqualShares}주 + 비례 {guaranteedProportionalShares}주 {fiveDownSixUpProbability >= 0.6 ? '+ 5사6입 1주 추가' : ''})
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>비례 1주 청약 필요 금액</span>
                <span className="font-bold text-gray-900">
                  약 {(oneShareDeposit / 10000).toFixed(1)}만원
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>마이너스통장 대출 이자 ({refundDays}일치)</span>
                <span className="font-bold text-red-600">
                  -{loanInterestCost.toLocaleString()}원
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>청약 수수료</span>
                <span className="font-bold text-red-600">
                  -{applicationFee.toLocaleString()}원
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>상장일 매도 기대 차익 (+{expectedReturnRate}%)</span>
                <span className="font-bold text-emerald-700">
                  +{grossProfit.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-300">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-gray-900">
                최종 예상 순수익 (이자 차감 후)
              </span>
              <span className={`text-xl font-black ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {netProfit >= 0 ? `+${netProfit.toLocaleString()}원` : `${netProfit.toLocaleString()}원`}
              </span>
            </div>
            <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 shrink-0" />
              <span>실제 배정수량과 시초가는 당일 시장 상황에 따라 달라질 수 있습니다.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
