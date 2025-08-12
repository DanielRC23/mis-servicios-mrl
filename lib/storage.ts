import { supabase } from "./supabase"

// Upload profile image
export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/profile.${fileExt}`
    const filePath = `profiles/${fileName}`

    const { error: uploadError } = await supabase.storage.from("user-files").upload(filePath, file, {
      upsert: true,
    })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("user-files").getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error uploading profile image:", error)
    throw error
  }
}

// Upload document (INE, address proof)
export const uploadDocument = async (
  file: File,
  userId: string,
  documentType: "ine-front" | "ine-back" | "address-proof",
): Promise<string> => {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${documentType}.${fileExt}`
    const filePath = `documents/${fileName}`

    const { error: uploadError } = await supabase.storage.from("user-files").upload(filePath, file, {
      upsert: true,
    })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("user-files").getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error uploading document:", error)
    throw error
  }
}

// Delete file
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage.from("user-files").remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

// Upload multiple files
export const uploadMultipleFiles = async (files: File[], userId: string, folder: string): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}/${index}_${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("user-files").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("user-files").getPublicUrl(filePath)

      return data.publicUrl
    })

    const downloadURLs = await Promise.all(uploadPromises)
    return downloadURLs
  } catch (error) {
    console.error("Error uploading multiple files:", error)
    throw error
  }
}
