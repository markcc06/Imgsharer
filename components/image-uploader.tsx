"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import { initializePaddle, Paddle } from "@paddle/paddle-js"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { BeforeAfterSlider } from "@/components/before-after-slider"
import { BlurPanel } from "@/components/blur-panel"
import { Reveal } from "@/components/reveal"
import { useUploadUI } from "@/lib/stores/upload-ui"
import { REPLICATE_MAX_DIMENSION, REPLICATE_MAX_DIMENSION_PAID, STABILITY_DIM_MULTIPLE } from "@/lib/constants"
import { publishHeroUpdate } from "@/lib/hero-bus"
import { getToolUploadLimits, getToolApiEndpoint } from "@/lib/tool-pipeline"
import { siteConfig } from "@/config/siteConfig"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog"

import Pica from "pica"

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

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
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
      <path d="M21 15v4a2 2 0 0 1-6.219-8.56" />
    </svg>
  )
}

const uploadLimits = getToolUploadLimits()
const apiEndpoint = getToolApiEndpoint()
const paddleEnv = (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production" | undefined) ?? "production"
const paddleToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
const pricingToken = process.env.NEXT_PUBLIC_PRICING_TOKEN ?? "prc-9b8f4c1d"
const paymentProvider = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER as "creem" | "paddle" | undefined) ?? "paddle"
const EARLY_BIRD_LIMIT = 50
const MS_PER_DAY = 86_400_000

