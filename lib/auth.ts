import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  user_type: "client" | "provider"
  profile_image?: string
  created_at: string
  updated_at: string
}

export interface ProviderProfile {
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
  trial_ends_at?: string
  location_lat?: number
  location_lng?: number
  location_address?: string
  prices: any
  availability: any
  documents: any
  created_at: string
  updated_at: string
}

// Register with email and password
export const registerWithEmail = async (
  email: string,
  password: string,
  userData: {
    fullName: string
    phone?: string
    userType: "client" | "provider"
    category?: string
    service?: string
    description?: string
  },
): Promise<User> => {
  try {
    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          user_type: userData.userType,
        },
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("No user returned from signup")

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: authData.user.email!,
      full_name: userData.fullName,
      phone: userData.phone || null,
      user_type: userData.userType,
    })

    if (profileError) throw profileError

    // If provider, create provider profile
    if (userData.userType === "provider") {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 40) // 40 days from now

      const { error: providerError } = await supabase.from("providers").insert({
        user_id: authData.user.id,
        category: userData.category || "",
        service: userData.service || "",
        description: userData.description || "",
        subscription_status: "trial",
        trial_ends_at: trialEndsAt.toISOString(),
        prices: {},
        availability: {
          monday: { start: "09:00", end: "18:00", available: true },
          tuesday: { start: "09:00", end: "18:00", available: true },
          wednesday: { start: "09:00", end: "18:00", available: true },
          thursday: { start: "09:00", end: "18:00", available: true },
          friday: { start: "09:00", end: "18:00", available: true },
          saturday: { start: "09:00", end: "18:00", available: true },
          sunday: { start: "09:00", end: "18:00", available: false },
        },
        documents: {
          ine: { front: "", back: "", verified: false },
          address_proof: { url: "", verified: false },
        },
      })

      if (providerError) throw providerError
    }

    return authData.user
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error("No user returned from signin")

    return data.user
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
  } catch (error) {
    console.error("Error signing in with Google:", error)
    throw error
  }
}

// Sign in with Facebook
export const signInWithFacebook = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
  } catch (error) {
    console.error("Error signing in with Facebook:", error)
    throw error
  }
}

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Get provider profile
export const getProviderProfile = async (userId: string): Promise<ProviderProfile | null> => {
  try {
    const { data, error } = await supabase.from("providers").select("*").eq("user_id", userId).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting provider profile:", error)
    return null
  }
}

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const { error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) throw error
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Update provider profile
export const updateProviderProfile = async (userId: string, updates: Partial<ProviderProfile>): Promise<void> => {
  try {
    const { error } = await supabase
      .from("providers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", userId)

    if (error) throw error
  } catch (error) {
    console.error("Error updating provider profile:", error)
    throw error
  }
}

export const deleteUserAccount = async (userId: string): Promise<void> => {
  try {
    // Delete all related data in the correct order (due to foreign key constraints)

    // Delete messages where user is sender or receiver
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    if (messagesError) throw messagesError

    // Delete conversations where user is participant
    const { error: conversationsError } = await supabase
      .from("conversations")
      .delete()
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

    if (conversationsError) throw conversationsError

    // Delete provider profile if exists
    const { error: providerError } = await supabase.from("providers").delete().eq("user_id", userId)

    if (providerError) throw providerError

    // Delete user profile
    const { error: userError } = await supabase.from("users").delete().eq("id", userId)

    if (userError) throw userError

    // Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      // If admin delete fails, try regular signOut
      console.warn("Admin delete failed, signing out user:", authError)
      await signOut()
    }
  } catch (error) {
    console.error("Error deleting user account:", error)
    throw error
  }
}
