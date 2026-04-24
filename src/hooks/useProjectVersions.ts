import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sanitizeErrorMessage } from '@/lib/errorMessages';

export interface ProjectVersion {
  id: string;
  project_id: string;
  user_id: string;
  version_number: number;
  name: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  created_at: string;
}

export function useProjectVersions(projectId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project_versions', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('project_versions')
        .select('*')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as ProjectVersion[];
    },
    enabled: !!user && !!projectId,
  });
}

export function useDuplicateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (project: {
      project_type: string;
      name: string;
      inputs: Record<string, any>;
      results: Record<string, any>;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('toolbox_projects')
        .insert({
          user_id: user.id,
          project_type: project.project_type,
          name: `Cópia de ${project.name}`,
          inputs: project.inputs,
          results: project.results,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Projeto duplicado!',
        description: 'Uma cópia foi criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao duplicar',
        description: sanitizeErrorMessage(error, 'Não foi possível duplicar o projeto.'),
        variant: 'destructive',
      });
    },
  });
}
