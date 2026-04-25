import { useState, useMemo } from 'react';
import { FolderKanban, Search, Eye, Download, Filter, Loader2, Globe, EyeOff } from 'lucide-react';
import { useAdminProjects, ProjectType, AdminProject } from '@/hooks/useAdminProjects';
import { VitrinePublishDialog } from '@/components/admin/VitrinePublishDialog';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ProjectViewer } from '@/components/admin/ProjectViewer';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

const projectTypeLabels: Record<string, string> = {
  simulador: 'Simulador',
  permuta: 'Permuta',
  'highest-best-use': 'H&BU',
  decisor: 'Decisor',
  'preco-teto': 'Preço Teto',
};

const projectTypeColors: Record<string, string> = {
  simulador: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  permuta: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'highest-best-use': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  decisor: 'bg-green-500/10 text-green-500 border-green-500/20',
  'preco-teto': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

export default function AdminProjects() {
  // Server-side role verification
  const { isLoading: roleLoading, isAuthorized } = useAdminRole({
    requiredRoles: ['admin', 'super_admin'],
    redirectTo: '/dashboard',
  });

  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProject, setViewingProject] = useState<Record<string, unknown> | null>(null);
  const [vitrineProject, setVitrineProject] = useState<AdminProject | null>(null);

  const { data: projects, isLoading, error } = useAdminProjects(selectedType);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!searchTerm) return projects;

    const term = searchTerm.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.user_name?.toLowerCase().includes(term) ||
        p.user_phone?.includes(term)
    );
  }, [projects, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };


  const exportToCSV = () => {
    if (!filteredProjects.length) return;

    const headers = ['Usuário', 'Telefone', 'Categoria', 'Projeto', 'Tipo', 'Vitrine', 'Data'];
    const rows = filteredProjects.map((p) => [
      p.user_name || 'N/A',
      p.user_phone || 'N/A',
      p.user_category || 'N/A',
      p.name,
      projectTypeLabels[p.project_type] || p.project_type,
      p.show_in_vitrine ? 'Sim' : 'Não',
      formatDate(p.updated_at),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `projetos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Show loading state while verifying role
  if (roleLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projetos dos Usuários</h1>
            <p className="text-sm text-muted-foreground">
              {filteredProjects.length} projeto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuário, telefone ou projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ProjectType | 'all')}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Tipo de projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="simulador">Simulador</SelectItem>
            <SelectItem value="permuta">Permuta</SelectItem>
            <SelectItem value="highest-best-use">Highest & Best Use</SelectItem>
            <SelectItem value="decisor">Decisor</SelectItem>
            <SelectItem value="preco-teto">Preço Teto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Usuário</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-center">Vitrine</TableHead>
              <TableHead className="hidden sm:table-cell">Atualizado</TableHead>
              <TableHead className="w-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-destructive">
                  Erro ao carregar projetos
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum projeto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{project.user_name || 'Usuário'}</p>
                      {project.user_category && (
                        <p className="text-xs text-muted-foreground">{project.user_category}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {project.user_phone || '—'}
                  </TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={projectTypeColors[project.project_type] || ''}
                    >
                      {projectTypeLabels[project.project_type] || project.project_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVitrineProject(project)}
                          className="h-8 px-2 gap-1.5"
                        >
                          {project.show_in_vitrine ? (
                            <Globe className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-xs">
                            {project.show_in_vitrine ? 'Publicado' : 'Publicar'}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Editar título, descrição e status na vitrine (com IA opcional)
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {formatDate(project.updated_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingProject({
                        inputs: project.inputs,
                        results: project.results,
                        name: project.name,
                        project_type: project.project_type,
                        user_name: project.user_name,
                        updated_at: project.updated_at,
                      })}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Project Dialog */}
      <Dialog open={!!viewingProject} onOpenChange={() => setViewingProject(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {(viewingProject?.name as string) || 'Detalhes do Projeto'}
            </DialogTitle>
          </DialogHeader>
          
          {viewingProject && (
            <ProjectViewer
              projectType={(viewingProject.project_type as string) || ''}
              inputs={viewingProject.inputs as import('@/integrations/supabase/types').Json}
              results={viewingProject.results as import('@/integrations/supabase/types').Json}
              projectName={(viewingProject.name as string) || ''}
              userName={viewingProject.user_name as string | null}
              updatedAt={viewingProject.updated_at as string}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Vitrine Publish Dialog (with AI copy generator) */}
      <VitrinePublishDialog
        project={vitrineProject}
        open={!!vitrineProject}
        onOpenChange={(open) => !open && setVitrineProject(null)}
      />
    </div>
  );
}
