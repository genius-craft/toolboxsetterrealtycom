import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { ProjectVersionsSheet } from './ProjectVersionsSheet';
import { ProjectVersion } from '@/hooks/useProjectVersions';

interface HistoryButtonProps {
  loadedProjectId: string | null;
  onRestore: (version: ProjectVersion) => void;
  className?: string;
}

export function HistoryButton({ loadedProjectId, onRestore, className }: HistoryButtonProps) {
  const [open, setOpen] = useState(false);
  if (!loadedProjectId) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={className}
      >
        <History className="h-4 w-4 mr-2" />
        Histórico
      </Button>
      <ProjectVersionsSheet
        projectId={loadedProjectId}
        open={open}
        onOpenChange={setOpen}
        onRestore={onRestore}
      />
    </>
  );
}
