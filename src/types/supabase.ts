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
      customers: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      downloads: {
        Row: {
          created_at: string
          customer_id: string
          download_date: string
          id: string
          ip_address: string | null
          product_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          download_date?: string
          id?: string
          ip_address?: string | null
          product_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          download_date?: string
          id?: string
          ip_address?: string | null
          product_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "downloads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "downloads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      licenses: {
        Row: {
          created_at: string
          current_activations: number
          customer_id: string | null
          expiration_date: string | null
          id: string
          is_active: boolean
          license_key: string
          max_activations: number
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_activations?: number
          customer_id?: string | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean
          license_key: string
          max_activations?: number
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_activations?: number
          customer_id?: string | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean
          license_key?: string
          max_activations?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          is_active: boolean
          name: string
          owner_id: string
          price: number
          requires_license: boolean
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          owner_id: string
          price?: number
          requires_license?: boolean
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          owner_id?: string
          price?: number
          requires_license?: boolean
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          id: string
          license_id: string | null
          payment_method: string | null
          payment_status: string
          product_id: string
          purchase_date: string
          transaction_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          customer_id: string
          id?: string
          license_id?: string | null
          payment_method?: string | null
          payment_status?: string
          product_id: string
          purchase_date?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          id?: string
          license_id?: string | null
          payment_method?: string | null
          payment_status?: string
          product_id?: string
          purchase_date?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
