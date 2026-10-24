import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node executes the TypeScript source directly, without a bundler extension resolver.
import { calculateIpoScenario, type IpoCalculationInput } from '../src/lib/ipoCalculation.ts';

const example: IpoCalculationInput = {
  depositAmount: 10000000,
  offerPrice: 20000,
  proportionalCompetitionRate: 1000,
  depositRatePercent: 50,
  equalShares: 0,
  allocationAssumption: 'floor',
  borrowedAmount: 0,
  annualInterestRatePercent: 5,
  lockedDays: 2,
  subscriptionFee: 2000,
  sellingCostRatePercent: 0,
  returnRatePercent: 20,
};

function scenario(overrides: Partial<IpoCalculationInput> = {}) {
  const result = calculateIpoScenario({ ...example, ...overrides });
  if (!result.valid) assert.fail(result.errors.join(' '));
  return result.scenario;
}

test('reproduces the published example without assuming an equal share or a loan', () => {
  const result = scenario();
  assert.equal(result.oneProportionalShareDeposit, 10000000);
  assert.equal(result.theoreticalProportionalShares, 1);
  assert.equal(result.totalShares, 1);
  assert.equal(result.loanInterest, 0);
  assert.equal(result.grossProfit, 4000);
  assert.equal(result.netProfit, 2000);
  assert.ok(Math.abs(result.breakEvenReturnRatePercent! - 10) < 1e-10);
});

test('uses the entered proportional rate directly and respects the deposit rate', () => {
  assert.equal(scenario({ proportionalCompetitionRate: 500 }).theoreticalProportionalShares, 2);
  assert.equal(scenario({ depositRatePercent: 100 }).theoreticalProportionalShares, 0.5);
  assert.equal(scenario({ depositRatePercent: 100 }).totalShares, 0);
});

test('keeps theoretical shares separate from the selected allocation assumption', () => {
  assert.equal(scenario({ depositAmount: 16000000 }).theoreticalProportionalShares, 1.6);
  assert.equal(scenario({ depositAmount: 16000000 }).proportionalShares, 1);
  assert.equal(scenario({ depositAmount: 16000000, allocationAssumption: 'five-down-six-up' }).proportionalShares, 2);
  assert.equal(scenario({ depositAmount: 15999999, allocationAssumption: 'five-down-six-up' }).proportionalShares, 1);
  assert.equal(scenario({ depositAmount: 16500000, equalShares: 2 }).totalShares, 3);
});

test('charges interest only on the borrowed portion using entered calendar days', () => {
  const result = scenario({ borrowedAmount: 5000000, lockedDays: 4, sellingCostRatePercent: 0.2 });
  assert.ok(Math.abs(result.loanInterest - 2739.72602739726) < 1e-9);
  assert.equal(result.saleProceeds, 24000);
  assert.equal(result.sellingCosts, 48);
  assert.equal(Math.round(result.netProfit), -788);
  assert.ok(Math.abs(result.breakEvenReturnRatePercent! - 23.946523183353) < 1e-9);
});

test('charges selling costs on proceeds, including in loss scenarios', () => {
  const gain = scenario({ sellingCostRatePercent: 0.2 });
  assert.equal(gain.netProfit, 1952);
  const loss = scenario({ returnRatePercent: -20, sellingCostRatePercent: 0.2 });
  assert.equal(loss.grossProfit, -4000);
  assert.equal(loss.sellingCosts, 32);
  assert.equal(loss.netProfit, -6032);
  assert.equal(scenario({ returnRatePercent: -100 }).netProfit, -22000);
  assert.equal(scenario({ returnRatePercent: 300 }).netProfit, 58000);
});

test('break-even rate cancels interest, subscription fee and proceeds-based selling costs', () => {
  const inputs = { borrowedAmount: 5000000, lockedDays: 4, sellingCostRatePercent: 0.2 };
  const breakEven = scenario(inputs).breakEvenReturnRatePercent!;
  assert.ok(Math.abs(scenario({ ...inputs, returnRatePercent: breakEven }).netProfit) < 1e-8);
});

test('zero allocation has no sale proceeds, still applies the entered costs, and has no break-even', () => {
  const result = scenario({ depositAmount: 1000000, borrowedAmount: 500000 });
  assert.equal(result.totalShares, 0);
  assert.equal(result.saleProceeds, 0);
  assert.equal(result.sellingCosts, 0);
  assert.ok(result.netProfit < -2000);
  assert.equal(result.breakEvenReturnRatePercent, null);
  assert.equal(scenario({ sellingCostRatePercent: 100 }).breakEvenReturnRatePercent, null);
});

test('rejects missing, zero, negative and non-finite required inputs instead of fabricating results', () => {
  for (const field of ['depositAmount', 'offerPrice', 'proportionalCompetitionRate', 'depositRatePercent'] as const) {
    for (const invalid of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.equal(calculateIpoScenario({ ...example, [field]: invalid }).valid, false, `${field}: ${invalid}`);
    }
  }
  for (const field of ['equalShares', 'borrowedAmount', 'annualInterestRatePercent', 'lockedDays', 'subscriptionFee', 'sellingCostRatePercent'] as const) {
    for (const invalid of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.equal(calculateIpoScenario({ ...example, [field]: invalid }).valid, false, `${field}: ${invalid}`);
    }
  }
});

test('rejects impossible percentages, fractional shares/days, excessive borrowing and unsupported assumptions', () => {
  for (const invalid of [
    { depositRatePercent: 101 }, { sellingCostRatePercent: 101 },
    { equalShares: 0.5 }, { lockedDays: 2.5 },
    { borrowedAmount: 10000001 }, { returnRatePercent: -101 },
    { returnRatePercent: 301 }, { returnRatePercent: Number.NaN },
    { allocationAssumption: 'guaranteed' },
  ]) {
    assert.equal(calculateIpoScenario({ ...example, ...invalid } as IpoCalculationInput).valid, false);
  }
});

test('rejects numeric overflow instead of returning Infinity or NaN', () => {
  assert.equal(calculateIpoScenario({ ...example, offerPrice: 1e308, proportionalCompetitionRate: 1e308 }).valid, false);
  assert.equal(calculateIpoScenario({ ...example, depositAmount: 1e308, proportionalCompetitionRate: 1e-308 }).valid, false);
});
