import { supabase } from "./supabase"
import type { Subscription, PaymentHistory } from "./types"

export const SUBSCRIPTION_PLANS = {
  CLIENT_PREMIUM: {
    id: "client_premium",
    name: "Cliente Premium",
    price: 25,
    currency: "MXN",
    description: "Sin anuncios y funciones exclusivas",
    features: ["Sin publicidad", "Búsqueda avanzada", "Historial de servicios", "Soporte prioritario"],
  },
  PROVIDER_BASIC: {
    id: "provider_basic",
    name: "Prestador Básico",
    price: 70,
    currency: "MXN",
    trialDays: 45,
    description: "Publica tus servicios y conecta con clientes",
    features: [
      "Perfil profesional",
      "Chat con clientes",
      "Gestión de disponibilidad",
      "Sistema de calificaciones",
      "45 días gratis al domiciliar tarjeta",
    ],
  },
} as const

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single()

  if (error) return null
  return data
}

export async function createSubscription(
  userId: string,
  planType: "client_premium" | "provider_basic",
  mercadopagoSubscriptionId: string,
): Promise<Subscription | null> {
  const plan = planType === "client_premium" ? SUBSCRIPTION_PLANS.CLIENT_PREMIUM : SUBSCRIPTION_PLANS.PROVIDER_BASIC

  const subscriptionData = {
    user_id: userId,
    plan_type: planType,
    status: planType === "provider_basic" ? "trial" : "active",
    amount: plan.price,
    currency: plan.currency,
    payment_method: "mercadopago",
    subscription_id: mercadopagoSubscriptionId,
    trial_ends_at:
      planType === "provider_basic" ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString() : null,
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }

  const { data, error } = await supabase.from("subscriptions").insert(subscriptionData).select().single()

  if (error) {
    console.error("Error creating subscription:", error)
    return null
  }

  // Update user subscription status
  await supabase
    .from("users")
    .update({
      subscription_status: subscriptionData.status,
      subscription_expires_at: subscriptionData.current_period_end,
      trial_ends_at: subscriptionData.trial_ends_at,
    })
    .eq("id", userId)

  return data
}

export async function cancelSubscription(userId: string): Promise<boolean> {
  const { error } = await supabase.from("subscriptions").update({ status: "cancelled" }).eq("user_id", userId)

  if (error) {
    console.error("Error cancelling subscription:", error)
    return false
  }

  // Update user status
  await supabase.from("users").update({ subscription_status: "inactive" }).eq("id", userId)

  return true
}

export async function getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
  const { data, error } = await supabase
    .from("payment_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payment history:", error)
    return []
  }

  return data || []
}

export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  if (!subscription) return false

  const now = new Date()
  const expiresAt = new Date(subscription.current_period_end)

  return subscription.status === "active" && expiresAt > now
}

export async function isInTrialPeriod(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  if (!subscription || !subscription.trial_ends_at) return false

  const now = new Date()
  const trialEnds = new Date(subscription.trial_ends_at)

  return subscription.status === "trial" && trialEnds > now
}
