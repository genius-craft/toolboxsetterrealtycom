import { ProjectViewerSimulador } from './ProjectViewerSimulador';
import { ProjectViewerPermuta } from './ProjectViewerPermuta';
import { ProjectViewerHBU } from './ProjectViewerHBU';
import { ProjectViewerDecisor } from './ProjectViewerDecisor';
import { Json } from '@/integrations/supabase/types';

interface ProjectViewerProps {
  projectType: string;
  inputs: Json;
  results: Json;
  projectName: string;
  userName?: string | null;
  updatedAt?: string;
}

function FallbackJSONViewer({ inputs, results }: { inputs: Json; results: Json }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Inputs
        </h3>
        <pre className="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto">
          {JSON.stringify(inputs, null, 2)}
        </pre>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Resultados
        </h3>
        <pre className="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export function ProjectViewer({
  projectType,
  inputs,
  results,
  projectName,
  userName,
  updatedAt,
}: ProjectViewerProps) {
  const commonProps = {
    inputs: inputs as Record<string, unknown>,
    results: results as Record<string, unknown>,
    projectName,
    userName,
    updatedAt,
  };

  switch (projectType) {
    case 'simulador':
      return <ProjectViewerSimulador {...commonProps} />;
    case 'permuta':
      return <ProjectViewerPermuta {...commonProps} />;
    case 'highest-best-use':
    case 'hbu':
      return <ProjectViewerHBU {...commonProps} />;
    case 'decisor':
      return <ProjectViewerDecisor {...commonProps} />;
    default:
      return <FallbackJSONViewer inputs={inputs} results={results} />;
  }
}
