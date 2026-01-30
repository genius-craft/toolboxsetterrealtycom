import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VitrineProperty {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  area_sqm: number | null;
  built_area_sqm: number | null;
  land_area_sqm: number | null;
  property_type: string | null;
  transaction_type: string | null;
  vocation: string | null;
  cap_rate: number | null;
  image_url: string | null;
  is_featured: boolean | null;
  is_opportunity: boolean | null;
  google_maps_link: string | null;
  front_meters: number | null;
  target_business_niche: string | null;
}

interface UseVitrinePropertiesOptions {
  propertyType?: string;
  city?: string;
  transactionType?: string;
}

export function useVitrineProperties(options: UseVitrinePropertiesOptions = {}) {
  const { propertyType, city, transactionType } = options;

  return useQuery({
    queryKey: ['vitrine-properties', propertyType, city, transactionType],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          price,
          city,
          state,
          neighborhood,
          area_sqm,
          built_area_sqm,
          land_area_sqm,
          property_type,
          transaction_type,
          vocation,
          cap_rate,
          image_url,
          is_featured,
          is_opportunity,
          google_maps_link,
          front_meters,
          target_business_niche
        `)
        .eq('show_in_vitrine', true)
        .eq('status', 'available')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (propertyType && propertyType !== 'all') {
        query = query.eq('property_type', propertyType);
      }

      if (city && city !== 'all') {
        query = query.eq('city', city);
      }

      if (transactionType && transactionType !== 'all') {
        query = query.eq('transaction_type', transactionType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as VitrineProperty[];
    },
  });
}

export function useVitrinePropertyDetail(id: string) {
  return useQuery({
    queryKey: ['vitrine-property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          price,
          city,
          state,
          neighborhood,
          area_sqm,
          built_area_sqm,
          land_area_sqm,
          property_type,
          transaction_type,
          vocation,
          cap_rate,
          image_url,
          is_featured,
          is_opportunity,
          google_maps_link,
          front_meters,
          target_business_niche
        `)
        .eq('id', id)
        .eq('show_in_vitrine', true)
        .eq('status', 'available')
        .single();

      if (error) throw error;
      return data as VitrineProperty;
    },
    enabled: !!id,
  });
}

export function useVitrineCities() {
  return useQuery({
    queryKey: ['vitrine-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('city')
        .eq('show_in_vitrine', true)
        .eq('status', 'available')
        .not('city', 'is', null);

      if (error) throw error;
      
      const uniqueCities = [...new Set(data.map(p => p.city).filter(Boolean))] as string[];
      return uniqueCities.sort();
    },
  });
}
