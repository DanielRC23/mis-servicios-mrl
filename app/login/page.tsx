"use client"

import type React from "react"
import { signInWithEmail, signInWithGoogle, signInWithFacebook } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Facebook } from "lucide-react"

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  })

  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signInWithEmail(formData.email, formData.password)
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      })
      router.push("/dashboard/client") // Will redirect based on user type
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setSocialLoading(provider)
    try {
      if (provider === "google") {
        await signInWithGoogle()
      } else {
        await signInWithFacebook()
      }
      // Redirect will be handled by the auth callback
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Error al iniciar sesión con ${provider === "google" ? "Google" : "Facebook"}`,
        variant: "destructive",
      })
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-900 dark:text-gray-900">Iniciar Sesión</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-600">
            Accede a tu cuenta de Mis Servicios Mrl
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Métodos de login social */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full bg-white dark:bg-white hover:bg-gray-50 dark:hover:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-300"
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={loading || socialLoading !== null}
            >
              {socialLoading === "google" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Continuar con Google
            </Button>
            <Button
              variant="outline"
              className="w-full bg-white dark:bg-white hover:bg-gray-50 dark:hover:bg-gray-50 text-gray-900 dark:text-gray-900 border-gray-300"
              type="button"
              onClick={() => handleSocialLogin("facebook")}
              disabled={loading || socialLoading !== null}
            >
              {socialLoading === "facebook" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Facebook className="w-4 h-4 mr-2" />
              )}
              Continuar con Facebook
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-white px-2 text-gray-500 dark:text-gray-500">O continúa con</span>
            </div>
          </div>

          {/* Selector de método de login */}
          <div className="flex space-x-2">
            <Button
              variant={loginMethod === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => setLoginMethod("email")}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant={loginMethod === "phone" ? "default" : "outline"}
              size="sm"
              onClick={() => setLoginMethod("phone")}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Teléfono
            </Button>
          </div>

          {/* Formulario de login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMethod === "email" ? (
              <div>
                <Label htmlFor="email" className="text-gray-900 dark:text-gray-900">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                  required
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="phone" className="text-gray-900 dark:text-gray-900">
                  Número de Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="password" className="text-gray-900 dark:text-gray-900">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                required
              />
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading || socialLoading !== null}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
