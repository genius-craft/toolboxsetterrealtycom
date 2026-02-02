import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { formatCompactCurrency } from '@/lib/formatters';
import { useIsMobile } from '@/hooks/use-mobile';

interface CashFlowChartProps {
  data: { year: number; value: number }[];
  locked?: boolean;
}

export function CashFlowChart({ data, locked = false }: CashFlowChartProps) {
  const isMobile = useIsMobile();

  if (locked) {
    return (
      <div className="h-48 sm:h-64 bg-secondary/50 rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Faça login para ver o gráfico
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-2 sm:p-3">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Ano {label}</p>
          <p className="font-mono text-xs sm:text-sm font-medium">
            {formatCompactCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-48 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 9 : 11 }}
            tickFormatter={(value) => formatCompactCurrency(value)}
            width={isMobile ? 50 : 70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}