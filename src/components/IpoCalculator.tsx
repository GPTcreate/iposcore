'use client';

import React, { useId, useState } from 'react';
import { Calculator } from 'lucide-react';
import { calculateIpoScenario, type AllocationAssumption, type IpoCalculationInput } from '@/lib/ipoCalculation';

interface IpoCalculatorProps {
  initialPrice?: number;
  initialProportionalCompetitionRate?: number;
  initialRefundDays?: number;
  initialDepositRatePercent?: number;
  stockName?: string;
}

type NumericField = Exclude<keyof IpoCalculationInput, 'allocationAssumption'>;
const inputGuidance: Partial<Record<NumericField, { label: string; description: string }>> = {
  depositRatePercent: { label: '청약 증거금률', description: '종목별 청약 공고의 증거금률을 적용하세요.' },
  proportionalCompetitionRate: { label: '비례 배정 경쟁률', description: '주관사가 공개한 일반 청약의 비례 경쟁률 또는 직접 정한 시나리오입니다. 기관 수요예측 경쟁률과 다릅니다.' },
  equalShares: { label: '균등 배정 가정', description: '기본 0주. 추첨 결과 또는 직접 가정한 주수를 입력합니다.' },
  borrowedAmount: { label: '대출 원금', description: '자기자금이면 0원입니다. 증거금 전체에 자동으로 이자를 매기지 않습니다.' },
  subscriptionFee: { label: '청약 수수료', description: '미배정 시 면제 등 실제 조건에 따라 0원도 입력할 수 있습니다.' },
  sellingCostRatePercent: { label: '매도 수수료·세금', description: '매도대금에 곱할 합산 비율입니다. 기본 0%는 비용 미반영 예시입니다.' },
  returnRatePercent: { label: '매도 수익률 시나리오', description: '예측값이 아닙니다. -100%는 전액 손실 가정이며 일일 가격제한폭과 다릅니다.' },
};
const fieldClassName = 'w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-100';
const numberFormat = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });
const won = (amount: number) => `${numberFormat.format(amount)}원`;
const signedWon = (amount: number) => `${amount > 0 ? '+' : ''}${won(amount)}`;
const percent = (amount: number) => `${amount > 0 ? '+' : ''}${amount.toFixed(2)}%`;

