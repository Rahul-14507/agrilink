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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          severity: Database["public"]["Enums"]["alert_severity"]
          storage_unit_id: string | null
          title: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          severity: Database["public"]["Enums"]["alert_severity"]
          storage_unit_id?: string | null
          title: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          storage_unit_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "produce_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_storage_unit_id_fkey"
            columns: ["storage_unit_id"]
            isOneToOne: false
            referencedRelation: "storage_units"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          id: string
          location: string
          market_name: string
          price_per_kg: number
          produce_name: string
          recorded_at: string | null
        }
        Insert: {
          id?: string
          location: string
          market_name: string
          price_per_kg: number
          produce_name: string
          recorded_at?: string | null
        }
        Update: {
          id?: string
          location?: string
          market_name?: string
          price_per_kg?: number
          produce_name?: string
          recorded_at?: string | null
        }
        Relationships: []
      }
      produce_batches: {
        Row: {
          created_at: string | null
          expected_shelf_life_days: number
          farmer_contact: string
          farmer_name: string
          harvest_date: string
          id: string
          produce_name: string
          produce_type: Database["public"]["Enums"]["produce_type"]
          qr_code: string
          quantity_kg: number
          status: Database["public"]["Enums"]["batch_status"] | null
          storage_unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expected_shelf_life_days: number
          farmer_contact: string
          farmer_name: string
          harvest_date: string
          id?: string
          produce_name: string
          produce_type: Database["public"]["Enums"]["produce_type"]
          qr_code: string
          quantity_kg: number
          status?: Database["public"]["Enums"]["batch_status"] | null
          storage_unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expected_shelf_life_days?: number
          farmer_contact?: string
          farmer_name?: string
          harvest_date?: string
          id?: string
          produce_name?: string
          produce_type?: Database["public"]["Enums"]["produce_type"]
          qr_code?: string
          quantity_kg?: number
          status?: Database["public"]["Enums"]["batch_status"] | null
          storage_unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produce_batches_storage_unit_id_fkey"
            columns: ["storage_unit_id"]
            isOneToOne: false
            referencedRelation: "storage_units"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          humidity_percent: number
          id: string
          recorded_at: string | null
          storage_unit_id: string
          temperature_celsius: number
          weight_kg: number | null
        }
        Insert: {
          humidity_percent: number
          id?: string
          recorded_at?: string | null
          storage_unit_id: string
          temperature_celsius: number
          weight_kg?: number | null
        }
        Update: {
          humidity_percent?: number
          id?: string
          recorded_at?: string | null
          storage_unit_id?: string
          temperature_celsius?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_storage_unit_id_fkey"
            columns: ["storage_unit_id"]
            isOneToOne: false
            referencedRelation: "storage_units"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_units: {
        Row: {
          capacity_kg: number
          created_at: string | null
          current_load_kg: number | null
          id: string
          location: string
          name: string
          status: Database["public"]["Enums"]["storage_status"] | null
          updated_at: string | null
        }
        Insert: {
          capacity_kg: number
          created_at?: string | null
          current_load_kg?: number | null
          id?: string
          location: string
          name: string
          status?: Database["public"]["Enums"]["storage_status"] | null
          updated_at?: string | null
        }
        Update: {
          capacity_kg?: number
          created_at?: string | null
          current_load_kg?: number | null
          id?: string
          location?: string
          name?: string
          status?: Database["public"]["Enums"]["storage_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transport_requests: {
        Row: {
          batch_id: string | null
          created_at: string | null
          driver_contact: string | null
          driver_name: string | null
          from_location: string
          id: string
          status: string | null
          to_location: string
          transport_date: string
          vehicle_type: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          driver_contact?: string | null
          driver_name?: string | null
          from_location: string
          id?: string
          status?: string | null
          to_location: string
          transport_date: string
          vehicle_type?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          driver_contact?: string | null
          driver_name?: string | null
          from_location?: string
          id?: string
          status?: string | null
          to_location?: string
          transport_date?: string
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_requests_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "produce_batches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_severity: "info" | "warning" | "critical"
      batch_status: "in_storage" | "in_transit" | "delivered" | "spoiled"
      produce_type: "vegetables" | "fruits" | "grains" | "dairy" | "other"
      storage_status: "active" | "inactive" | "maintenance"
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
      alert_severity: ["info", "warning", "critical"],
      batch_status: ["in_storage", "in_transit", "delivered", "spoiled"],
      produce_type: ["vegetables", "fruits", "grains", "dairy", "other"],
      storage_status: ["active", "inactive", "maintenance"],
    },
  },
} as const
