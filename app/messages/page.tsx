"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { ChatList } from "@/components/chat/chat-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function MessagesPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string
    otherUser: any
  } | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleSelectConversation = (conversationId: string, otherUser: any) => {
    setSelectedConversation({ id: conversationId, otherUser })
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
  }

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-xl font-bold">Mensajes</h1>
            </div>
            <div className="text-sm text-gray-600">{userProfile.full_name}</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Lista de conversaciones - oculta en móvil cuando hay conversación seleccionada */}
          <div className={`lg:col-span-1 ${selectedConversation ? "hidden lg:block" : ""}`}>
            <ChatList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Ventana de chat */}
          <div className={`lg:col-span-2 ${!selectedConversation ? "hidden lg:block" : ""}`}>
            {selectedConversation ? (
              <div className="h-full">
                {/* Botón de volver en móvil */}
                <div className="lg:hidden mb-4">
                  <Button variant="ghost" size="sm" onClick={handleBackToList}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a conversaciones
                  </Button>
                </div>
                <ChatWindow conversationId={selectedConversation.id} otherUser={selectedConversation.otherUser} />
              </div>
            ) : (
              <div className="hidden lg:flex h-full items-center justify-center bg-white rounded-lg border">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Selecciona una conversación</p>
                  <p className="text-sm">Elige una conversación para comenzar a chatear</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
