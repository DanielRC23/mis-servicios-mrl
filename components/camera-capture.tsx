"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, RotateCcw } from "lucide-react"

interface CameraCaptureProps {
  onCapture: (file: File) => void
  label: string
  required?: boolean
}

export default function CameraCapture({ onCapture, label, required = false }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCapturing(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("No se pudo acceder a la cámara. Por favor, permite el acceso.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `${label.toLowerCase().replace(/\s+/g, "_")}.jpg`, {
                type: "image/jpeg",
              })
              onCapture(file)
              setCapturedImage(canvas.toDataURL())
              stopCamera()
            }
          },
          "image/jpeg",
          0.8,
        )
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    setIsCapturing(false)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {!isCapturing && !capturedImage && (
          <Button onClick={startCamera} className="w-full bg-transparent" variant="outline">
            <Camera className="w-4 h-4 mr-2" />
            Tomar foto de {label.toLowerCase()}
          </Button>
        )}

        {isCapturing && (
          <div className="space-y-4">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
            <div className="flex gap-2">
              <Button onClick={capturePhoto} className="flex-1">
                Capturar
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <img src={capturedImage || "/placeholder.svg"} alt={`Foto de ${label}`} className="w-full rounded-lg" />
            <Button onClick={retakePhoto} variant="outline" className="w-full bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tomar otra foto
            </Button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}
