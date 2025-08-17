import { supabase } from "./supabase"
import type { Database } from "./supabase"

type Provider = Database["public"]["Tables"]["providers"]["Row"]
type Review = Database["public"]["Tables"]["reviews"]["Row"]
type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"]

// Search providers with filters
export const searchProviders = async (filters: {
  category?: string
  service?: string
  available?: boolean
  minRating?: number
  location?: { lat: number; lng: number; radius: number }
}): Promise<Provider[]> => {
  try {
    let query = supabase.from("providers").select(`
        *,
        users!providers_user_id_fkey (
          full_name,
          email,
          phone,
          profile_image
        )
      `)

    if (filters.category) {
      query = query.eq("category", filters.category)
    }

    if (filters.service) {
      query = query.eq("service", filters.service)
    }

    if (filters.available !== undefined) {
      query = query.eq("is_available", filters.available)
    }

    if (filters.minRating) {
      query = query.gte("rating", filters.minRating)
    }

    // Order by rating and limit results
    query = query.order("rating", { ascending: false }).limit(50)

    const { data, error } = await query

    if (error) throw error

    // If location filter is provided, calculate distances
    if (filters.location && data) {
      const providersWithDistance = data
        .filter((provider) => provider.location_lat && provider.location_lng)
        .map((provider) => {
          const distance = calculateDistance(
            filters.location!.lat,
            filters.location!.lng,
            provider.location_lat!,
            provider.location_lng!,
          )
          return { ...provider, distance }
        })
        .filter((provider) => provider.distance <= filters.location!.radius)
        .sort((a, b) => a.distance - b.distance)

      return providersWithDistance
    }

    return data || []
  } catch (error) {
    console.error("Error searching providers:", error)
    throw error
  }
}

// Get provider by ID
export const getProvider = async (providerId: string): Promise<Provider | null> => {
  try {
    const { data, error } = await supabase
      .from("providers")
      .select(`
        *,
        users!providers_user_id_fkey (
          full_name,
          email,
          phone,
          profile_image
        )
      `)
      .eq("id", providerId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting provider:", error)
    return null
  }
}

// Add review
export const addReview = async (reviewData: {
  provider_id: string
  client_id: string
  client_name: string
  rating: number
  comment: string
  service_type: string
}): Promise<void> => {
  try {
    // Insert review
    const { error: reviewError } = await supabase.from("reviews").insert(reviewData)

    if (reviewError) throw reviewError

    // Update provider rating
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("rating, total_reviews")
      .eq("id", reviewData.provider_id)
      .single()

    if (providerError) throw providerError

    const newTotalReviews = provider.total_reviews + 1
    const newRating = (provider.rating * provider.total_reviews + reviewData.rating) / newTotalReviews

    const { error: updateError } = await supabase
      .from("providers")
      .update({
        rating: Math.round(newRating * 10) / 10,
        total_reviews: newTotalReviews,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewData.provider_id)

    if (updateError) throw updateError
  } catch (error) {
    console.error("Error adding review:", error)
    throw error
  }
}

// Get provider reviews
export const getProviderReviews = async (providerId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting provider reviews:", error)
    throw error
  }
}

// Create service request
export const createServiceRequest = async (
  requestData: Database["public"]["Tables"]["service_requests"]["Insert"],
): Promise<string> => {
  try {
    const { data, error } = await supabase.from("service_requests").insert(requestData).select("id").single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error("Error creating service request:", error)
    throw error
  }
}

// Update service request
export const updateServiceRequest = async (
  requestId: string,
  updates: Database["public"]["Tables"]["service_requests"]["Update"],
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("service_requests")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", requestId)

    if (error) throw error
  } catch (error) {
    console.error("Error updating service request:", error)
    throw error
  }
}

// Get service requests
export const getServiceRequests = async (
  userId: string,
  userType: "client" | "provider",
): Promise<ServiceRequest[]> => {
  try {
    const field = userType === "client" ? "client_id" : "provider_id"

    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .eq(field, userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting service requests:", error)
    throw error
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in kilometers
  return distance
}
