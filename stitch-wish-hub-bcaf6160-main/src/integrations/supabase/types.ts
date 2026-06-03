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
      customer_measurements: {
        Row: {
          arm_length: number | null
          chest: number | null
          created_at: string
          hips: number | null
          id: string
          inseam: number | null
          measurement_name: string
          neck: number | null
          notes: string | null
          shoulder_width: number | null
          thigh: number | null
          updated_at: string
          user_id: string
          waist: number | null
        }
        Insert: {
          arm_length?: number | null
          chest?: number | null
          created_at?: string
          hips?: number | null
          id?: string
          inseam?: number | null
          measurement_name?: string
          neck?: number | null
          notes?: string | null
          shoulder_width?: number | null
          thigh?: number | null
          updated_at?: string
          user_id: string
          waist?: number | null
        }
        Update: {
          arm_length?: number | null
          chest?: number | null
          created_at?: string
          hips?: number | null
          id?: string
          inseam?: number | null
          measurement_name?: string
          neck?: number | null
          notes?: string | null
          shoulder_width?: number | null
          thigh?: number | null
          updated_at?: string
          user_id?: string
          waist?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          order_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          order_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          order_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          description: string | null
          design_images: string[] | null
          estimated_delivery: string | null
          garment_name: string
          garment_type: Database["public"]["Enums"]["garment_type"]
          id: string
          measurement_id: string | null
          price: number | null
          status: Database["public"]["Enums"]["order_status"]
          tailor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description?: string | null
          design_images?: string[] | null
          estimated_delivery?: string | null
          garment_name: string
          garment_type: Database["public"]["Enums"]["garment_type"]
          id?: string
          measurement_id?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          tailor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string | null
          design_images?: string[] | null
          estimated_delivery?: string | null
          garment_name?: string
          garment_type?: Database["public"]["Enums"]["garment_type"]
          id?: string
          measurement_id?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          tailor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_measurement_id_fkey"
            columns: ["measurement_id"]
            isOneToOne: false
            referencedRelation: "customer_measurements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          images: string[] | null
          order_id: string
          rating: number
          tailor_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          images?: string[] | null
          order_id: string
          rating: number
          tailor_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          images?: string[] | null
          order_id?: string
          rating?: number
          tailor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tailor_deals: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          tailor_id: string
          title: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          tailor_id: string
          title: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          tailor_id?: string
          title?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tailor_deals_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tailor_deals_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tailor_portfolio: {
        Row: {
          created_at: string
          description: string | null
          garment_type: Database["public"]["Enums"]["garment_type"] | null
          id: string
          image_url: string
          tailor_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          garment_type?: Database["public"]["Enums"]["garment_type"] | null
          id?: string
          image_url: string
          tailor_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          garment_type?: Database["public"]["Enums"]["garment_type"] | null
          id?: string
          image_url?: string
          tailor_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tailor_portfolio_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tailor_portfolio_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tailor_pricing: {
        Row: {
          created_at: string
          description: string | null
          garment_name: string
          garment_type: Database["public"]["Enums"]["garment_type"]
          id: string
          price: number
          tailor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          garment_name: string
          garment_type: Database["public"]["Enums"]["garment_type"]
          id?: string
          price: number
          tailor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          garment_name?: string
          garment_type?: Database["public"]["Enums"]["garment_type"]
          id?: string
          price?: number
          tailor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tailor_pricing_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tailor_pricing_tailor_id_fkey"
            columns: ["tailor_id"]
            isOneToOne: false
            referencedRelation: "tailors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tailors: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          rating: number | null
          shop_name: string
          specialties: Database["public"]["Enums"]["garment_type"][] | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          rating?: number | null
          shop_name: string
          specialties?: Database["public"]["Enums"]["garment_type"][] | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          rating?: number | null
          shop_name?: string
          specialties?: Database["public"]["Enums"]["garment_type"][] | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      tailors_public: {
        Row: {
          city: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_available: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          rating: number | null
          shop_name: string | null
          specialties: Database["public"]["Enums"]["garment_type"][] | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_available?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          rating?: number | null
          shop_name?: string | null
          specialties?: Database["public"]["Enums"]["garment_type"][] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_available?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          rating?: number | null
          shop_name?: string | null
          specialties?: Database["public"]["Enums"]["garment_type"][] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
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
      app_role: "admin" | "tailor" | "customer"
      garment_type:
        | "traditional"
        | "western_formal"
        | "bridal_wedding"
        | "alterations"
      order_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "ready"
        | "delivered"
        | "cancelled"
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
      app_role: ["admin", "tailor", "customer"],
      garment_type: [
        "traditional",
        "western_formal",
        "bridal_wedding",
        "alterations",
      ],
      order_status: [
        "pending",
        "accepted",
        "in_progress",
        "ready",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
