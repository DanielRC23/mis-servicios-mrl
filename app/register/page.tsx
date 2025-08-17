"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { User, Briefcase, Loader2 } from "lucide-react"
import { registerWithEmail, signInWithGoogle, signInWithFacebook } from "@/lib/auth"
import { uploadProfileImage, uploadDocument } from "@/lib/storage"
import CameraCapture from "@/components/camera-capture"

const serviceCategories = {
  hogar: {
    name: "Servicios para el hogar",
    services: [
      "Albañiles",
      "Pintores",
      "Instaladores de pisos y azulejos",
      "Carpinteros",
      "Herreros y soldadores",
      "Vidrieros",
      "Jardinero / podador de árboles",
      "Técnicos en instalación de cámaras de seguridad",
      "Técnicos en aire acondicionado y refrigeración",
      "Técnicos en instalación de paneles solares",
      "Desinfección y fumigación",
    ],
  },
  reparaciones: {
    name: "Reparaciones y mantenimiento",
    services: [
      "Técnicos de electrodomésticos (lavadoras, refrigeradores, estufas)",
      "Técnicos en computadoras y laptops",
      "Técnicos en celulares y tablets",
      "Reparación de motocicletas",
      "Cerrajeros automotrices y residenciales",
    ],
  },
  personales: {
    name: "Servicios personales y de salud",
    services: [
      "Estilistas y barberos a domicilio",
      "Maquillistas",
      "Masajistas y fisioterapeutas",
      "Entrenadores personales",
      "Nutriólogos",
      "Psicólogos (sesiones online o presenciales)",
    ],
  },
  eventos: {
    name: "Servicios para eventos",
    services: [
      "Fotógrafos y videógrafos",
      "DJ's y músicos",
      "Organizadores de eventos",
      "Rentas de mobiliario y carpas",
      "Banquetes y catering",
      "Florerías",
    ],
  },
  otros: {
    name: "Otros",
    services: [
      "Paseadores de perros y cuidadores de mascotas",
      "Profesores particulares (idiomas, música, matemáticas, etc.)",
      "Choferes privados o de traslado especial",
      "Gestores de trámites",
      "Servicios de mensajería y paquetería local",
    ],
  },
}

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [userType, setUserType] = useState<"client" | "provider" | null>(null)
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [ineFiles, setIneFiles] = useState<{ front: File | null; back: File | null }>({ front: null, back: null })
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    category: "",
    service: "",
    description: "",
    acceptTermsAndPrivacy: false,
    customService: "",
  })

  useEffect(() => {
    const type = searchParams.get("type") as "client" | "provider"
    if (type) {
      setUserType(type)
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return false
    }

    if (!profileImage) {
      toast({
        title: "Error",
        description: "La foto de perfil es obligatoria",
        variant: "destructive",
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return false
    }

    if (userType === "provider") {
      if (!formData.category || !formData.service) {
        toast({
          title: "Error",
          description: "Por favor selecciona una categoría y servicio",
          variant: "destructive",
        })
        return false
      }

      if (!ineFiles.front || !ineFiles.back || !addressProofFile) {
        toast({
          title: "Error",
          description: "Todos los documentos son obligatorios para prestadores de servicios",
          variant: "destructive",
        })
        return false
      }

      if (formData.service === "otros" && !formData.customService) {
        toast({
          title: "Error",
          description: "Por favor especifica tu servicio",
          variant: "destructive",
        })
        return false
      }
    }

    if (!formData.acceptTermsAndPrivacy) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y condiciones y el aviso de privacidad",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // Register user with Supabase
      const user = await registerWithEmail(formData.email, formData.password, {
        fullName: formData.fullName,
        phone: formData.phone,
        userType: userType!,
        category: formData.category,
        service: formData.service === "otros" ? formData.customService : formData.service,
        description: formData.description,
      })

      // Upload profile image
      if (profileImage) {
        try {
          await uploadProfileImage(profileImage, user.id)
        } catch (error) {
          console.error("Error uploading profile image:", error)
        }
      }

      // If provider, upload documents
      if (userType === "provider") {
        try {
          if (ineFiles.front) {
            await uploadDocument(ineFiles.front, user.id, "ine-front")
          }
          if (ineFiles.back) {
            await uploadDocument(ineFiles.back, user.id, "ine-back")
          }
          if (addressProofFile) {
            await uploadDocument(addressProofFile, user.id, "address-proof")
          }
        } catch (error) {
          console.error("Error uploading documents:", error)
        }
      }

      toast({
        title: "¡Registro exitoso!",
        description:
          userType === "provider"
            ? "Tu cuenta ha sido creada. Tienes 30 días gratis para probar la plataforma."
            : "Tu cuenta ha sido creada exitosamente.",
      })

      // Redirect to appropriate dashboard
      router.push(userType === "provider" ? "/dashboard/provider" : "/dashboard/client")
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Error en el registro",
        description: error.message || "Ocurrió un error durante el registro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setLoading(true)
    try {
      if (provider === "google") {
        await signInWithGoogle()
      } else {
        await signInWithFacebook()
      }
      // OAuth will redirect automatically
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión con " + provider,
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">¿Cómo quieres usar Mis Servicios Mrl?</CardTitle>
            <CardDescription>Selecciona el tipo de cuenta que necesitas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full h-16 flex items-center justify-start space-x-4"
              onClick={() => setUserType("client")}
              disabled={loading}
            >
              <User className="w-8 h-8" />
              <div className="text-left">
                <div className="font-semibold">Soy Cliente</div>
                <div className="text-sm opacity-90">Busco servicios profesionales</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full h-16 flex items-center justify-start space-x-4 bg-white hover:bg-gray-50"
              onClick={() => setUserType("provider")}
              disabled={loading}
            >
              <Briefcase className="w-8 h-8" />
              <div className="text-left">
                <div className="font-semibold">Soy Prestador</div>
                <div className="text-sm opacity-70">Ofrezco servicios profesionales</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Registro como {userType === "client" ? "Cliente" : "Prestador de Servicios"}
            </CardTitle>
            <CardDescription>
              {userType === "client"
                ? "Crea tu cuenta para encontrar los mejores servicios en Morelia"
                : "Únete a nuestra plataforma y comienza a ofrecer tus servicios (30 días gratis)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social Login */}
            <div className="space-y-3 mb-6">
              <Button
                variant="outline"
                className="w-full bg-white hover:bg-gray-50"
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <User className="w-4 h-4 mr-2" />}
                Continuar con Google
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white hover:bg-gray-50"
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <User className="w-4 h-4 mr-2" />}
                Continuar con Facebook
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">O regístrate con email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Personal</h3>

                <div>
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={loading}
                    placeholder="+52 443 123 4567"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Foto de perfil obligatoria */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Foto de Perfil *</h3>
                <CameraCapture onCapture={(file) => setProfileImage(file)} label="Foto de perfil" required />
              </div>

              {/* Campos específicos para prestadores */}
              {userType === "provider" && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información del Servicio</h3>

                    <div>
                      <Label htmlFor="category">Categoría de Servicio *</Label>
                      <Select onValueChange={(value) => handleInputChange("category", value)} disabled={loading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(serviceCategories).map(([key, category]) => (
                            <SelectItem key={key} value={key}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="service">Servicio Específico *</Label>
                      <Select onValueChange={(value) => handleInputChange("service", value)} disabled={loading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories[formData.category as keyof typeof serviceCategories]?.services.map(
                            (service) => (
                              <SelectItem key={service} value={service}>
                                {service}
                              </SelectItem>
                            ),
                          )}
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.service === "otros" && (
                      <div>
                        <Label htmlFor="customService">Especifica tu servicio *</Label>
                        <Input
                          id="customService"
                          value={formData.customService || ""}
                          onChange={(e) => handleInputChange("customService", e.target.value)}
                          placeholder="Escribe el nombre de tu servicio"
                          required
                          disabled={loading}
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="description">Descripción de tu servicio (máx. 100 palabras)</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Describe brevemente tu experiencia y servicios..."
                        maxLength={500}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Documentos de verificación obligatorios */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Documentos de Verificación *</h3>
                    <p className="text-sm text-gray-600">
                      Todos los documentos son obligatorios para garantizar la seguridad de la plataforma
                    </p>

                    <div className="space-y-4">
                      <CameraCapture
                        onCapture={(file) => setIneFiles((prev) => ({ ...prev, front: file }))}
                        label="INE Frente"
                        required
                      />

                      <CameraCapture
                        onCapture={(file) => setIneFiles((prev) => ({ ...prev, back: file }))}
                        label="INE Reverso"
                        required
                      />

                      <CameraCapture
                        onCapture={(file) => setAddressProofFile(file)}
                        label="Comprobante de Domicilio"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Términos y condiciones */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptTermsAndPrivacy"
                    checked={formData.acceptTermsAndPrivacy}
                    onCheckedChange={(checked) => handleInputChange("acceptTermsAndPrivacy", checked as boolean)}
                    disabled={loading}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <Label htmlFor="acceptTermsAndPrivacy" className="cursor-pointer">
                      He leído y acepto los{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">
                        Términos y Condiciones
                      </Link>{" "}
                      y el{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                        Aviso de Privacidad
                      </Link>
                      .
                    </Label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  `Crear cuenta como ${userType === "client" ? "Cliente" : "Prestador"}`
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
