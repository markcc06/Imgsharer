import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ChristmasWallpaperGenerator } from "@/components/christmas-wallpaper-generator"
import { siteConfig } from "@/config/siteConfig"

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
    src: "/wallpapers/christmas-desktop-realistic.svg",
    alt: "AI-generated Christmas desktop wallpaper with snowy cabins",
  },
  phones: [
    {
      src: "/wallpapers/christmas-phone-cozy.svg",
      alt: "AI Christmas phone wallpaper with warm living room lights",
    },
    {
      src: "/wallpapers/christmas-phone-snow.svg",
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

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      <section className="pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-white via-white to-neutral-50">
        <div className="container-custom">
          <div className="grid gap-10 lg:gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
            <div className="max-w-2xl mx-auto text-center lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B35] mb-4">Wallpaper Hub</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] tracking-tight mb-6">
                Free AI Christmas Wallpaper Generator
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Create cozy AI Christmas wallpapers for your desktop, iPhone and Android in seconds. Describe a scene or choose an art style, then generate 4K festive backgrounds you can further sharpen and upscale with Imgsharer.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                <Button asChild className="h-12 px-8 text-base font-semibold w-full sm:w-auto">
                  <a href="#generator">Generate Christmas Wallpaper</a>
                </Button>
                <Link
                  href="/"
                  className="text-sm font-semibold text-[#FF6B35] hover:text-[#ff8c63] transition-colors underline-offset-4 hover:underline w-full sm:w-auto text-center"
                >
                  Enhance an existing wallpaper instead
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-[40px] border border-white/60 shadow-xl bg-neutral-900 aspect-[16/9]">
                <Image
                  src={wallpaperShowcase.desktop.src}
                  alt={wallpaperShowcase.desktop.alt}
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/80 text-[#1a1a1a] text-xs font-semibold tracking-widest px-4 py-1 uppercase">
                  Desktop 4K
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {wallpaperShowcase.phones.map((sample) => (
                  <div
                    key={sample.src}
                    className="relative overflow-hidden rounded-[36px] border border-white/50 shadow-lg bg-neutral-900 aspect-[9/16]"
                  >
                    <Image
                      src={sample.src}
                      alt={sample.alt}
                      fill
                      sizes="(min-width: 768px) 22vw, 45vw"
                      className="object-cover"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-white/85 text-[#1a1a1a] text-[10px] font-semibold tracking-[0.2em] px-3 py-1 uppercase">
                      Phone
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </section>

      <section id="generator" className="py-16 lg:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mb-10 space-y-4 text-center md:text-left mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a]">How to Generate Your Christmas Wallpaper</h2>
            <p className="text-base sm:text-lg text-neutral-600">
              Follow the prompts below to plan your perfect festive background. We’ll wire in the AI model shortly, so everything you configure here will translate to one-click wallpaper generation.
            </p>
          </div>
          <ChristmasWallpaperGenerator />
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="container-custom">
          <div className="max-w-3xl space-y-4 text-center md:text-left mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a]">Why Use Imgsharer for Christmas Wallpapers</h2>
            <p className="text-base sm:text-lg text-neutral-600">
              Imgsharer already powers millions of sharp, enhanced photos—now the same pipeline helps your seasonal wallpapers look polished across every device.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">{benefit.title}</h3>
                <p className="text-neutral-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl space-y-4 text-center md:text-left mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-4">
              Sharpen Any Christmas Wallpaper You Already Have
            </h2>
            <p className="text-base sm:text-lg text-neutral-600">
              Already downloaded a festive background? Send it through Imgsharer’s flagship AI Image Sharpener to remove blur, fix noise and upscale before sharing it on desktop or mobile.
            </p>
            <Button asChild className="h-12 px-8 text-base font-semibold w-full sm:w-auto">
              <Link href="/">Open AI Image Sharpener</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="container-custom">
          <div className="max-w-3xl text-center md:text-left mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-8">Christmas Wallpaper Generator FAQ</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-[#1a1a1a]">{faq.question}</h3>
                <p className="text-neutral-600 mt-3">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
