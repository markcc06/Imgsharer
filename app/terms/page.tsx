import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Imgsharer",
  description: "Terms of Service for using Imgsharer's AI image sharpening service.",
  robots: {
    index: false,
    follow: true,
  },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-8">Terms of Service</h1>
          <p className="text-sm text-neutral-500 mb-8">Last updated: January 28, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              By accessing and using Imgsharer, you accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Use License</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Permission is granted to temporarily use Imgsharer for personal and commercial image enhancement purposes.
              This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. User Responsibilities</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">You agree to:</p>
            <ul className="list-disc pl-6 text-neutral-600 space-y-2">
              <li>Only upload images you own or have permission to use</li>
              <li>Not upload illegal, offensive, or copyrighted content</li>
              <li>Respect the rate limits set by our service</li>
              <li>Not attempt to abuse or exploit our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Privacy and Data</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              We do not store your uploaded images. All images are processed in real-time and immediately discarded
              after processing. See our Privacy Policy for more details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Service Limitations</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              We reserve the right to limit usage through rate limiting and may modify or discontinue the service at any
              time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Disclaimer</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              The service is provided "as is" without warranties of any kind. We do not guarantee specific results from
              image sharpening.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Contact</h2>
            <p className="text-neutral-600 leading-relaxed">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@imgsharer.example" className="text-coral hover:underline">
                legal@imgsharer.example
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
