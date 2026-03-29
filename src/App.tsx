import { ChangeEvent, useMemo, useState } from 'react';
import { defaultInputs } from './defaults';
import { solveRequiredReturn, simulatePlan } from './financialModel';
import { formatCurrency, formatPercent } from './format';
import { OneTimeCashFlow, PlannerInputs } from './types';
import { validateInputs } from './validation';
import { InputSection } from './components/InputSection';
import { AssetChart } from './components/AssetChart';
import { YearlyTable } from './components/YearlyTable';

const cashFlowCategories = ['inheritance', 'medical', 'childbirth', 'college', 'home purchase', 'other'];

export default function App() {
  const [inputs, setInputs] = useState<PlannerInputs>(defaultInputs);

  const errors = useMemo(() => validateInputs(inputs), [inputs]);

  const simulation = useMemo(() => {
    if (errors.length > 0) {
      return null;
    }
    return simulatePlan(inputs, inputs.assumedAnnualReturn);
  }, [inputs, errors]);

  const requiredReturn = useMemo(() => {
    if (errors.length > 0) {
      return null;
    }
    return solveRequiredReturn(inputs);
  }, [inputs, errors]);

  const updateNumber = <K extends keyof PlannerInputs>(key: K, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(value) ? value : 0 }));
  };

  const updateBoolean = <K extends keyof PlannerInputs>(key: K, value: boolean) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleNumericInput =
    <K extends keyof PlannerInputs>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value === '' ? 0 : Number(event.target.value);
      updateNumber(key, next);
    };

  const updateCashFlow = (id: string, patch: Partial<OneTimeCashFlow>) => {
    setInputs((prev) => ({
      ...prev,
      oneTimeCashFlows: prev.oneTimeCashFlows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  };

  const removeCashFlow = (id: string) => {
    setInputs((prev) => ({ ...prev, oneTimeCashFlows: prev.oneTimeCashFlows.filter((row) => row.id !== id) }));
  };

  const addCashFlow = () => {
    setInputs((prev) => ({
      ...prev,
      oneTimeCashFlows: [
        ...prev.oneTimeCashFlows,
        {
          id: `evt-${crypto.randomUUID()}`,
          age: prev.currentAge,
          amount: 0,
          type: 'outflow',
          category: 'other',
          note: '',
        },
      ],
    }));
  };

  return (
    <main className="app-shell">
      <header>
        <h1>Personal Financial Planning Simulator</h1>
        <p>Model your career, gap years, freelance life, and retirement using a simple annual simulation.</p>
      </header>

      <div className="layout">
        <div>
          <InputSection title="A. Life Timeline">
            <label>Current Age<input type="number" value={inputs.currentAge} onChange={handleNumericInput('currentAge')} /></label>
            <label>Freelance Age<input type="number" value={inputs.freelanceAge} onChange={handleNumericInput('freelanceAge')} /></label>
            <label>Retirement Age<input type="number" value={inputs.retirementAge} onChange={handleNumericInput('retirementAge')} /></label>
            <label>Death Age<input type="number" value={inputs.deathAge} onChange={handleNumericInput('deathAge')} /></label>
          </InputSection>

          <InputSection title="B. Income Assumptions">
            <label>Current Annual Income<input type="number" value={inputs.currentAnnualIncome} onChange={handleNumericInput('currentAnnualIncome')} /></label>
            <label>Freelance Income Ratio<input step="0.01" type="number" value={inputs.freelanceIncomeRatio} onChange={handleNumericInput('freelanceIncomeRatio')} /></label>
            <label>Retirement Annual Income<input type="number" value={inputs.retirementAnnualIncome} onChange={handleNumericInput('retirementAnnualIncome')} /></label>
            <label>Annual Income Growth Rate<input step="0.001" type="number" value={inputs.annualIncomeGrowthRate} onChange={handleNumericInput('annualIncomeGrowthRate')} /></label>
          </InputSection>

          <InputSection title="C. Expense Assumptions">
            <label>Current Annual Expense<input type="number" value={inputs.currentAnnualExpense} onChange={handleNumericInput('currentAnnualExpense')} /></label>
            <label>Freelance Expense Ratio<input step="0.01" type="number" value={inputs.freelanceExpenseRatio} onChange={handleNumericInput('freelanceExpenseRatio')} /></label>
            <label>Retirement Expense Ratio<input step="0.01" type="number" value={inputs.retirementExpenseRatio} onChange={handleNumericInput('retirementExpenseRatio')} /></label>
            <label>Annual Expense Growth Rate<input step="0.001" type="number" value={inputs.annualExpenseGrowthRate} onChange={handleNumericInput('annualExpenseGrowthRate')} /></label>
          </InputSection>

          <InputSection title="D. Gap Year Assumptions">
            <label>Gap Years After Leaving Job<input type="number" value={inputs.gapYearsAfterLeavingJob} onChange={handleNumericInput('gapYearsAfterLeavingJob')} /></label>
            <label>Gap Annual Income<input type="number" value={inputs.gapAnnualIncome} onChange={handleNumericInput('gapAnnualIncome')} /></label>
            <label>Gap Annual Expense<input type="number" value={inputs.gapAnnualExpense} onChange={handleNumericInput('gapAnnualExpense')} /></label>
          </InputSection>

          <InputSection title="E. Children">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={inputs.hasChildren}
                onChange={(e) => updateBoolean('hasChildren', e.target.checked)}
              />
              Has Children
            </label>
            <label>Child Count<input type="number" value={inputs.childCount} onChange={handleNumericInput('childCount')} /></label>
            <label>Child Start Age<input type="number" value={inputs.childStartAge} onChange={handleNumericInput('childStartAge')} /></label>
            <label>Child Support Years<input type="number" value={inputs.childSupportYears} onChange={handleNumericInput('childSupportYears')} /></label>
            <label>Annual Child Cost Per Child<input type="number" value={inputs.annualChildCostPerChild} onChange={handleNumericInput('annualChildCostPerChild')} /></label>
            <label>Child Cost Growth Rate<input step="0.001" type="number" value={inputs.childCostGrowthRate} onChange={handleNumericInput('childCostGrowthRate')} /></label>
          </InputSection>

          <InputSection title="F. One-Time Cash Flows">
            <div className="flow-header-row">
              <button className="secondary" type="button" onClick={addCashFlow}>+ Add Event</button>
            </div>
            <div className="flow-list">
              {inputs.oneTimeCashFlows.map((flow) => (
                <div key={flow.id} className="flow-row">
                  <label>Age<input type="number" value={flow.age} onChange={(e) => updateCashFlow(flow.id, { age: Number(e.target.value) || 0 })} /></label>
                  <label>Amount<input type="number" value={flow.amount} onChange={(e) => updateCashFlow(flow.id, { amount: Number(e.target.value) || 0 })} /></label>
                  <label>
                    Type
                    <select value={flow.type} onChange={(e) => updateCashFlow(flow.id, { type: e.target.value as OneTimeCashFlow['type'] })}>
                      <option value="inflow">inflow</option>
                      <option value="outflow">outflow</option>
                    </select>
                  </label>
                  <label>
                    Category
                    <select value={flow.category} onChange={(e) => updateCashFlow(flow.id, { category: e.target.value })}>
                      {cashFlowCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label>Note<input value={flow.note ?? ''} onChange={(e) => updateCashFlow(flow.id, { note: e.target.value })} /></label>
                  <button type="button" className="danger" onClick={() => removeCashFlow(flow.id)}>Remove</button>
                </div>
              ))}
            </div>
          </InputSection>

          <InputSection title="G + H. Assets, Goal, and Return">
            <label>Current Savings<input type="number" value={inputs.currentSavings} onChange={handleNumericInput('currentSavings')} /></label>
            <label>Target Estate at Death<input type="number" value={inputs.targetEstateAtDeath} onChange={handleNumericInput('targetEstateAtDeath')} /></label>
            <label>Assumed Annual Return<input step="0.001" type="number" value={inputs.assumedAnnualReturn} onChange={handleNumericInput('assumedAnnualReturn')} /></label>
          </InputSection>
        </div>

        <div>
          <section className="card sticky">
            <h2>Plan Results</h2>
            {errors.length > 0 ? (
              <ul className="error-list">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : (
              <div className="metrics">
                <div className="metric"><span>Required annual return</span><strong>{requiredReturn?.requiredAnnualReturn !== null ? formatPercent(requiredReturn?.requiredAnnualReturn ?? 0) : 'No solution in bounds'}</strong></div>
                {requiredReturn?.message ? <small>{requiredReturn.message}</small> : null}
                <div className="metric"><span>Ending estate (assumed return)</span><strong>{formatCurrency(simulation?.endingAssets ?? 0)}</strong></div>
                <div className="metric"><span>Plan success at assumed return</span><strong className={(simulation?.endingAssets ?? 0) >= inputs.targetEstateAtDeath ? 'ok' : 'negative'}>{(simulation?.endingAssets ?? 0) >= inputs.targetEstateAtDeath ? 'Success' : 'Shortfall'}</strong></div>
                <div className="metric"><span>Minimum asset level</span><strong>{formatCurrency(simulation?.minimumAssets ?? 0)}</strong></div>
                <div className="metric"><span>Age assets first go negative</span><strong>{simulation?.failureAge ?? 'Never'}</strong></div>
              </div>
            )}
          </section>

          {simulation && (
            <>
              <AssetChart records={simulation.yearlyRecords} />
              <YearlyTable records={simulation.yearlyRecords} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
