"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle } from "lucide-react"
import { getUserConversations } from "@/lib/chat"
import { useAuth } from "@/contexts/AuthContext"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Conversation {
  id: string
  client_id: string
  provider_id: string
  last_message: string | null
  last_message_at: string
  client: {
    id: string
    full_name: string
    profile_image: string | null
  }
  provider: {
    id: string
    full_name: string
    profile_image: string | null
  }
}

interface ChatListProps {
  onSelectConversation: (conversationId: string, otherUser: any) => void
  selectedConversationId?: string
}

export function ChatList({ onSelectConversation, selectedConversationId }: ChatListProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user) return

    try {
      const data = await getUserConversations(user.id)
      setConversations(data)
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getOtherUser = (conversation: Conversation) => {
    return user?.id === conversation.client_id ? conversation.provider : conversation.client
  }

  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = getOtherUser(conversation)
    return otherUser.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Mensajes
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No tienes conversaciones aún</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation)
              const isSelected = selectedConversationId === conversation.id

              return (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                    isSelected ? "bg-blue-50 border-l-blue-500" : "border-l-transparent"
                  }`}
                  onClick={() => onSelectConversation(conversation.id, otherUser)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={otherUser.profile_image || "/placeholder.svg?height=40&width=40"} />
                      <AvatarFallback>
                        {otherUser.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{otherUser.full_name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.last_message_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message || "Inicia una conversación"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
