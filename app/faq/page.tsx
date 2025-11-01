import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ — Imgsharer | AI Image Sharpener",
  description:
    "Learn how our AI image sharpener can unblur image issues, make pictures clearer, enhance selfies, rescue travel shots, and polish product photos with Imgsharer.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/faq` : "/faq",
  },
}

const faqs = [
  {
    question: "What is an AI Image Sharpener and how can Imgsharer help?",
    answer:
      "An AI image sharpener uses deep-learning to unblur images online and make pictures clearer without changing natural colors. Imgsharer enhances edges, textures, and small details so photos look crisp again—great for portraits, travel shots, product photos, and screenshots. It’s fast, browser-based, and designed for a clean workflow from upload to download.",
  },
  {
    question: "Can it unblur selfies and enhance makeup & hair?",
    answer:
      "Yes. For portraits, Imgsharer can unblur selfies, sharpen makeup details, and bring out hair and eye definition while keeping skin tones natural. If a face is extremely out of focus, try a larger source image and good lighting; otherwise the portrait enhancer will recover clarity and micro-contrast nicely.",
  },
  {
    question: "How do I fix blurry travel photos or low-light shots?",
    answer:
      "Use Imgsharer to fix blurry travel photos—it reduces motion blur and noise to unblur vacation photos from night scenes, moving subjects, or handheld shots. Tip: upload the highest-resolution version you have; the tool restores edges first, then balances grain so landmarks, street lights, and skies look clearer without a harsh, over-processed look.",
  },
  {
    question: "Will this make product photos clearer for Amazon/Etsy?",
    answer:
      "Absolutely. The tool sharpens product photos to improve textures, labels, and small text, helping listings stand out. It keeps white backgrounds clean and avoids color shifts, so packaging, fabrics, and glossy surfaces remain true. For best results, upload a well-lit image; Imgsharer enhances clarity so shoppers see details that drive conversions.",
  },
  {
    question: "Can I unblur screenshots or scanned documents?",
    answer:
      "Yes—Imgsharer can unblur screenshots and make scanned text readable for receipts, PDFs, slides, and app UIs. It improves edge contrast on small fonts while controlling halos, so letters stay crisp. No account required for basic use; if a scan is very low-resolution, try a larger source or re-scan at higher DPI for best results.",
  },
]

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export default function FAQPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
          />
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-neutral-600">Everything you need to know about Imgsharer</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">{faq.question}</h2>
                <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-neutral-600 mb-4">Still have questions?</p>
            <p className="text-sm text-neutral-500">
              Contact us at{" "}
              <a href="mailto:support@imgsharer.example" className="text-coral hover:underline">
                support@imgsharer.example
              </a>
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-neutral-600">
              Ready to see the difference?{" "}
              <a href="/" className="text-coral font-medium hover:underline">
                Try Imgsharer now
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
