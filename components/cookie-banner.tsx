"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Cookie, X } from "lucide-react"

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookieConsent")
    if (!cookieConsent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted")
    setShowBanner(false)
  }

  const rejectCookies = () => {
    localStorage.setItem("cookieConsent", "rejected")
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="bg-white shadow-lg border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Uso de Cookies</h3>
              <p className="text-sm text-gray-600 mb-4">
                Utilizamos cookies para mejorar tu experiencia y mostrar publicidad personalizada. Al aceptar, nos
                ayudas a mantener la plataforma gratuita.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={acceptCookies} size="sm">
                  Aceptar cookies
                </Button>
                <Button onClick={rejectCookies} variant="outline" size="sm">
                  Rechazar
                </Button>
              </div>
            </div>
            <Button onClick={rejectCookies} variant="ghost" size="sm" className="flex-shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
