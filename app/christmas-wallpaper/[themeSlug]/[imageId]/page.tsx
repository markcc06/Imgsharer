import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import PreviewModal from "@/components/PreviewModal"
import { siteConfig } from "@/config/siteConfig"
import { CHRISTMAS_THEMES, type ChristmasTheme } from "../../themes"
import { CHRISTMAS_WALLPAPERS, type ChristmasWallpaper } from "../../wallpapers"
import { WallpaperDetailActions } from "../../WallpaperDetailActions"

type ImagePageParams = {
  themeSlug: string
  imageId: string
}

function getTheme(slug: string): ChristmasTheme | undefined {
  return CHRISTMAS_THEMES.find((theme) => theme.slug === slug)
}

function getWallpaperForTheme(themeSlug: string, imageId: string): ChristmasWallpaper | undefined {
  const candidates = CHRISTMAS_WALLPAPERS.filter((wallpaper) => wallpaper.themes.includes(themeSlug))

  return (
    candidates.find((wallpaper) => wallpaper.id === imageId) ??
    candidates.find((wallpaper) => wallpaper.downloadName === imageId) ??
    candidates.find((wallpaper) => wallpaper.downloadName.replace(/\.[a-z0-9]+$/i, "") === imageId)
  )
}

export async function generateMetadata({
  params,
}: {
  params: ImagePageParams
}): Promise<Metadata> {
  const theme = getTheme(params.themeSlug)
  const wallpaper = theme ? getWallpaperForTheme(theme.slug, params.imageId) : undefined

  const baseUrl = siteConfig.siteUrl.replace(/\/$/, "")

  if (!theme || !wallpaper) {
    return {
      title: "Christmas Wallpapers | Imgsharer",
      description:
        "Browse aesthetic AI-generated Christmas wallpapers for desktop and mobile, then sharpen and upscale them with Imgsharer.",
      alternates: {
        canonical: `${baseUrl}/christmas-wallpaper`,
      },
    }
  }

  const indexMatch = wallpaper.id.match(/-(\d{2})$/)
  const indexLabel = indexMatch ? ` #${parseInt(indexMatch[1], 10)}` : ""

  const title = `${theme.name} Christmas wallpaper${indexLabel} | Imgsharer`
  const description = `Download this ${theme.name.toLowerCase()} Christmas wallpaper in HD, then unlock a 4K version with Imgsharer. Perfect for phones, tablets and desktop backgrounds.`
  const canonicalUrl = `${baseUrl}/christmas-wallpaper/${theme.slug}/${wallpaper.id}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default function ChristmasWallpaperImagePage({ params }: { params: ImagePageParams }) {
  const theme = getTheme(params.themeSlug)

  if (!theme) {
    notFound()
  }

  const wallpaper = getWallpaperForTheme(theme.slug, params.imageId)

  if (!wallpaper) {
    notFound()
  }

  const themeLabel = theme.slug === "cute-wallpaper-for-christmas" ? "Cozy Christmas" : theme.name

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Header />
      <div className="flex-1 pt-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
          <section className="space-y-4">
            <p className="inline-flex items-center gap-2 text-xs text-neutral-500">
              <Link href="/christmas-wallpaper" className="hover:text-[#FF6B35]">
                Christmas Wallpapers
              </Link>
              <span>/</span>
              <Link
                href={`/christmas-wallpaper/${theme.slug}`}
                className="font-medium text-[#1a1a1a] hover:text-[#FF6B35]"
              >
                {theme.name}
              </Link>
            </p>
            <div
              className={`relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br ${theme.accentColor} px-6 py-6 md:px-8 md:py-8`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_55%)]" />
              <div className="relative z-10 space-y-2 max-w-xl">
                <span className="text-3xl">{theme.emoji}</span>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {themeLabel} Christmas wallpaper
                </h1>
                <p className="text-xs text-neutral-800/90">
                  A single high-quality wallpaper from the {theme.name.toLowerCase()} collection. Download a quick
                  preview or unlock a full 4K version for your devices.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
              <div className="relative w-full bg-neutral-100">
                <div className="relative mx-auto aspect-[9/16] w-full max-w-md md:max-w-none">
                  <Image
                    src={wallpaper.highResSrc || wallpaper.src}
                    alt={`${themeLabel} Christmas wallpaper`}
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            <WallpaperDetailActions wallpaper={wallpaper} themeLabel={themeLabel} />
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-5">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">
              Browse the full {theme.name} collection
            </h2>
            <p className="mt-1 text-xs text-neutral-700">
              Want more wallpapers in this style? Visit the full theme page to explore additional
              cozy, cosmic, and candy-colored scenes.
            </p>
            <div className="mt-3">
              <Link
                href={`/christmas-wallpaper/${theme.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-800 hover:border-[#FF6B35]/60 hover:bg-[#FF6B35]/5"
              >
                <span>{theme.emoji}</span>
                <span>Back to {theme.name} wallpapers</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
      <Footer />
      <PreviewModal />
    </main>
  )
}
