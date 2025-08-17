"use client"

import type React from "react"

import { useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useAuth } from "@/contexts/AuthContext"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("📬 Nueva notificación:", payload.new.message)

          // Mostrar notificación al usuario
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Mis Servicios Mrl", {
              body: payload.new.message,
              icon: "/icon-192x192.png",
            })
          } else {
            // Fallback con alert si no hay permisos de notificación
            alert(`🔔 ${payload.new.message}`)
          }
        },
      )
      .subscribe()

    // Solicitar permisos de notificación
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  return <>{children}</>
}
