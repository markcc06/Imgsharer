import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsletterSection } from "@/components/newsletter-section"
import PreviewModal from "@/components/PreviewModal"
import { ImageEnhancerHero } from "../image-enhancer-free/ImageEnhancerHero"
import { buildLandingMetadata } from "@/lib/seo-config"
import { getLandingConfig } from "@/config/toolConfig"
import type { StepItem, FaqItem } from "@/config/toolConfig"

export const metadata: Metadata = buildLandingMetadata("/make-picture-clear")

export default function MakePictureClearPage() {
  const landing = getLandingConfig("/make-picture-clear")!
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <ImageEnhancerHero
        badge={landing.heroBadge}
        title={landing.heroTitle}
        subtitle={landing.heroSubtitle}
        ctaText={landing.heroCtaLabel}
        body={landing.heroDescription}
        bullets={landing.heroBullets?.map((bullet) => ({
          icon: bullet.icon ?? "✨",
          title: bullet.title,
          description: bullet.body,
        }))}
      />
      {landing.useCasesItems && landing.useCasesItems.length > 0 ? (
        <MakePictureUseCasesSection
          title={landing.useCasesTitle}
          description={landing.useCasesDescription}
          cards={landing.useCasesItems}
        />
      ) : null}
      {landing.howItWorksSteps.length > 0 ? (
        <MakePictureHowToSection title={landing.howItWorksTitle} steps={landing.howItWorksSteps} />
      ) : null}
      {landing.faqItems && landing.faqItems.length > 0 ? (
        <MakePictureFaqSection title={landing.faqTitle} faqs={landing.faqItems} />
      ) : null}
      <NewsletterSection />
      <Footer />
      <PreviewModal />
    </main>
  )
}

function MakePictureUseCasesSection({
  title,
  description,
  cards,
}: {
  title?: string
  description?: string
  cards: StepItem[]
}) {
  return (
    <section className="bg-[#f9fafb] py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          {title ? <h2 className="text-3xl font-semibold text-slate-900">{title}</h2> : null}
          {description ? <p className="mt-4 text-slate-600">{description}</p> : null}
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

function MakePictureHowToSection({ title, steps }: { title: string; steps: StepItem[] }) {
  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="space-y-6 md:space-y-0 md:flex md:items-start md:gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <span className="text-sm font-semibold text-[#FF6B35]">Step {index + 1}</span>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MakePictureFaqSection({ title, faqs }: { title?: string; faqs: FaqItem[] }) {
  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        {title ? (
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
          </div>
        ) : null}
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
