"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { ProblemSolutionsSection } from "@/components/ProblemSolutionsSection"
import { NewsletterSection } from "@/components/newsletter-section"
import { Upload, Zap, Download, Shield, Sparkles, FileImage } from "lucide-react"
import PreviewModal from "@/components/PreviewModal"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <HeroSection />
      <ProblemSolutionsSection />

      <section className="py-16 lg:py-24 bg-white">
        <div className="container-custom">
          {/* How It Works Section */}
          <div className="max-w-7xl mx-auto mb-20">
            <div className="text-center mb-12">
              <h2 id="how-it-works" className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1a1a1a] mb-3">
                How It Works
              </h2>
              <p className="text-lg text-[#666666] max-w-2xl mx-auto">
                Three simple steps to enhance your images with AI
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:shadow-xl hover:border-[#FF6B35]/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center mb-6 shadow-lg">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">Upload your image</h3>
                  <p className="text-[#666666] leading-relaxed">
                    Drag and drop or click to select your photo from your device
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:shadow-xl hover:border-[#FF6B35]/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center mb-6 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3 whitespace-nowrap">
                    AI sharpens in seconds
                  </h3>
                  <p className="text-[#666666] leading-relaxed">
                    Our AI enhances clarity and detail instantly with advanced algorithms
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:shadow-xl hover:border-[#FF6B35]/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center mb-6 shadow-lg">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">Download the result</h3>
                  <p className="text-[#666666] leading-relaxed">
                    Get your enhanced image in high quality, ready to use anywhere
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Imgsharer Section */}
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="why-choose" className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1a1a1a] mb-3">
                Why Choose Imgsharer
              </h2>
              <p className="text-lg text-[#666666] max-w-2xl mx-auto">
                Professional image enhancement made simple and secure
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Benefit 1 */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:shadow-xl hover:border-[#FF6B35]/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-7 h-7 text-[#FF6B35]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">
                    Crisp results,
                    <br />
                    free to start
                  </h3>
                  <p className="text-[#666666] leading-relaxed">
                    Professional-grade sharpening at no cost. Get started instantly without any payment.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:shadow-xl hover:border-[#FF6B35]/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center mb-6">
                    <Shield className="w-7 h-7 text-[#FF6B35]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">
                    Private:
                    <br />
                    processed securely
                  </h3>
                  <p className="text-[#666666] leading-relaxed">
                    Your images stay private and secure. We never store or share your photos.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:shadow-xl hover:border-[#FF6B35]/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center mb-6">
                    <FileImage className="w-7 h-7 text-[#FF6B35]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">
                    Works with
                    <br />
                    JPEG, PNG, WebP
                  </h3>
                  <p className="text-[#666666] leading-relaxed">
                    Support for all common image formats. Upload any photo and get great results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
      <Footer />
      <PreviewModal />
    </main>
  )
}
