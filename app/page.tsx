"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Star, Users, Shield, AlertCircle } from "lucide-react"
import PWAInstallButton from "@/components/pwa-install-button"

export default function HomePage() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    const checkConfiguration = () => {
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      setIsConfigured(hasUrl && hasKey)
    }

    checkConfiguration()
  }, [])

  // Show loading state while checking configuration
  if (isConfigured === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show configuration message if Supabase is not set up
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-orange-600">Configuración Requerida</CardTitle>
            <CardDescription className="text-gray-600">
              Para usar la aplicación, necesitas configurar Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">Pasos para configurar:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-orange-700">
                <li>
                  Crea un proyecto en{" "}
                  <a href="https://supabase.com" className="underline" target="_blank" rel="noopener noreferrer">
                    supabase.com
                  </a>
                </li>
                <li>Copia la URL del proyecto y la clave anónima</li>
                <li>Agrega las variables de entorno:</li>
              </ol>
              <div className="mt-3 bg-gray-900 text-green-400 p-3 rounded text-sm font-mono">
                NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
                <br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
              </div>
            </div>
            <div className="text-center">
              <Button asChild>
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                  Ir a Supabase
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white">
              <img
                src="/logo.png"
                alt="Mis Servicios Mrl Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Si no hay logo personalizado, mostrar placeholder simple
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = "none"
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML =
                      '<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">MRL</div>'
                  }
                }}
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Mis Servicios Mrl</h1>
          </div>
          <div className="flex space-x-2">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Conectando a Morelia con los mejores servicios profesionales
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Encuentra profesionales verificados cerca de ti u ofrece tus servicios a miles de clientes potenciales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?type=client">
              <Button size="lg" className="w-full sm:w-auto">
                Buscar Servicios
              </Button>
            </Link>
            <Link href="/register?type=provider">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white hover:bg-gray-50">
                Ofrecer Servicios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center bg-white">
            <CardHeader>
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg text-gray-900">Servicios Cercanos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Encuentra profesionales verificados en tu zona de Morelia
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-white">
            <CardHeader>
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg text-gray-900">Verificados</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Todos los prestadores están verificados con INE y comprobante de domicilio
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-white">
            <CardHeader>
              <Star className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle className="text-lg text-gray-900">Calificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Sistema de reseñas y calificaciones de clientes reales
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center bg-white">
            <CardHeader>
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg text-gray-900">Comunidad</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Únete a la comunidad de servicios más grande de Morelia
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Service Categories Preview */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">Categorías de Servicios</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Servicios para el Hogar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Albañiles, pintores, carpinteros, jardineros y más</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Reparaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Técnicos en electrodomésticos, computadoras, celulares</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Servicios Personales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Estilistas, masajistas, entrenadores, nutriólogos</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Fotógrafos, DJ's, catering, organización de eventos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left px-8 md:px-16">
            <div className="flex flex-col items-center">
              <h4 className="font-bold mb-4">Nuestra empresa</h4>
              <div className="space-y-2">
                <Link href="/mission" className="block text-gray-400 hover:text-white text-sm">
                  Nuestra misión
                </Link>
                <Link href="/vision" className="block text-gray-400 hover:text-white text-sm">
                  Nuestra visión
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="font-bold mb-4">Contacto y Soporte</h4>
              <div className="space-y-2 text-sm text-gray-400 text-center">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a href="mailto:misserviciosmx@outlook.com" className="hover:text-white">
                    misserviciosmx@outlook.com
                  </a>
                </p>
                <p>
                  <span className="font-medium">Teléfono:</span>{" "}
                  <a href="tel:+524434167491" className="hover:text-white">
                    (443) 416-7491
                  </a>
                </p>
                <p className="text-xs text-gray-500 mt-2">Horario de atención: Lunes a Viernes 9:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="font-bold mb-4">Enlaces</h4>
              <div className="space-y-2 text-center">
                <Link href="/terms" className="block text-gray-400 hover:text-white text-sm">
                  Términos y Condiciones
                </Link>
                <Link href="/privacy" className="block text-gray-400 hover:text-white text-sm">
                  Aviso de Privacidad
                </Link>
                <div className="mt-4 flex justify-center">
                  <PWAInstallButton />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">&copy; 2025 Mis Servicios Mrl. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
