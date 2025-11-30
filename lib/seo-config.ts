import type { Metadata } from "next"
import { siteConfig } from "@/config/siteConfig"
import { getLandingConfig, toolConfig } from "@/config/toolConfig"

export function buildLandingMetadata(slugOrPath: string): Metadata {
  const landing = getLandingConfig(slugOrPath)
  const baseTitle = landing?.metaTitle ?? toolConfig.defaultMetaTitle
  const description = landing?.metaDescription ?? toolConfig.defaultMetaDescription
  const url =
    landing?.path && landing.path !== "/"
      ? `${siteConfig.siteUrl}${landing.path}`
      : siteConfig.siteUrl

  const fullTitle = `${baseTitle} | ${siteConfig.brandName}`

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  }
}
