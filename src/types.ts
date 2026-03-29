export type LifeStage = 'career' | 'gap' | 'freelance' | 'retired';

export type OneTimeCashFlowType = 'inflow' | 'outflow';

export interface OneTimeCashFlow {
  id: string;
  age: number;
  amount: number;
  type: OneTimeCashFlowType;
  category: string;
  note?: string;
}

export interface PlannerInputs {
  currentAge: number;
  freelanceAge: number;
  retirementAge: number;
  deathAge: number;

  currentAnnualIncome: number;
  freelanceIncomeRatio: number;
  retirementAnnualIncome: number;
  annualIncomeGrowthRate: number;

  currentAnnualExpense: number;
  freelanceExpenseRatio: number;
  retirementExpenseRatio: number;
  annualExpenseGrowthRate: number;

  gapYearsAfterLeavingJob: number;
  gapAnnualIncome: number;
  gapAnnualExpense: number;

  hasChildren: boolean;
  childCount: number;
  childStartAge: number;
  childSupportYears: number;
  annualChildCostPerChild: number;
  childCostGrowthRate: number;

  currentSavings: number;
  targetEstateAtDeath: number;
  assumedAnnualReturn: number;

  oneTimeCashFlows: OneTimeCashFlow[];
}

export interface YearRecord {
  age: number;
  stage: LifeStage;
  startingAssets: number;
  income: number;
  expenses: number;
  childCosts: number;
  oneTimeNetCashFlow: number;
  netCashFlowBeforeReturn: number;
  endingAssets: number;
}

export interface SimulationResult {
  yearlyRecords: YearRecord[];
  endingAssets: number;
  minimumAssets: number;
  failed: boolean;
  failureAge?: number;
}

export interface RequiredReturnResult {
  requiredAnnualReturn: number | null;
  solvableInBounds: boolean;
  message?: string;
}
