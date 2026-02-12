import type { Metadata } from "next"
import { Suspense } from "react"
import { siteConfig } from "@/config/siteConfig"
import { billingMode } from "@/config/billing"
import PricingClientPage from "./pricing-client-page"
import { notFound } from "next/navigation"

const canonicalUrl = `${siteConfig.siteUrl.replace(/\/$/, "")}/pricing`

export const metadata: Metadata = {
  title: `Pricing | ${siteConfig.brandName}`,
  description: "Simple plans for Imgsharer: free tier and Pro with 6x/8x upscaling and watermark-free downloads.",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `Pricing | ${siteConfig.brandName}`,
    description: "Simple plans for Imgsharer: free tier and Pro with 6x/8x upscaling and watermark-free downloads.",
    url: canonicalUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `Pricing | ${siteConfig.brandName}`,
    description: "Simple plans for Imgsharer: free tier and Pro with 6x/8x upscaling and watermark-free downloads.",
  },
}

export default function PricingPage() {
  if (billingMode === "off") {
    notFound()
  }
  return (
    <Suspense fallback={null}>
      <PricingClientPage />
    </Suspense>
  )
}