export default function IpoCalculator({
  initialPrice = 20000,
  initialProportionalCompetitionRate = 1000,
  initialRefundDays = 2,
  initialDepositRatePercent = 50,
  stockName = '공모주',
}: IpoCalculatorProps) {
  const inputPrefix = useId();
  // Keep text while editing: clearing a field must not silently turn it into zero.
  const [fields, setFields] = useState<Record<NumericField, string>>({
    depositAmount: '10000000',
    offerPrice: String(initialPrice),
    proportionalCompetitionRate: String(initialProportionalCompetitionRate),
    depositRatePercent: String(initialDepositRatePercent),
    equalShares: '0',
    borrowedAmount: '0',
    annualInterestRatePercent: '5',
    lockedDays: String(initialRefundDays),
    subscriptionFee: '2000',
    sellingCostRatePercent: '0',
    returnRatePercent: '20',
  });
  const [allocationAssumption, setAllocationAssumption] = useState<AllocationAssumption>('floor');
  const setField = (name: NumericField, value: string) => setFields((current) => ({ ...current, [name]: value }));
  const valueOf = (name: NumericField) => fields[name].trim() === '' ? Number.NaN : Number(fields[name]);
  const result = calculateIpoScenario({
    depositAmount: valueOf('depositAmount'), offerPrice: valueOf('offerPrice'),
    proportionalCompetitionRate: valueOf('proportionalCompetitionRate'), depositRatePercent: valueOf('depositRatePercent'),
    equalShares: valueOf('equalShares'), borrowedAmount: valueOf('borrowedAmount'),
    annualInterestRatePercent: valueOf('annualInterestRatePercent'), lockedDays: valueOf('lockedDays'),
    subscriptionFee: valueOf('subscriptionFee'), sellingCostRatePercent: valueOf('sellingCostRatePercent'),
    returnRatePercent: valueOf('returnRatePercent'), allocationAssumption,
  });

  const numericInput = (name: NumericField, label: string, options: { min?: number; max?: number; step?: string } = {}) => (
    <div className="min-w-0">
      <label htmlFor={`${inputPrefix}-${name}`} className="mb-1 block text-xs font-semibold text-gray-700">{label}</label>
      <input id={`${inputPrefix}-${name}`} type="number" inputMode="decimal" value={fields[name]} onChange={(event) => setField(name, event.target.value)} min={options.min ?? 0} max={options.max} step={options.step ?? 'any'} className={fieldClassName} aria-describedby={inputGuidance[name] ? `${inputPrefix}-${name}-hint` : undefined} />
    </div>
  );

  return (
    <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-2xs sm:p-6" aria-labelledby={`${inputPrefix}-heading`}>
      <div className="mb-4 flex items-start gap-2 border-b border-gray-200 pb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800"><Calculator className="h-4 w-4" /></div>
        <div>
          <h2 id={`${inputPrefix}-heading`} className="text-lg font-bold text-gray-900">{stockName} 비례 배정·손익 계산기</h2>
          <p className="mt-1 text-xs text-gray-600">기본 입력은 예시입니다. 내 청약 조건으로 바꿔 계산하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {numericInput('depositAmount', '청약 증거금 (원)', { min: 1, step: '10000' })}
          <div className="flex flex-wrap gap-1.5">
            {[5000000, 10000000, 30000000, 50000000, 100000000].map((amount) => (
              <button key={amount} type="button" onClick={() => setField('depositAmount', String(amount))} className={`cursor-pointer rounded border px-2.5 py-1.5 text-xs ${Number(fields.depositAmount) === amount ? 'border-blue-700 bg-blue-700 font-bold text-white' : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>{numberFormat.format(amount / 10000)}만원</button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {numericInput('offerPrice', '공모가 (원)', { min: 1 })}
            {numericInput('depositRatePercent', '청약 증거금률 (%)', { min: 0.01, max: 100 })}
          </div>
          {numericInput('proportionalCompetitionRate', '비례 배정 경쟁률 (:1)', { min: 0.01 })}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {numericInput('equalShares', '균등 배정 가정 (주)', { step: '1' })}
            <div>
              <label htmlFor={`${inputPrefix}-allocation`} className="mb-1 block text-xs font-semibold text-gray-700">비례 소수점 처리 가정</label>
              <select id={`${inputPrefix}-allocation`} value={allocationAssumption} onChange={(event) => setAllocationAssumption(event.target.value as AllocationAssumption)} className={fieldClassName}>
                <option value="floor">절사 (기본 가정)</option>
                <option value="five-down-six-up">5사6입 (0.6 이상 올림 가정)</option>
              </select>
            </div>
          </div>
          <fieldset className="space-y-3 rounded-lg border border-gray-200 p-3">
            <legend className="px-1 text-xs font-bold text-gray-800">대출과 거래 비용</legend>
            {numericInput('borrowedAmount', '증거금 중 대출 원금 (원)')}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {numericInput('annualInterestRatePercent', '대출 연이율 (%)')}
              {numericInput('lockedDays', '대출 사용 일수 (달력일)', { step: '1' })}
              {numericInput('subscriptionFee', '적용할 청약 수수료 (원)')}
              {numericInput('sellingCostRatePercent', '매도 수수료·세금 합계 (%)', { max: 100 })}
            </div>
          </fieldset>
          <div>
            {numericInput('returnRatePercent', '공모가 대비 매도 수익률 시나리오 (%)', { min: -100, max: 300 })}
            <input type="range" aria-label="매도 수익률 시나리오 조절" min="-100" max="300" step="1" value={Number.isFinite(valueOf('returnRatePercent')) ? valueOf('returnRatePercent') : 0} onChange={(event) => setField('returnRatePercent', event.target.value)} className="mt-3 w-full accent-blue-700" />
            <div className="flex justify-between text-[11px] text-gray-500"><span>-100% 손실</span><span>0%</span><span>+300%</span></div>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-gray-300 bg-gray-50 p-4 sm:p-5">
          {!result.valid ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-bold">입력값을 확인하면 계산 결과가 표시됩니다.</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">{result.errors.map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          ) : (
            <div className="space-y-4" aria-live="polite" aria-atomic="true">
              <div className="border-b border-gray-300 pb-4">
                <p className="text-xs font-bold text-gray-500">입력한 조건으로 계산한 시나리오</p>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm font-bold text-gray-800">배정 주수 가정</span><strong className="text-2xl text-blue-800">{numberFormat.format(result.scenario.totalShares)}주</strong></div>
                <p className="mt-1 text-xs text-gray-600">균등 {fields.equalShares}주 + 비례 {numberFormat.format(result.scenario.proportionalShares)}주 ({allocationAssumption === 'floor' ? '절사' : '5사6입'} 가정)</p>
                <p className="mt-2 text-xs text-gray-600">비례 이론값 {result.scenario.theoreticalProportionalShares.toLocaleString('ko-KR', { maximumFractionDigits: 4 })}주</p>
              </div>
              <dl className="space-y-3 text-sm">
                {([
                  ['비례 1주 이론상 필요 증거금', won(result.scenario.oneProportionalShareDeposit)],
                  ['배정 주식 취득대금', won(result.scenario.acquisitionAmount)],
                  ['가정한 매도대금', won(result.scenario.saleProceeds)],
                  ['매매 차익 (비용 차감 전)', signedWon(result.scenario.grossProfit)],
                  [`대출 이자 (${fields.lockedDays}일·365일 단리)`, `−${won(result.scenario.loanInterest)}`],
                  ['입력한 청약 수수료', `−${won(Number(fields.subscriptionFee))}`],
                  ['매도 수수료·세금', `−${won(result.scenario.sellingCosts)}`],
                ] as const).map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-1"><dt className="text-gray-600">{label}</dt><dd className="font-semibold text-gray-900">{value}</dd></div>)}
              </dl>
              <div className="space-y-3 border-t border-gray-300 pt-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm font-bold text-gray-900">가정 비용 차감 후 손익</span><strong className={`text-xl ${result.scenario.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{signedWon(result.scenario.netProfit)}</strong></div>
                <div className="flex flex-wrap justify-between gap-2 text-sm"><span className="font-semibold text-gray-700">공모가 대비 손익분기 수익률</span><strong className="text-blue-800">{result.scenario.breakEvenReturnRatePercent === null ? '산출 불가' : percent(result.scenario.breakEvenReturnRatePercent)}</strong></div>
                {result.scenario.breakEvenReturnRatePercent === null && <p className="text-xs text-gray-600">배정 가정이 0주이거나 매도비용률이 100%이면 유한한 손익분기 매도가를 계산할 수 없습니다.</p>}
              </div>
              <p className="text-xs text-gray-500">{Number(fields.sellingCostRatePercent) === 0 ? '매도 수수료·세금 미반영' : `매도 수수료·세금 ${fields.sellingCostRatePercent}% 적용`}</p>
            </div>
          )}
        </div>
      </div>
      <details className="mt-5 border-t border-gray-200 pt-4 text-xs text-gray-600">
        <summary className="cursor-pointer font-semibold">계산 방법·입력 안내</summary>
        <div className="mt-4 space-y-4 leading-relaxed">
          <dl className="space-y-3">{Object.entries(inputGuidance).map(([name, guidance]) => <div key={name}><dt className="font-semibold text-gray-800">{guidance.label}</dt><dd id={`${inputPrefix}-${name}-hint`}>{guidance.description}</dd></div>)}</dl>
          <p>절사와 5사6입은 실제 배정을 보장하지 않습니다. 청약 한도·청약 단위·최종 경쟁률·단수주 처리·추첨은 주관사 공지를 따릅니다.</p>
          <p>입력한 대출 이자·청약 수수료·매도 수수료·세금률만 반영하며, 매도비용률은 매도대금에 적용합니다. 기회비용과 별도 고정 비용은 제외합니다. 금액은 원 단위 반올림 표시이며 실제 금융기관의 이자·세금 계산과 다를 수 있습니다.</p>
        </div>
      </details>
    </section>
  );
}
