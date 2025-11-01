import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ - Imgsharer | AI Image Sharpener",
  description: "Frequently asked questions about Imgsharer's AI-powered image sharpening service.",
}

const faqs = [
  {
    question: "How does AI image sharpening work?",
    answer:
      "Our AI uses advanced machine learning models trained on millions of images to intelligently enhance and sharpen your photos. The AI analyzes your image and applies sophisticated upscaling and sharpening techniques to improve clarity and detail while preserving natural appearance.",
  },
  {
    question: "What image formats are supported?",
    answer: "We support JPEG, PNG, and WebP formats. Images must be under 4MB in size for optimal processing.",
  },
  {
    question: "Is there a limit on how many images I can sharpen?",
    answer:
      "Yes, to ensure fair usage, we limit users to 4 images per minute and 12 images per day. If you need higher limits, please contact us about our premium plans.",
  },
  {
    question: "How long does it take to sharpen an image?",
    answer:
      "Most images are processed in 5-15 seconds, depending on the size and complexity of the image. Our AI works quickly to deliver high-quality results.",
  },
  {
    question: "Do you store my images?",
    answer:
      "No, we do not store your images. All processing happens in real-time, and images are immediately discarded after processing. Your privacy and security are our top priorities.",
  },
  {
    question: "What's the maximum resolution I can sharpen?",
    answer:
      "Our AI can upscale images up to 2048px width while maintaining quality. The output resolution depends on your input image size.",
  },
  {
    question: "Can I use sharpened images commercially?",
    answer:
      "Yes, you retain all rights to your images. The sharpened versions are yours to use however you like, including for commercial purposes.",
  },
  {
    question: "What if the sharpening doesn't work well?",
    answer:
      "AI sharpening works best on photos with some blur or softness. Extremely low-quality or heavily compressed images may not see significant improvement. Try uploading the highest quality version of your image for best results.",
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
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
        </div>
      </div>
      <Footer />
    </main>
  )
}
