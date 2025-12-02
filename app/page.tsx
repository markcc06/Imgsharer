import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { ProblemSolutionsSection } from "@/components/ProblemSolutionsSection"
import { NewsletterSection } from "@/components/newsletter-section"
import { Upload, Zap, Download, Shield, Sparkles, FileImage } from "lucide-react"
import PreviewModal from "@/components/PreviewModal"
import { buildLandingMetadata } from "@/lib/seo-config"
import { getLandingConfig, toolConfig } from "@/config/toolConfig"

export const metadata: Metadata = buildLandingMetadata("/")

export default function HomePage() {
  const landing = getLandingConfig("/")!
  const steps = landing.howItWorksSteps ?? []
  const useCases = landing.useCasesItems ?? []
  const howItWorksIcons = [Upload, Zap, Download]

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <HeroSection hero={landing} />
      <ProblemSolutionsSection
        eyebrow={toolConfig.relatedSection.eyebrow}
        title={toolConfig.relatedSection.title}
        description={toolConfig.relatedSection.description}
        cards={toolConfig.relatedSolutions}
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto mb-20">
            <div className="text-center mb-12 px-4 sm:px-0">
              <h2 id="how-it-works" className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1a1a1a] mb-3">
                {landing.howItWorksTitle}
              </h2>
              {landing.howItWorksSubtitle ? (
                <p className="text-base sm:text-lg text-[#666666] max-w-2xl mx-auto">{landing.howItWorksSubtitle}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {steps.map((step, index) => {
                const Icon = howItWorksIcons[index] ?? Upload
                return (
                  <div
                    key={step.title}
                    className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-6 md:p-8 hover:shadow-xl hover:border-[#FF6B35]/30 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center mb-6 shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3 text-balance">{step.title}</h3>
                      <p className="text-[#666666] leading-relaxed text-balance">{step.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {landing.useCasesTitle && useCases.length > 0 ? (
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 px-4 sm:px-0">
                <h2 id="why-choose" className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1a1a1a] mb-3">
                  {landing.useCasesTitle}
                </h2>
                {landing.useCasesDescription ? (
                  <p className="text-base sm:text-lg text-[#666666] max-w-2xl mx-auto text-balance">{landing.useCasesDescription}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {useCases.map((item, index) => {
                  const benefitIcons = [Sparkles, Shield, FileImage]
                  const Icon = benefitIcons[index] ?? Sparkles
                  return (
                  <div
                    key={item.title}
                    className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-6 md:p-8 hover:shadow-xl hover:border-[#FF6B35]/30 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center mb-6">
                        <Icon className="w-7 h-7 text-[#FF6B35]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3 text-balance">{item.title}</h3>
                      <p className="text-[#666666] leading-relaxed text-balance">{item.body}</p>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <NewsletterSection />
      <Footer />
      <PreviewModal />
    </main>
  )
}
