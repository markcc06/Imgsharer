import type { Metadata } from "next"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsletterSection } from "@/components/newsletter-section"
import PreviewModal from "@/components/PreviewModal"
import { Upload, Zap, Download } from "lucide-react"
import { ImageEnhancerHero } from "./ImageEnhancerHero"

export const metadata: Metadata = {
  title: "Free Image Enhancer – Unblur Photos & Fix CVS Prints | Imgsharer",
  description:
    "Use Imgsharer’s image enhancer free to unblur photos online, fix CVS prints, and boost detail in seconds. No apps or plugins required — just upload, enhance, and download.",
}

export default function ImageEnhancerFreePage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <ImageEnhancerHero />
      <FeaturesSection />
      <HowItWorksSection />
      <NewsletterSection />
      <Footer />
      <PreviewModal />
    </main>
  )
}

function FeaturesSection() {
  const cards = [
    {
      title: "Enhance photo detail for free",
      body:
        "Use our image enhancer free to sharpen soft edges, recover textures, and make low-contrast shots look crisp again in just a few clicks.",
    },
    {
      title: "Perfect for CVS photos and scanned prints",
      body:
        "Scan or snap your CVS photos, then let AI reduce blur, boost contrast, and correct color so your prints look fresh instead of faded.",
    },
    {
      title: "Unblur image free in your browser",
      body:
        "Everything runs online in your browser — no downloads or plugins. Just upload, enhance, and save a clearer image for free.",
    },
  ]

  return (
    <section className="bg-[#f8f9fb] py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-900">Make every photo look clear and print-ready</h2>
          <p className="mt-4 text-slate-600 text-base md:text-lg">
            From quick phone snapshots to scanned CVS photos, Imgsharer’s free image enhancer cleans up noise, restores detail,
            and makes your pictures ready to share or print.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm text-left">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{card.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: "Upload your image",
      description: "Drop in a blurry photo, CVS photo, or scanned print straight from your device.",
    },
    {
      icon: Zap,
      title: "Let AI enhance and unblur",
      description: "Imgsharer’s AI analyzes faces, edges, and textures to sharpen detail, reduce blur, and improve contrast.",
    },
    {
      icon: Download,
      title: "Download a clearer result",
      description: "Preview the changes and download a cleaner, sharper image that’s ready to share or print.",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-900">How to enhance a photo with Imgsharer</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl bg-neutral-50 border border-neutral-200 p-6 shadow-sm text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
