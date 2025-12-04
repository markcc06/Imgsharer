import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ChristmasWallpaperGenerator } from "@/components/christmas-wallpaper-generator"
import { siteConfig } from "@/config/siteConfig"
import { CHRISTMAS_THEMES } from "./themes"
import { CHRISTMAS_WALLPAPERS } from "./wallpapers"

const productionUrl = siteConfig.siteUrl.replace(/\/$/, "")
const christmasWallpaperUrl = `${productionUrl}/christmas-wallpaper`

export const metadata: Metadata = {
  title: "Free AI Christmas Wallpaper Generator (4K Desktop & Mobile) | Imgsharer",
  description:
    "Create free AI Christmas wallpapers in seconds. Generate cozy Christmas backgrounds for desktop, iPhone and Android, then sharpen and upscale them with Imgsharer.",
  openGraph: {
    title: "Free AI Christmas Wallpaper Generator (4K Desktop & Mobile)",
    description:
      "Generate festive AI Christmas wallpapers for phone and desktop. One-click creation plus AI sharpening and upscaling.",
    url: christmasWallpaperUrl,
    type: "website",
  },
}

const wallpaperShowcase = {
  desktop: {
    src: "/wallpapers/christmas-desktop-realistic.png",
    alt: "AI-generated Christmas desktop wallpaper with snowy cabins",
  },
  phones: [
    {
      src: "/wallpapers/christmas-phone-cozy.png",
      alt: "AI Christmas phone wallpaper with warm living room lights",
    },
    {
      src: "/wallpapers/christmas-phone-snow.png",
      alt: "AI Christmas phone wallpaper with snowy moonlit forest",
    },
  ],
}

const benefits = [
  {
    title: "4K-ready backgrounds",
    description: "Create wallpapers sized for desktop monitors plus iPhone and Android lock screens.",
  },
  {
    title: "Sharper, cleaner details",
    description: "Pair generations with Imgsharer’s AI sharpening and upscaling pipeline for crisp results.",
  },
  {
    title: "Fast and private",
    description: "Work right in your browser—no installs, no data sharing, just festive creativity.",
  },
]

const faqs = [
  {
    question: "Is the Christmas wallpaper generator free?",
    answer:
      "Yes. This seasonal Wallpaper Hub is free to try while we prepare the full AI generation engine, so you can plan holiday backgrounds early.",
  },
  {
    question: "Can I create wallpapers for both desktop and phone?",
    answer:
      "You can choose Desktop 4K, iPhone wallpaper or Android wallpaper outputs so your Christmas wallpapers fit every screen.",
  },
  {
    question: "Can I enhance wallpapers I already downloaded?",
    answer:
      "Absolutely—send any Christmas wallpaper through Imgsharer’s sharpening tool to clear noise, boost detail and upscale instantly.",
  },
  {
    question: "Do you store my images?",
    answer:
      "No. Imgsharer processes wallpapers in transient sessions so your holiday photos remain private and secure.",
  },
]

