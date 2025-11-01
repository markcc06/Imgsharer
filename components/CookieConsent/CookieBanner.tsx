"use client"

import { useCallback, useEffect, useState } from "react"
import CookiePreferences from "./CookiePreferences"
import {
  applyConsentToGtag,
  consentToModeArgs,
  defaultDenied,
  getStoredConsent,
  loadAdSenseIfAllowed,
  loadGAIfAllowed,
  storeConsent,
} from "@/lib/consent"
import type { ConsentState } from "@/lib/consent"

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""
const ADS_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ""

const ensureGtag = () => {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer?.push(arguments as any)
    }
  }
}

const buildState = (analytics: boolean, ads: boolean): ConsentState => ({
  granted: analytics || ads,
  updatedAt: Date.now(),
  categories: {
    essential: true,
    analytics,
    ads,
    personalization: false,
  },
})

export default function CookieBanner() {
  const [isMounted, setIsMounted] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [consent, setConsent] = useState<ConsentState>(() => defaultDenied())

  const persistAndApply = useCallback(
    (next: ConsentState) => {
      setConsent(next)
      storeConsent(next)
      ensureGtag()
      applyConsentToGtag(next)
      if (GA_ID) loadGAIfAllowed(GA_ID, next)
      if (ADS_CLIENT) loadAdSenseIfAllowed(ADS_CLIENT, next)
      setShowBanner(false)
    },
    [],
  )

  useEffect(() => {
    setIsMounted(true)
    if (typeof window === "undefined") return

    ensureGtag()
    const denied = defaultDenied()
    window.gtag?.("consent", "default", consentToModeArgs(denied))

    const stored = getStoredConsent()
    if (!stored) {
      setConsent(denied)
      setShowBanner(true)
      return
    }

    setConsent(stored)
    applyConsentToGtag(stored)
    if (GA_ID) loadGAIfAllowed(GA_ID, stored)
    if (ADS_CLIENT) loadAdSenseIfAllowed(ADS_CLIENT, stored)
  }, [])

  const handleAccept = useCallback(() => {
    const next = buildState(true, true)
    persistAndApply(next)
  }, [persistAndApply])

  const handleReject = useCallback(() => {
    const next = buildState(false, false)
    persistAndApply(next)
  }, [persistAndApply])

  const handleConfirm = useCallback(
    (nextState: ConsentState) => {
      persistAndApply(nextState)
    },
    [persistAndApply],
  )

  const allowAllFromModal = useCallback(() => {
    const next = buildState(true, true)
    persistAndApply(next)
  }, [persistAndApply])

  const bannerClass =
    "fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 shadow-sm supports-[backdrop-filter]:bg-white/70 backdrop-blur"

  if (!isMounted) return null
  if (!showBanner) {
    return (
      <>
        <CookiePreferences
          open={preferencesOpen}
          onOpenChange={setPreferencesOpen}
          state={consent}
          onConfirm={handleConfirm}
          onAllowAll={allowAllFromModal}
        />
      </>
    )
  }

  return (
    <>
      <div className={bannerClass}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-8">
          <p className="text-sm text-neutral-700 md:flex-1">
            We use cookies to analyze traffic and improve your experience. For details, see our{" "}
            <a href="/privacy" className="text-coral hover:underline">
              Privacy &amp; Cookie Notice
            </a>
            .
          </p>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:flex-nowrap md:items-center md:justify-end md:gap-3">
            <button
              type="button"
              className="rounded-md border border-brand-primary/40 px-4 py-2 text-sm font-medium text-brand-primary transition hover:bg-brand-primary/10"
              onClick={handleReject}
            >
              Reject All
            </button>
            <button
              type="button"
              className="rounded-md px-4 py-2 text-sm font-medium text-brand-primary underline underline-offset-4 transition hover:text-brand-primary-dark"
              onClick={() => setPreferencesOpen(true)}
            >
              Your Privacy Choices
            </button>
            <button
              type="button"
              className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary-dark"
              onClick={handleAccept}
            >
              Accept Cookies
            </button>
          </div>
        </div>
      </div>

      <CookiePreferences
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        state={consent}
        onConfirm={handleConfirm}
        onAllowAll={allowAllFromModal}
      />
    </>
  )
}
