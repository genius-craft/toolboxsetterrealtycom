import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects, useDeleteProject, ProjectType } from '@/hooks/useProjects';
import { useDuplicateProject } from '@/hooks/useProjectVersions';
import { formatCompactCurrency, formatPercentage } from '@/lib/formatters';
import {
  Calculator,
  Repeat2,
  Map,
  CheckCircle,
  Target,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  BarChart3,
  TrendingUp,
  Wallet,
  ListChecks,
  Trophy,
  X,
  Sparkles,
  Percent,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthModal } from '@/components/auth/AuthModal';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { OnboardingTour } from '@/components/OnboardingTour';
import { StarterWizard } from '@/components/dashboard/StarterWizard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip as RTooltip } from 'recharts';

const projectTypeConfig: Record<ProjectType, { label: string; icon: typeof Calculator; path: string; color: string; description: string }> = {
  simulador: { label: 'Simulador', icon: Calculator, path: '/simulador', color: 'text-blue-500', description: 'Simule investimentos imobiliários com fluxo de caixa detalhado' },
  permuta: { label: 'Permuta', icon: Repeat2, path: '/permuta', color: 'text-purple-500', description: 'Compare vender agora vs. permutar com incorporadora' },
  hbu: { label: 'H&BU', icon: Map, path: '/highest-best-use', color: 'text-emerald-500', description: 'Descubra o melhor uso para o seu terreno' },
  decisor: { label: 'Decisor', icon: CheckCircle, path: '/decisor', color: 'text-amber-500', description: 'Decida entre comprar ou não com base em métricas' },
  preco_teto: { label: 'Preço Teto', icon: Target, path: '/preco-teto', color: 'text-rose-500', description: 'Calcule o preço máximo que vale pagar' },
};

const TOUR_STEPS = [
  {
    title: 'Bem-vindo ao Setter Toolbox!',
    description: 'Vamos fazer um tour rápido pelo Dashboard. Em 5 passos você conhecerá tudo o que precisa saber.',
  },
  {
    selector: '[data-tour="new-project"]',
    title: 'Criar uma nova análise',
    description: 'Escolha aqui qual ferramenta usar: Simulador, Permuta, H&BU, Decisor ou Preço Teto.',
  },
  {
    selector: '[data-tour="filters"]',
    title: 'Filtrar por tipo',
    description: 'Use os filtros para focar em um tipo específico de análise.',
  },
  {
    selector: '[data-tour="compare-btn"]',
    title: 'Comparar projetos',
    description: 'Ative o modo Comparar para selecionar 2 ou 3 projetos do mesmo tipo e ver os KPIs lado a lado.',
  },
  {
    selector: '[data-tour="sidebar"]',
    title: 'Menu lateral',
    description: 'Acesse rapidamente todas as ferramentas pelo menu da esquerda. Você pode refazer este tour a qualquer momento.',
  },
];

