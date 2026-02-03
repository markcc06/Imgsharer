import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"
import { siteConfig } from "@/config/siteConfig"

export const metadata: Metadata = {
  title: `Terms of Service - ${siteConfig.brandName}`,
  description: `Terms of Service for using ${siteConfig.brandName}'s AI image sharpening service.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/terms`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `Terms of Service - ${siteConfig.brandName}`,
    description: `Terms of Service for using ${siteConfig.brandName}'s AI image sharpening service.`,
    url: `${siteConfig.siteUrl}/terms`,
  },
  twitter: {
    card: "summary",
    title: `Terms of Service - ${siteConfig.brandName}`,
    description: `Terms of Service for using ${siteConfig.brandName}'s AI image sharpening service.`,
  },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-8">Terms of Service</h1>
          <p className="text-sm text-neutral-500 mb-8">Last updated: January 26, 2026</p>

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
              <a href="mailto:support@imagesharpenerai.pro" className="text-coral hover:underline">
                support@imagesharpenerai.pro
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Paid Features &amp; Subscriptions</h2>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8.1 Pricing Tiers</h3>
            <ul className="list-disc pl-6 text-neutral-600 space-y-2 mb-4">
              <li>
                <strong>Early Bird:</strong> $2.99 USD per month (limited to first 50 customers)
              </li>
              <li>
                <strong>Standard:</strong> $4.99 USD per month (after Early Bird sold out)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8.2 Payment Processing</h3>
            <p className="text-neutral-600 leading-relaxed mb-4">
              All payments are processed by Creem, our authorized payment service provider. By purchasing a subscription,
              you agree to Creem&apos;s Terms of Service and Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8.3 Subscription Terms</h3>
            <ul className="list-disc pl-6 text-neutral-600 space-y-2 mb-4">
              <li>Subscriptions automatically renew annually unless cancelled before the renewal date</li>
              <li>
                You can cancel your subscription at any time through your account settings or by contacting
                support@imagesharpenerai.pro
              </li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>No refunds for partial subscription periods unless specified in our Refund Policy</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8.4 Feature Access</h3>
            <ul className="list-disc pl-6 text-neutral-600 space-y-2 mb-4">
              <li>Free users: 2x/4x upscaling, 3 images per day, watermarked output</li>
              <li>Pro users: 6x/8x upscaling, unlimited images, no watermark, priority processing</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8.5 Refund Policy</h3>
            <p className="text-neutral-600 leading-relaxed mb-4">
              For refund terms and conditions, please see our Refund Policy at /refund
            </p>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8.6 Price Changes</h3>
            <p className="text-neutral-600 leading-relaxed">
              We reserve the right to modify subscription prices with 30 days&apos; notice to active subscribers. Price
              changes do not affect current subscription periods.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
