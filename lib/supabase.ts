import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          user_type: "client" | "provider"
          profile_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          user_type: "client" | "provider"
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          user_type?: "client" | "provider"
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      providers: {
        Row: {
          id: string
          user_id: string
          category: string
          service: string
          description: string
          is_verified: boolean
          is_available: boolean
          rating: number
          total_reviews: number
          total_clients: number
          subscription_status: "trial" | "active" | "expired"
          trial_ends_at: string | null
          location_lat: number | null
          location_lng: number | null
          location_address: string | null
          prices: any
          availability: any
          documents: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          service: string
          description: string
          is_verified?: boolean
          is_available?: boolean
          rating?: number
          total_reviews?: number
          total_clients?: number
          subscription_status?: "trial" | "active" | "expired"
          trial_ends_at?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          prices?: any
          availability?: any
          documents?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          service?: string
          description?: string
          is_verified?: boolean
          is_available?: boolean
          rating?: number
          total_reviews?: number
          total_clients?: number
          subscription_status?: "trial" | "active" | "expired"
          trial_ends_at?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          prices?: any
          availability?: any
          documents?: any
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          provider_id: string
          client_id: string
          client_name: string
          rating: number
          comment: string
          service_type: string
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          client_id: string
          client_name: string
          rating: number
          comment: string
          service_type: string
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          client_id?: string
          client_name?: string
          rating?: number
          comment?: string
          service_type?: string
          created_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          client_id: string
          provider_id: string
          service_type: string
          description: string
          urgency: "low" | "medium" | "high"
          status: "pending" | "accepted" | "completed" | "cancelled"
          scheduled_date: string | null
          location_lat: number
          location_lng: number
          location_address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          provider_id: string
          service_type: string
          description: string
          urgency?: "low" | "medium" | "high"
          status?: "pending" | "accepted" | "completed" | "cancelled"
          scheduled_date?: string | null
          location_lat: number
          location_lng: number
          location_address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          provider_id?: string
          service_type?: string
          description?: string
          urgency?: "low" | "medium" | "high"
          status?: "pending" | "accepted" | "completed" | "cancelled"
          scheduled_date?: string | null
          location_lat?: number
          location_lng?: number
          location_address: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
