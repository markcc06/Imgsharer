"use client"

import { useCallback, useRef } from "react"

import { useToast } from "@/hooks/use-toast"
import { useUploadUI } from "@/lib/stores/upload-ui"
import { Upload } from "lucide-react"
import { getToolUploadLimits } from "@/lib/tool-pipeline"

interface HeroBullet {
  icon: string
  title: string
  description: string
}

const uploadLimits = getToolUploadLimits()

interface ImageEnhancerHeroProps {
  badge?: string
  title?: string
  subtitle?: string
  body?: string
  ctaText?: string
  bullets?: HeroBullet[]
}

export function ImageEnhancerHero({ badge, title, subtitle, body, ctaText, bullets }: ImageEnhancerHeroProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { open, setFile, setObjectUrl } = useUploadUI()

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

  const defaultBullets = [
    {
      icon: "✨",
      title: "Boost detail instantly",
      description: "Enhance phone shots and soften edges so every portrait and product photo looks crisp again.",
    },
    {
      icon: "🧾",
      title: "Refresh CVS photos",
      description: "Upload scanned CVS photos or receipts and let AI clean noise, boost contrast, and revive color.",
    },
    {
      icon: "🖥️",
      title: "Unblur image free online",
      description: "Everything runs in the browser—no apps or plugins. Just upload, enhance, and download a clearer file.",
    },
  ]

  const heroBullets = bullets ?? defaultBullets
  const heroBadge = badge ?? "Free image enhancer online"
  const heroTitle = title ?? "Enhance photos with our image enhancer free"
  const heroSubtitle = subtitle ?? "Use Imgsharer’s AI image enhancer free to boost clarity, contrast, and detail. Unblur image free in your browser and make scanned prints, phone shots, and CVS photos look crisp again."
  const heroBody = body ?? "Upload any photo or CVS print, let AI enhance faces and textures, and download a sharper version in seconds — no apps, no Photoshop, and no sign-up."
  const heroCta = ctaText ?? "Enhance my image"

  return (
    <section className="bg-white py-20">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <p className="inline-flex items-center rounded-full bg-orange-500/10 text-orange-600 px-4 py-1 text-sm font-semibold tracking-wide">
            {heroBadge}
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900 tracking-tight whitespace-normal md:whitespace-nowrap">
            {heroTitle}
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            {heroSubtitle}
          </p>
          {heroBody && (
          <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            {heroBody}
          </p>
        )}
        </div>

        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-6 md:p-8">
            <div
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
                  <p className="text-sm text-neutral-500">
                    {uploadLimits.allowedMimeTypes.map((type) => type.split("/")[1].toUpperCase()).join(", ")} • Max{" "}
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff5733] to-[#e63b14] text-white font-semibold py-3 shadow-lg shadow-[#ff5733]/30 hover:scale-[1.01] transition-transform"
            >
              {heroCta}
            </button>
          </div>

          <div className="space-y-6">
            {heroBullets.map((bullet) => (
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
