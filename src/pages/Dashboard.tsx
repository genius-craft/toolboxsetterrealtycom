import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects, useDeleteProject, ProjectType } from '@/hooks/useProjects';
import { formatCompactCurrency, formatPercentage } from '@/lib/formatters';
import {
  Calculator,
  Repeat2,
  Map,
  CheckCircle,
  Target,
  Plus,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthModal } from '@/components/auth/AuthModal';
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

const projectTypeConfig: Record<ProjectType, { label: string; icon: typeof Calculator; path: string; color: string; description: string }> = {
  simulador: {
    label: 'Simulador',
    icon: Calculator,
    path: '/simulador',
    color: 'text-blue-500',
    description: 'Simule investimentos imobiliários com fluxo de caixa detalhado',
  },
  permuta: {
    label: 'Permuta',
    icon: Repeat2,
    path: '/permuta',
    color: 'text-purple-500',
    description: 'Compare vender agora vs. permutar com incorporadora',
  },
  hbu: {
    label: 'H&BU',
    icon: Map,
    path: '/highest-best-use',
    color: 'text-emerald-500',
    description: 'Descubra o melhor uso para o seu terreno',
  },
  decisor: {
    label: 'Decisor',
    icon: CheckCircle,
    path: '/decisor',
    color: 'text-amber-500',
    description: 'Decida entre comprar ou não com base em métricas',
  },
  preco_teto: {
    label: 'Preço Teto',
    icon: Target,
    path: '/preco-teto',
    color: 'text-rose-500',
    description: 'Calcule o preço máximo que vale pagar',
  },
};

function ProjectCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className={cn('bg-card rounded-lg border border-border p-6 animate-fade-up', `delay-${index * 100}`)}
    >
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

export default function Dashboard() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [filter, setFilter] = useState<ProjectType | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: projects, isLoading } = useProjects(
    filter === 'all' ? undefined : filter
  );
  const deleteProject = useDeleteProject();

  const handleDelete = () => {
    if (deleteId) {
      deleteProject.mutate(deleteId);
      setDeleteId(null);
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
          <Button variant="gold" onClick={() => setAuthModalOpen(true)}>
            Entrar
          </Button>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <h1 className="font-serif text-3xl font-medium">Meus Projetos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas simulações e análises
            </p>
          </div>
          
          {/* New Project Dropdown */}
          <div className="flex gap-2 flex-wrap">
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

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-fade-up delay-100">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="transition-all duration-200 active:scale-[0.97]"
          >
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

        {/* Projects List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <ProjectCardSkeleton key={i} index={i} />
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <div className="animate-fade-up delay-200">
            <div className="text-center py-8 mb-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-secondary mb-4">
                <Calculator className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-2xl mb-2">Crie sua primeira análise</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Escolha uma ferramenta abaixo para começar sua primeira simulação imobiliária.
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
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {config.description}
                  </p>
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

              return (
                <div
                  key={project.id}
                  className={cn(
                    'bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] animate-fade-up',
                    `delay-${Math.min(i, 5) * 75}`
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
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

                  {/* Title */}
                  <h3 className="font-serif text-lg font-medium mb-3 truncate">
                    {project.name}
                  </h3>

                  {/* Quick Stats */}
                  <div className="space-y-1 text-sm mb-4">
                    {project.project_type === 'simulador' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cap Rate Mensal</span>
                        <span className="font-mono text-accent">
                          {formatPercentage(
                            project.results.monthlyCapRate ?? 
                            (project.results.noi / 12) / project.results.totalInvestment
                          )}
                        </span>
                      </div>
                    )}
                    {project.project_type === 'permuta' && project.results.winner && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vencedor</span>
                        <span className="font-mono text-accent capitalize">
                          {project.results.winner}
                        </span>
                      </div>
                    )}
                    {project.project_type === 'hbu' && project.results.winner && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Melhor Uso</span>
                        <span className="font-mono text-accent">
                          {project.results.winner}
                        </span>
                      </div>
                    )}
                    {project.project_type === 'decisor' && project.results.verdict && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Veredicto</span>
                        <span
                          className={cn(
                            'font-mono font-medium',
                            project.results.verdict === 'GO' && 'text-green-600',
                            project.results.verdict === 'NEGOTIATE' && 'text-amber-600',
                            project.results.verdict === 'NO-GO' && 'text-red-600'
                          )}
                        >
                          {project.results.verdict}
                        </span>
                      </div>
                    )}
                    {project.project_type === 'preco_teto' && project.results.maxPrice && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preço Teto</span>
                        <span className="font-mono text-accent">
                          {formatCompactCurrency(project.results.maxPrice as number)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`${config.path}?id=${project.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full active:scale-[0.97] transition-all">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(project.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 active:scale-[0.95] transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
