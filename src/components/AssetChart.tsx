import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { YearRecord } from '../types';
import { formatCurrency } from '../format';

interface AssetChartProps {
  records: YearRecord[];
}

export function AssetChart({ records }: AssetChartProps) {
  return (
    <div className="card">
      <h2>Net Worth Curve</h2>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={records}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" />
            <YAxis tickFormatter={(value) => formatCurrency(value as number)} width={100} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Age ${label}`}
            />
            <ReferenceLine y={0} stroke="#b91c1c" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="endingAssets" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
