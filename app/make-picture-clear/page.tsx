import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsletterSection } from "@/components/newsletter-section"
import PreviewModal from "@/components/PreviewModal"
import { ImageEnhancerHero } from "../image-enhancer-free/ImageEnhancerHero"

export const metadata: Metadata = {
  title: "Make Pictures Clear Online | Imgsharer",
  description:
    "Make pictures clear online with Imgsharer. Use AI to make any picture more clear, sharpen blurry photos, and recover detail fast.",
}

export default function MakePictureClearPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <ImageEnhancerHero
        badge="Make pictures clearer online"
        title="Make pictures clear and fix blurry photos with AI"
        subtitle="Use Imgsharer’s AI to make any picture more clear, sharpen blurry photos, and recover detail in seconds. Learn how to fix blurry photos online without apps or complicated tools."
        ctaText="Make my picture clearer"
        body="Upload any photo or CVS print, let AI enhance faces and textures, and download a sharper version in seconds — no apps, no Photoshop, and no sign-up."
        bullets={[
          { icon: "📷", title: "Make pictures more clear online", description: "Upload a blurry photo or low-quality picture and let AI sharpen edges, reduce haze, and make the image clear enough to share or print." },
          { icon: "🤳", title: "Fix blurry photos from your phone", description: "Rescue shaky phone shots, soft faces, and motion blur so your favorite selfies and travel photos look sharp again." },
          { icon: "💡", title: "How to fix blurry photos without apps", description: "Everything runs in your browser — no apps or Photoshop. Just upload, enhance, and download a clearer image for free." },
        ]}
      />
      <MakePictureUseCasesSection />
      <MakePictureHowToSection />
      <MakePictureFaqSection />
      <NewsletterSection />
      <Footer />
      <PreviewModal />
    </main>
  )
}

function MakePictureUseCasesSection() {
  const cards = [
    {
      title: "Make pictures more clear online",
      description: "Upload a blurry photo or low-quality picture and let AI sharpen edges, reduce haze, and make the image clear enough to share or print.",
    },
    {
      title: "Fix blurry photos from your phone",
      description: "Rescue shaky phone shots, soft faces, and motion blur so your favorite selfies and travel photos look sharp again.",
    },
    {
      title: "How to fix blurry photos without apps",
      description: "Everything runs in your browser — no apps or Photoshop. Just upload, enhance, and download a clearer image for free.",
    },
  ]

  return (
    <section className="bg-[#f9fafb] py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-900">When to make pictures clearer</h2>
          <p className="mt-4 text-slate-600">
            Ideal for blurry phone snapshots, CVS photos, and old family pictures that need clearer detail.
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

function MakePictureHowToSection() {
  const steps = [
    {
      title: "Upload your blurry picture",
      description: "Drop in a blurry photo, phone shot, or scanned picture straight from your device.",
    },
    {
      title: "Let AI sharpen and unblur",
      description: "Imgsharer’s AI analyzes faces, edges, and textures to boost clarity and reduce blur automatically.",
    },
    {
      title: "Download a clearer photo",
      description: "Preview the result and download a sharper, more usable version ready to share, print, or post.",
    },
  ]

  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-900">How to make a picture clearer with Imgsharer</h2>
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

function MakePictureFaqSection() {
  const faqs = [
    {
      question: "Why are my photos blurry?",
      answer:
        "Photos get blurry from camera shake, low light, or focus issues. Imgsharer restores usable detail so your pictures don’t go to waste.",
    },
    {
      question: "Can AI really fix a blurry photo?",
      answer:
        "AI can sharpen faces, edges, and text well enough for web or small prints. It can’t rebuild missing pixels, but it reduces blur dramatically.",
    },
    {
      question: "Will this work on CVS photos and prints?",
      answer:
        "Yes. Scan or photograph your CVS prints, upload them here, and let AI boost contrast, remove blur, and prep them for a fresh reprint.",
    },
  ]

  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-semibold text-slate-900">Make picture clear FAQ</h2>
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
