import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/vitrine/ProjectCard';
import { ProjectFilters } from '@/components/vitrine/ProjectFilters';
import { VitrineDisclaimer } from '@/components/vitrine/VitrineDisclaimer';
import { SoftLockOverlay } from '@/components/tools/SoftLockOverlay';
import { useVitrineProjects } from '@/hooks/useVitrineProjects';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Vitrine() {
  const [projectType, setProjectType] = useState('all');

  const { data: projects, isLoading, error } = useVitrineProjects({
    projectType,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-primary to-primary/95">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4 mt-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center">
              <FolderKanban className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Vitrine de Análises
              </h1>
              <p className="text-primary-foreground/60">
                Estudos de viabilidade e análises de investimento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Disclaimer */}
        <div className="mb-8">
          <VitrineDisclaimer />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ProjectFilters
            projectType={projectType}
            onProjectTypeChange={setProjectType}
          />
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="h-24 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-6 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <FolderKanban className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar análises</h2>
            <p className="text-muted-foreground">Tente novamente mais tarde.</p>
          </div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-16">
            <FolderKanban className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhuma análise encontrada</h2>
            <p className="text-muted-foreground">
              Não há análises disponíveis com os filtros selecionados.
            </p>
          </div>
        ) : (
          <SoftLockOverlay featureName="as análises da vitrine">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects?.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </SoftLockOverlay>
        )}
      </main>

      <VitrineDisclaimer variant="footer" />
      <Footer />
    </div>
  );
}
