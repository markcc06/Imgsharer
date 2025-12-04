import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { siteConfig } from "@/config/siteConfig"
import { CHRISTMAS_THEMES, type ChristmasTheme } from "../themes"
import { CHRISTMAS_WALLPAPERS } from "../wallpapers"

type ThemePageProps = {
  params: {
    themeSlug: string
  }
}

function getTheme(slug: string): ChristmasTheme | undefined {
  return CHRISTMAS_THEMES.find((theme) => theme.slug === slug)
}

export async function generateMetadata({ params }: ThemePageProps): Promise<Metadata> {
  const theme = getTheme(params.themeSlug)

  if (!theme) {
    return {
      title: "Christmas Wallpapers | Imgsharer",
      description:
        "Browse aesthetic AI-generated Christmas wallpapers for desktop and mobile, then sharpen and upscale them with Imgsharer.",
    }
  }

  const title = `${theme.name} Christmas Wallpapers | Imgsharer`
  const description = `${theme.tagline} Explore AI-generated ${theme.name.toLowerCase()} Christmas wallpapers for phones and desktops.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.siteUrl.replace(/\/$/, "")}/christmas-wallpaper/${theme.slug}`,
      type: "website",
    },
  }
}

export default function ChristmasThemePage({ params }: ThemePageProps) {
  const theme = getTheme(params.themeSlug)

  if (!theme) {
    notFound()
  }

  const wallpapersForTheme = CHRISTMAS_WALLPAPERS.filter((wallpaper) =>
    wallpaper.themes.includes(theme.slug),
  )
  const images = wallpapersForTheme.length > 0 ? wallpapersForTheme : CHRISTMAS_WALLPAPERS

  const otherThemes = CHRISTMAS_THEMES.filter((item) => item.slug !== theme.slug).slice(0, 3)

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Header />
      <div className="flex-1 pt-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:px-6 md:py-14">
          <section className="space-y-4">
            <p className="inline-flex items-center gap-2 text-xs text-neutral-500">
              <Link href="/christmas-wallpaper" className="hover:text-[#FF6B35]">
                Christmas Wallpapers
              </Link>
              <span>/</span>
              <span className="font-medium text-[#1a1a1a]">{theme.name}</span>
            </p>
            <div
              className={`relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br ${theme.accentColor} px-6 py-8 md:px-8 md:py-10`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_55%)]" />
              <div className="relative z-10 space-y-3 max-w-xl">
                <span className="text-3xl">{theme.emoji}</span>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {theme.name} Wallpapers
                </h1>
                <p className="text-sm text-neutral-800">{theme.tagline}</p>
                <p className="text-xs text-neutral-800/90">
                  Scroll down to explore AI-generated {theme.name.toLowerCase()} Christmas wallpapers in HD and 4K.
                  Perfect for phones, tablets and desktops.
                </p>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="theme-wallpapers-heading"
            className="space-y-4"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2
                id="theme-wallpapers-heading"
                className="text-lg font-semibold text-[#1a1a1a] md:text-xl"
              >
                {theme.name} Christmas wallpapers
              </h2>
              <p className="text-xs text-neutral-500">
                Tap an image to open and download.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {images.map((wallpaper) => (
                <div
                  key={wallpaper.id}
                  className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                  <div className="relative">
                    <Image
                      src={wallpaper.src}
                      alt={wallpaper.alt}
                      width={640}
                      height={960}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">
              Explore other Christmas themes
            </h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {otherThemes.map((item) => (
                <Link
                  key={item.slug}
                  href={`/christmas-wallpaper/${item.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-neutral-700 hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/5"
                >
                  <span>{item.emoji}</span>
                  <span>{item.name} wallpapers</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-5">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">
              How to use these wallpapers
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs text-neutral-700">
              <li>• Tap any image to open the HD version.</li>
              <li>• On mobile: long-press the image and save to your Photos.</li>
              <li>• On desktop: right-click → “Save image as…” then set it as your wallpaper.</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
