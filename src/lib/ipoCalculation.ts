export type AllocationAssumption = 'floor' | 'five-down-six-up';

export interface IpoCalculationInput {
  depositAmount: number;
  offerPrice: number;
  proportionalCompetitionRate: number;
  depositRatePercent: number;
  equalShares: number;
  allocationAssumption: AllocationAssumption;
  borrowedAmount: number;
  annualInterestRatePercent: number;
  lockedDays: number;
  subscriptionFee: number;
  sellingCostRatePercent: number;
  returnRatePercent: number;
}

export interface IpoScenario {
  oneProportionalShareDeposit: number;
  theoreticalProportionalShares: number;
  proportionalShares: number;
  totalShares: number;
  acquisitionAmount: number;
  saleProceeds: number;
  grossProfit: number;
  loanInterest: number;
  sellingCosts: number;
  totalCosts: number;
  netProfit: number;
  /** Null means there is no finite break-even sale price for this scenario. */
  breakEvenReturnRatePercent: number | null;
}

export type IpoCalculationResult =
  | { valid: true; scenario: IpoScenario }
  | { valid: false; errors: string[] };

/** A transparent scenario model, not a prediction of an underwriter's allocation. */
export function calculateIpoScenario(input: IpoCalculationInput): IpoCalculationResult {
  const errors: string[] = [];
  const positiveFields = [
    ['depositAmount', '청약 증거금'],
    ['offerPrice', '공모가'],
    ['proportionalCompetitionRate', '비례 경쟁률'],
    ['depositRatePercent', '증거금률'],
  ] as const;
  const nonNegativeFields = [
    ['equalShares', '균등 배정 가정'],
    ['borrowedAmount', '대출 원금'],
    ['annualInterestRatePercent', '대출 연이율'],
    ['lockedDays', '대출 사용 일수'],
    ['subscriptionFee', '청약 수수료'],
    ['sellingCostRatePercent', '매도 수수료·세금률'],
  ] as const;

  for (const [key, label] of positiveFields) {
    if (!Number.isFinite(input[key]) || input[key] <= 0) errors.push(`${label}은(는) 0보다 큰 숫자로 입력해 주세요.`);
  }
  for (const [key, label] of nonNegativeFields) {
    if (!Number.isFinite(input[key]) || input[key] < 0) errors.push(`${label}은(는) 0 이상의 숫자로 입력해 주세요.`);
  }
  if (input.depositRatePercent > 100) errors.push('증거금률은 100% 이하여야 합니다.');
  if (input.sellingCostRatePercent > 100) errors.push('매도 수수료·세금률은 100% 이하여야 합니다.');
  if (!Number.isInteger(input.equalShares)) errors.push('균등 배정 가정은 정수 주수로 입력해 주세요.');
  if (!Number.isInteger(input.lockedDays)) errors.push('대출 사용 일수는 정수로 입력해 주세요.');
  if (input.borrowedAmount > input.depositAmount) errors.push('대출 원금은 이 청약 증거금 중 빌린 금액으로, 증거금 이하여야 합니다.');
  if (!Number.isFinite(input.returnRatePercent) || input.returnRatePercent < -100 || input.returnRatePercent > 300) errors.push('매도 수익률 시나리오는 -100%부터 +300%까지 입력해 주세요.');
  if (input.allocationAssumption !== 'floor' && input.allocationAssumption !== 'five-down-six-up') errors.push('비례 배정 가정을 선택해 주세요.');
  if (errors.length) return { valid: false, errors };

  const oneProportionalShareDeposit = input.offerPrice * (input.depositRatePercent / 100) * input.proportionalCompetitionRate;
  const theoreticalProportionalShares = input.depositAmount / oneProportionalShareDeposit;
  const wholeShares = Math.floor(theoreticalProportionalShares);
  const fractionalShares = theoreticalProportionalShares - wholeShares;
  // Account only for binary floating-point noise at the selected 0.6 threshold.
  const thresholdTolerance = Number.EPSILON * Math.max(1, theoreticalProportionalShares) * 4;
  const extraShare = input.allocationAssumption === 'five-down-six-up' && fractionalShares + thresholdTolerance >= 0.6 ? 1 : 0;
  const proportionalShares = wholeShares + extraShare;
  const totalShares = input.equalShares + proportionalShares;
  const acquisitionAmount = totalShares * input.offerPrice;
  const grossProfit = acquisitionAmount * (input.returnRatePercent / 100);
  const saleProceeds = acquisitionAmount * (1 + input.returnRatePercent / 100);
  const loanInterest = input.borrowedAmount * (input.annualInterestRatePercent / 100) * input.lockedDays / 365;
  const sellingCosts = saleProceeds * (input.sellingCostRatePercent / 100);
  const totalCosts = loanInterest + input.subscriptionFee + sellingCosts;
  const netProfit = grossProfit - totalCosts;
  const netSaleFactor = 1 - input.sellingCostRatePercent / 100;
  const breakEvenReturnRatePercent = acquisitionAmount > 0 && netSaleFactor > 0
    ? ((acquisitionAmount + loanInterest + input.subscriptionFee) / (acquisitionAmount * netSaleFactor) - 1) * 100
    : null;
  const scenario: IpoScenario = {
    oneProportionalShareDeposit, theoreticalProportionalShares, proportionalShares,
    totalShares, acquisitionAmount, saleProceeds, grossProfit, loanInterest,
    sellingCosts, totalCosts, netProfit, breakEvenReturnRatePercent,
  };
  if (Object.values(scenario).some((value) => value !== null && !Number.isFinite(value)) || !Number.isSafeInteger(totalShares)) {
    return { valid: false, errors: ['입력값이 계산 가능한 범위를 벗어났습니다. 금액과 경쟁률을 확인해 주세요.'] };
  }
  return { valid: true, scenario };
}
