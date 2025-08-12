"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error:", error)
          router.push("/login?error=auth_error")
          return
        }

        if (data.session) {
          // Check if user has a profile
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("user_type")
            .eq("id", data.session.user.id)
            .single()

          if (profile) {
            // User exists, redirect to appropriate dashboard
            if (profile.user_type === "provider") {
              router.push("/dashboard/provider")
            } else {
              router.push("/dashboard/client")
            }
          } else {
            // New user from OAuth, redirect to complete registration
            router.push("/register?oauth=true")
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        router.push("/login?error=callback_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-white dark:bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-600">Completando autenticación...</p>
      </div>
    </div>
  )
}
