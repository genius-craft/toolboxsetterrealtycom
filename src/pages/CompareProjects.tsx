import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ToolboxProject, ProjectType } from '@/hooks/useProjects';
import { formatCompactCurrency, formatPercentage, formatCurrency } from '@/lib/formatters';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Metric = {
  label: string;
  getValue: (p: ToolboxProject) => number | string | null | undefined;
  format?: (v: any) => string;
  betterWhen?: 'higher' | 'lower';
  isNumeric?: boolean;
};

const metricsByType: Record<ProjectType, Metric[]> = {
  simulador: [
    { label: 'Investimento Total', getValue: (p) => p.results.totalInvestment, format: formatCompactCurrency, betterWhen: 'lower', isNumeric: true },
    { label: 'NOI Anual', getValue: (p) => p.results.noi, format: formatCompactCurrency, betterWhen: 'higher', isNumeric: true },
    { label: 'Cap Rate Mensal', getValue: (p) => p.results.monthlyCapRate ?? (p.results.noi / 12) / p.results.totalInvestment, format: formatPercentage, betterWhen: 'higher', isNumeric: true },
    { label: 'Cap Rate Anual', getValue: (p) => p.results.capRate ?? p.results.noi / p.results.totalInvestment, format: formatPercentage, betterWhen: 'higher', isNumeric: true },
    { label: 'TIR', getValue: (p) => p.results.irr, format: formatPercentage, betterWhen: 'higher', isNumeric: true },
    { label: 'Payback (anos)', getValue: (p) => p.results.payback, format: (v) => v ? `${Number(v).toFixed(1)} anos` : '—', betterWhen: 'lower', isNumeric: true },
  ],
  permuta: [
    { label: 'Vencedor', getValue: (p) => p.results.winner },
    { label: 'VPL Vender', getValue: (p) => p.results.npvSell, format: formatCompactCurrency, betterWhen: 'higher', isNumeric: true },
    { label: 'VPL Permutar', getValue: (p) => p.results.npvPermuta, format: formatCompactCurrency, betterWhen: 'higher', isNumeric: true },
    { label: 'Diferença', getValue: (p) => p.results.delta, format: formatCompactCurrency, isNumeric: true },
  ],
  hbu: [
    { label: 'Melhor Uso', getValue: (p) => p.results.winner },
    { label: 'VPL Melhor Cenário', getValue: (p) => p.results.bestNpv, format: formatCompactCurrency, betterWhen: 'higher', isNumeric: true },
    { label: 'TIR Melhor Cenário', getValue: (p) => p.results.bestIrr, format: formatPercentage, betterWhen: 'higher', isNumeric: true },
  ],
  decisor: [
    { label: 'Veredicto', getValue: (p) => p.results.verdict },
    { label: 'Score', getValue: (p) => p.results.score, format: (v) => v != null ? `${Number(v).toFixed(0)}/100` : '—', betterWhen: 'higher', isNumeric: true },
    { label: 'TIR', getValue: (p) => p.results.irr, format: formatPercentage, betterWhen: 'higher', isNumeric: true },
    { label: 'Cap Rate', getValue: (p) => p.results.capRate, format: formatPercentage, betterWhen: 'higher', isNumeric: true },
  ],
  preco_teto: [
    { label: 'Preço Teto', getValue: (p) => p.results.maxPrice, format: formatCompactCurrency, betterWhen: 'higher', isNumeric: true },
    { label: 'Cap Rate Alvo', getValue: (p) => p.inputs.targetCapRate, format: formatPercentage, isNumeric: true },
    { label: 'NOI Estimado', getValue: (p) => p.results.estimatedNoi, format: formatCompactCurrency, betterWhen: 'higher', isNumeric: true },
  ],
};

export default function CompareProjects() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const ids = useMemo(() => (searchParams.get('ids') || '').split(',').filter(Boolean), [searchParams]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['compare_projects', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from('toolbox_projects')
        .select('*')
        .in('id', ids);
      if (error) throw error;
      return data as ToolboxProject[];
    },
    enabled: !!user && ids.length > 0,
  });

  if (!user) {
    return <div className="p-8 text-center">Faça login para comparar projetos.</div>;
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <h2 className="font-serif text-xl mb-2">Nada para comparar</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Volte ao Dashboard e selecione 2 ou 3 projetos do mesmo tipo.
        </p>
        <Link to="/dashboard">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Dashboard</Button>
        </Link>
      </div>
    );
  }

  const type = projects[0].project_type as ProjectType;
  const allSameType = projects.every((p) => p.project_type === type);

  if (!allSameType) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h2 className="font-serif text-xl mb-2">Tipos diferentes</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Só é possível comparar projetos da mesma ferramenta.
        </p>
        <Link to="/dashboard"><Button variant="outline">Voltar</Button></Link>
      </div>
    );
  }

  const metrics = metricsByType[type] || [];

  // Compute best/worst per row
  const computeBestWorst = (m: Metric) => {
    if (!m.isNumeric || !m.betterWhen) return { bestId: null, worstId: null };
    const valid = projects
      .map((p) => ({ id: p.id, v: Number(m.getValue(p)) }))
      .filter((x) => Number.isFinite(x.v));
    if (valid.length < 2) return { bestId: null, worstId: null };
    const sorted = [...valid].sort((a, b) => (m.betterWhen === 'higher' ? b.v - a.v : a.v - b.v));
    return { bestId: sorted[0].id, worstId: sorted[sorted.length - 1].id };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="font-serif text-3xl font-medium mb-1">Comparação de Projetos</h1>
        <p className="text-muted-foreground">
          {projects.length} projetos · Tipo: <span className="capitalize">{type.replace('_', ' ')}</span>
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] font-medium">Métrica</TableHead>
              {projects.map((p) => (
                <TableHead key={p.id} className="font-medium text-foreground">
                  <div className="truncate max-w-[200px]">{p.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    {new Date(p.updated_at).toLocaleDateString('pt-BR')}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((m) => {
              const { bestId, worstId } = computeBestWorst(m);
              return (
                <TableRow key={m.label}>
                  <TableCell className="font-medium text-muted-foreground">{m.label}</TableCell>
                  {projects.map((p) => {
                    const raw = m.getValue(p);
                    const display = raw == null || raw === '' || (typeof raw === 'number' && !Number.isFinite(raw))
                      ? '—'
                      : (m.format ? m.format(raw) : String(raw));
                    const isBest = p.id === bestId;
                    const isWorst = p.id === worstId;
                    return (
                      <TableCell
                        key={p.id}
                        className={cn(
                          'font-mono',
                          isBest && 'text-green-600 dark:text-green-400 font-semibold',
                          isWorst && 'text-red-600 dark:text-red-400'
                        )}
                      >
                        <span className="inline-flex items-center gap-1">
                          {isBest && <TrendingUp className="h-3 w-3" />}
                          {isWorst && <TrendingDown className="h-3 w-3" />}
                          {display}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Valores destacados em <span className="text-green-600 dark:text-green-400 font-medium">verde</span> indicam o melhor desempenho;
        em <span className="text-red-600 dark:text-red-400 font-medium">vermelho</span>, o pior.
      </p>
    </div>
  );
}
