import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  addDoc,
} from "firebase/firestore"
import { db } from "./firebase"

// Types
export interface ServiceProvider {
  uid: string
  displayName: string
  email: string
  phone: string
  category: string
  service: string
  description: string
  profileImage: string
  isVerified: boolean
  isAvailable: boolean
  rating: number
  totalReviews: number
  totalClients: number
  subscriptionStatus: "trial" | "active" | "expired"
  trialEndsAt?: Date
  location: {
    latitude: number
    longitude: number
    address: string
  }
  prices: {
    hourly?: number
    fixed?: number
    description: string
  }
  availability: {
    monday: { start: string; end: string; available: boolean }
    tuesday: { start: string; end: string; available: boolean }
    wednesday: { start: string; end: string; available: boolean }
    thursday: { start: string; end: string; available: boolean }
    friday: { start: string; end: string; available: boolean }
    saturday: { start: string; end: string; available: boolean }
    sunday: { start: string; end: string; available: boolean }
  }
  documents: {
    ine: { front: string; back: string; verified: boolean }
    addressProof: { url: string; verified: boolean }
  }
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  providerId: string
  clientId: string
  clientName: string
  rating: number
  comment: string
  serviceType: string
  createdAt: Date
}

export interface ServiceRequest {
  id: string
  clientId: string
  providerId: string
  serviceType: string
  description: string
  urgency: "low" | "medium" | "high"
  status: "pending" | "accepted" | "completed" | "cancelled"
  scheduledDate?: Date
  location: {
    latitude: number
    longitude: number
    address: string
  }
  createdAt: Date
  updatedAt: Date
}

// Service Providers
export const createServiceProvider = async (providerData: Partial<ServiceProvider>): Promise<void> => {
  try {
    const providerRef = doc(db, "providers", providerData.uid!)
    await setDoc(providerRef, {
      ...providerData,
      createdAt: new Date(),
      updatedAt: new Date(),
      rating: 0,
      totalReviews: 0,
      totalClients: 0,
      isAvailable: true,
    })
  } catch (error) {
    console.error("Error creating service provider:", error)
    throw error
  }
}

export const getServiceProvider = async (uid: string): Promise<ServiceProvider | null> => {
  try {
    const providerDoc = await getDoc(doc(db, "providers", uid))
    if (providerDoc.exists()) {
      return providerDoc.data() as ServiceProvider
    }
    return null
  } catch (error) {
    console.error("Error getting service provider:", error)
    throw error
  }
}

export const updateServiceProvider = async (uid: string, updates: Partial<ServiceProvider>): Promise<void> => {
  try {
    const providerRef = doc(db, "providers", uid)
    await updateDoc(providerRef, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating service provider:", error)
    throw error
  }
}

// Search providers
export const searchProviders = async (filters: {
  category?: string
  service?: string
  location?: { lat: number; lng: number; radius: number }
  available?: boolean
  minRating?: number
}): Promise<ServiceProvider[]> => {
  try {
    let q = query(collection(db, "providers"))

    if (filters.category) {
      q = query(q, where("category", "==", filters.category))
    }

    if (filters.service) {
      q = query(q, where("service", "==", filters.service))
    }

    if (filters.available !== undefined) {
      q = query(q, where("isAvailable", "==", filters.available))
    }

    if (filters.minRating) {
      q = query(q, where("rating", ">=", filters.minRating))
    }

    q = query(q, orderBy("rating", "desc"), limit(50))

    const querySnapshot = await getDocs(q)
    const providers: ServiceProvider[] = []

    querySnapshot.forEach((doc) => {
      providers.push(doc.data() as ServiceProvider)
    })

    return providers
  } catch (error) {
    console.error("Error searching providers:", error)
    throw error
  }
}

// Reviews
export const addReview = async (reviewData: Omit<Review, "id" | "createdAt">): Promise<void> => {
  try {
    const reviewRef = collection(db, "reviews")
    await addDoc(reviewRef, {
      ...reviewData,
      createdAt: new Date(),
    })

    // Update provider rating
    const provider = await getServiceProvider(reviewData.providerId)
    if (provider) {
      const newTotalReviews = provider.totalReviews + 1
      const newRating = (provider.rating * provider.totalReviews + reviewData.rating) / newTotalReviews

      await updateServiceProvider(reviewData.providerId, {
        rating: Math.round(newRating * 10) / 10, // Round to 1 decimal
        totalReviews: newTotalReviews,
      })
    }
  } catch (error) {
    console.error("Error adding review:", error)
    throw error
  }
}

export const getProviderReviews = async (providerId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, "reviews"),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc"),
      limit(20),
    )

    const querySnapshot = await getDocs(q)
    const reviews: Review[] = []

    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() } as Review)
    })

    return reviews
  } catch (error) {
    console.error("Error getting provider reviews:", error)
    throw error
  }
}

// Service Requests
export const createServiceRequest = async (
  requestData: Omit<ServiceRequest, "id" | "createdAt" | "updatedAt">,
): Promise<string> => {
  try {
    const requestRef = collection(db, "serviceRequests")
    const docRef = await addDoc(requestRef, {
      ...requestData,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating service request:", error)
    throw error
  }
}

export const updateServiceRequest = async (requestId: string, updates: Partial<ServiceRequest>): Promise<void> => {
  try {
    const requestRef = doc(db, "serviceRequests", requestId)
    await updateDoc(requestRef, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating service request:", error)
    throw error
  }
}

export const getServiceRequests = async (
  userId: string,
  userType: "client" | "provider",
): Promise<ServiceRequest[]> => {
  try {
    const field = userType === "client" ? "clientId" : "providerId"
    const q = query(collection(db, "serviceRequests"), where(field, "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const requests: ServiceRequest[] = []

    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as ServiceRequest)
    })

    return requests
  } catch (error) {
    console.error("Error getting service requests:", error)
    throw error
  }
}
