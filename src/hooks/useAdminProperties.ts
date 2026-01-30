import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminProperty {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  area_sqm: number | null;
  built_area_sqm: number | null;
  land_area_sqm: number | null;
  front_meters: number | null;
  property_type: string | null;
  transaction_type: string | null;
  vocation: string | null;
  target_business_niche: string | null;
  cap_rate: number | null;
  image_url: string | null;
  google_maps_link: string | null;
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean | null;
  is_opportunity: boolean | null;
  status: string | null;
  show_in_vitrine: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
}

export interface PropertyFormData {
  title: string;
  description?: string;
  price?: number;
  address?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  area_sqm?: number;
  built_area_sqm?: number;
  land_area_sqm?: number;
  front_meters?: number;
  property_type?: string;
  transaction_type?: string;
  vocation?: string;
  target_business_niche?: string;
  cap_rate?: number;
  image_url?: string;
  google_maps_link?: string;
  latitude?: number;
  longitude?: number;
  is_featured?: boolean;
  is_opportunity?: boolean;
  status?: string;
  show_in_vitrine?: boolean;
}

export function useAdminProperties() {
  return useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminProperty[];
    },
  });
}

export function useAdminPropertyDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-property', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as AdminProperty;
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: PropertyFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...formData,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['vitrine-properties'] });
      toast({
        title: 'Imóvel criado',
        description: 'O imóvel foi cadastrado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating property:', error);
      toast({
        title: 'Erro ao criar imóvel',
        description: 'Não foi possível cadastrar o imóvel. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: PropertyFormData }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['vitrine-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-property'] });
      toast({
        title: 'Imóvel atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating property:', error);
      toast({
        title: 'Erro ao atualizar imóvel',
        description: 'Não foi possível salvar as alterações. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['vitrine-properties'] });
      toast({
        title: 'Imóvel excluído',
        description: 'O imóvel foi removido com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting property:', error);
      toast({
        title: 'Erro ao excluir imóvel',
        description: 'Não foi possível remover o imóvel. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
}

export function useToggleVitrine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, show }: { id: string; show: boolean }) => {
      const { data, error } = await supabase
        .from('properties')
        .update({ show_in_vitrine: show })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['vitrine-properties'] });
      toast({
        title: variables.show ? 'Publicado na vitrine' : 'Removido da vitrine',
        description: variables.show 
          ? 'O imóvel está visível na vitrine pública.' 
          : 'O imóvel não está mais visível na vitrine.',
      });
    },
    onError: (error) => {
      console.error('Error toggling vitrine:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a visibilidade do imóvel.',
        variant: 'destructive',
      });
    },
  });
}

export function useUploadPropertyImage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `properties/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível fazer upload da imagem.',
        variant: 'destructive',
      });
    },
  });
}
