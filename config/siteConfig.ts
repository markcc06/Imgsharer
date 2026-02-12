export type SiteConfig = {
  brandName: string
  siteUrl: string
  tagline: string
  contactEmail?: string
  adsenseClientId?: string
  gaMeasurementId?: string
  defaultLocale?: string
}

export const siteConfig: SiteConfig = {
  brandName: "Imgsharer",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.imagesharpenerai.pro",
  tagline: "AI-powered image sharpening made simple.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@imagesharpenerai.pro",
  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? undefined,
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? undefined,
  defaultLocale: "en-US",
}
