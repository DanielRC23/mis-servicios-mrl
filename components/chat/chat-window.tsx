"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Phone, Video } from "lucide-react"
import { getConversationMessages, sendMessage, markMessagesAsRead, subscribeToMessages } from "@/lib/chat"
import { useAuth } from "@/contexts/AuthContext"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  sender: {
    id: string
    full_name: string
    profile_image: string | null
  }
}

interface ChatWindowProps {
  conversationId: string
  otherUser: {
    id: string
    full_name: string
    profile_image: string | null
  }
}

export function ChatWindow({ conversationId, otherUser }: ChatWindowProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) {
      loadMessages()
      markAsRead()

      // Suscribirse a nuevos mensajes
      const subscription = subscribeToMessages(conversationId, (message) => {
        setMessages((prev) => [...prev, message])
        if (message.sender_id !== user?.id) {
          markAsRead()
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [conversationId, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await getConversationMessages(conversationId)
      setMessages(data)
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    if (!user) return
    try {
      await markMessagesAsRead(conversationId, user.id)
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || sending) return

    setSending(true)
    try {
      await sendMessage(conversationId, user.id, newMessage)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className="max-w-xs">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-10 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
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
            <div>
              <CardTitle className="text-lg">{otherUser.full_name}</CardTitle>
              <p className="text-sm text-gray-500">En línea</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No hay mensajes aún. ¡Inicia la conversación!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id
            return (
              <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-2" : "order-1"}`}>
                  {!isOwn && <p className="text-xs text-gray-500 mb-1 px-3">{message.sender.full_name}</p>}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwn ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-3">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
