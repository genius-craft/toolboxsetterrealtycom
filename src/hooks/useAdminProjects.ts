import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export type ProjectType = 'simulador' | 'permuta' | 'highest-best-use' | 'decisor' | 'preco_teto';

export interface AdminProject {
  id: string;
  name: string;
  project_type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  inputs: Json;
  results: Json;
  show_in_vitrine: boolean;
  vitrine_title: string | null;
  vitrine_description: string | null;
  user_name?: string | null;
  user_phone?: string | null;
  user_category?: string | null;
}

export function useAdminProjects(projectType?: ProjectType | 'all') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-projects', projectType],
    queryFn: async (): Promise<AdminProject[]> => {
      // First get the projects
      let query = supabase
        .from('toolbox_projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (projectType && projectType !== 'all') {
        query = query.eq('project_type', projectType);
      }

      const { data: projects, error: projectsError } = await query;
      if (projectsError) throw projectsError;
      if (!projects) return [];

      // Get unique user IDs
      const userIds = [...new Set(projects.map(p => p.user_id))];

      // Fetch profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, phone, category')
        .in('user_id', userIds);

      // Create a map of user_id to profile data
      const profileMap = new Map(
        profiles?.map(p => [p.user_id, { name: p.name, phone: p.phone, category: p.category }]) ?? []
      );

      // Merge projects with profile data
      return projects.map(project => ({
        ...project,
        show_in_vitrine: project.show_in_vitrine ?? false,
        vitrine_title: project.vitrine_title ?? null,
        vitrine_description: project.vitrine_description ?? null,
        user_name: profileMap.get(project.user_id)?.name ?? null,
        user_phone: profileMap.get(project.user_id)?.phone ?? null,
        user_category: profileMap.get(project.user_id)?.category ?? null,
      }));
    },
    enabled: !!user,
  });
}

export function useToggleVitrineStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      showInVitrine,
      vitrineTitle,
      vitrineDescription,
    }: { 
      projectId: string; 
      showInVitrine: boolean;
      vitrineTitle?: string;
      vitrineDescription?: string;
    }) => {
      const updateData: {
        show_in_vitrine: boolean;
        vitrine_title?: string | null;
        vitrine_description?: string | null;
      } = {
        show_in_vitrine: showInVitrine,
      };
      
      if (vitrineTitle !== undefined) {
        updateData.vitrine_title = vitrineTitle || null;
      }
      if (vitrineDescription !== undefined) {
        updateData.vitrine_description = vitrineDescription || null;
      }

      const { error } = await supabase
        .from('toolbox_projects')
        .update(updateData)
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['vitrine-projects'] });
    },
  });
}