function ProjectCardSkeleton({ index }: { index: number }) {
  return (
    <div className={cn('bg-card rounded-lg border border-border p-6 animate-fade-up', `delay-${index * 100}`)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg skeleton-shimmer" />
          <div className="h-3 w-16 rounded skeleton-shimmer" />
        </div>
        <div className="h-3 w-20 rounded skeleton-shimmer" />
      </div>
      <div className="h-5 rounded skeleton-shimmer w-3/4 mb-3" />
      <div className="h-4 rounded skeleton-shimmer w-1/2 mb-4" />
      <div className="flex gap-2">
        <div className="h-9 rounded-md skeleton-shimmer flex-1" />
        <div className="h-9 w-9 rounded-md skeleton-shimmer" />
      </div>
    </div>
  );
}

// TODO: mover para tool_config (benchmark configurável pelo admin)
const CDI_BENCHMARK = 0.12;

function DeltaBadge({ value, suffix = '%' }: { value: number | null; suffix?: string }) {
  if (value == null || !Number.isFinite(value)) return null;
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md',
        positive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
      )}
    >
      <Icon className="h-3 w-3" />
      {positive ? '+' : ''}{Math.round(value)}{suffix}
    </span>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  iconColor,
  delta,
  benchmark,
  sparkline,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
  iconColor: string;
  delta?: number | null;
  benchmark?: { label: string; tone: 'positive' | 'neutral' | 'negative' };
  sparkline?: { label: string; count: number }[];
}) {
  const benchmarkTone =
    benchmark?.tone === 'positive'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : benchmark?.tone === 'negative'
      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400';

  return (
    <div className="relative bg-card border border-border rounded-lg p-4 shadow-card overflow-hidden">
      {sparkline && sparkline.length > 0 && (
        <div className="absolute inset-y-0 right-0 w-20 opacity-30 pointer-events-none hidden sm:block">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline} margin={{ top: 8, right: 4, bottom: 8, left: 0 }}>
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--accent))"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="relative flex items-start justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
      <div className="relative flex items-baseline gap-2 flex-wrap">
        <div className="font-mono text-2xl font-medium">{value}</div>
        {delta != null && <DeltaBadge value={delta} />}
      </div>
      <div className="relative flex items-center gap-2 mt-1 min-h-[16px]">
        {hint && <div className="text-xs text-muted-foreground truncate">{hint}</div>}
        {benchmark && (
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md whitespace-nowrap', benchmarkTone)}>
            {benchmark.label}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [filter, setFilter] = useState<ProjectType | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [tourOpen, setTourOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const { data: projects, isLoading } = useProjects(filter === 'all' ? undefined : filter);
  const { data: allProjects } = useProjects();
  const deleteProject = useDeleteProject();
  const duplicateProject = useDuplicateProject();

  // Auto-trigger onboarding for new users
  useEffect(() => {
    if (user && !localStorage.getItem('onboarding_completed') && allProjects !== undefined) {
      const t = setTimeout(() => setTourOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [user, allProjects]);

  // Auto-open wizard for users with zero projects (only once)
  useEffect(() => {
    if (
      user &&
      allProjects !== undefined &&
      allProjects.length === 0 &&
      !localStorage.getItem('wizard_seen')
    ) {
      const t = setTimeout(() => {
        setWizardOpen(true);
        localStorage.setItem('wizard_seen', '1');
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [user, allProjects]);

  const aggregates = useMemo(() => {
    if (!allProjects || allProjects.length === 0) return null;
    let totalInvestment = 0;
    const irrs: number[] = [];
    const capRates: number[] = [];
    let best: { id: string; name: string; type: ProjectType; metric: string; value: number; display: string } | null = null;
    const byType: Record<string, number> = {};

    for (const p of allProjects) {
      byType[p.project_type] = (byType[p.project_type] || 0) + 1;

      const inv = Number(p.results?.totalInvestment || p.inputs?.askingPrice || p.inputs?.purchasePrice || 0);
      if (Number.isFinite(inv)) totalInvestment += inv;

      const irr = Number(p.results?.irr);
      if (Number.isFinite(irr)) {
        irrs.push(irr);
        if (!best || irr > best.value) {
          best = { id: p.id, name: p.name, type: p.project_type, metric: 'TIR', value: irr, display: formatPercentage(irr) };
        }
      }

      if (p.project_type === 'simulador') {
        const cr = Number(
          p.results?.monthlyCapRate ??
            (p.results?.noi && p.results?.totalInvestment ? p.results.noi / 12 / p.results.totalInvestment : NaN)
        );
        if (Number.isFinite(cr)) capRates.push(cr);
      }
    }

    // Monthly counts (last 6 months)
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('pt-BR', { month: 'short' });
      const count = allProjects.filter((p) => {
        const cd = new Date(p.created_at);
        return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
      }).length;
      months.push({ label, count });
    }

    const thisMonth = months[months.length - 1]?.count || 0;
    const prevMonth = months[months.length - 2]?.count || 0;
    const monthDelta = prevMonth === 0 ? (thisMonth > 0 ? 100 : null) : ((thisMonth - prevMonth) / prevMonth) * 100;

    const avgIrr = irrs.length ? irrs.reduce((a, b) => a + b, 0) / irrs.length : null;
    const avgCapRate = capRates.length ? capRates.reduce((a, b) => a + b, 0) / capRates.length : null;

    return {
      total: allProjects.length,
      totalInvestment,
      avgTicket: allProjects.length ? totalInvestment / allProjects.length : 0,
      avgIrr,
      irrMin: irrs.length ? Math.min(...irrs) : null,
      irrMax: irrs.length ? Math.max(...irrs) : null,
      irrCount: irrs.length,
      avgCapRate,
      capCount: capRates.length,
      best,
      byType,
      months,
      thisMonth,
      monthDelta,
    };
  }, [allProjects]);

  const handleDelete = () => {
    if (deleteId) {
      deleteProject.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const toggleSelect = (id: string, type: ProjectType) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      // limit to 3, same type
      const others = projects?.filter((p) => prev.includes(p.id)) || [];
      if (others.length > 0 && others[0].project_type !== type) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selected.length < 2) return;
    navigate(`/comparar?ids=${selected.join(',')}`);
  };

  const handleDuplicate = async (project: any) => {
    const newProj = await duplicateProject.mutateAsync({
      project_type: project.project_type,
      name: project.name,
      inputs: project.inputs,
      results: project.results,
    });
    const config = projectTypeConfig[project.project_type as ProjectType];
    if (config && newProj?.id) {
      navigate(`${config.path}?id=${newProj.id}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-up">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="font-serif text-2xl mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Faça login para ver seus projetos salvos e ter acesso completo às ferramentas.
          </p>
          <Button variant="gold" onClick={() => setAuthModalOpen(true)}>Entrar</Button>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-up">
          <div>
            <h1 className="font-serif text-3xl font-medium">Meus Projetos</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas simulações e análises</p>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <Button
              variant="gold"
              size="sm"
              onClick={() => setWizardOpen(true)}
              className="shadow-card hover:shadow-card-hover active:scale-[0.97] transition-all"
            >
              <Compass className="h-4 w-4 mr-1.5" />
              Por onde começar?
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setTourOpen(true)} className="text-muted-foreground">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Tour
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refazer o tour guiado</TooltipContent>
            </Tooltip>

            <div data-tour="compare-btn">
              <Button
                variant={compareMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setCompareMode((m) => !m);
                  setSelected([]);
                }}
                disabled={!allProjects || allProjects.length < 2}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {compareMode ? 'Sair de Comparar' : 'Comparar'}
              </Button>
            </div>

            <div data-tour="new-project" className="flex gap-2 flex-wrap">
              {Object.entries(projectTypeConfig).map(([key, config]) => (
                <Link key={key} to={config.path}>
                  <Button variant="outline" size="sm" className="transition-all duration-200 active:scale-[0.97]">
                    <config.icon className={cn('h-4 w-4 mr-2', config.color)} />
                    {config.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Aggregates */}
        {aggregates && aggregates.total > 0 && (() => {
          const irrBenchmark = aggregates.avgIrr != null
            ? aggregates.avgIrr > CDI_BENCHMARK + 0.02
              ? { label: `vs CDI ${formatPercentage(CDI_BENCHMARK)}`, tone: 'positive' as const }
              : aggregates.avgIrr < CDI_BENCHMARK - 0.02
              ? { label: `vs CDI ${formatPercentage(CDI_BENCHMARK)}`, tone: 'negative' as const }
              : { label: `~ CDI ${formatPercentage(CDI_BENCHMARK)}`, tone: 'neutral' as const }
            : undefined;

          const maxTypeCount = Math.max(1, ...Object.values(aggregates.byType));
          const topConfig = aggregates.best ? projectTypeConfig[aggregates.best.type] : null;

          return (
            <div className="space-y-3 mb-6 animate-fade-up delay-75">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                  icon={ListChecks}
                  label="Análises"
                  value={String(aggregates.total)}
                  hint={`${aggregates.thisMonth} este mês`}
                  iconColor="text-blue-500"
                  delta={aggregates.monthDelta}
                  sparkline={aggregates.months}
                />
                <KpiCard
                  icon={Wallet}
                  label="Investimento total"
                  value={formatCompactCurrency(aggregates.totalInvestment)}
                  hint={`Ticket médio: ${formatCompactCurrency(aggregates.avgTicket)}`}
                  iconColor="text-emerald-500"
                />
                <KpiCard
                  icon={TrendingUp}
                  label="TIR média"
                  value={aggregates.avgIrr != null ? formatPercentage(aggregates.avgIrr) : '—'}
                  hint={
                    aggregates.irrCount > 0 && aggregates.irrMin != null && aggregates.irrMax != null
                      ? `Faixa: ${formatPercentage(aggregates.irrMin)}–${formatPercentage(aggregates.irrMax)}`
                      : 'Sem dados ainda'
                  }
                  iconColor="text-amber-500"
                  benchmark={irrBenchmark}
                />
                <KpiCard
                  icon={Percent}
                  label="Cap Rate mensal"
                  value={aggregates.avgCapRate != null ? formatPercentage(aggregates.avgCapRate) : '—'}
                  hint={
                    aggregates.capCount > 0
                      ? `${aggregates.capCount} ${aggregates.capCount === 1 ? 'simulação' : 'simulações'}`
                      : 'Só no Simulador'
                  }
                  iconColor="text-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Top projeto */}
                <div className="lg:col-span-2 relative bg-gradient-to-br from-accent/10 via-card to-card border border-accent/30 rounded-lg p-4 shadow-card overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-accent" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Top projeto</span>
                    </div>
                    {topConfig && (
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        {topConfig.label}
                      </span>
                    )}
                  </div>
                  {aggregates.best && topConfig ? (
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-secondary rounded-lg shrink-0">
                          <topConfig.icon className={cn('h-5 w-5', topConfig.color)} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif text-lg font-medium truncate">{aggregates.best.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {aggregates.best.metric}: <span className="font-mono text-accent">{aggregates.best.display}</span>
                          </div>
                        </div>
                      </div>
                      <Link to={`${topConfig.path}?id=${aggregates.best.id}`}>
                        <Button variant="gold" size="sm" className="active:scale-[0.97] transition-all">
                          Abrir
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Sem TIR calculada ainda. Crie uma simulação para ver o destaque.</div>
                  )}
                </div>

                {/* Distribuição por tipo */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Por tipo</span>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    {(Object.keys(projectTypeConfig) as ProjectType[]).map((t) => {
                      const count = aggregates.byType[t] || 0;
                      const cfg = projectTypeConfig[t];
                      const pct = (count / maxTypeCount) * 100;
                      return (
                        <div key={t} className="flex items-center gap-2 text-xs">
                          <cfg.icon className={cn('h-3 w-3 shrink-0', cfg.color)} />
                          <span className="w-16 truncate text-muted-foreground">{cfg.label}</span>
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent/70 transition-all duration-500"
                              style={{ width: count > 0 ? `${Math.max(6, pct)}%` : '0%' }}
                            />
                          </div>
                          <span className="font-mono tabular-nums w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Compare bar */}
        {compareMode && (
          <div className="flex items-center justify-between gap-2 mb-4 p-3 rounded-lg border border-accent/40 bg-accent/5 animate-fade-up">
            <div className="text-sm">
              <span className="font-medium">{selected.length}</span> de 3 selecionados
              <span className="text-muted-foreground ml-2">(mesmo tipo, mín. 2)</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                <X className="h-4 w-4 mr-1" /> Limpar
              </Button>
              <Button variant="gold" size="sm" onClick={handleCompare} disabled={selected.length < 2}>
                Comparar selecionados
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div data-tour="filters" className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-fade-up delay-100">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')} className="transition-all duration-200 active:scale-[0.97]">
            Todos
          </Button>
          {Object.entries(projectTypeConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as ProjectType)}
              className="transition-all duration-200 active:scale-[0.97]"
            >
              <config.icon className={cn('h-4 w-4 mr-2', config.color)} />
              {config.label}
            </Button>
          ))}
        </div>

        {/* Projects list */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <ProjectCardSkeleton key={i} index={i} />)}
          </div>
        ) : projects?.length === 0 ? (
          <div className="animate-fade-up delay-200">
            <div className="text-center py-8 mb-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-secondary mb-4">
                <Calculator className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-2xl mb-2">Crie sua primeira análise</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Escolha uma ferramenta abaixo para começar.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {Object.entries(projectTypeConfig).map(([key, config], i) => (
                <Link
                  key={key}
                  to={config.path}
                  className={cn(
                    'group bg-card rounded-lg border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] animate-fade-up',
                    `delay-${(i + 1) * 100}`
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-secondary rounded-lg group-hover:bg-accent/10 transition-colors">
                      <config.icon className={cn('h-5 w-5', config.color)} />
                    </div>
                    <h4 className="font-medium">{config.label}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{config.description}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Começar <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects?.map((project, i) => {
              const config = projectTypeConfig[project.project_type];
              const Icon = config.icon;
              const isSelected = selected.includes(project.id);
              const otherSelectedType = selected.length > 0 ? projects.find((p) => p.id === selected[0])?.project_type : null;
              const disabledForCompare = compareMode && !isSelected && otherSelectedType && otherSelectedType !== project.project_type;

              return (
                <div
                  key={project.id}
                  className={cn(
                    'bg-card rounded-lg border p-6 shadow-card transition-all duration-300 active:scale-[0.99] animate-fade-up relative',
                    `delay-${Math.min(i, 5) * 75}`,
                    isSelected ? 'border-accent ring-2 ring-accent/30' : 'border-border hover:shadow-card-hover hover:-translate-y-0.5',
                    disabledForCompare && 'opacity-50'
                  )}
                >
                  {compareMode && (
                    <div className="absolute top-3 left-3 z-10">
                      <Checkbox
                        checked={isSelected}
                        disabled={!!disabledForCompare}
                        onCheckedChange={() => toggleSelect(project.id, project.project_type)}
                      />
                    </div>
                  )}

                  <div className={cn('flex items-start justify-between mb-4', compareMode && 'pl-7')}>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.updated_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-medium mb-3 truncate">{project.name}</h3>

                  <div className="space-y-1 text-sm mb-4">
                    {project.project_type === 'simulador' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cap Rate Mensal</span>
                        <span className="font-mono text-accent">
                          {formatPercentage(project.results.monthlyCapRate ?? (project.results.noi / 12) / project.results.totalInvestment)}
                        </span>
                      </div>
                    )}
                    {project.project_type === 'permuta' && project.results.winner && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vencedor</span>
                        <span className="font-mono text-accent capitalize">{project.results.winner}</span>
                      </div>
                    )}
                    {project.project_type === 'hbu' && project.results.winner && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Melhor Uso</span>
                        <span className="font-mono text-accent">{project.results.winner}</span>
                      </div>
                    )}
                    {project.project_type === 'decisor' && project.results.verdict && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Veredicto</span>
                        <span className={cn('font-mono font-medium', project.results.verdict === 'GO' && 'text-green-600', project.results.verdict === 'NEGOTIATE' && 'text-amber-600', project.results.verdict === 'NO-GO' && 'text-red-600')}>
                          {project.results.verdict}
                        </span>
                      </div>
                    )}
                    {project.project_type === 'preco_teto' && project.results.maxPrice && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preço Teto</span>
                        <span className="font-mono text-accent">{formatCompactCurrency(project.results.maxPrice as number)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`${config.path}?id=${project.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full active:scale-[0.97] transition-all">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </Link>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(project)}
                          disabled={duplicateProject.isPending}
                          className="active:scale-[0.95] transition-all"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Duplicar</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(project.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 active:scale-[0.95] transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OnboardingTour
        steps={TOUR_STEPS}
        storageKey="onboarding_completed"
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      <StarterWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
