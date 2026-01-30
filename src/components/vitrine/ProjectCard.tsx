import { Link } from 'react-router-dom';
import { Calculator, ArrowLeftRight, TrendingUp, Scale, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/formatters';
import type { VitrineProject } from '@/hooks/useVitrineProjects';
import type { Json } from '@/integrations/supabase/types';

interface ProjectCardProps {
  project: VitrineProject;
}

const projectTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  simulador: { 
    label: 'Simulador', 
    icon: Calculator, 
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
  },
  permuta: { 
    label: 'Permuta', 
    icon: ArrowLeftRight, 
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
  },
  'highest-best-use': { 
    label: 'Highest & Best Use', 
    icon: TrendingUp, 
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
  },
  decisor: { 
    label: 'Decisor', 
    icon: Scale, 
    color: 'bg-green-500/10 text-green-500 border-green-500/20' 
  },
  'preco-teto': { 
    label: 'Preço Teto', 
    icon: DollarSign, 
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
  },
};

function getMetricsFromResults(results: Json, projectType: string): { label: string; value: string }[] {
  const metrics: { label: string; value: string }[] = [];
  
  if (!results || typeof results !== 'object' || Array.isArray(results)) {
    return metrics;
  }

  const r = results as Record<string, unknown>;

  switch (projectType) {
    case 'simulador':
      if (r.capRate !== undefined) {
        metrics.push({ label: 'Cap Rate', value: `${formatNumber(r.capRate as number, 1)}%` });
      }
      if (r.tirMensal !== undefined) {
        metrics.push({ label: 'TIR Mensal', value: `${formatNumber(r.tirMensal as number, 2)}%` });
      }
      if (r.vpl !== undefined) {
        metrics.push({ label: 'VPL', value: `R$ ${formatNumber(r.vpl as number / 1000, 0)}k` });
      }
      break;
    case 'permuta':
      if (r.paybackMesesDesdobrada !== undefined) {
        metrics.push({ label: 'Payback', value: `${formatNumber(r.paybackMesesDesdobrada as number, 0)} meses` });
      }
      if (r.vplIncorporador !== undefined) {
        metrics.push({ label: 'VPL Inc.', value: `R$ ${formatNumber((r.vplIncorporador as number) / 1000, 0)}k` });
      }
      break;
    case 'highest-best-use':
      if (r.scenarios && Array.isArray(r.scenarios) && r.scenarios.length > 0) {
        const best = r.scenarios[0] as Record<string, unknown>;
        if (best.label) {
          metrics.push({ label: 'Melhor Uso', value: String(best.label) });
        }
        if (best.score !== undefined) {
          metrics.push({ label: 'Score', value: formatNumber(best.score as number, 0) });
        }
      }
      break;
    case 'decisor':
      if (r.veredicto !== undefined) {
        const veredicto = r.veredicto as string;
        metrics.push({ label: 'Veredicto', value: veredicto === 'go' ? '✅ GO' : veredicto === 'no-go' ? '❌ NO-GO' : '⚠️ Análise' });
      }
      if (r.scoreTotal !== undefined) {
        metrics.push({ label: 'Score', value: `${formatNumber(r.scoreTotal as number, 0)}/100` });
      }
      break;
    case 'preco-teto':
      if (r.precoTetoCalculado !== undefined) {
        metrics.push({ label: 'Preço Teto', value: `R$ ${formatNumber((r.precoTetoCalculado as number) / 1000, 0)}k` });
      }
      if (r.margemSeguranca !== undefined) {
        metrics.push({ label: 'Margem', value: `${formatNumber(r.margemSeguranca as number, 1)}%` });
      }
      break;
  }

  return metrics.slice(0, 3);
}

export function ProjectCard({ project }: ProjectCardProps) {
  const {
    id,
    name,
    project_type,
    results,
    vitrine_title,
    vitrine_description,
    updated_at,
  } = project;

  const config = projectTypeConfig[project_type] || projectTypeConfig.simulador;
  const Icon = config.icon;
  const displayTitle = vitrine_title || name;
  const metrics = getMetricsFromResults(results, project_type);

  const formattedDate = new Date(updated_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      {/* Header with icon */}
      <div className="relative h-24 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
        <div className={`h-14 w-14 rounded-xl ${config.color} flex items-center justify-center`}>
          <Icon className="h-7 w-7" />
        </div>
      </div>

      <CardHeader className="pb-2">
        {/* Type Badge */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {displayTitle}
        </h3>

        {/* Description */}
        {vitrine_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {vitrine_description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pb-4">
        {/* Metrics */}
        {metrics.length > 0 && (
          <div className="space-y-2">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{metric.label}</span>
                <span className="font-medium">{metric.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/vitrine/${id}`}>
            Ver Análise Completa
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
