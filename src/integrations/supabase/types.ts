// src/integrations/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          created_at: string
          customer: string | null
          id: string
          items: Json | null
          notes: string | null
          order_number: string
          order_type: string | null
          staff_name: string | null
          status: string | null
          table_number: string | null
          total_items: number | null
        }
        Insert: {
          created_at?: string
          customer?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          order_number: string
          order_type?: string | null
          staff_name?: string | null
          status?: string | null
          table_number?: string | null
          total_items?: number | null
        }
        Update: {
          created_at?: string
          customer?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          order_number?: string
          order_type?: string | null
          staff_name?: string | null
          status?: string | null
          table_number?: string | null
          total_items?: number | null
        }
        Relationships: []
      }
      // --- PENAMBAHAN DEFINISI TABEL PROFILES DI SINI ---
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          data: Json | null
          id: number
        }
        Insert: {
          data?: Json | null
          id?: number
        }
        Update: {
          data?: Json | null
          id?: number
        }
        Relationships: []
      }
      stocks: {
        Row: {
          category: string | null
          created_at: string
          current_stock: number
          id: string
          last_updated: string
          min_stock: number
          name: string
          recipe: Json | null
          type: string
          unit: string | null
          variants: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_stock?: number
          id?: string
          last_updated?: string
          min_stock?: number
          name: string
          recipe?: Json | null
          type: string
          unit?: string | null
          variants?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string
          current_stock?: number
          id?: string
          last_updated?: string
          min_stock?: number
          name?: string
          recipe?: Json | null
          type?: string
          unit?: string | null
          variants?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}