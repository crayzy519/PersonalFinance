import { PlannerInputs, RequiredReturnResult, SimulationResult, YearRecord, LifeStage } from './types';

const STAGE_LABELS: Record<LifeStage, string> = {
  career: 'Career',
  gap: 'Gap',
  freelance: 'Freelance',
  retired: 'Retired',
};

export const getStageLabel = (stage: LifeStage): string => STAGE_LABELS[stage];

interface StageContext {
  stage: LifeStage;
  yearsFromCurrent: number;
  yearsFromFreelance: number;
  yearsFromFreelanceStartAfterGap: number;
  yearsFromRetirement: number;
}

function getStageForAge(inputs: PlannerInputs, age: number): StageContext {
  const gapStartAge = inputs.freelanceAge;
  const gapEndAge = inputs.freelanceAge + inputs.gapYearsAfterLeavingJob;

  let stage: LifeStage;
  if (age < inputs.freelanceAge) {
    stage = 'career';
  } else if (age < gapEndAge) {
    stage = 'gap';
  } else if (age < inputs.retirementAge) {
    stage = 'freelance';
  } else {
    stage = 'retired';
  }

  return {
    stage,
    yearsFromCurrent: age - inputs.currentAge,
    yearsFromFreelance: age - inputs.freelanceAge,
    yearsFromFreelanceStartAfterGap: age - gapEndAge,
    yearsFromRetirement: age - inputs.retirementAge,
  };
}

function grow(base: number, rate: number, years: number): number {
  return base * Math.pow(1 + rate, Math.max(0, years));
}

function incomeForAge(inputs: PlannerInputs, context: StageContext): number {
  const incomeGrowth = inputs.annualIncomeGrowthRate;

  if (context.stage === 'career') {
    return grow(inputs.currentAnnualIncome, incomeGrowth, context.yearsFromCurrent);
  }

  if (context.stage === 'gap') {
    return grow(inputs.gapAnnualIncome, incomeGrowth, context.yearsFromFreelance);
  }

  if (context.stage === 'freelance') {
    const incomeAtFreelanceTransition = grow(
      inputs.currentAnnualIncome,
      incomeGrowth,
      inputs.freelanceAge - inputs.currentAge,
    );

    const freelanceBase = incomeAtFreelanceTransition * inputs.freelanceIncomeRatio;
    return grow(freelanceBase, incomeGrowth, context.yearsFromFreelanceStartAfterGap);
  }

  return inputs.retirementAnnualIncome;
}

function expenseForAge(inputs: PlannerInputs, context: StageContext): number {
  const expenseGrowth = inputs.annualExpenseGrowthRate;

  if (context.stage === 'career') {
    return grow(inputs.currentAnnualExpense, expenseGrowth, context.yearsFromCurrent);
  }

  if (context.stage === 'gap') {
    return grow(inputs.gapAnnualExpense, expenseGrowth, context.yearsFromFreelance);
  }

  const expenseAtFreelanceAge = grow(
    inputs.currentAnnualExpense,
    expenseGrowth,
    inputs.freelanceAge - inputs.currentAge,
  );
  const freelanceStartExpense = expenseAtFreelanceAge * inputs.freelanceExpenseRatio;

  if (context.stage === 'freelance') {
    return grow(freelanceStartExpense, expenseGrowth, context.yearsFromFreelanceStartAfterGap);
  }

  const yearsRetiredStartsFromGapEnd = inputs.retirementAge - (inputs.freelanceAge + inputs.gapYearsAfterLeavingJob);
  const expenseAtRetirement = grow(
    freelanceStartExpense,
    expenseGrowth,
    yearsRetiredStartsFromGapEnd,
  );

  const retiredBaseExpense = expenseAtRetirement * inputs.retirementExpenseRatio;
  return grow(retiredBaseExpense, expenseGrowth, context.yearsFromRetirement);
}

function childCostForAge(inputs: PlannerInputs, age: number): number {
  if (!inputs.hasChildren || inputs.childCount <= 0) {
    return 0;
  }

  const childEndAge = inputs.childStartAge + inputs.childSupportYears;
  if (age < inputs.childStartAge || age >= childEndAge) {
    return 0;
  }

  const yearsFromChildStart = age - inputs.childStartAge;
  const annualPerChild = grow(inputs.annualChildCostPerChild, inputs.childCostGrowthRate, yearsFromChildStart);
  return annualPerChild * inputs.childCount;
}

function oneTimeNetCashFlowForAge(inputs: PlannerInputs, age: number): number {
  return inputs.oneTimeCashFlows
    .filter((event) => event.age === age)
    .reduce((sum, event) => {
      const signedAmount = event.type === 'inflow' ? Math.abs(event.amount) : -Math.abs(event.amount);
      return sum + signedAmount;
    }, 0);
}

export function simulatePlan(inputs: PlannerInputs, annualReturn: number): SimulationResult {
  const yearlyRecords: YearRecord[] = [];
  let assets = inputs.currentSavings;
  let minimumAssets = assets;
  let failureAge: number | undefined;

  for (let age = inputs.currentAge; age <= inputs.deathAge; age += 1) {
    const context = getStageForAge(inputs, age);
    const startingAssets = assets;
    const income = incomeForAge(inputs, context);
    const expenses = expenseForAge(inputs, context);
    const childCosts = childCostForAge(inputs, age);
    const oneTimeNetCashFlow = oneTimeNetCashFlowForAge(inputs, age);

    const netCashFlowBeforeReturn = income - expenses - childCosts + oneTimeNetCashFlow;

    // End-of-year model: cash flow first, then annual compounding on resulting assets.
    assets = (startingAssets + netCashFlowBeforeReturn) * (1 + annualReturn);

    if (assets < minimumAssets) {
      minimumAssets = assets;
    }

    if (failureAge === undefined && assets < 0) {
      failureAge = age;
    }

    yearlyRecords.push({
      age,
      stage: context.stage,
      startingAssets,
      income,
      expenses,
      childCosts,
      oneTimeNetCashFlow,
      netCashFlowBeforeReturn,
      endingAssets: assets,
    });
  }

  return {
    yearlyRecords,
    endingAssets: assets,
    minimumAssets,
    failed: failureAge !== undefined,
    failureAge,
  };
}

export function solveRequiredReturn(
  inputs: PlannerInputs,
  minReturn = -0.5,
  maxReturn = 0.3,
  tolerance = 1e-5,
  maxIterations = 200,
): RequiredReturnResult {
  const endingAt = (r: number) => simulatePlan(inputs, r).endingAssets;
  const lowEnd = endingAt(minReturn) - inputs.targetEstateAtDeath;
  const highEnd = endingAt(maxReturn) - inputs.targetEstateAtDeath;

  if (lowEnd >= 0) {
    return { requiredAnnualReturn: minReturn, solvableInBounds: true, message: 'Plan works at lower search bound.' };
  }

  if (highEnd < 0) {
    return {
      requiredAnnualReturn: null,
      solvableInBounds: false,
      message: 'No solution found in search bounds (-50% to 30%).',
    };
  }

  let low = minReturn;
  let high = maxReturn;

  for (let i = 0; i < maxIterations; i += 1) {
    const mid = (low + high) / 2;
    const midEnd = endingAt(mid) - inputs.targetEstateAtDeath;

    if (Math.abs(midEnd) <= tolerance || (high - low) / 2 < tolerance) {
      return { requiredAnnualReturn: mid, solvableInBounds: true };
    }

    if (midEnd >= 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return { requiredAnnualReturn: (low + high) / 2, solvableInBounds: true, message: 'Solved with max-iteration approximation.' };
}
