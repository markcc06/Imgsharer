"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import type { ConsentState } from "@/lib/consent"

type CookiePreferencesProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: ConsentState
  onConfirm: (nextState: ConsentState) => void
  onAllowAll: () => void
}

const buildState = (state: ConsentState, analytics: boolean, ads: boolean): ConsentState => ({
  granted: analytics || ads,
  updatedAt: Date.now(),
  categories: {
    essential: true,
    analytics,
    ads,
    personalization: state.categories.personalization ?? false,
  },
})

export default function CookiePreferences({ open, onOpenChange, state, onConfirm, onAllowAll }: CookiePreferencesProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(state.categories.analytics)
  const [adsEnabled, setAdsEnabled] = useState(state.categories.ads)

  useEffect(() => {
    if (open) {
      setAnalyticsEnabled(state.categories.analytics)
      setAdsEnabled(state.categories.ads)
    }
  }, [open, state.categories.analytics, state.categories.ads])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-3">
          <DialogTitle>Manage Consent Preferences</DialogTitle>
          <DialogDescription>
            Control how Imgsharer uses cookies and similar technologies. Adjust analytics and advertising preferences any
            time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200/70 bg-neutral-50 p-4">
            <div>
              <p className="font-medium text-neutral-900">Strictly Necessary Cookies</p>
              <p className="text-sm text-neutral-600">Required for the site to function and always active.</p>
            </div>
            <div className="text-sm font-medium text-emerald-600">Always Active</div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200/70 bg-white p-4">
            <div>
              <p className="font-medium text-neutral-900">Analytics</p>
              <p className="text-sm text-neutral-600">Help us understand traffic and improve Imgsharer.</p>
            </div>
            <Switch checked={analyticsEnabled} onCheckedChange={setAnalyticsEnabled} />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200/70 bg-white p-4">
            <div>
              <p className="font-medium text-neutral-900">Advertising</p>
              <p className="text-sm text-neutral-600">Show relevant campaigns and support our free tier.</p>
            </div>
            <Switch checked={adsEnabled} onCheckedChange={setAdsEnabled} />
          </div>

          <p className="text-sm text-neutral-500">
            Read more in our{" "}
            <Link href="/privacy" className="text-coral hover:underline">
              Privacy Notice
            </Link>{" "}
            and{" "}
            <Link href="/cookies" className="text-coral hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
        </div>

        <DialogFooter className="sm:flex-row sm:justify-between sm:gap-3">
          <button
            type="button"
            className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
            onClick={() => {
              onAllowAll()
              onOpenChange(false)
            }}
          >
            Allow All
          </button>
          <button
            type="button"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            onClick={() => {
              onConfirm(buildState(state, analyticsEnabled, adsEnabled))
              onOpenChange(false)
            }}
          >
            Confirm My Choices
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
