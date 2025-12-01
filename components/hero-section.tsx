"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { AnimatedText } from "./animated-text"
import { Reveal } from "./reveal"
import HeroBgBeforeAfter from "./HeroBgBeforeAfter"
import { useToast } from "@/hooks/use-toast"
import { DEFAULT_HERO } from "@/lib/hero-constants"
import { loadSessionPair, saveSessionPair, subscribeHeroUpdate, type HeroPair } from "@/lib/hero-bus"
import { useUploadUI } from "@/lib/stores/upload-ui"
import { getToolUploadLimits } from "@/lib/tool-pipeline"
import type { LandingConfig } from "@/config/toolConfig"

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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

const uploadLimits = getToolUploadLimits()

type HeroSectionProps = {
  hero: Pick<LandingConfig, "heroBadge" | "heroTitle" | "heroSubtitle" | "heroDescription" | "heroBullets">
}

export function HeroSection({ hero }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [heroPair, setHeroPair] = useState<HeroPair>(DEFAULT_HERO)
  const { open, setFile, setObjectUrl } = useUploadUI()

  useEffect(() => {
    setMounted(true)
    const initial = loadSessionPair() ?? DEFAULT_HERO
    setHeroPair(initial)

    const unsubscribe = subscribeHeroUpdate((p) => {
      setHeroPair(p)
      saveSessionPair(p)
    })

    return () => unsubscribe()
  }, [])

  const handleFileSelect = useCallback(
    (file: File) => {
      console.log("[v0] handleFileSelect called with file:", file.name)

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

      console.log("[v0] Creating objectUrl for file")
      const objectUrl = URL.createObjectURL(file)
      console.log("[v0] Setting file and objectUrl in store")
      setFile(file)
      setObjectUrl(objectUrl)
      console.log("[v0] Opening modal")
      open()
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
    console.log("[v0] handleFileInput triggered")
    const file = e.target.files?.[0]
    console.log("[v0] Selected file:", file?.name)

    if (file) {
      handleFileSelect(file)
    }

    if (fileInputRef.current) {
      console.log("[v0] Resetting file input value")
      fileInputRef.current.value = ""
    }
  }

  const heroBadge = hero.heroBadge ?? "AI-Powered Enhancement"
  const heroTitle = hero.heroTitle ?? "Free AI Image Sharpener & Upscaler"
  const heroSubtitle = hero.heroSubtitle ?? "enhance Photos and Fix Blurry Images in Seconds"
  const heroDescription =
    hero.heroDescription ??
    "Use our free AI image sharpener and AI image upscaler to remove blur from photos online, fix blurry pictures, and enhance photo detail in one click. Upload any AI picture or regular photo and get a clearer, sharper download in seconds."
  const heroBullets = hero.heroBullets ?? [
    { title: "Lightning Fast", body: "" },
    { title: "Secure & Private", body: "" },
    { title: "AI-Enhanced", body: "" },
  ]

  return (
    <section className="relative w-full min-h-[72vh] max-h-[920px] flex items-center justify-center overflow-hidden">
      <HeroBgBeforeAfter
        src={heroPair.originalUrl}
        afterSrc={heroPair.resultUrl || undefined}
        alt="Professional portrait showing before/after sharpening comparison"
      />

      <div className="absolute inset-0 z-[11] bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="absolute inset-0 z-[12] grain-texture" />

      <div className="relative z-30 container-custom py-12 md:py-16">
        <Reveal>
            <div
              data-hero-foreground
              className="w-full max-w-6xl mx-auto bg-white/10 bg-gradient-to-b from-white/8 to-white/5 ring-1 ring-white/15 rounded-3xl px-10 py-8 md:px-16 md:py-14 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            >
            <div className="text-center mb-10">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/20 border border-white/30 mb-6 transition-all duration-600 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                }`}
                style={{ transitionDelay: "0.1s" }}
              >
                <SparklesIcon className="w-4 h-4 text-[#ff7959]" />
                <span className="text-sm font-medium text-white">{heroBadge}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight whitespace-nowrap">
                <AnimatedText text={heroTitle} delay={0.2} />
              </h1>
              <p className="text-2xl md:text-4xl font-semibold text-white mb-2">
                <AnimatedText text={heroSubtitle} delay={0.4} />
              </p>

              <p
                className={`text-base md:text-lg text-white/85 mb-10 leading-relaxed max-w-3xl mx-auto text-balance transition-all duration-600 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                }`}
                style={{ transitionDelay: "0.8s" }}
              >
                {heroDescription}
              </p>
            </div>

            <div
              className={`transition-all duration-600 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: "1s" }}
            >
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="backdrop-blur-md bg-white/10 border-2 border-dashed border-white/30 rounded-2xl p-8 cursor-pointer hover:bg-white/15 hover:border-white/40 transition-all group"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff5733] to-[#e63b14] flex items-center justify-center shadow-lg shadow-[#ff5733]/25 group-hover:scale-110 transition-transform">
                    <UploadIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                  <p className="text-lg font-semibold text-white mb-1">Drop your image here, or click to browse</p>
                  <p className="text-sm text-neutral-300">
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
            </div>

            <div
              className={`flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/80 transition-all duration-600 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: "1.2s" }}
            >
              {heroBullets.map((bullet) => (
                <div key={bullet.title} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff7959]" />
                  <span>{bullet.title}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
