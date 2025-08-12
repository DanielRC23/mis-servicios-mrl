import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
      }

      if (data.session) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("user_type")
          .eq("id", data.session.user.id)
          .single()

        if (profile) {
          // User exists, redirect to appropriate dashboard
          if (profile.user_type === "provider") {
            return NextResponse.redirect(`${requestUrl.origin}/dashboard/provider`)
          } else {
            return NextResponse.redirect(`${requestUrl.origin}/dashboard/client`)
          }
        } else {
          // New user from OAuth, redirect to complete registration
          return NextResponse.redirect(`${requestUrl.origin}/register?oauth=true`)
        }
      }
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_error`)
    }
  }

  // Default redirect if no code or session
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
