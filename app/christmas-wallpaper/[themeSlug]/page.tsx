import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import PreviewModal from "@/components/PreviewModal"
import { WallpaperDeepLinker } from "@/components/WallpaperDeepLinker"
import { siteConfig } from "@/config/siteConfig"
import { CHRISTMAS_THEMES, type ChristmasTheme } from "../themes"
import { CHRISTMAS_WALLPAPERS } from "../wallpapers"
import { WallpaperCard } from "../WallpaperCard"

const THEME_DESCRIPTIONS: Record<string, string> = {
  "cute-wallpaper-for-christmas":
    "Warm and cozy Christmas wallpapers filled with fireplaces, candlelit bookshelves, and snow-dusted windows. Perfect for phones or desktops when you want gentle lights, nostalgic textures, and a peaceful holiday mood that feels like cocoa nights and handwritten cards by the fire.",
  "pastel-candy-christmas":
    "Cute Christmas wallpapers packed with pastel palettes, marshmallow clouds, and playful characters. These soft-focus graphics brighten phones, tablets, or desktops for kids, teens, and anyone who loves adorable, candy-coated holiday scenes with charming details and dreamy color gradients.",
  "ice-castle-queen":
    "Dark Christmas wallpapers that mix festive ornaments with gothic silhouettes, haunted cabins, and flickering red-green light. Ideal for fans of spooky December atmospheres, these scenes keep the holly-and-ivy spirit while adding moody shadows, candle smoke, and mysterious, cinematic contrasts.",
  "winter-cabin-at-night":
    "Futuristic Christmas wallpapers that trade village streets for neon runways, sci-fi towers, and glowing cables in the snow. Think cyberpunk tinsel, armored wanderers, and multicolored mist—bold backdrops for anyone who wants holiday energy with a high-tech, synthwave-inspired twist.",
  "cosmic-space-christmas":
    "Cosmic Christmas wallpapers featuring astronauts, auroras, drifting planets, and presents floating through shimmering galaxies. Perfect for sci-fi fans who want dreamy seasonal art, these scenes pair deep-space gradients with subtle holiday cues like glowing ornaments, cosmic snow, and calm starlit skies.",
  "christmas-tree-lights":
    "Fantasy Christmas wallpapers brimming with enchanted evergreens, shimmering ornaments, and magical woodland glow. Ideal when you want tree-lined cabins, sparkling bridges, and fairytale plazas that make every screen feel like a wonderland of warm light and softly falling snow.",
  "cute-christmas-robots":
    "Steampunk Christmas wallpapers inspired by brass gears, mechanical reindeer, glowing lanterns, and retro laboratory vibes. These whimsical robots bring a playful industrial twist to seasonal backgrounds while still feeling cozy enough for storybook desktops or sci-fi phone lock screens.",
  "snowy-forest-aesthetic":
    "Minimal Christmas wallpapers built from pristine snowscapes, soft gradients, and calm branches catching morning light. Ideal for modern setups that prefer quiet elegance, the images keep details subtle so your phone or desktop feels clean, airy, and gently festive all season long.",
}

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

  const isCozy = theme.slug === "cute-wallpaper-for-christmas"
  const baseTitle = isCozy ? "cute wallpaper for christmas" : `${theme.name} Christmas Wallpapers`
  const title = `${baseTitle} | Imgsharer`
  const description = `${theme.tagline} Explore AI-generated ${theme.name.toLowerCase()} Christmas wallpapers for phones and desktops.`
  const canonicalUrl = `${siteConfig.siteUrl.replace(/\/$/, "")}/christmas-wallpaper/${theme.slug}`

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

export default function ChristmasThemePage({ params }: ThemePageProps) {
  const theme = getTheme(params.themeSlug)

  if (!theme) {
    notFound()
  }

  const isCozy = theme.slug === "cute-wallpaper-for-christmas"

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
          <WallpaperDeepLinker />
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
                  {isCozy ? "cute wallpaper for christmas" : `${theme.name} Wallpapers`}
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
                {isCozy ? "Cute Christmas Wallpapers" : `${theme.name} Christmas wallpapers`}
              </h2>
              <p className="text-xs text-neutral-500">
                Tap an image to open and download.
              </p>
            </div>

            {THEME_DESCRIPTIONS[theme.slug] ? (
              <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed">
                {THEME_DESCRIPTIONS[theme.slug]}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {images.map((wallpaper) => (
                <WallpaperCard
                  key={wallpaper.id}
                  wallpaper={wallpaper}
                  themeLabel={isCozy ? "Cute Christmas" : theme.name}
                  themeSlug={theme.slug}
                />
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
      <PreviewModal />
    </main>
  )
}
