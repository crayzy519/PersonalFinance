import { getStageLabel } from '../financialModel';
import { formatCurrency } from '../format';
import { YearRecord } from '../types';

interface YearlyTableProps {
  records: YearRecord[];
}

export function YearlyTable({ records }: YearlyTableProps) {
  return (
    <div className="card">
      <h2>Year-by-Year Simulation</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Age</th>
              <th>Stage</th>
              <th>Starting Assets</th>
              <th>Income</th>
              <th>Expenses</th>
              <th>Child Costs</th>
              <th>One-Time Net</th>
              <th>Net Before Return</th>
              <th>Ending Assets</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row) => (
              <tr key={row.age}>
                <td>{row.age}</td>
                <td>{getStageLabel(row.stage)}</td>
                <td>{formatCurrency(row.startingAssets)}</td>
                <td>{formatCurrency(row.income)}</td>
                <td>{formatCurrency(row.expenses)}</td>
                <td>{formatCurrency(row.childCosts)}</td>
                <td>{formatCurrency(row.oneTimeNetCashFlow)}</td>
                <td>{formatCurrency(row.netCashFlowBeforeReturn)}</td>
                <td className={row.endingAssets < 0 ? 'negative' : ''}>{formatCurrency(row.endingAssets)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
