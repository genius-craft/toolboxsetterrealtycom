import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useProjectVersions, ProjectVersion } from '@/hooks/useProjectVersions';
import { History, RotateCcw, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectVersionsSheetProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (version: ProjectVersion) => void;
}

export function ProjectVersionsSheet({
  projectId,
  open,
  onOpenChange,
  onRestore,
}: ProjectVersionsSheetProps) {
  const { data: versions, isLoading } = useProjectVersions(projectId);

  const handleRestore = (v: ProjectVersion) => {
    onRestore(v);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-accent" />
            Histórico de Versões
          </SheetTitle>
          <SheetDescription>
            Restaure uma versão anterior do projeto. As últimas 20 alterações ficam guardadas.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}

          {!isLoading && (!versions || versions.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhuma versão anterior ainda.</p>
              <p className="text-xs mt-1">Edite e salve o projeto para começar a registrar versões.</p>
            </div>
          )}

          {versions?.map((v) => (
            <div
              key={v.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-sm">v{v.version_number} — {v.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(v.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleRestore(v)}>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restaurar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
