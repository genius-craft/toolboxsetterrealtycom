import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCompactCurrency } from '@/lib/formatters';

interface ComparisonData {
  name: string;
  nominal: number;
  npv: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  locked?: boolean;
}

export function ComparisonChart({ data, locked = false }: ComparisonChartProps) {
  if (locked) {
    return (
      <div className="h-64 bg-secondary/50 rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Faça login para ver a análise completa
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.name}:</span>
              <span className="font-mono text-sm font-medium">
                {formatCompactCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickFormatter={(value) => formatCompactCurrency(value)}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
          <Legend
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
          <Bar
            dataKey="nominal"
            name="Valor Nominal"
            fill="hsl(var(--muted-foreground))"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="npv"
            name="Valor Presente"
            fill="hsl(var(--accent))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
