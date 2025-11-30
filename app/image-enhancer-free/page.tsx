import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsletterSection } from "@/components/newsletter-section"
import PreviewModal from "@/components/PreviewModal"
import { ImageEnhancerHero } from "./ImageEnhancerHero"
import { Upload, Zap, Download } from "lucide-react"
import { buildLandingMetadata } from "@/lib/seo-config"
import { getLandingConfig } from "@/config/toolConfig"
import type { StepItem } from "@/config/toolConfig"

export const metadata: Metadata = buildLandingMetadata("/image-enhancer-free")

export default function ImageEnhancerFreePage() {
  const landing = getLandingConfig("/image-enhancer-free")!
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <ImageEnhancerHero
        badge={landing.heroBadge}
        title={landing.heroTitle}
        subtitle={landing.heroSubtitle}
        body={landing.heroDescription}
        ctaText={landing.heroCtaLabel}
        bullets={landing.heroBullets?.map((bullet) => ({
          icon: bullet.icon ?? "✨",
          title: bullet.title,
          description: bullet.body,
        }))}
      />
      {landing.useCasesItems && landing.useCasesItems.length > 0 ? (
        <FeaturesSection title={landing.useCasesTitle} description={landing.useCasesDescription} cards={landing.useCasesItems} />
      ) : null}
      {landing.howItWorksSteps.length > 0 ? (
        <HowItWorksSection title={landing.howItWorksTitle} steps={landing.howItWorksSteps} />
      ) : null}
      <NewsletterSection />
      <Footer />
      <PreviewModal />
    </main>
  )
}

function FeaturesSection({
  title,
  description,
  cards,
}: {
  title?: string
  description?: string
  cards: StepItem[]
}) {
  return (
    <section className="bg-[#f8f9fb] py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          {title ? <h2 className="text-3xl font-semibold text-slate-900">{title}</h2> : null}
          {description ? <p className="mt-4 text-slate-600 text-base md:text-lg">{description}</p> : null}
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

function HowItWorksSection({ title, steps }: { title: string; steps: StepItem[] }) {
  const icons = [Upload, Zap, Download]

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = icons[index] ?? Upload
            return (
            <div key={step.title} className="rounded-2xl bg-neutral-50 border border-neutral-200 p-6 shadow-sm text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
            </div>
          )})}
        </div>
      </div>
    </section>
  )
}
