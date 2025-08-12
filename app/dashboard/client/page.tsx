"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MapPin, Star, Phone, MessageCircle, Filter, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { searchProviders } from "@/lib/database"
import { createOrGetConversation } from "@/lib/chat"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface Provider {
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
  location_address: string | null
  prices: any
  users: {
    full_name: string
    email: string
    phone: string | null
    profile_image: string | null
  }
  distance?: number
}

export default function ClientDashboard() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (userProfile && userProfile.user_type !== "client") {
      router.push("/dashboard/provider")
      return
    }
  }, [user, userProfile, authLoading, router])

  useEffect(() => {
    loadProviders()
  }, [selectedCategory, sortBy])

  const loadProviders = async () => {
    try {
      setLoading(true)
      const filters: any = {
        available: true,
      }

      if (selectedCategory !== "all") {
        filters.category = selectedCategory
      }

      const results = await searchProviders(filters)
      setProviders(results)
    } catch (error) {
      console.error("Error loading providers:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los prestadores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async (provider: Provider) => {
    if (!user) return

    try {
      const conversationId = await createOrGetConversation(user.id, provider.user_id)
      router.push(`/messages`)
    } catch (error) {
      console.error("Error starting chat:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el chat",
        variant: "destructive",
      })
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

  const filteredProviders = providers.filter(
    (provider) =>
      provider.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Mis Servicios Mrl</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hola, {userProfile.full_name}</span>
              <Button variant="ghost" size="sm" onClick={() => router.push("/messages")}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Mensajes
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
        {/* Búsqueda y filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Servicios cerca de ti en Morelia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar servicios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="hogar">Servicios para el hogar</SelectItem>
                  <SelectItem value="reparaciones">Reparaciones</SelectItem>
                  <SelectItem value="personales">Servicios personales</SelectItem>
                  <SelectItem value="eventos">Eventos</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Mejor calificación</SelectItem>
                  <SelectItem value="reviews">Más reseñas</SelectItem>
                  <SelectItem value="clients">Más clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Disponible ahora
              </Button>
              <Button variant="outline" size="sm">
                Verificados
              </Button>
              <Button variant="outline" size="sm">
                Mejor precio
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de prestadores */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">
                {providers.length === 0
                  ? "Aún no hay prestadores registrados. ¡Sé el primero en registrarte como prestador!"
                  : "No se encontraron prestadores que coincidan con tu búsqueda."}
              </p>
              {providers.length === 0 && (
                <Button onClick={() => router.push("/register?type=provider")}>Registrarse como Prestador</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={provider.users.profile_image || "/placeholder.svg?height=64&width=64"} />
                        <AvatarFallback>
                          {provider.users.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{provider.users.full_name}</h3>
                          <div className="flex items-center space-x-2">
                            {provider.is_available ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Disponible
                              </Badge>
                            ) : (
                              <Badge variant="secondary">No disponible</Badge>
                            )}
                            {provider.is_verified && (
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                Verificado
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-blue-600 font-medium mb-1">{provider.service}</p>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{provider.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="font-medium">{provider.rating.toFixed(1)}</span>
                            <span className="ml-1">({provider.total_reviews} reseñas)</span>
                          </div>
                          {provider.location_address && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {provider.location_address}
                            </div>
                          )}
                          <div>{provider.total_clients} clientes atendidos</div>
                        </div>

                        {provider.prices?.description && (
                          <p className="font-semibold text-green-600">{provider.prices.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 md:w-32">
                      {provider.users.phone && (
                        <Button size="sm" className="w-full" asChild>
                          <a href={`tel:${provider.users.phone}`}>
                            <Phone className="w-4 h-4 mr-2" />
                            Llamar
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleStartChat(provider)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        Ver perfil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Publicidad */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">Publicidad</p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-lg font-semibold mb-2">¡Promoción especial!</p>
              <p className="text-sm text-gray-600">Obtén 20% de descuento en tu primer servicio</p>
            </div>
            <Button variant="outline" size="sm">
              Eliminar anuncios por $25/mes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
