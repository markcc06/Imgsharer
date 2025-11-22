import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsletterSection } from "@/components/newsletter-section"
import PreviewModal from "@/components/PreviewModal"
import { Upload, Zap, Download } from "lucide-react"
import { BlurryPhotoHero } from "./BlurryPhotoHero"

export const metadata: Metadata = {
  title: "Fix Blurry Photos Online Free | Imgsharer AI Photo Enhancer",
  description:
    "Fix blurry photos online with Imgsharer. Use our free AI image sharpener and enhancer to remove blur from photos online, sharpen CVS photos and prints, and recover clear detail in seconds.",
}

export default function BlurryPhotoPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <BlurryPhotoHero />
      <UseCasesSection />
      <BlurryHowToSection />
      <FaqSection />
      <NewsletterSection />
      <Footer />
      <PreviewModal />
    </main>
  )
}

function UseCasesSection() {
  const cards = [
    {
      title: "Shaky phone photos",
      description: "Fix low-light or motion-blur selfies and phone shots so faces look intentional instead of smeared.",
    },
    {
      title: "CVS photos and prints",
      description: "Scan or snap your CVS photos, boost contrast, and recover detail in faded prints and receipts.",
    },
    {
      title: "Old family pictures",
      description: "Restore old scanned prints that look blurry or soft so memories stay clear for the next share or reprint.",
    },
  ]

  return (
    <section className="bg-[#f9fafb] py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-900">When to use the blurry photo fixer</h2>
          <p className="mt-4 text-slate-600">
            Built for blurry phone snapshots, CVS photos and prints, and old family photos that look soft or out of focus.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm text-left">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{card.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BlurryHowToSection() {
  const steps = [
    {
      title: "Upload your blurry photo",
      description: "Upload a blurry picture, CVS photo, or scanned print straight from your phone or laptop.",
    },
    {
      title: "Let AI enhance and unblur",
      description: "The AI image enhancer sharpens faces, edges, and text so blur is reduced and detail comes back.",
    },
    {
      title: "Download a clearer image",
      description: "Download a sharper version ready to share, print, or send back to CVS for reprinting.",
    },
  ]

  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-900">How to fix a blurry photo with Imgsharer</h2>
        </div>
        <div className="space-y-6 md:space-y-0 md:flex md:items-start md:gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <span className="text-sm font-semibold text-[#FF6B35]">Step {index + 1}</span>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  const faqs = [
    {
      question: "Why are my photos blurry?",
      answer:
        "Blurry photos usually happen because of camera shake, low light, or focus issues. Our AI helps recover usable detail so your shots don’t go to waste.",
    },
    {
      question: "Can AI really fix a blurry photo?",
      answer:
        "AI can sharpen faces, edges, and text well enough for the web or small prints. It can’t invent missing pixels, but it makes blur far less noticeable.",
    },
    {
      question: "Will this work on CVS photos and prints?",
      answer:
        "Yes. Scan or photograph your CVS prints, upload them here, and let the AI enhance contrast, remove blur, and prep them for a fresh reprint.",
    },
  ]

  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-semibold text-slate-900">Blurry photo FAQ</h2>
        </div>
        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