function getUtcDayString(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function utcMidnightMs(utcDay: string) {
  const date = new Date(`${utcDay}T00:00:00.000Z`)
  const ms = date.getTime()
  return Number.isFinite(ms) ? ms : null
}

function getUtcDayDiff(startUtcDay: string, now = new Date()) {
  const startMs = utcMidnightMs(startUtcDay)
  if (startMs === null) return null
  return Math.floor((now.getTime() - startMs) / MS_PER_DAY)
}

function getCampaignStartKey(installId: string) {
  return `imgsharer:campaign_start:${installId}`
}

function getSeenKey(installId: string, variant: string, utcDay: string) {
  return `imgsharer:seen:${installId}:${variant}:${utcDay}`
}

function formatSpotsLeft(spots: number) {
  if (spots <= 0) return "Sold out"
  if (spots === 1) return "1 spot left"
  return `${spots} spots left`
}

const EXPERIMENT_ID = "upsell_modal_v1"
type UpsellVariant = "strong_modal" | "intent_modal"

function hashToBucket(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 100
}

function assignUpsellVariant(installId: string): UpsellVariant {
  return hashToBucket(installId) < 20 ? "strong_modal" : "intent_modal"
}

function getVariantKey(installId: string) {
  return `imgsharer:upsell_variant:${installId}`
}

function Loader2Icon({ className }: { className?: string }) {
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function getFileNameFromPath(path: string, fallback: string): string {
  try {
    const url = new URL(path, "http://localhost")
    const parts = url.pathname.split("/")
    const last = parts[parts.length - 1]
    return last || fallback
  } catch {
    const parts = path.split("/")
    const last = parts[parts.length - 1]
    return last || fallback
  }
}

// Helper function to process image in browser
async function processImageInBrowser(file: File, preserveFullRes = false): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = async (e) => {
      img.onload = async () => {
        try {
          let { width, height } = img
          const originalWidth = width
          const originalHeight = height

          const maxDimension = preserveFullRes ? REPLICATE_MAX_DIMENSION_PAID : REPLICATE_MAX_DIMENSION

          // Check if we need to downscale based on longest side
          const longestSide = Math.max(width, height)
          if (longestSide > maxDimension) {
            const scale = maxDimension / longestSide
            width = Math.floor(width * scale)
            height = Math.floor(height * scale)
            console.log(
              `[v0] Downscaled image to safe size for GPU: ${originalWidth}x${originalHeight} → ${width}x${height}`,
            )
          }

          // Floor to multiples of 64
          width = Math.max(64, Math.floor(width / STABILITY_DIM_MULTIPLE) * STABILITY_DIM_MULTIPLE)
          height = Math.max(64, Math.floor(height / STABILITY_DIM_MULTIPLE) * STABILITY_DIM_MULTIPLE)

          console.log("[v0] Browser resize:", originalWidth, "x", originalHeight, "→", width, "x", height)

          // Create canvases for resizing
          const sourceCanvas = document.createElement("canvas")
          sourceCanvas.width = img.width
          sourceCanvas.height = img.height
          const sourceCtx = sourceCanvas.getContext("2d")
          if (!sourceCtx) throw new Error("Failed to get source canvas context")
          sourceCtx.drawImage(img, 0, 0)

          const targetCanvas = document.createElement("canvas")
          targetCanvas.width = width
          targetCanvas.height = height

          // Use pica for high-quality resize
          const pica = new Pica()
          await pica.resize(sourceCanvas, targetCanvas, {
            quality: 3,
            alpha: true,
          })

          const MAX_SIZE = 4_500_000 // 4.5MB
          let quality = 0.9
          let blob: Blob | null = null

          while (quality >= 0.6) {
            blob = await new Promise<Blob | null>((res) => {
              targetCanvas.toBlob(res, "image/jpeg", quality)
            })

            if (!blob) {
              throw new Error("Failed to create JPEG blob")
            }

            console.log("[v0] JPEG quality", quality, "→ size:", blob.size, "bytes")

            if (blob.size <= MAX_SIZE) {
              console.log("[v0] Browser processing complete, JPEG size:", blob.size, "bytes")
              resolve(blob)
              return
            }

            quality -= 0.1
          }

          // If we get here, even at quality 0.6 it's too large
          if (blob) {
            console.log("[v0] Warning: Using quality 0.6, size:", blob.size, "bytes (may exceed limit)")
            resolve(blob)
          } else {
            reject(new Error("Failed to compress image below 4.5MB"))
          }
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

export function ImageUploader({
  initialImage,
  onSharpenComplete,
}: {
  initialImage?: { image: string; fileName: string } | null
  onSharpenComplete?: (sharpenedUrl: string) => void
}) {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [sharpenedImage, setSharpenedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [imageSizeKb, setImageSizeKb] = useState<number>(0)
  const [entitlement, setEntitlement] = useState<any>(null)
  const [earlyBirdSold, setEarlyBirdSold] = useState<number>(0)
  const [priceIds, setPriceIds] = useState<{ earlyBirdPriceId?: string | null; standardPriceId?: string | null }>({})
  const [paddle, setPaddle] = useState<Paddle | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const fakeIntervalRef = useRef<number | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const pollTimeoutRef = useRef<number | null>(null)
  const pollAbortRef = useRef<AbortController | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [rateLimitLabel, setRateLimitLabel] = useState<string | null>(null)
  const [showRateLimitModal, setShowRateLimitModal] = useState(false)
  const [rateLimitDailyLimit, setRateLimitDailyLimit] = useState<number | null>(null)
  const [rateLimitModalUtcDay, setRateLimitModalUtcDay] = useState<string | null>(null)
  const [showWatermarkModal, setShowWatermarkModal] = useState(false)
  const [watermarkModalUtcDay, setWatermarkModalUtcDay] = useState<string | null>(null)
  const [campaignStartUtcDay, setCampaignStartUtcDay] = useState<string | null>(null)
  const [upsellVariant, setUpsellVariant] = useState<UpsellVariant | null>(null)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [campaignModalUtcDay, setCampaignModalUtcDay] = useState<string | null>(null)
  const [campaignModalDay, setCampaignModalDay] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [scale, setScale] = useState<number>(4)
  const [blockedHighScale, setBlockedHighScale] = useState(false)
  const [faceEnhance, setFaceEnhance] = useState<boolean>(true)
  const [isFakeMode, setIsFakeMode] = useState(false)
  const [userType, setUserType] = useState<"free" | "pro" | "unknown">("unknown")
  const [showPaywallModal, setShowPaywallModal] = useState(false)
  const [hasPricingAccess, setHasPricingAccess] = useState(false)
  const sessionIdRef = useRef<string | null>(null)
  const installIdRef = useRef<string | null>(null)
  const { toast } = useToast()
  const { close: closeModal, pendingWallpaper } = useUploadUI()
  const { isSignedIn, userId } = useAuth()

  const getOrCreateSessionId = useCallback(() => {
    if (typeof window === "undefined") return null
    const KEY = "imgsharer_session_id"
    const existing = window.sessionStorage?.getItem(KEY)
    if (existing) return existing
    const array = new Uint8Array(16)
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(array)
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }
    const id = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    window.sessionStorage?.setItem(KEY, id)
    return id
  }, [])

  const getOrCreateInstallId = useCallback(() => {
    if (typeof window === "undefined") return null
    const KEY = "imgsharer_install_id"
    const existing = window.localStorage?.getItem(KEY)
    if (existing) return existing
    const array = new Uint8Array(16)
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(array)
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }
    const id = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    window.localStorage?.setItem(KEY, id)
    return id
  }, [])

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId()
    installIdRef.current = getOrCreateInstallId()

    const installId = installIdRef.current
    if (installId && typeof window !== "undefined") {
      const existing = window.localStorage?.getItem(getCampaignStartKey(installId)) ?? null
      setCampaignStartUtcDay(existing)
    }

    setHasPricingAccess(true)
    setUserType("free")

    if (paymentProvider === "paddle" && paddleToken) {
      initializePaddle({
        token: paddleToken,
        environment: paddleEnv,
      })
        .then((instance) => {
          setPaddle(instance ?? null)
        })
        .catch((error) => {
          console.warn("[paddle] init failed", error)
          setPaddle(null)
        })
    }
  }, [getOrCreateInstallId, getOrCreateSessionId])

  useEffect(() => {
    if (isSignedIn === undefined) return
    if (!isSignedIn || !userId) {
      setEntitlement(null)
      setUserType("free")
      return
    }
    const installId = installIdRef.current
    if (!installId) return
    let active = true

    const load = async () => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage?.removeItem("pro_status")
          window.localStorage?.removeItem("user_type")
        }
        const res = await fetch("/api/entitlement", {
          headers: { "x-install-id": installId },
        })
        if (!res.ok) return
        const data = await res.json()
        if (!active) return
        if (data?.entitlement) setEntitlement(data.entitlement)
        if (typeof data?.earlyBirdSold === "number") {
          setEarlyBirdSold(data.earlyBirdSold)
        }
        if (data?.prices) {
          setPriceIds({
            earlyBirdPriceId: data.prices.earlyBirdPriceId,
            standardPriceId: data.prices.standardPriceId,
          })
        }
      } catch (error) {
        console.warn("[entitlement] fetch failed", error)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [isSignedIn, userId])

  useEffect(() => {
    setUserType(entitlement ? "pro" : "free")
  }, [entitlement])

  const getLocalInstallId = useCallback(() => {
    if (typeof window === "undefined") return null
    const current = installIdRef.current || getOrCreateInstallId()
    installIdRef.current = current
    return current
  }, [getOrCreateInstallId])

  const ensureCampaignStarted = useCallback(() => {
    if (typeof window === "undefined") return null
    const installId = getLocalInstallId()
    if (!installId) return null
    const key = getCampaignStartKey(installId)
    const existing = window.localStorage?.getItem(key) ?? null
    if (existing) {
      setCampaignStartUtcDay((prev) => prev ?? existing)
      return existing
    }
    const utcDay = getUtcDayString()
    window.localStorage?.setItem(key, utcDay)
    setCampaignStartUtcDay(utcDay)
    return utcDay
  }, [getLocalInstallId])

  const hasSeen = useCallback(
    (variant: string, utcDay: string) => {
      if (typeof window === "undefined") return false
      const installId = getLocalInstallId()
      if (!installId) return false
      return window.localStorage?.getItem(getSeenKey(installId, variant, utcDay)) === "1"
    },
    [getLocalInstallId],
  )

  const markSeen = useCallback(
    (variant: string, utcDay: string) => {
      if (typeof window === "undefined") return
      const installId = getLocalInstallId()
      if (!installId) return
      window.localStorage?.setItem(getSeenKey(installId, variant, utcDay), "1")
    },
    [getLocalInstallId],
  )

  const trackEvent = useCallback((name: string, params: Record<string, any> = {}) => {
    if (typeof window === "undefined") return
    const gtagFn = (window as any).gtag
    if (typeof gtagFn !== "function") return
    gtagFn("event", name, params)
  }, [])

  const trackUpsellEvent = useCallback(
    (name: string, params: Record<string, any> = {}) => {
      trackEvent(name, {
        experiment_id: EXPERIMENT_ID,
        variant: upsellVariant ?? "unknown",
        user_type: userType,
        ...params,
      })
    },
    [trackEvent, upsellVariant, userType],
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const installId = getLocalInstallId()
    if (!installId) return
    const key = getVariantKey(installId)
    const existing = window.localStorage?.getItem(key)
    const validExisting = existing === "strong_modal" || existing === "intent_modal"
    const variant: UpsellVariant = validExisting ? (existing as UpsellVariant) : assignUpsellVariant(installId)
    if (!validExisting) {
      window.localStorage?.setItem(key, variant)
      trackEvent("upsell_experiment_assigned", { experiment_id: EXPERIMENT_ID, variant })
    }
    setUpsellVariant(variant)

    const gtagFn = (window as any).gtag
    if (typeof gtagFn === "function") {
      gtagFn("set", "user_properties", {
        upsell_variant: variant,
        upsell_experiment: EXPERIMENT_ID,
      })
    }
  }, [getLocalInstallId, trackEvent])

  const trackUpscaleFactor = useCallback(
    (nextScale: number) => {
      try {
        if (typeof window === "undefined") return
        const gtagFn = (window as any).gtag
        if (typeof gtagFn !== "function") return
        const sessionId = sessionIdRef.current ?? getOrCreateSessionId()
        sessionIdRef.current = sessionId
        gtagFn("event", "upscale_factor_selected", {
          factor: `${nextScale}x`,
          user_type: userType,
          enhance_faces: !!faceEnhance,
          image_size_kb: imageSizeKb || 0,
          session_id: sessionId || undefined,
          timestamp: Date.now(),
        })
      } catch (error) {
        console.warn("[tracking] upscale_factor_selected failed", error)
      }
    },
    [faceEnhance, getOrCreateSessionId, imageSizeKb, userType],
  )

  const isPro = !!entitlement

  const earlyBirdAvailable =
    paymentProvider === "creem" ? earlyBirdSold < EARLY_BIRD_LIMIT : priceIds?.earlyBirdPriceId && earlyBirdSold < EARLY_BIRD_LIMIT
  const earlyBirdSpotsLeft = Math.max(0, EARLY_BIRD_LIMIT - earlyBirdSold)

  const openCheckout = useCallback(
    async (preferEarlyBird = true) => {
      if (!hasPricingAccess) {
        toast({
          title: "Upgrade restricted",
          description: "Checkout is limited to authorized testing links.",
          variant: "destructive",
        })
        return
      }
      const installId = installIdRef.current || getOrCreateInstallId()
      installIdRef.current = installId
      if (!installId) {
        toast({
          title: "Missing device ID",
          description: "Please refresh and try again.",
          variant: "destructive",
        })
        return
      }

      if (paymentProvider === "creem") {
        const tier = preferEarlyBird && earlyBirdAvailable ? "early_bird" : "standard"
        try {
          const res = await fetch("/api/creem/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tier, installId }),
          })
          if (res.status === 401) {
            window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`
            return
          }
          const data = await res.json().catch(() => ({}))
          if (!res.ok || !data?.checkoutUrl) {
            throw new Error(data?.error || `Creem checkout failed (${res.status})`)
          }
          window.location.href = data.checkoutUrl
        } catch (error) {
          toast({
            title: "Checkout failed",
            description: error instanceof Error ? error.message : "Please try again later.",
            variant: "destructive",
          })
        }
        return
      }
      const targetPriceId =
        (preferEarlyBird && earlyBirdAvailable && priceIds?.earlyBirdPriceId) || priceIds?.standardPriceId

      if (!targetPriceId) {
        toast({
          title: "Upgrade unavailable",
          description: "Price configuration is missing. Please try again later.",
          variant: "destructive",
        })
        return
      }

      if (!paddle || !paddleToken) {
        toast({
          title: "Checkout not ready",
          description: "Please wait a moment and try again.",
          variant: "destructive",
        })
        return
      }

      paddle.Checkout.open({
        items: [
          {
            priceId: targetPriceId,
            quantity: 1,
          },
        ],
        customData: installId ? { installId } : undefined,
        settings: {
          displayMode: "overlay",
          locale: "en",
          theme: "light",
          successUrl: siteConfig.siteUrl,
        },
      })
    },
    [earlyBirdAvailable, getOrCreateInstallId, hasPricingAccess, paddle, priceIds?.earlyBirdPriceId, priceIds?.standardPriceId, toast],
  )

  const showPaywall = useCallback(
    (options?: { blockHighScale?: boolean }) => {
      ensureCampaignStarted()
      if (options?.blockHighScale) {
        setBlockedHighScale(true)
      }
      setShowPaywallModal(true)
      trackUpsellEvent("upsell_modal_shown", { trigger: "high_scale" })
    },
    [ensureCampaignStarted, trackUpsellEvent],
  )

  useEffect(() => {
    if (upsellVariant !== "strong_modal") return
    if (isPro) return
    if (showCampaignModal) return

    const startUtcDay = campaignStartUtcDay ?? ensureCampaignStarted()
    if (!startUtcDay) return
    const campaignDay = getUtcDayDiff(startUtcDay)
    if (campaignDay === null || ![0, 3, 6, 7].includes(campaignDay)) return
    const utcDay = getUtcDayString()
    const variantKey = `modal:campaign_day${campaignDay}`
    if (hasSeen(variantKey, utcDay)) return

    setCampaignModalUtcDay(utcDay)
    setCampaignModalDay(campaignDay)
    setShowRateLimitModal(false)
    setShowWatermarkModal(false)
    setShowPaywallModal(false)
    setShowCampaignModal(true)
    trackUpsellEvent("upsell_modal_shown", { trigger: `campaign_day${campaignDay}`, campaign_day: campaignDay })
  }, [
    upsellVariant,
    isPro,
    showCampaignModal,
    campaignStartUtcDay,
    ensureCampaignStarted,
    hasSeen,
    trackUpsellEvent,
  ])

  useEffect(() => {
    if (initialImage) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      setOriginalImage(initialImage.image)
      setFileName(initialImage.fileName)
      setImageSizeKb(0)
      setSharpenedImage(null)
      setIsProcessing(false)
      setProgress(0)
    } else if (initialImage === null) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      setOriginalImage(null)
      setSharpenedImage(null)
      setFileName("")
      setImageSizeKb(0)
      setIsProcessing(false)
      setProgress(0)
    }
  }, [initialImage])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (fakeIntervalRef.current !== null) {
        window.clearInterval(fakeIntervalRef.current)
        fakeIntervalRef.current = null
      }
      if (pollAbortRef.current) {
        pollAbortRef.current.abort()
        pollAbortRef.current = null
      }
      if (pollTimeoutRef.current !== null) {
        window.clearTimeout(pollTimeoutRef.current)
        pollTimeoutRef.current = null
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!pendingWallpaper) {
      setIsFakeMode(false)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    if (fakeIntervalRef.current !== null) {
      window.clearInterval(fakeIntervalRef.current)
      fakeIntervalRef.current = null
    }
    if (pollAbortRef.current) {
      pollAbortRef.current.abort()
      pollAbortRef.current = null
    }
    if (pollTimeoutRef.current !== null) {
      window.clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }

    setIsFakeMode(true)
    setOriginalImage(pendingWallpaper.previewSrc)
    setSharpenedImage(null)
    // Use the configured downloadName so filenames stay consistent (e.g. snow-aesthetic-01.png)
    setFileName(pendingWallpaper.downloadName || "wallpaper-4k.png")
    setImageSizeKb(0)
    setProgress(0)
    setIsProcessing(true)

    const totalDurationMs = 2500
    const stepMs = 100
    const steps = Math.max(1, Math.floor(totalDurationMs / stepMs))
    let currentStep = 0

    fakeIntervalRef.current = window.setInterval(() => {
      currentStep += 1
      const nextProgress = Math.min(100, Math.round((currentStep / steps) * 100))
      setProgress(nextProgress)

      if (nextProgress >= 100) {
        if (fakeIntervalRef.current !== null) {
          window.clearInterval(fakeIntervalRef.current)
          fakeIntervalRef.current = null
        }
        setSharpenedImage(pendingWallpaper.highResSrc)
        setIsProcessing(false)
      }
    }, stepMs)
  }, [pendingWallpaper])

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

      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string)
        setSharpenedImage(null)
        setImageSizeKb(Math.round(file.size / 1024))
      }
      reader.readAsDataURL(file)
    },
    [toast],
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

  const handleScaleSelect = (nextScale: number) => {
    if (nextScale > 4 && !isPro) {
      setBlockedHighScale(true)
      showPaywall({ blockHighScale: true })
      trackUpscaleFactor(nextScale)
      return
    }
    setBlockedHighScale(false)
    setScale(nextScale)
    trackUpscaleFactor(nextScale)
  }

  const handleSharpen = async () => {
    if (isFakeMode) {
      return
    }

    if (!originalImage) return

    if (!isPro && (scale > 4 || blockedHighScale)) {
      showPaywall({ blockHighScale: true })
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (pollAbortRef.current) {
      pollAbortRef.current.abort()
      pollAbortRef.current = null
    }
    if (pollTimeoutRef.current !== null) {
      window.clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsProcessing(true)
    setProgress(0)

    let progressInterval: number | null = null
    const stopProgress = () => {
      if (progressInterval !== null) {
        window.clearInterval(progressInterval)
        progressInterval = null
      }
    }

    try {
      const response = await fetch(originalImage)
      const blob = await response.blob()
      const file = new File([blob], fileName, { type: blob.type })

      console.log("[v0] Processing image in browser...")
      setProgress(10)

      const processedBlob = await processImageInBrowser(file, false)
      setProgress(30)

      const formData = new FormData()
      formData.append("image", processedBlob, "processed.jpg")
      formData.append("scale", scale.toString())
      formData.append("face_enhance", faceEnhance.toString())
      formData.append("response_format", "image")
      formData.append("async", "true")

      console.log("[v0] Sending request to", apiEndpoint)
      console.log("[v0] FormData contents:", {
        imageSize: processedBlob.size,
        scale,
        faceEnhance,
      })

      progressInterval = window.setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90))
      }, 1000)

      console.log("[v0] Calling fetch...")
      const headers: Record<string, string> = {}
      if (installIdRef.current) {
        headers["x-install-id"] = installIdRef.current
      }

      const apiResponse = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers,
      })

      console.log("[v0] Fetch completed, status:", apiResponse.status)
      console.log("[v0] Response headers:", Object.fromEntries(apiResponse.headers.entries()))

      const responseContentType = apiResponse.headers.get("content-type") || ""

      if (apiResponse.ok && responseContentType.startsWith("image/")) {
        const blob = await apiResponse.blob()
        const nextUrl = URL.createObjectURL(blob)
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
        }
        objectUrlRef.current = nextUrl
        setSharpenedImage(nextUrl)

        if (onSharpenComplete) {
          onSharpenComplete(nextUrl)
        }

        if (originalImage) {
          publishHeroUpdate({
            originalUrl: originalImage,
            resultUrl: nextUrl,
          })
        }

        stopProgress()
        setProgress(100)
        toast({
          title: "Success!",
          description: "Your image has been sharpened.",
        })
        return
      }

      let data: any = null
      if (apiResponse.status !== 204) {
        try {
          data = await apiResponse.json()
        } catch {}
      }

      if (apiResponse.status === 429) {
        let errorMessage = "Usage limit exceeded. Please try again later."
        let limitType: string | null = null
        let resetAt: number | null = null
        let dailyLimit: number | null = null
        try {
          const errorData = data ?? {}
          errorMessage = errorData.error || errorMessage
          limitType = typeof errorData?.limit === "string" ? errorData.limit : null
          resetAt = typeof errorData?.resetAt === "number" ? errorData.resetAt : null
          dailyLimit = typeof errorData?.dailyLimit === "number" ? errorData.dailyLimit : null
        } catch {}

        const label =
          limitType === "free_daily"
            ? `Daily limit reached (${dailyLimit ?? 3}/day)`
            : limitType === "pro_hour"
              ? "Hourly limit reached"
              : limitType === "pro_daily"
                ? "Daily limit reached"
                : "Usage limit reached"

        const description =
          limitType === "free_daily"
            ? `Free users can process up to ${dailyLimit ?? 3} images per day. Please try again tomorrow or upgrade.`
            : errorMessage

        setIsRateLimited(true)
        setRateLimitLabel(label)
        if (limitType === "free_daily") {
          ensureCampaignStarted()
          const utcDay = getUtcDayString()
          setRateLimitDailyLimit(dailyLimit ?? 3)
          setRateLimitModalUtcDay(utcDay)

          if (!hasSeen("modal:free_daily", utcDay)) {
            setShowPaywallModal(false)
            setShowWatermarkModal(false)
            setShowRateLimitModal(true)
            trackUpsellEvent("upsell_modal_shown", { trigger: "free_daily" })
          } else {
            toast({ title: label, description })
          }

          stopProgress()
          return
        }

        toast({
          title: label,
          description,
        })

        if (limitType !== "free_daily" && resetAt && resetAt > Date.now()) {
          const ms = Math.min(Math.max(1000, resetAt - Date.now()), 60 * 60 * 1000)
          window.setTimeout(() => {
            setIsRateLimited(false)
            setRateLimitLabel(null)
          }, ms)
        }
        stopProgress()
        return
      }

      console.log("[v0] Response data:", data)

      if (apiResponse.status === 402 && data?.error === "pro_required") {
        if (typeof data?.earlyBirdSold === "number") {
          setEarlyBirdSold(data.earlyBirdSold)
        }
        if (data?.prices) {
          setPriceIds({
            earlyBirdPriceId: data.prices.earlyBirdPriceId,
            standardPriceId: data.prices.standardPriceId,
          })
        }
        showPaywall()
        stopProgress()
        return
      }

      if (!apiResponse.ok) {
        const errorMessage = data?.error || `Sharpen failed: ${apiResponse.status}`
        console.error("[v0] Sharpen error:", errorMessage)
        throw new Error(errorMessage)
      }

      const pollForResult = async (jobId: string) => {
        if (pollAbortRef.current) {
          pollAbortRef.current.abort()
        }
        if (pollTimeoutRef.current !== null) {
          window.clearTimeout(pollTimeoutRef.current)
          pollTimeoutRef.current = null
        }

        const pollController = new AbortController()
        pollAbortRef.current = pollController
        const startedAt = Date.now()
        let warned = false

        return new Promise<void>((resolve, reject) => {
          const pollOnce = async () => {
            if (pollController.signal.aborted) {
              resolve()
              return
            }
            try {
              const headers: Record<string, string> = {}
              if (installIdRef.current) {
                headers["x-install-id"] = installIdRef.current
              }
              const statusRes = await fetch(`/api/sharpen/status?jobId=${encodeURIComponent(jobId)}`, {
                headers,
                signal: pollController.signal,
              })
              if (!statusRes.ok) {
                const errorData = await statusRes.json().catch(() => ({}))
                throw new Error(errorData?.error || `Status check failed (${statusRes.status})`)
              }
              const statusData = await statusRes.json()
              if (statusData?.status === "failed") {
                throw new Error(statusData?.error || "Prediction failed")
              }

              if (statusData?.status === "succeeded" && statusData?.resultUrl) {
                const resultRes = await fetch(statusData.resultUrl, {
                  headers,
                  signal: pollController.signal,
                })
                if (!resultRes.ok) {
                  const errorData = await resultRes.json().catch(() => ({}))
                  throw new Error(errorData?.error || `Failed to download result (${resultRes.status})`)
                }
                const resultType = resultRes.headers.get("content-type") || ""
                if (!resultType.startsWith("image/")) {
                  throw new Error("Invalid image response")
                }
                const blob = await resultRes.blob()
                const nextUrl = URL.createObjectURL(blob)
                if (objectUrlRef.current) {
                  URL.revokeObjectURL(objectUrlRef.current)
                }
                objectUrlRef.current = nextUrl
                setSharpenedImage(nextUrl)

                if (onSharpenComplete) {
                  onSharpenComplete(nextUrl)
                }

                if (originalImage) {
                  publishHeroUpdate({
                    originalUrl: originalImage,
                    resultUrl: nextUrl,
                  })
                }

                stopProgress()
                setProgress(100)
                toast({
                  title: "Success!",
                  description: "Your image has been sharpened.",
                })
                resolve()
                return
              }

              if (!warned && Date.now() - startedAt > 90_000) {
                warned = true
                toast({
                  title: "Still processing",
                  description: "This is taking longer than usual. You can keep this tab open or check back soon.",
                })
              }

              pollTimeoutRef.current = window.setTimeout(pollOnce, 2000)
            } catch (err) {
              if (pollController.signal.aborted) {
                resolve()
                return
              }
              reject(err)
            }
          }

          pollOnce()
        })
      }

      let resultUrl: string | null = null

      if (data?.jobId) {
        await pollForResult(data.jobId)
        return
      }

      if (data?.imageUrl) {
        console.log("[v0] Got imageUrl:", data.imageUrl)
        resultUrl = data.imageUrl
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
          objectUrlRef.current = null
        }
        setSharpenedImage(data.imageUrl)

        if (onSharpenComplete) {
          onSharpenComplete(data.imageUrl)
        }
      } else if (data?.imageBase64) {
        console.log("[v0] Got imageBase64, length:", data.imageBase64.length)
        const mime = typeof data?.imageMime === "string" ? data.imageMime : "image/png"
        const imageUrl = `data:${mime};base64,${data.imageBase64}`
        resultUrl = imageUrl
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
          objectUrlRef.current = null
        }
        setSharpenedImage(imageUrl)

        if (onSharpenComplete) {
          onSharpenComplete(imageUrl)
        }
      } else {
        throw new Error("No image returned from API")
      }

      if (resultUrl && originalImage) {
        publishHeroUpdate({
          originalUrl: originalImage,
          resultUrl: resultUrl,
        })
      }

      stopProgress()
      setProgress(100)
      toast({
        title: "Success!",
        description: "Your image has been sharpened.",
      })
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("[v0] Request aborted")
        return
      }

      console.error("[v0] Sharpen error:", error)
      console.error("[v0] Error type:", error instanceof Error ? error.constructor.name : typeof error)
      console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sharpen image",
        variant: "destructive",
      })
    } finally {
      stopProgress()
      setIsProcessing(false)
      setProgress(0)
      abortControllerRef.current = null
      if (pollAbortRef.current) {
        pollAbortRef.current.abort()
        pollAbortRef.current = null
      }
      if (pollTimeoutRef.current !== null) {
        window.clearTimeout(pollTimeoutRef.current)
        pollTimeoutRef.current = null
      }
    }
  }

  const downloadSharpenedImage = () => {
    if (!sharpenedImage) return

    const link = document.createElement("a")
    link.href = sharpenedImage
    link.download = `sharpened-${fileName}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownload = () => {
    if (!sharpenedImage) return

    if (!isPro && !isFakeMode) {
      const utcDay = getUtcDayString()
      ensureCampaignStarted()
      if (!hasSeen("modal:watermark", utcDay)) {
        setWatermarkModalUtcDay(utcDay)
        setShowPaywallModal(false)
        setShowRateLimitModal(false)
        setShowWatermarkModal(true)
        trackUpsellEvent("upsell_modal_shown", { trigger: "watermark_download" })
        return
      }
    }

    downloadSharpenedImage()
  }

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (fakeIntervalRef.current !== null) {
      window.clearInterval(fakeIntervalRef.current)
      fakeIntervalRef.current = null
    }
    setOriginalImage(null)
    setSharpenedImage(null)
    setFileName("")
    setImageSizeKb(0)
    setProgress(0)
    setIsProcessing(false)
    setIsFakeMode(false)
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    closeModal()
  }

  const upsellBanner = (() => {
    if (isPro) return null
    if (!campaignStartUtcDay) return null
    if (typeof window === "undefined") return null

    const campaignDay = getUtcDayDiff(campaignStartUtcDay)
    if (campaignDay === null) return null
    if (![0, 3, 6, 7].includes(campaignDay)) return null

    const utcDay = getUtcDayString()
    const variant = `banner:day${campaignDay}`
    if (hasSeen(variant, utcDay)) return null

    const shownKey = `banner_shown:day${campaignDay}`
    if (!hasSeen(shownKey, utcDay)) {
      trackUpsellEvent("upsell_banner_shown", { campaign_day: campaignDay })
      markSeen(shownKey, utcDay)
    }

    const baseOffer = `Early Bird $2.99/mo (reg. $4.99) · ${formatSpotsLeft(earlyBirdSpotsLeft)}`
    const message =
      campaignDay === 0
        ? baseOffer
        : campaignDay === 3
          ? `Reminder: ${baseOffer}`
          : campaignDay === 6
            ? `Early Bird may end anytime · ${formatSpotsLeft(earlyBirdSpotsLeft)}`
            : `Final reminder: ${baseOffer}`

    return (
      <div className="rounded-2xl border border-[#ff5733]/20 bg-[#ff5733]/5 px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-800">{message}</p>
        <div className="flex items-center gap-2">
          <Button asChild className="rounded-full bg-[#ff5733] text-white hover:bg-[#ff7959] px-4 py-2 h-auto">
            <Link
              href="/pricing"
              onClick={() => {
                trackUpsellEvent("upsell_cta_click", { location: "banner", action: "pricing", campaign_day: campaignDay })
                markSeen(variant, utcDay)
              }}
            >
              See pricing
            </Link>
          </Button>
          <button
            type="button"
            className="rounded-full p-2 text-neutral-600 hover:bg-black/5"
            aria-label="Dismiss"
            onClick={() => {
              trackUpsellEvent("upsell_banner_dismissed", { campaign_day: campaignDay })
              markSeen(variant, utcDay)
            }}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  })()

  const campaignEmoji =
    campaignModalDay === 7 ? "⚡" : campaignModalDay === 6 ? "⏳" : campaignModalDay === 3 ? "⏰" : "🚀"

  return (
    <>
      <Reveal>
        <div className="space-y-8">
          {upsellBanner}
          {!originalImage ? (
            <BlurPanel className="p-8 lg:p-12 bg-white/40 backdrop-blur-md grain-texture border border-white/30">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary/10 to-brand-primary-light/10 flex items-center justify-center border border-brand-primary/20 transition-transform hover:scale-105">
                    <UploadIcon className="w-10 h-10 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-neutral-900 mb-2">
                      Drop your image here, or click to browse
                    </p>
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
            </BlurPanel>
          ) : (
            <div className="space-y-6">
              {sharpenedImage ? (
                <BlurPanel className="p-8 lg:p-12 bg-white/40 backdrop-blur-md grain-texture border border-white/30">
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-neutral-900">Before & After</h3>
                  </div>
                  <BeforeAfterSlider beforeImage={originalImage} afterImage={sharpenedImage} />
                  <div
                    className={
                      isFakeMode
                        ? "mt-8 flex justify-center"
                        : "flex gap-3 mt-8"
                    }
                  >
                    <Button
                      onClick={handleDownload}
                      className="flex-1 md:flex-none min-w-[12rem] bg-gradient-to-r from-brand-primary to-brand-primary-light hover:from-brand-primary/90 hover:to-brand-primary-light/90 text-white rounded-full py-6 font-medium shadow-lg shadow-brand-primary/25"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      {isFakeMode ? "Download 4K" : "Download Sharpened"}
                    </Button>
                    {!isFakeMode && (
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="rounded-full px-8 py-6 border-neutral-300 hover:bg-neutral-900/5 bg-white/60 backdrop-blur-sm"
                      >
                        Upload New
                      </Button>
                    )}
                  </div>
                </BlurPanel>
              ) : isFakeMode ? (
                <BlurPanel className="p-8 lg:p-12 bg-white/40 backdrop-blur-md grain-texture border border-white/30">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-neutral-900">Upscaling to 4K...</h3>
                    <p className="mt-2 text-sm text-neutral-600">
                      We’re preparing a high-resolution version of this wallpaper.
                    </p>
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 mb-6">
                    <img
                      src={originalImage || "/placeholder.svg"}
                      alt="Original preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {isProcessing && progress > 0 && (
                    <div className="mt-2">
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-primary to-brand-primary-light transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </BlurPanel>
              ) : (
                <BlurPanel className="p-8 lg:p-12 bg-white/40 backdrop-blur-md grain-texture border border-white/30">
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-neutral-900">Preview</h3>
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 mb-6">
                    <img
                      src={originalImage || "/placeholder.svg"}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-neutral-200">
                    <label className="block text-sm font-medium text-neutral-700 mb-3">Upscale Factor</label>
                    <div className="flex gap-2">
                      {[2, 4, 6, 8].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleScaleSelect(s)}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            scale === s
                              ? "bg-gradient-to-r from-brand-primary to-brand-primary-light text-white shadow-md"
                              : "bg-white/80 text-neutral-700 hover:bg-white border border-neutral-200"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-neutral-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={faceEnhance}
                        onChange={(e) => setFaceEnhance(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <div>
                        <span className="text-sm font-medium text-neutral-900">Enhance faces</span>
                        <p className="text-xs text-neutral-600">Improves facial details in photos with people</p>
                      </div>
                    </label>
                  </div>

                  {isProcessing && progress > 0 && (
                    <div className="mb-4">
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-primary to-brand-primary-light transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={handleSharpen}
                    disabled={isProcessing || isRateLimited}
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-primary-light hover:from-brand-primary/90 hover:to-brand-primary-light/90 text-white rounded-full py-6 font-medium shadow-lg shadow-brand-primary/25 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                        Upscaling...
                      </>
                    ) : isRateLimited ? (
                      rateLimitLabel ?? "Usage limit reached"
                    ) : (
                      "Sharpen Image"
                    )}
                  </Button>
                </BlurPanel>
              )}
            </div>
          )}
        </div>
      </Reveal>

      <Dialog
        open={showCampaignModal}
        onOpenChange={(open) => {
          if (!open && campaignModalUtcDay && campaignModalDay !== null) {
            const key = `modal:campaign_day${campaignModalDay}`
            markSeen(key, campaignModalUtcDay)
            trackUpsellEvent("upsell_modal_dismissed", { trigger: `campaign_day${campaignModalDay}`, campaign_day: campaignModalDay })
          }
          setShowCampaignModal(open)
        }}
      >
        <DialogPortal>
          <DialogOverlay className="!z-[150] bg-black/70 backdrop-blur-sm" />
          <DialogContent className="!z-[160] sm:max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-display text-neutral-900">
                {campaignEmoji} Early Bird $2.99/mo
              </DialogTitle>
              <DialogDescription className="text-neutral-600">
                Unlock 6x/8x, no watermark, unlimited daily usage.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
              <div className="font-medium">Reg. $4.99 · {formatSpotsLeft(earlyBirdSpotsLeft)}</div>
            </div>

            <div className="mt-6 space-y-3">
              <Button asChild className="w-full bg-[#ff5733] text-white hover:bg-[#ff7959] rounded-full py-6 h-auto">
                <Link
                  href="/pricing"
                  onClick={() => {
                    if (campaignModalUtcDay && campaignModalDay !== null) {
                      markSeen(`modal:campaign_day${campaignModalDay}`, campaignModalUtcDay)
                    }
                    trackUpsellEvent("upsell_cta_click", { location: "modal", trigger: `campaign_day${campaignModalDay ?? 0}`, action: "pricing" })
                    setShowCampaignModal(false)
                  }}
                >
                  See pricing
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full border-[#ff7959] text-[#ff5733] hover:bg-[#ff5733]/10 hover:border-[#ff5733] py-6 h-auto"
                onClick={() => {
                  if (campaignModalUtcDay && campaignModalDay !== null) {
                    markSeen(`modal:campaign_day${campaignModalDay}`, campaignModalUtcDay)
                  }
                  trackUpsellEvent("upsell_cta_click", { location: "modal", trigger: `campaign_day${campaignModalDay ?? 0}`, action: "dismiss" })
                  setShowCampaignModal(false)
                }}
              >
                Not now
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Dialog
        open={showPaywallModal}
        onOpenChange={(open) => {
          if (!open && blockedHighScale) {
            setBlockedHighScale(false)
            setScale((current) => (current > 4 ? 4 : current))
          }
          setShowPaywallModal(open)
        }}
      >
        <DialogPortal>
          <DialogOverlay className="!z-[130] bg-black/70 backdrop-blur-sm" />
          <DialogContent className="!z-[140] sm:max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-display text-neutral-900">Unlock 6x &amp; 8x Upscaling</DialogTitle>
              <DialogDescription className="text-neutral-600">
                Get sharper, high-resolution results. Free plan supports up to 4x.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
              <div className="font-medium">
                Early Bird $2.99/mo <span className="text-neutral-500">(reg. $4.99)</span> · {formatSpotsLeft(earlyBirdSpotsLeft)}
              </div>
              <div className="mt-1 text-neutral-600">Unlimited daily usage · No watermark</div>
            </div>

            <div className="mt-6 space-y-3">
              <Button asChild className="w-full bg-[#ff5733] text-white hover:bg-[#ff7959] rounded-full py-6 h-auto">
                <Link
                  href="/pricing"
                  onClick={() => {
                    trackUpsellEvent("upsell_cta_click", { location: "modal", trigger: "high_scale", action: "pricing" })
                    setShowPaywallModal(false)
                  }}
                >
                  Upgrade to Pro
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full border-[#ff7959] text-[#ff5733] hover:bg-[#ff5733]/10 hover:border-[#ff5733] py-6 h-auto"
                onClick={() => {
                  trackUpsellEvent("upsell_cta_click", { location: "modal", trigger: "high_scale", action: "continue_4x" })
                  setBlockedHighScale(false)
                  setScale(4)
                  setShowPaywallModal(false)
                }}
              >
                Continue with 4x
              </Button>
            </div>

            <p className="mt-4 text-xs text-neutral-500">
              Secure checkout. Your Pro access is tied to your signed-in email.
            </p>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Dialog
        open={showRateLimitModal}
        onOpenChange={(open) => {
          if (!open && rateLimitModalUtcDay) {
            markSeen("modal:free_daily", rateLimitModalUtcDay)
          }
          setShowRateLimitModal(open)
        }}
      >
        <DialogPortal>
          <DialogOverlay className="!z-[150] bg-black/70 backdrop-blur-sm" />
          <DialogContent className="!z-[160] sm:max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-display text-neutral-900">
                You&apos;ve used all {rateLimitDailyLimit ?? 3} free sharpens today
              </DialogTitle>
              <DialogDescription className="text-neutral-600">
                Upgrade to Pro for unlimited daily usage + 6x/8x + no watermark.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
              <div className="font-medium">Early Bird $2.99/mo · {formatSpotsLeft(earlyBirdSpotsLeft)}</div>
            </div>

            <div className="mt-6 space-y-3">
              <Button asChild className="w-full bg-[#ff5733] text-white hover:bg-[#ff7959] rounded-full py-6 h-auto">
                <Link
                  href="/pricing"
                  onClick={() => {
                    trackUpsellEvent("upsell_cta_click", { location: "modal", trigger: "free_daily", action: "pricing" })
                    if (rateLimitModalUtcDay) markSeen("modal:free_daily", rateLimitModalUtcDay)
                    setShowRateLimitModal(false)
                  }}
                >
                  Upgrade to Pro
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full border-[#ff7959] text-[#ff5733] hover:bg-[#ff5733]/10 hover:border-[#ff5733] py-6 h-auto"
                onClick={() => {
                  trackUpsellEvent("upsell_cta_click", { location: "modal", trigger: "free_daily", action: "come_back_tomorrow" })
                  if (rateLimitModalUtcDay) markSeen("modal:free_daily", rateLimitModalUtcDay)
                  setShowRateLimitModal(false)
                }}
              >
                Come back tomorrow
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Dialog
        open={showWatermarkModal}
        onOpenChange={(open) => {
          if (!open && watermarkModalUtcDay) {
            markSeen("modal:watermark", watermarkModalUtcDay)
          }
          setShowWatermarkModal(open)
        }}
      >
        <DialogPortal>
          <DialogOverlay className="!z-[150] bg-black/70 backdrop-blur-sm" />
          <DialogContent className="!z-[160] sm:max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-display text-neutral-900">This download includes a watermark</DialogTitle>
              <DialogDescription className="text-neutral-600">Pro removes watermarks from all downloads.</DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
              <div className="font-medium">Early Bird $2.99/mo · {formatSpotsLeft(earlyBirdSpotsLeft)}</div>
            </div>

            <div className="mt-6 space-y-3">
              <Button asChild className="w-full bg-[#ff5733] text-white hover:bg-[#ff7959] rounded-full py-6 h-auto">
                <Link
                  href="/pricing"
                  onClick={() => {
                    trackUpsellEvent("upsell_cta_click", { location: "modal", trigger: "watermark_download", action: "pricing" })
                    if (watermarkModalUtcDay) markSeen("modal:watermark", watermarkModalUtcDay)
                    setShowWatermarkModal(false)
                  }}
                >
                  Upgrade — $2.99/mo
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full border-[#ff7959] text-[#ff5733] hover:bg-[#ff5733]/10 hover:border-[#ff5733] py-6 h-auto"
                onClick={() => {
                  trackUpsellEvent("upsell_cta_click", { location: "modal", trigger: "watermark_download", action: "download_with_watermark" })
                  if (watermarkModalUtcDay) markSeen("modal:watermark", watermarkModalUtcDay)
                  setShowWatermarkModal(false)
                  downloadSharpenedImage()
                }}
              >
                Download with watermark
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  )
}
