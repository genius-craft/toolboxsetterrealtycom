import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type ProjectType = 'simulador' | 'permuta' | 'hbu' | 'decisor';

export interface ToolboxProject {
  id: string;
  user_id: string;
  project_type: ProjectType;
  name: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useProjects(projectType?: ProjectType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', projectType],
    queryFn: async () => {
      let query = supabase
        .from('toolbox_projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (projectType) {
        query = query.eq('project_type', projectType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ToolboxProject[];
    },
    enabled: !!user,
  });
}

export function useProject(projectId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('toolbox_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as ToolboxProject;
    },
    enabled: !!user && !!projectId,
  });
}

export function useSaveProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (project: Omit<ToolboxProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('toolbox_projects')
        .insert({
          ...project,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Projeto salvo!',
        description: 'Seu projeto foi salvo com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ToolboxProject> & { id: string }) => {
      const { data, error } = await supabase
        .from('toolbox_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      toast({
        title: 'Projeto atualizado!',
        description: 'Suas alterações foram salvas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('toolbox_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Projeto excluído',
        description: 'O projeto foi removido permanentemente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
