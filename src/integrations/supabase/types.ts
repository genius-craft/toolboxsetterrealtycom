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
          color: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          author_name: string | null
          content: string | null
          created_at: string
          id: string
          media_url: string | null
          published: boolean
          tags: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          published?: boolean
          tags?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          published?: boolean
          tags?: Json | null
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
          created_at: string
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          category?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          category?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_versions: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          name: string
          project_id: string
          results: Json
          user_id: string
          version_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          inputs?: Json
          name: string
          project_id: string
          results?: Json
          user_id: string
          version_number: number
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          name?: string
          project_id?: string
          results?: Json
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "toolbox_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          area_built: number | null
          area_total: number | null
          bathrooms: number | null
          bedrooms: number | null
          cap_rate: number | null
          city: string | null
          created_at: string
          created_by: string | null
          description: string | null
          features: Json | null
          gross_rent: number | null
          id: string
          images: Json | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          noi: number | null
          parking_spots: number | null
          price: number | null
          property_type: string | null
          show_in_vitrine: boolean
          state: string | null
          status: string | null
          title: string
          updated_at: string
          vacancy_rate: number | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          area_built?: number | null
          area_total?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          features?: Json | null
          gross_rent?: number | null
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          noi?: number | null
          parking_spots?: number | null
          price?: number | null
          property_type?: string | null
          show_in_vitrine?: boolean
          state?: string | null
          status?: string | null
          title: string
          updated_at?: string
          vacancy_rate?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          area_built?: number | null
          area_total?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          features?: Json | null
          gross_rent?: number | null
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          noi?: number | null
          parking_spots?: number | null
          price?: number | null
          property_type?: string | null
          show_in_vitrine?: boolean
          state?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          vacancy_rate?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      tool_knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          content_tsv: unknown
          created_at: string
          document_id: string
          id: string
        }
        Insert: {
          chunk_index: number
          content: string
          content_tsv?: unknown
          created_at?: string
          document_id: string
          id?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          content_tsv?: unknown
          created_at?: string
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "tool_knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_knowledge_documents: {
        Row: {
          chunk_count: number
          created_at: string
          enabled: boolean
          file_type: string
          id: string
          original_filename: string
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          chunk_count?: number
          created_at?: string
          enabled?: boolean
          file_type: string
          id?: string
          original_filename: string
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          chunk_count?: number
          created_at?: string
          enabled?: boolean
          file_type?: string
          id?: string
          original_filename?: string
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      toolbox_projects: {
        Row: {
          created_at: string
          id: string
          inputs: Json | null
          name: string
          project_type: string
          results: Json | null
          show_in_vitrine: boolean
          updated_at: string
          user_id: string
          vitrine_description: string | null
          vitrine_title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          inputs?: Json | null
          name: string
          project_type: string
          results?: Json | null
          show_in_vitrine?: boolean
          updated_at?: string
          user_id: string
          vitrine_description?: string | null
          vitrine_title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json | null
          name?: string
          project_type?: string
          results?: Json | null
          show_in_vitrine?: boolean
          updated_at?: string
          user_id?: string
          vitrine_description?: string | null
          vitrine_title?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
          area_built: number | null
          area_total: number | null
          bathrooms: number | null
          bedrooms: number | null
          cap_rate: number | null
          city: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          gross_rent: number | null
          id: string | null
          images: Json | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          noi: number | null
          parking_spots: number | null
          price: number | null
          property_type: string | null
          show_in_vitrine: boolean | null
          state: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          vacancy_rate: number | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          area_built?: number | null
          area_total?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          gross_rent?: number | null
          id?: string | null
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          noi?: number | null
          parking_spots?: number | null
          price?: number | null
          property_type?: string | null
          show_in_vitrine?: boolean | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          vacancy_rate?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          area_built?: number | null
          area_total?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          gross_rent?: number | null
          id?: string | null
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          noi?: number | null
          parking_spots?: number | null
          price?: number | null
          property_type?: string | null
          show_in_vitrine?: boolean | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          vacancy_rate?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      properties_public: {
        Row: {
          area_built: number | null
          area_total: number | null
          bathrooms: number | null
          bedrooms: number | null
          cap_rate: number | null
          city: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          gross_rent: number | null
          id: string | null
          images: Json | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          noi: number | null
          parking_spots: number | null
          price: number | null
          property_type: string | null
          show_in_vitrine: boolean | null
          state: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          vacancy_rate: number | null
          zip_code: string | null
        }
        Insert: {
          area_built?: number | null
          area_total?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          gross_rent?: number | null
          id?: string | null
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          noi?: number | null
          parking_spots?: number | null
          price?: number | null
          property_type?: string | null
          show_in_vitrine?: boolean | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          vacancy_rate?: number | null
          zip_code?: string | null
        }
        Update: {
          area_built?: number | null
          area_total?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cap_rate?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          gross_rent?: number | null
          id?: string | null
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          noi?: number | null
          parking_spots?: number | null
          price?: number | null
          property_type?: string | null
          show_in_vitrine?: boolean | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          vacancy_rate?: number | null
          zip_code?: string | null
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
