import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface VitrineProject {
  id: string;
  name: string;
  project_type: string;
  inputs: Json;
  results: Json;
  updated_at: string;
  vitrine_title: string | null;
  vitrine_description: string | null;
}

interface UseVitrineProjectsOptions {
  projectType?: string;
}

export function useVitrineProjects(options: UseVitrineProjectsOptions = {}) {
  const { projectType } = options;

  return useQuery({
    queryKey: ['vitrine-projects', projectType],
    queryFn: async () => {
      let query = supabase
        .from('vitrine_projects_public' as any)
        .select(`
          id,
          name,
          project_type,
          inputs,
          results,
          updated_at,
          vitrine_title,
          vitrine_description
        `)
        .order('updated_at', { ascending: false });

      if (projectType && projectType !== 'all') {
        query = query.eq('project_type', projectType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as unknown) as VitrineProject[];
    },
  });
}

export function useVitrineProjectDetail(id: string) {
  return useQuery({
    queryKey: ['vitrine-project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vitrine_projects_public' as any)
        .select(`
          id,
          name,
          project_type,
          inputs,
          results,
          updated_at,
          vitrine_title,
          vitrine_description
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as unknown) as VitrineProject;
    },
    enabled: !!id,
  });
}
