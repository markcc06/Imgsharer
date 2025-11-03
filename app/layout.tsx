import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Free AI Image Sharpener Instantly Enhance Photo Clarity | Imgsharer",
  description:
    "Free AI image sharpener to enhance and restore photo clarity. Upload a picture, sharpen in seconds, then download crystal-clear results. Private and fast.",
  generator: "v0.app",
  metadataBase: new URL("https://www.imagesharpenerai.pro"),
  alternates: {
    canonical: "https://www.imagesharpenerai.pro",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: "Imgsharer",
    title: "Free AI Image Sharpener Instantly Enhance Photo Clarity",
    description:
      "Free AI image sharpener to enhance and restore photo clarity. Upload a picture, sharpen in seconds, then download crystal-clear results. Private and fast.",
    type: "website",
    url: "https://www.imagesharpenerai.pro",
    locale: "en_US",
    images: [
      {
        url: "/hero/portrait-3840.jpg",
        width: 3840,
        height: 2160,
        alt: "AI Image Sharpener Hero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Image Sharpener Instantly Enhance Photo Clarity",
    description:
      "Free AI image sharpener to enhance and restore photo clarity. Upload a picture, sharpen in seconds, then download crystal-clear results. Private and fast.",
    site: "@imgsharer",
    images: ["/hero/portrait-3840.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.jpg", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.jpg", type: "image/png", sizes: "16x16" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.jpg", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.jpg", color: "#ff5733" }],
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const ADSENSE_CLIENT =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_ADSENSE_CLIENT : undefined

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
      <head>
        {/* Conditionally inject AdSense base so Google CMP can auto-inject */}
        {ADSENSE_CLIENT ? (
          <>
            <script
              id="adsbygoogle-script"
              async
              crossOrigin="anonymous"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            />
          </>
        ) : null}
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ff5733" />
        <meta name="msapplication-TileColor" content="#ff5733" />
        {process.env.NODE_ENV === "production"
          ? (() => {
              const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-VZXMJJJQD5"
              if (!GA_ID) return null
              return (
                <>
                  <Script
                    id="ga4-src"
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                    strategy="afterInteractive"
                  />
                  <Script id="ga4-init" strategy="afterInteractive">
                    {`
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${GA_ID}', { anonymize_ip: true });
                    `}
                  </Script>
                </>
              )
            })()
          : null}
      </head>
      <body className="font-sans bg-neutral-50 text-neutral-900 overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
