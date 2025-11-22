"use client"

import { useCallback, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { ALLOWED_FILE_TYPES } from "@/lib/constants"
import { useUploadUI } from "@/lib/stores/upload-ui"
import { Upload } from "lucide-react"

export function BlurryPhotoHero() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { open, setFile, setObjectUrl } = useUploadUI()

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, or WebP image.",
          variant: "destructive",
        })
        return
      }

      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
          variant: "destructive",
        })
        return
      }

      const objectUrl = URL.createObjectURL(file)
      setFile(file)
      setObjectUrl(objectUrl)
      open(file)
    },
    [toast, setFile, setObjectUrl, open],
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
    if (file) {
      handleFileSelect(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const bullets = [
    {
      icon: "📱",
      title: "Fix blurry phone photos",
      description: "Fix blurry phone photos and soft faces from shaky hands or low-light selfies.",
    },
    {
      icon: "🧾",
      title: "Enhance CVS photos",
      description: "Enhance CVS photos and printed receipts so text stays readable and colors pop again.",
    },
    {
      icon: "🖥️",
      title: "No-app AI enhancer",
      description: "Remove blur from photos online for free in your browser using the same AI image enhancer.",
    },
  ]

  return (
    <section className="bg-white py-20">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <p className="inline-flex items-center rounded-full bg-orange-500/10 text-orange-600 px-4 py-1 text-sm font-semibold tracking-wide">
            Fix blurry photos online free
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Fix Blurry Photos with AI Image Enhancer
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            Remove blur from photos online free, restore CVS photos, and rescue shaky phone shots with Imgsharer’s AI image enhancer.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-6 md:p-8">
            <div
              data-hero-foreground
              className="border-2 border-dashed border-neutral-200 rounded-2xl p-8 text-center cursor-pointer hover:border-[#ff7959]/60 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff5733] to-[#e63b14] flex items-center justify-center shadow-lg shadow-[#ff5733]/25">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-neutral-900 mb-1">Drop your image here, or click to browse</p>
                  <p className="text-sm text-neutral-500">JPEG, PNG, WebP • Max 4MB</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff5733] to-[#e63b14] text-white font-semibold py-3 shadow-lg shadow-[#ff5733]/30 hover:scale-[1.01] transition-transform"
            >
              Fix my blurry photo
            </button>
          </div>

          <div className="space-y-6">
            {bullets.map((bullet) => (
              <div key={bullet.title} className="flex items-start gap-4 bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                <div className="text-2xl" aria-hidden="true">
                  {bullet.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{bullet.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{bullet.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
