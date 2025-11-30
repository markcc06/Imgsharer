import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { siteConfig } from "@/config/siteConfig"

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.brandName}`,
  description: `Contact the ${siteConfig.brandName} team for support, feedback, or partnership inquiries.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/contact`,
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: `Contact | ${siteConfig.brandName}`,
    description: `Contact the ${siteConfig.brandName} team for support, feedback, or partnership inquiries.`,
    url: `${siteConfig.siteUrl}/contact`,
  },
  twitter: {
    card: "summary",
    title: `Contact | ${siteConfig.brandName}`,
    description: `Contact the ${siteConfig.brandName} team for support, feedback, or partnership inquiries.`,
  },
}

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4 bg-neutral-50">
        <div className="max-w-3xl mx-auto space-y-10">
          <h1 className="text-4xl font-display font-bold text-neutral-900">Contact</h1>

          <section className="space-y-4 text-neutral-700 leading-relaxed">
            <p>
              We’d love to hear from you. Send feedback, report bugs, or propose ideas — we read every message.
            </p>
            <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-2 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">Email</h2>
              {siteConfig.contactEmail ? (
                <p className="text-neutral-700">
                  Reach us at{" "}
                  <a
                    href={`mailto:${siteConfig.contactEmail}`}
                    className="text-[#ff5733] hover:underline"
                    rel="noopener"
                  >
                    {siteConfig.contactEmail}
                  </a>
                  .
                </p>
              ) : (
                <p className="text-neutral-700">
                  Email temporarily unavailable — please reach us via X/Twitter or GitHub Issues if listed in the footer.
                </p>
              )}
              <p className="text-sm text-neutral-500">We usually reply within 2–3 business days.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900">Feedback Form</h2>
            <p className="text-neutral-600 text-sm">
              Prefer a quick note? Use the form below to share ideas or report an issue. Submissions are powered by Google
              Forms.
            </p>
            <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLScm8J-cM01J783TEbwnKrHJERfySq41UDR5xiyikS6yI63OGA/viewform?embedded=true"
                width="100%"
                height="700"
                title={`${siteConfig.brandName} feedback form`}
              >
                Loading…
              </iframe>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
