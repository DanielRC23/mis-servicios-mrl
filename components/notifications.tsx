"use client"

import type React from "react"

import { useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function NotificationsProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const { toast } = useToast()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          toast({
            title: "🔔 Nuevo mensaje",
            description: "Tienes un mensaje nuevo",
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_requests",
          filter: `provider_id=eq.${userId}`,
        },
        (payload) => {
          toast({
            title: "🔔 Nueva solicitud",
            description: "Tienes una nueva solicitud de servicio",
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, toast])

  return <>{children}</>
}
