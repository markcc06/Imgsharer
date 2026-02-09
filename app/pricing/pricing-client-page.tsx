"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { initializePaddle, type Paddle } from "@paddle/paddle-js"
import { useSearchParams } from "next/navigation"
import { SignInButton, useAuth } from "@clerk/nextjs"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { siteConfig } from "@/config/siteConfig"

type Entitlement = {
  tier: "early_bird" | "standard"
  priceId: string
  installId: string
  createdAt: number
}

type PriceConfig = {
  earlyBirdPriceId: string | null
  standardPriceId: string | null
}

const EARLY_BIRD_LIMIT = 50
const paddleEnv = (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production" | undefined) ?? "production"
const paddleToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
const pricingToken = process.env.NEXT_PUBLIC_PRICING_TOKEN ?? "YOUR_TOKEN"
const paymentProvider = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER as "creem" | "paddle" | undefined) ?? "paddle"
const MS_PER_DAY = 86_400_000
const EXPERIMENT_ID = "upsell_modal_v1"

type UpsellVariant = "strong_modal" | "intent_modal"

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

function getVariantKey(installId: string) {
  return `imgsharer:upsell_variant:${installId}`
}

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

function formatRemaining(n: number) {
  if (n <= 0) return "Sold out"
  if (n === 1) return "1 spot left"
  return `${n} spots left`
}

