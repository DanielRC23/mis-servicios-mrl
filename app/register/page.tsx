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
import { Camera, Upload, User, Briefcase, Loader2 } from "lucide-react"
import { registerWithEmail, signInWithGoogle, signInWithFacebook } from "@/lib/auth"
import { uploadProfileImage, uploadDocument } from "@/lib/storage"

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

  const handleFileChange = (type: "profile" | "ine-front" | "ine-back" | "address-proof", file: File | null) => {
    if (type === "profile") {
      setProfileImage(file)
    } else if (type === "ine-front") {
      setIneFiles((prev) => ({ ...prev, front: file }))
    } else if (type === "ine-back") {
      setIneFiles((prev) => ({ ...prev, back: file }))
    } else if (type === "address-proof") {
      setAddressProofFile(file)
    }
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
        service: formData.service,
        description: formData.description,
      })

      // Upload profile image if provided
      if (profileImage) {
        try {
          await uploadProfileImage(profileImage, user.id)
        } catch (error) {
          console.error("Error uploading profile image:", error)
          // Don't fail registration if image upload fails
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
          // Don't fail registration if document upload fails
        }
      }

      toast({
        title: "¡Registro exitoso!",
        description:
          userType === "provider"
            ? "Tu cuenta ha sido creada. Tienes 40 días gratis para probar la plataforma."
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
              className="w-full h-16 flex items-center justify-start space-x-4 bg-transparent"
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
                : "Únete a nuestra plataforma y comienza a ofrecer tus servicios (40 días gratis)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social Login */}
            <div className="space-y-3 mb-6">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <User className="w-4 h-4 mr-2" />}
                Continuar con Google
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
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

              {/* Foto de perfil */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Foto de Perfil (Opcional)</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {profileImage ? profileImage.name : "Selecciona una foto de perfil"}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("profile", e.target.files?.[0] || null)}
                    className="hidden"
                    id="profile-image"
                    disabled={loading}
                  />
                  <Button type="button" variant="outline" asChild disabled={loading}>
                    <label htmlFor="profile-image" className="cursor-pointer">
                      <Camera className="w-4 h-4 mr-2" />
                      Seleccionar Foto
                    </label>
                  </Button>
                </div>
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

                    {formData.category && (
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
                          </SelectContent>
                        </Select>
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

                  {/* Documentos de verificación */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Documentos de Verificación (Opcional)</h3>
                    <p className="text-sm text-gray-600">
                      Puedes subir estos documentos ahora o después desde tu perfil
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">INE Frente</p>
                        <p className="text-xs text-gray-500 mb-2">
                          {ineFiles.front ? ineFiles.front.name : "No seleccionado"}
                        </p>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange("ine-front", e.target.files?.[0] || null)}
                          className="hidden"
                          id="ine-front"
                          disabled={loading}
                        />
                        <Button type="button" variant="outline" size="sm" asChild disabled={loading}>
                          <label htmlFor="ine-front" className="cursor-pointer">
                            Subir INE Frente
                          </label>
                        </Button>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">INE Reverso</p>
                        <p className="text-xs text-gray-500 mb-2">
                          {ineFiles.back ? ineFiles.back.name : "No seleccionado"}
                        </p>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange("ine-back", e.target.files?.[0] || null)}
                          className="hidden"
                          id="ine-back"
                          disabled={loading}
                        />
                        <Button type="button" variant="outline" size="sm" asChild disabled={loading}>
                          <label htmlFor="ine-back" className="cursor-pointer">
                            Subir INE Reverso
                          </label>
                        </Button>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Comprobante de Domicilio</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {addressProofFile ? addressProofFile.name : "No seleccionado"}
                      </p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange("address-proof", e.target.files?.[0] || null)}
                        className="hidden"
                        id="address-proof"
                        disabled={loading}
                      />
                      <Button type="button" variant="outline" size="sm" asChild disabled={loading}>
                        <label htmlFor="address-proof" className="cursor-pointer">
                          Subir Comprobante
                        </label>
                      </Button>
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
