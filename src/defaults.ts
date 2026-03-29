import { PlannerInputs } from './types';

export const defaultInputs: PlannerInputs = {
  currentAge: 35,
  freelanceAge: 45,
  retirementAge: 62,
  deathAge: 90,

  currentAnnualIncome: 150000,
  freelanceIncomeRatio: 0.55,
  retirementAnnualIncome: 25000,
  annualIncomeGrowthRate: 0.03,

  currentAnnualExpense: 80000,
  freelanceExpenseRatio: 0.95,
  retirementExpenseRatio: 0.85,
  annualExpenseGrowthRate: 0.025,

  gapYearsAfterLeavingJob: 1,
  gapAnnualIncome: 0,
  gapAnnualExpense: 60000,

  hasChildren: true,
  childCount: 2,
  childStartAge: 36,
  childSupportYears: 18,
  annualChildCostPerChild: 12000,
  childCostGrowthRate: 0.025,

  currentSavings: 300000,
  targetEstateAtDeath: 500000,
  assumedAnnualReturn: 0.06,

  oneTimeCashFlows: [
    {
      id: 'evt-1',
      age: 40,
      amount: 75000,
      type: 'outflow',
      category: 'home purchase',
      note: 'Down payment boost',
    },
    {
      id: 'evt-2',
      age: 70,
      amount: 150000,
      type: 'inflow',
      category: 'inheritance',
      note: 'Family inheritance',
    },
  ],
};
