import { supabase } from "./supabase"
import type { Database } from "./supabase"

type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
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

type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  sender: {
    id: string
    full_name: string
    profile_image: string | null
  }
}

// Obtener conversaciones del usuario
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        client:client_id (id, full_name, profile_image),
        provider:provider_id (id, full_name, profile_image)
      `)
      .or(`client_id.eq.${userId},provider_id.eq.${userId}`)
      .order("last_message_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting conversations:", error)
    throw error
  }
}

// Crear o obtener conversación existente
export const createOrGetConversation = async (clientId: string, providerId: string): Promise<string> => {
  try {
    // Intentar obtener conversación existente
    const { data: existing, error: selectError } = await supabase
      .from("conversations")
      .select("id")
      .eq("client_id", clientId)
      .eq("provider_id", providerId)
      .single()

    if (existing) {
      return existing.id
    }

    // Si no existe, crear nueva conversación
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        client_id: clientId,
        provider_id: providerId,
      })
      .select("id")
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error("Error creating/getting conversation:", error)
    throw error
  }
}

// Obtener mensajes de una conversación
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id (id, full_name, profile_image)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting messages:", error)
    throw error
  }
}

// Enviar mensaje
export const sendMessage = async (conversationId: string, senderId: string, content: string): Promise<void> => {
  try {
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
    })

    if (error) throw error
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

// Marcar mensajes como leídos
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false)

    if (error) throw error
  } catch (error) {
    console.error("Error marking messages as read:", error)
    throw error
  }
}

// Suscribirse a nuevos mensajes en tiempo real
export const subscribeToMessages = (conversationId: string, onMessage: (message: Message) => void) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // Obtener datos completos del mensaje con información del sender
        const { data } = await supabase
          .from("messages")
          .select(`
            *,
            sender:sender_id (id, full_name, profile_image)
          `)
          .eq("id", payload.new.id)
          .single()

        if (data) {
          onMessage(data as Message)
        }
      },
    )
    .subscribe()
}

// Obtener número de mensajes no leídos
export const getUnreadMessagesCount = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id", { count: "exact" })
      .neq("sender_id", userId)
      .eq("is_read", false)
      .in(
        "conversation_id",
        supabase.from("conversations").select("id").or(`client_id.eq.${userId},provider_id.eq.${userId}`),
      )

    if (error) throw error
    return data?.length || 0
  } catch (error) {
    console.error("Error getting unread count:", error)
    return 0
  }
}
