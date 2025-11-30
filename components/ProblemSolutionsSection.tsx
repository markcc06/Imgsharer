import Link from "next/link"
import type { RelatedSolution } from "@/config/toolConfig"

type ProblemSolutionsSectionProps = {
  eyebrow: string
  title: string
  description: string
  cards: RelatedSolution[]
}

export function ProblemSolutionsSection({ eyebrow, title, description, cards }: ProblemSolutionsSectionProps) {
  return (
    <section className="mt-16 md:mt-20 py-12 md:py-16 bg-white">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold tracking-wide text-orange-500/80 uppercase">{eyebrow}</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto">{description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-white/80 border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 backdrop-blur p-5 md:p-6 h-full flex flex-col"
              >
                <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${card.iconBg} ${card.iconColor} text-lg`}>
                  <span role="img" aria-hidden="true">
                    {card.iconEmoji}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{card.description}</p>
                <div className="mt-auto pt-3 border-t border-slate-100">
                  <Link
                    href={card.href}
                    className="inline-flex items-center justify-center w-full rounded-xl bg-[#FF6B35] text-white text-sm font-medium py-2.5 hover:bg-[#ff8154] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6B35]"
                  >
                    {card.ctaLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
