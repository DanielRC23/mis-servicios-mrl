"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { deleteUserAccount } from "@/lib/auth"
import Link from "next/link"

export default function DeleteProfilePage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDeleteAccount = async () => {
    if (!user || !confirmDelete || confirmText !== "ELIMINAR") {
      toast({
        title: "Error",
        description: "Por favor confirma que deseas eliminar tu cuenta",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await deleteUserAccount(user.id)
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada exitosamente",
      })
      router.push("/")
    } catch (error: any) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la cuenta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href={userProfile.user_type === "client" ? "/dashboard/client" : "/dashboard/provider"}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al dashboard
            </Button>
          </Link>
        </div>

        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <CardTitle className="text-2xl text-red-600">Eliminar Cuenta</CardTitle>
                <CardDescription>Esta acción no se puede deshacer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">¿Qué sucederá al eliminar tu cuenta?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                <li>Se eliminará toda tu información personal</li>
                <li>Se borrarán todos tus mensajes y conversaciones</li>
                <li>Se eliminarán tus calificaciones y reseñas</li>
                {userProfile.user_type === "provider" && (
                  <>
                    <li>Se cancelará tu suscripción automáticamente</li>
                    <li>Ya no aparecerás en las búsquedas de clientes</li>
                  </>
                )}
                <li>No podrás recuperar esta información</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="confirmText">
                  Para confirmar, escribe <strong>ELIMINAR</strong> en el campo de abajo:
                </Label>
                <Input
                  id="confirmText"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Escribe ELIMINAR"
                  disabled={loading}
                />
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="confirmDelete"
                  checked={confirmDelete}
                  onCheckedChange={(checked) => setConfirmDelete(checked as boolean)}
                  disabled={loading}
                  className="mt-1"
                />
                <Label htmlFor="confirmDelete" className="cursor-pointer text-sm">
                  Entiendo que esta acción es permanente y no se puede deshacer. Confirmo que deseo eliminar mi cuenta
                  de Mis Servicios Mrl.
                </Label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => router.back()} disabled={loading} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading || confirmText !== "ELIMINAR" || !confirmDelete}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar Cuenta"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
