import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VitrineDisclaimer } from '@/components/vitrine/VitrineDisclaimer';
import { SoftLockOverlay } from '@/components/tools/SoftLockOverlay';
import { useVitrineProjectDetail } from '@/hooks/useVitrineProjects';
import { ProjectViewer } from '@/components/admin/ProjectViewer';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-8 bg-gradient-to-b from-primary to-primary/95">
        <div className="container mx-auto px-4">
          <div className="h-8 w-40 skeleton-shimmer rounded mb-4" />
          <div className="h-8 w-2/3 skeleton-shimmer rounded mb-2" />
          <div className="h-5 w-1/3 skeleton-shimmer rounded" />
        </div>
      </section>
      <main className="container mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 animate-fade-up">
          <div className="h-6 skeleton-shimmer rounded w-1/4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 skeleton-shimmer rounded-lg" />
            ))}
          </div>
          <div className="h-64 skeleton-shimmer rounded-lg" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function VitrineDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useVitrineProjectDetail(id || '');

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center animate-fade-up">
          <FolderKanban className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Análise não encontrada</h2>
          <p className="text-muted-foreground mb-6">
            A análise solicitada não existe ou não está disponível.
          </p>
          <Button asChild>
            <Link to="/vitrine">Voltar para Vitrine</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-8 bg-gradient-to-b from-primary to-primary/95">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4 animate-fade-in">
            <Link to="/vitrine">
              <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Vitrine
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground animate-fade-up delay-100">
            {project.vitrine_title || project.name}
          </h1>
          {project.vitrine_description && (
            <p className="text-primary-foreground/60 mt-2 animate-fade-up delay-200">
              {project.vitrine_description}
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Disclaimer */}
        <div className="mb-8 animate-fade-up delay-200">
          <VitrineDisclaimer />
        </div>

        {/* Project Viewer */}
        <SoftLockOverlay featureName="os detalhes desta análise">
          <div className="bg-card border border-border rounded-xl p-6 animate-fade-up delay-300">
            <ProjectViewer
              projectType={project.project_type}
              inputs={project.inputs}
              results={project.results}
              projectName={project.vitrine_title || project.name}
              userName={null}
              updatedAt={project.updated_at}
            />
          </div>
        </SoftLockOverlay>
      </main>

      <VitrineDisclaimer variant="footer" />
      <Footer />
    </div>
  );
}
