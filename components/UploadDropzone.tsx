"use client"

import type React from "react"

import { useRef, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUploadUI } from "@/lib/stores/upload-ui"
import { uploaderBridge } from "@/lib/uploader-bridge"
import { getToolUploadLimits } from "@/lib/tool-pipeline"

const uploadLimits = getToolUploadLimits()

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}

export default function UploadDropzone({ mode = "modal" }: { mode?: "standalone" | "modal" }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { setFile, setObjectUrl } = useUploadUI()

  useEffect(() => {
    uploaderBridge.pick = () => fileInputRef.current?.click()
    return () => {
      uploaderBridge.pick = undefined
    }
  }, [])

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!uploadLimits.allowedMimeTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a supported image format.",
          variant: "destructive",
        })
        return
      }

      if (file.size > uploadLimits.maxFileSizeBytes) {
        toast({
          title: "File too large",
          description: `Please upload an image smaller than ${uploadLimits.maxFileSizeMb}MB.`,
          variant: "destructive",
        })
        return
      }

      const objectUrl = URL.createObjectURL(file)
      setFile(file)
      setObjectUrl(objectUrl)
    },
    [toast, setFile, setObjectUrl],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  return (
    <div
      data-testid="dropzone"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="text-center cursor-pointer p-8 lg:p-12 bg-white/40 backdrop-blur-md grain-texture border border-white/30 rounded-2xl"
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary/10 to-brand-primary-light/10 flex items-center justify-center border border-brand-primary/20 transition-transform hover:scale-105">
          <UploadIcon className="w-10 h-10 text-brand-primary" />
        </div>
        <div>
          <p className="text-xl font-semibold text-neutral-900 mb-2">Drop your image here, or click to browse</p>
          <p className="text-sm text-neutral-600">
            Supports {uploadLimits.allowedMimeTypes.map((type) => type.split("/")[1].toUpperCase()).join(", ")} up to{" "}
            {uploadLimits.maxFileSizeMb}MB
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={uploadLimits.allowedMimeTypes.join(",")}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}