export default function PricingClientPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const { isSignedIn } = useAuth()
  const [paddle, setPaddle] = useState<Paddle | null>(null)
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null)
  const [prices, setPrices] = useState<PriceConfig>({ earlyBirdPriceId: null, standardPriceId: null })
  const [earlyBirdSold, setEarlyBirdSold] = useState(0)
  const [loading, setLoading] = useState(true)
  const [checkoutPolling, setCheckoutPolling] = useState(false)
  const [checkoutStarting, setCheckoutStarting] = useState(false)
  const [campaignStartUtcDay, setCampaignStartUtcDay] = useState<string | null>(null)
  const [upsellVariant, setUpsellVariant] = useState<UpsellVariant | null>(null)

  const hasAccess = true

  const earlyBirdRemaining = Math.max(0, EARLY_BIRD_LIMIT - earlyBirdSold)
  const earlyBirdAvailable = paymentProvider === "creem" ? earlyBirdRemaining > 0 : !!prices.earlyBirdPriceId && earlyBirdRemaining > 0
  const isPro = !!entitlement
  const hasCheckoutReturn = useMemo(() => {
    if (!searchParams) return false
    return (
      searchParams.has("checkout_id") ||
      searchParams.has("order_id") ||
      searchParams.has("customer_id") ||
      searchParams.has("subscription_id")
    )
  }, [searchParams])

  const getOrCreateInstallId = useCallback(() => {
    if (typeof window === "undefined") return null
    const KEY = "imgsharer_install_id"
    const existing = window.localStorage?.getItem(KEY)
    if (existing) return existing
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    window.localStorage?.setItem(KEY, id)
    return id
  }, [])

  const getLocalInstallId = useCallback(() => {
    if (typeof window === "undefined") return null
    return window.localStorage?.getItem("imgsharer_install_id") ?? getOrCreateInstallId()
  }, [getOrCreateInstallId])

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

  useEffect(() => {
    if (!upsellVariant) return
    trackEvent("pricing_view", { experiment_id: EXPERIMENT_ID, variant: upsellVariant })
  }, [trackEvent, upsellVariant])

  const campaignBanner = useMemo(() => {
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
      trackEvent("upsell_banner_shown", {
        experiment_id: EXPERIMENT_ID,
        variant: upsellVariant ?? "unknown",
        campaign_day: campaignDay,
        location: "pricing",
      })
      markSeen(shownKey, utcDay)
    }

    const baseOffer = `Early Bird $2.99/mo (reg. $4.99) · ${formatRemaining(earlyBirdRemaining)}`
    const message =
      campaignDay === 0
        ? baseOffer
        : campaignDay === 3
          ? `Reminder: ${baseOffer}`
          : campaignDay === 6
            ? `Early Bird may end anytime · ${formatRemaining(earlyBirdRemaining)}`
            : `Final reminder: ${baseOffer}`

    return (
      <div className="mb-6 rounded-2xl border border-[#ff5733]/20 bg-[#ff5733]/5 px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-800">{message}</p>
        <div className="flex items-center gap-2">
          <Button asChild className="rounded-full bg-[#ff5733] text-white hover:bg-[#ff7959] px-4 py-2 h-auto">
            <Link
              href="/pricing"
              onClick={() => {
                trackEvent("upsell_cta_click", {
                  experiment_id: EXPERIMENT_ID,
                  variant: upsellVariant ?? "unknown",
                  location: "banner",
                  action: "pricing",
                  campaign_day: campaignDay,
                })
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
              trackEvent("upsell_banner_dismissed", {
                experiment_id: EXPERIMENT_ID,
                variant: upsellVariant ?? "unknown",
                campaign_day: campaignDay,
                location: "pricing",
              })
              markSeen(variant, utcDay)
            }}
          >
            ×
          </button>
        </div>
      </div>
    )
  }, [campaignStartUtcDay, earlyBirdRemaining, hasSeen, isPro, markSeen, trackEvent, upsellVariant])

  const loadEntitlement = useCallback(async () => {
    setLoading(true)
    try {
      const installId =
        typeof window !== "undefined" ? window.localStorage?.getItem("imgsharer_install_id") ?? null : null

      const res = await fetch("/api/entitlement", {
        cache: "no-store",
        headers: installId ? { "x-install-id": installId } : undefined,
      })
      if (!res.ok) throw new Error(`Failed to load entitlement: ${res.status}`)
      const data = await res.json()

      if (data?.installId && typeof window !== "undefined") {
        const KEY = "imgsharer_install_id"
        const existing = window.localStorage?.getItem(KEY)
        if (!existing) window.localStorage?.setItem(KEY, data.installId)
      }

      setEntitlement(isSignedIn ? data?.entitlement ?? null : null)
      setEarlyBirdSold(typeof data?.earlyBirdSold === "number" ? data.earlyBirdSold : 0)
      setPrices({
        earlyBirdPriceId: data?.prices?.earlyBirdPriceId ?? null,
        standardPriceId: data?.prices?.standardPriceId ?? null,
      })
      return data?.entitlement ?? null
    } catch (error) {
      console.warn("[pricing] entitlement fetch failed", error)
      return null
    } finally {
      setLoading(false)
    }
  }, [isSignedIn])

  useEffect(() => {
    const installId = getOrCreateInstallId()
    if (!installId || typeof window === "undefined") return
    const key = getCampaignStartKey(installId)
    const existing = window.localStorage?.getItem(key) ?? null
    if (existing) {
      setCampaignStartUtcDay(existing)
      return
    }
    const utcDay = getUtcDayString()
    window.localStorage?.setItem(key, utcDay)
    setCampaignStartUtcDay(utcDay)
  }, [getOrCreateInstallId])

  useEffect(() => {
    if (!hasAccess) {
      setPaddle(null)
      return
    }
    if (paymentProvider !== "paddle") {
      setPaddle(null)
      return
    }
    if (!paddleToken) return
    initializePaddle({ token: paddleToken, environment: paddleEnv })
      .then((instance) => setPaddle(instance ?? null))
      .catch((error) => {
        console.warn("[pricing] paddle init failed", error)
        setPaddle(null)
      })
  }, [hasAccess])

  useEffect(() => {
    loadEntitlement()
  }, [loadEntitlement])

  useEffect(() => {
    if (!hasCheckoutReturn) return
    if (isPro) return
    if (checkoutPolling) return

    setCheckoutPolling(true)
    toast({
      title: "Processing payment",
      description: "This can take a few seconds. Your Pro status will update automatically.",
    })

    let cancelled = false
    ;(async () => {
      for (let i = 0; i < 15; i++) {
        if (cancelled) return
        const ent = await loadEntitlement()
        if (ent) break
        await new Promise((r) => setTimeout(r, 2000))
      }
      if (!cancelled) setCheckoutPolling(false)
    })()

    return () => {
      cancelled = true
    }
  }, [checkoutPolling, hasCheckoutReturn, isPro, loadEntitlement, toast])

  useEffect(() => {
    const onFocus = () => loadEntitlement()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [loadEntitlement])

  const openCheckout = useCallback(
    async (preferEarlyBird: boolean) => {
      if (!hasAccess) {
        toast({
          title: "Access required",
          description: "Upgrade checkout is limited to authorized testing links.",
          variant: "destructive",
        })
        return
      }

      let installId: string | null = null
      if (typeof window !== "undefined") {
        installId = window.localStorage?.getItem("imgsharer_install_id")
      }
      if (!installId) {
        installId = getOrCreateInstallId()
      }
      if (!installId) {
        toast({ title: "Missing device ID", description: "Please refresh and try again.", variant: "destructive" })
        return
      }

      if (paymentProvider === "creem" && checkoutStarting) return

      const selectedTier = preferEarlyBird && earlyBirdAvailable ? "early_bird" : "standard"
      trackEvent("upsell_cta_click", {
        experiment_id: EXPERIMENT_ID,
        variant: upsellVariant ?? "unknown",
        location: "pricing",
        action: "checkout",
        plan: selectedTier,
      })

      if (paymentProvider === "creem") {
        setCheckoutStarting(true)
        const tier = selectedTier
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
        } finally {
          setCheckoutStarting(false)
        }
        return
      }

      if (!paddle) {
        const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost"
        toast({
          title: "Checkout not ready",
          description: isLocal
            ? "Live checkout may be blocked on localhost. Try on your Vercel domain or use sandbox keys for local dev."
            : "Please wait a moment and try again.",
          variant: "destructive",
        })
        return
      }

      const selected =
        (preferEarlyBird && earlyBirdAvailable && prices.earlyBirdPriceId) || prices.standardPriceId || null

      if (!selected) {
        toast({
          title: "Pricing unavailable",
          description: "Price configuration is missing. Please try again later.",
          variant: "destructive",
        })
        return
      }

      paddle.Checkout.open({
        items: [{ priceId: selected, quantity: 1 }],
        customData: { installId },
        settings: {
          displayMode: "overlay",
          locale: "en",
          theme: "light",
          successUrl: `${siteConfig.siteUrl.replace(/\/$/, "")}/pricing`,
        },
      })
    },
    [earlyBirdAvailable, getOrCreateInstallId, hasAccess, paddle, prices.earlyBirdPriceId, prices.standardPriceId, toast, trackEvent, upsellVariant],
  )

  if (!hasAccess) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl font-display font-bold text-neutral-900">Pricing is restricted</h1>
            <p className="text-neutral-600">
              This page is available for testing only. Add the correct token to the URL to continue.
            </p>
            <p className="text-sm text-neutral-500">
              Example: <code className="bg-neutral-100 px-2 py-1 rounded">?token={pricingToken}</code>
            </p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {campaignBanner}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">Pricing</h1>
            <p className="text-lg text-neutral-600">
              Start free. Upgrade for 6x/8x upscaling and watermark-free downloads.
            </p>
          </div>

          {!isSignedIn ? (
            <div className="mb-8">
              <Card className="p-6 border border-neutral-200 bg-neutral-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-neutral-900 font-medium">Sign in to activate Pro</p>
                    <p className="text-sm text-neutral-600">Pro is tied to your signed-in email across devices.</p>
                  </div>
                  <SignInButton mode="modal">
                    <Button
                      className="bg-[#ff5733] text-white hover:bg-[#ff7959] rounded-full"
                      onClick={() =>
                        trackEvent("upsell_cta_click", {
                          experiment_id: EXPERIMENT_ID,
                          variant: upsellVariant ?? "unknown",
                          location: "pricing",
                          action: "sign_in",
                        })
                      }
                    >
                      Sign in
                    </Button>
                  </SignInButton>
                </div>
              </Card>
            </div>
          ) : null}

          {isPro ? (
            <div className="mb-8">
              <Card className="p-6 border border-coral/20 bg-coral/5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-coral text-white">Pro Active</Badge>
                      <span className="text-sm text-neutral-500">Tier: {entitlement.tier}</span>
                    </div>
                    <p className="text-neutral-700">Your Pro features are unlocked on your signed-in email.</p>
                  </div>
                  <Button asChild className="bg-coral text-white hover:bg-coral/90 rounded-full">
                    <Link href="/">Use the tool</Link>
                  </Button>
                </div>
              </Card>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-display font-bold text-neutral-900">Free</h2>
                <Badge variant="secondary">Forever</Badge>
              </div>
              <div className="mb-4">
                  <div className="text-3xl font-display font-bold text-neutral-900">$0</div>
                  <div className="text-sm text-neutral-500">For casual use</div>
                </div>
                <ul className="text-sm text-neutral-700 space-y-2 mb-6">
                  <li>2x / 4x upscaling</li>
                  <li>3 images per day</li>
                  <li>Watermarked downloads</li>
                </ul>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full border-[#ff7959] text-[#ff5733] hover:bg-[#ff5733]/10 hover:border-[#ff5733]"
              >
                <Link href="/">Start free</Link>
              </Button>
            </Card>

            <Card className="p-6 border border-coral/30 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-display font-bold text-neutral-900">Early Bird</h2>
                <Badge className="bg-coral text-white">Limited</Badge>
              </div>
              <div className="mb-4">
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-display font-bold text-neutral-900">$2.99</div>
                    <div className="text-sm text-neutral-500">/ month</div>
                  </div>
                <div className="text-sm text-neutral-500">
                  {loading ? "Checking availability..." : formatRemaining(earlyBirdRemaining)}
                </div>
              </div>
              <ul className="text-sm text-neutral-700 space-y-2 mb-6">
                <li>Unlock 6x / 8x upscaling</li>
                <li>No watermark</li>
                <li>Unlimited daily usage</li>
              </ul>
              <Button
                className="w-full bg-[#ff5733] text-white hover:bg-[#ff7959] disabled:bg-[#ff5733]/60 disabled:text-white rounded-full"
                disabled={
                  !earlyBirdAvailable || (paymentProvider === "paddle" && !paddle) || isPro || checkoutPolling || checkoutStarting
                }
                onClick={() => openCheckout(true)}
              >
                {isPro
                  ? "Already Pro"
                  : checkoutStarting
                    ? "Redirecting..."
                    : checkoutPolling
                      ? "Processing..."
                      : earlyBirdAvailable
                        ? "Claim Early Bird"
                        : "Sold out"}
              </Button>
              {paymentProvider === "paddle" && !prices.earlyBirdPriceId ? (
                <p className="mt-3 text-xs text-neutral-500">Early Bird price is not configured yet.</p>
              ) : null}
            </Card>

            <Card className="p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-display font-bold text-neutral-900">Standard</h2>
                <Badge variant="secondary">Pro</Badge>
              </div>
              <div className="mb-4">
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-display font-bold text-neutral-900">$4.99</div>
                    <div className="text-sm text-neutral-500">/ month</div>
                  </div>
                  <div className="text-sm text-neutral-500">Same Pro features</div>
              </div>
              <ul className="text-sm text-neutral-700 space-y-2 mb-6">
                <li>Unlock 6x / 8x upscaling</li>
                <li>No watermark</li>
                <li>Unlimited daily usage</li>
              </ul>
              <Button
                className="w-full bg-[#ff5733] text-white hover:bg-[#ff7959] disabled:bg-[#ff5733]/60 disabled:text-white rounded-full"
                disabled={
                  (paymentProvider === "paddle" && (!prices.standardPriceId || !paddle)) ||
                  (paymentProvider !== "paddle" && !hasAccess) ||
                  isPro ||
                  checkoutPolling ||
                  checkoutStarting
                }
                onClick={() => openCheckout(false)}
              >
                {isPro ? "Already Pro" : checkoutStarting ? "Redirecting..." : checkoutPolling ? "Processing..." : "Upgrade"}
              </Button>
              {paymentProvider === "paddle" && !prices.standardPriceId ? (
                <p className="mt-3 text-xs text-neutral-500">Standard price is not configured yet.</p>
              ) : null}
            </Card>
          </div>

          <div className="mt-12 grid grid-cols-1">
            <Card className="p-6">
              <h3 className="text-xl font-display font-bold text-neutral-900 mb-4">FAQ</h3>
              <Accordion type="single" collapsible>
                <AccordionItem value="q1">
                  <AccordionTrigger>How does Pro unlock work?</AccordionTrigger>
                    <AccordionContent>
                      Pro is tied to your signed-in email. After checkout, return here and your status will refresh
                      automatically (or just refresh the page). Your access follows your email across browsers/devices.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger>Where do I use Pro features?</AccordionTrigger>
                  <AccordionContent>
                    Go back to the tool on the homepage and select 6x or 8x. Pro removes the watermark automatically.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger>Is Early Bird really limited to 50?</AccordionTrigger>
                  <AccordionContent>
                    Yes. Once 50 Early Bird licenses are sold, it switches to the Standard plan automatically.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
