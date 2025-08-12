"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { getUserProfile, getProviderProfile, type UserProfile, type ProviderProfile } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  providerProfile: ProviderProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  providerProfile: null,
  loading: true,
  refreshProfile: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.id)
        setUserProfile(profile)

        if (profile?.user_type === "provider") {
          const providerData = await getProviderProfile(user.id)
          setProviderProfile(providerData)
        }
      } catch (error) {
        console.error("Error refreshing profile:", error)
      }
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        refreshProfile()
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await refreshProfile()
      } else {
        setUserProfile(null)
        setProviderProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    userProfile,
    providerProfile,
    loading,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