export default function ChristmasWallpaperPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Free AI Christmas Wallpaper Generator",
    url: christmasWallpaperUrl,
    description:
      "Generate aesthetic AI Christmas wallpapers for desktop and mobile, then sharpen and upscale them with Imgsharer.",
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "Imgsharer Christmas Wallpaper Generator",
      applicationCategory: "ImageEditor",
      operatingSystem: "Web",
    },
  }

  const shuffled = [...CHRISTMAS_WALLPAPERS].sort(() => Math.random() - 0.5)
  const midpoint = Math.ceil(shuffled.length / 2)
  const firstRow = shuffled.slice(0, midpoint)
  const secondRow = shuffled.slice(midpoint)

  const loopRow = (row: typeof CHRISTMAS_WALLPAPERS) => [...row, ...row]

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Header />
      <div className="flex-1 pt-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 md:px-6 lg:py-16">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-orange-50 px-6 py-10 md:px-10 md:py-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(255,248,240,0.9),_transparent_55%)]" />
            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#FF8C63]/40 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#FF6B35] shadow-sm">
                  🎄 AI Generated • HD &amp; 4K
                </p>
                <h1 className="text-balance text-3xl font-semibold tracking-tight text-[#1a1a1a] md:text-4xl lg:text-5xl">
                  Free AI Christmas Wallpaper Generator
                </h1>
                <p className="text-sm text-neutral-700 md:text-base max-w-xl">
                  Browse aesthetic AI-generated Christmas wallpapers and generate your own: cozy living rooms, snowy cabins, ice castles, cosmic scenes, pastel candy clouds, cute robots and more.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#all-wallpapers"
                    className="rounded-full bg-[#FF6B35] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#FF6B35]/30 hover:bg-[#ff8c63]"
                  >
                    Browse all wallpapers
                  </a>
                  <Button
                    asChild
                    className="h-9 rounded-full border border-[#FF6B35]/30 bg-transparent px-4 text-xs font-semibold text-[#FF6B35] hover:bg-[#FF6B35]/10"
                  >
                    <a href="#generator">Generate your own</a>
                  </Button>
                  <p className="text-xs text-neutral-500">Free personal use • Optimized for phone &amp; desktop</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 md:max-w-xs">
                <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-neutral-900 aspect-[4/3]">
                  <Image
                    src={wallpaperShowcase.desktop.src}
                    alt={wallpaperShowcase.desktop.alt}
                    fill
                    sizes="(min-width: 1024px) 20rem, 50vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white">
                    Desktop 4K
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {wallpaperShowcase.phones.map((sample) => (
                    <div
                      key={sample.src}
                      className="relative overflow-hidden rounded-2xl border border-white/70 bg-neutral-900 aspect-[9/16]"
                    >
                      <Image
                        src={sample.src}
                        alt={sample.alt}
                        fill
                        sizes="(min-width: 768px) 10rem, 40vw"
                        className="object-cover"
                      />
                      <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white">
                        Phone
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          </section>

          {/* Themes slider */}
          <section aria-labelledby="christmas-themes-heading" className="space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2
                id="christmas-themes-heading"
                className="text-lg font-semibold text-[#1a1a1a] md:text-xl"
              >
                Christmas themes
              </h2>
              <p className="text-xs text-neutral-500">
                Tap a theme to open its dedicated collection page.
              </p>
            </div>

            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex min-w-full gap-4 pb-2">
                {CHRISTMAS_THEMES.map((theme) => (
                  <Link
                    key={theme.slug}
                    href={`/christmas-wallpaper/${theme.slug}`}
                    className="group relative flex w-56 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg hover:border-[#FF6B35]/40"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 opacity-40 bg-gradient-to-br ${theme.accentColor}`}
                    />
                    <div className="relative z-10 space-y-1">
                      <span className="text-xl">{theme.emoji}</span>
                      <h3 className="text-sm font-semibold text-[#1a1a1a]">{theme.name}</h3>
                      <p className="line-clamp-2 text-xs text-neutral-700">
                        {theme.slug === "cute-wallpaper-for-christmas"
                          ? "cute wallpaper for christmas"
                          : theme.tagline}
                      </p>
                    </div>
                    <span className="relative z-10 mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#FF6B35] group-hover:text-[#ff8c63]">
                      View collection
                      <span aria-hidden>↗</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* All wallpapers grid */}
          <section
            id="all-wallpapers"
            aria-labelledby="all-wallpapers-heading"
            className="space-y-4"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2
                id="all-wallpapers-heading"
                className="text-lg font-semibold text-[#1a1a1a] md:text-xl"
              >
                All Christmas wallpapers
              </h2>
              <p className="text-xs text-neutral-500">
                Gently scrolling preview plus full gallery. Tap an image to open and download.
              </p>
            </div>

            <div className="space-y-4">
              {/* Featured scrolling rows */}
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white px-4 py-4">
                <div className="christmas-scroll-row-left christmas-scroll-paused flex min-w-max gap-4">
                  {loopRow(firstRow.length > 0 ? firstRow : CHRISTMAS_WALLPAPERS).map(
                    (wallpaper, index) => (
                      <div
                        key={`${wallpaper.id}-strip1-${index}`}
                        className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                      >
                        <div className="relative">
                          <Image
                            src={wallpaper.src}
                            alt={wallpaper.alt}
                            width={640}
                            height={960}
                            className="h-full w-[140px] md:w-[180px] object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white px-4 py-4">
                <div className="christmas-scroll-row-right christmas-scroll-paused flex min-w-max gap-4">
                  {loopRow(
                    secondRow.length > 0 ? secondRow : CHRISTMAS_WALLPAPERS,
                  ).map((wallpaper, index) => (
                    <div
                      key={`${wallpaper.id}-strip2-${index}`}
                      className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                    >
                      <div className="relative">
                        <Image
                          src={wallpaper.src}
                          alt={wallpaper.alt}
                          width={640}
                          height={960}
                          className="h-full w-[140px] md:w-[180px] object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Explore more themes */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">
              Explore more Christmas wallpaper ideas
            </h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {CHRISTMAS_THEMES.map((theme) => (
                <Link
                  key={theme.slug}
                  href={`/christmas-wallpaper/${theme.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-neutral-700 hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/5"
                >
                  <span>{theme.emoji}</span>
                  <span>{theme.name} wallpapers</span>
                </Link>
              ))}
            </div>
          </section>

          {/* How to use these wallpapers */}
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

          {/* Generator section */}
          <section id="generator" className="space-y-6">
            <div className="max-w-3xl space-y-4 text-center md:text-left mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a]">
                How to Generate Your Christmas Wallpaper
              </h2>
              <p className="text-base sm:text-lg text-neutral-700">
                Follow the prompts below to plan your perfect festive background. Choose an art style, write a scene, and generate wallpapers ready for phone and desktop.
              </p>
            </div>
            <ChristmasWallpaperGenerator />
          </section>

          {/* Existing marketing content, lightly adapted for dark background */}
          <section className="space-y-8">
            <div className="max-w-3xl space-y-4 text-center md:text-left mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a]">
                Why Use Imgsharer for Christmas Wallpapers
              </h2>
              <p className="text-base sm:text-lg text-neutral-700">
                Imgsharer already powers millions of sharp, enhanced photos—now the same pipeline helps your seasonal wallpapers look polished across every device.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">{benefit.title}</h3>
                  <p className="text-neutral-700">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="max-w-3xl space-y-4 text-center md:text-left mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a]">
                Sharpen Any Christmas Wallpaper You Already Have
              </h2>
              <p className="text-base sm:text-lg text-neutral-700">
                Already downloaded a festive background? Send it through Imgsharer’s flagship AI Image Sharpener to remove blur, fix noise and upscale before sharing it on desktop or mobile.
              </p>
              <Button asChild className="h-12 px-8 text-base font-semibold w-full sm:w-auto">
                <Link href="/">Open AI Image Sharpener</Link>
              </Button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="max-w-3xl text-center md:text-left mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-4">Christmas Wallpaper Generator FAQ</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-[#1a1a1a]">{faq.question}</h3>
                  <p className="text-neutral-700 mt-3">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
