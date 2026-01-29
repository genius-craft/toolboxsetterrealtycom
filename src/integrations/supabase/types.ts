export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      insight_authors: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string | null
        }
        Relationships: []
      }
      insight_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          author_name: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          media_type: string | null
          media_url: string | null
          published: boolean
          published_at: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          published?: boolean
          published_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          published?: boolean
          published_at?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          category: string | null
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area_sqm: number | null
          built_area_sqm: number | null
          cap_rate: number | null
          city: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          front_meters: number | null
          google_maps_link: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_opportunity: boolean | null
          land_area_sqm: number | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          price: number | null
          property_type: string | null
          state: string | null
          status: string | null
          target_business_niche: string | null
          title: string
          transaction_type: string | null
          updated_at: string | null
          vocation: string | null
        }
        Insert: {
          address?: string | null
          area_sqm?: number | null
          built_area_sqm?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          front_meters?: number | null
          google_maps_link?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_opportunity?: boolean | null
          land_area_sqm?: number | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          price?: number | null
          property_type?: string | null
          state?: string | null
          status?: string | null
          target_business_niche?: string | null
          title: string
          transaction_type?: string | null
          updated_at?: string | null
          vocation?: string | null
        }
        Update: {
          address?: string | null
          area_sqm?: number | null
          built_area_sqm?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          front_meters?: number | null
          google_maps_link?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_opportunity?: boolean | null
          land_area_sqm?: number | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          price?: number | null
          property_type?: string | null
          state?: string | null
          status?: string | null
          target_business_niche?: string | null
          title?: string
          transaction_type?: string | null
          updated_at?: string | null
          vocation?: string | null
        }
        Relationships: []
      }
      toolbox_projects: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          name: string
          project_type: string
          results: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs?: Json
          name: string
          project_type: string
          results?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          name?: string
          project_type?: string
          results?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      properties_authenticated: {
        Row: {
          address: string | null
          area_sqm: number | null
          built_area_sqm: number | null
          cap_rate: number | null
          city: string | null
          created_at: string | null
          description: string | null
          front_meters: number | null
          google_maps_link: string | null
          id: string | null
          image_url: string | null
          is_featured: boolean | null
          is_opportunity: boolean | null
          land_area_sqm: number | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          price: number | null
          property_type: string | null
          state: string | null
          status: string | null
          target_business_niche: string | null
          title: string | null
          transaction_type: string | null
          updated_at: string | null
          vocation: string | null
        }
        Insert: {
          address?: string | null
          area_sqm?: number | null
          built_area_sqm?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          front_meters?: number | null
          google_maps_link?: string | null
          id?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          is_opportunity?: boolean | null
          land_area_sqm?: number | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          price?: number | null
          property_type?: string | null
          state?: string | null
          status?: string | null
          target_business_niche?: string | null
          title?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vocation?: string | null
        }
        Update: {
          address?: string | null
          area_sqm?: number | null
          built_area_sqm?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          front_meters?: number | null
          google_maps_link?: string | null
          id?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          is_opportunity?: boolean | null
          land_area_sqm?: number | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          price?: number | null
          property_type?: string | null
          state?: string | null
          status?: string | null
          target_business_niche?: string | null
          title?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vocation?: string | null
        }
        Relationships: []
      }
      properties_public: {
        Row: {
          area_sqm: number | null
          built_area_sqm: number | null
          cap_rate: number | null
          city: string | null
          created_at: string | null
          description: string | null
          front_meters: number | null
          google_maps_link: string | null
          id: string | null
          image_url: string | null
          is_featured: boolean | null
          is_opportunity: boolean | null
          land_area_sqm: number | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          price: number | null
          property_type: string | null
          state: string | null
          status: string | null
          target_business_niche: string | null
          title: string | null
          transaction_type: string | null
          updated_at: string | null
          vocation: string | null
        }
        Insert: {
          area_sqm?: number | null
          built_area_sqm?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          front_meters?: number | null
          google_maps_link?: string | null
          id?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          is_opportunity?: boolean | null
          land_area_sqm?: number | null
          latitude?: never
          longitude?: never
          neighborhood?: string | null
          price?: number | null
          property_type?: string | null
          state?: string | null
          status?: string | null
          target_business_niche?: string | null
          title?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vocation?: string | null
        }
        Update: {
          area_sqm?: number | null
          built_area_sqm?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          front_meters?: number | null
          google_maps_link?: string | null
          id?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          is_opportunity?: boolean | null
          land_area_sqm?: number | null
          latitude?: never
          longitude?: never
          neighborhood?: string | null
          price?: number | null
          property_type?: string | null
          state?: string | null
          status?: string | null
          target_business_niche?: string | null
          title?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vocation?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "super_admin" | "hunter"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "super_admin", "hunter"],
    },
  },
} as const
