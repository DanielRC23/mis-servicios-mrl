export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  user_type: "client" | "provider"
  created_at: string
  subscription_status?: "active" | "inactive" | "trial"
  subscription_expires_at?: string
  trial_ends_at?: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  phone?: string
  address?: string
  profile_image?: string
  created_at: string
  updated_at: string
}

export interface ProviderProfile {
  id: string
  user_id: string
  category: string
  description: string
  experience_years: number
  hourly_rate: number
  availability_status: "available" | "busy" | "offline"
  rating: number
  total_reviews: number
  verification_status: "pending" | "verified" | "rejected"
  identity_document?: string
  address_proof?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: "client_premium" | "provider_basic"
  status: "active" | "inactive" | "trial" | "cancelled"
  amount: number
  currency: string
  payment_method: "mercadopago"
  subscription_id: string // MercadoPago subscription ID
  trial_ends_at?: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface PaymentHistory {
  id: string
  user_id: string
  subscription_id: string
  amount: number
  currency: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  payment_method: string
  mercadopago_payment_id: string
  created_at: string
}

export interface Conversation {
  id: string
  client_id: string
  provider_id: string
  last_message?: string
  last_message_at?: string
  created_at: string
  updated_at: string
  client_profile?: UserProfile
  provider_profile?: UserProfile & ProviderProfile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: "text" | "image" | "file"
  created_at: string
  sender_profile?: UserProfile
}

export interface ServiceCategory {
  id: string
  name: string
  description: string
  icon: string
}
