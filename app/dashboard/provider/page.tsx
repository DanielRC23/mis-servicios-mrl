"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, MessageCircle, Star, Users, Calendar, Settings, TrendingUp, DollarSign, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { signOut, updateProviderProfile } from "@/lib/auth"
import { getUnreadMessagesCount } from "@/lib/chat"
import { useToast } from "@/hooks/use-toast"

export default function ProviderDashboard() {
  const { user, userProfile, providerProfile, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isAvailable, setIsAvailable] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (userProfile && userProfile.user_type !== "provider") {
      router.push("/dashboard/client")
      return
    }

    if (providerProfile) {
      setIsAvailable(providerProfile.is_available)
    }
  }, [user, userProfile, providerProfile, authLoading, router])

  useEffect(() => {
    if (user) {
      loadUnreadCount()
    }
  }, [user])

  const loadUnreadCount = async () => {
    if (!user) return
    try {
      const count = await getUnreadMessagesCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error("Error loading unread count:", error)
    }
  }

  const handleAvailabilityChange = async (available: boolean) => {
    if (!user) return

    setUpdating(true)
    try {
      await updateProviderProfile(user.id, { is_available: available })
      setIsAvailable(available)
      await refreshProfile()
      toast({
        title: "Estado actualizado",
        description: available ? "Ahora estás disponible para nuevos servicios" : "Ya no recibirás nuevas solicitudes",
      })
    } catch (error) {
      console.error("Error updating availability:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar tu estado",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getTrialDaysLeft = () => {
    if (!providerProfile?.trial_ends_at) return 0
    const trialEnd = new Date(providerProfile.trial_ends_at)
    const now = new Date()
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user || !userProfile || !providerProfile) {
    return null
  }

  const trialDaysLeft = getTrialDaysLeft()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Panel de Prestador</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hola, {userProfile.full_name}</span>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/messages")}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Mensajes
                {unreadCount > 0 && (
                  <Badge className="ml-2 w-5 h-5 p-0 flex items-center justify-center text-xs">{unreadCount}</Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/profile/delete")}>
                Eliminar Perfil
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Salir
              </Button>
              <Avatar>
                <AvatarImage src={userProfile.profile_image || "/placeholder.svg?height=32&width=32"} />
                <AvatarFallback>
                  {userProfile.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Estado de suscripción */}
        {providerProfile.subscription_status === "trial" && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-orange-800">Período de prueba</p>
                  <p className="text-sm text-orange-600">Te quedan {trialDaysLeft} días gratis</p>
                </div>
                <Button size="sm">Activar Suscripción</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calificación</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providerProfile.rating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">{providerProfile.total_reviews} reseñas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providerProfile.total_clients}</div>
              <p className="text-xs text-muted-foreground">Total histórico</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
              <MessageCircle className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">Sin leer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isAvailable ? "Activo" : "Inactivo"}</div>
              <p className="text-xs text-muted-foreground">
                {isAvailable ? "Recibiendo solicitudes" : "No disponible"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado de disponibilidad */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de Disponibilidad</CardTitle>
                <CardDescription>Controla cuándo los clientes pueden contactarte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="availability">
                      {isAvailable ? "Disponible para nuevos servicios" : "No disponible"}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {isAvailable
                        ? "Los clientes pueden contactarte y solicitar servicios"
                        : "No recibirás nuevas solicitudes de servicio"}
                    </p>
                  </div>
                  <Switch
                    id="availability"
                    checked={isAvailable}
                    onCheckedChange={handleAvailabilityChange}
                    disabled={updating}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información del servicio */}
            <Card>
              <CardHeader>
                <CardTitle>Mi Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-600">{providerProfile.service}</h4>
                    <p className="text-sm text-gray-600">{providerProfile.category}</p>
                  </div>
                  {providerProfile.description && (
                    <div>
                      <h5 className="font-medium mb-2">Descripción:</h5>
                      <p className="text-sm text-gray-600">{providerProfile.description}</p>
                    </div>
                  )}
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Editar información
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Perfil rápido */}
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={userProfile.profile_image || "/placeholder.svg?height=80&width=80"} />
                  <AvatarFallback className="text-lg">
                    {userProfile.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{userProfile.full_name}</h3>
                <p className="text-blue-600 mb-2">{providerProfile.service}</p>
                <p className="text-sm text-gray-600 mb-4">{providerProfile.category}</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Acciones rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/messages")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ver Mensajes {unreadCount > 0 && `(${unreadCount})`}
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Mi Calendario
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Estadísticas
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Mis Precios
                </Button>
              </CardContent>
            </Card>

            {/* Suscripción */}
            <Card>
              <CardHeader>
                <CardTitle>Suscripción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge className="mb-3">
                    {providerProfile.subscription_status === "active" ? "Activa" : "Prueba"}
                  </Badge>
                  <p className="text-sm text-gray-600 mb-4">Plan Profesional - $69/mes</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Gestionar Suscripción
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
