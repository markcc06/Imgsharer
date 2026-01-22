import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"
import { siteConfig } from "@/config/siteConfig"

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.brandName}`,
  description: `Privacy Policy for ${siteConfig.brandName}'s AI image sharpening service.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/privacy`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `Privacy Policy - ${siteConfig.brandName}`,
    description: `Privacy Policy for ${siteConfig.brandName}'s AI image sharpening service.`,
    url: `${siteConfig.siteUrl}/privacy`,
  },
  twitter: {
    card: "summary",
    title: `Privacy Policy - ${siteConfig.brandName}`,
    description: `Privacy Policy for ${siteConfig.brandName}'s AI image sharpening service.`,
  },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-8">Privacy Policy</h1>
          <p className="text-sm text-neutral-500 mb-8">Last updated: January 28, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Information We Collect</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              We collect minimal information necessary to provide our service:
            </p>
            <ul className="list-disc pl-6 text-neutral-600 space-y-2">
              <li>IP addresses for rate limiting purposes</li>
              <li>Usage statistics (anonymous)</li>
              <li>Technical information about your browser and device</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Image Processing</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Your uploaded images are processed in real-time and are NOT stored on our servers. Images are immediately
              discarded after processing is complete. We do not retain, analyze, or use your images for any purpose
              other than providing the sharpening service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Third-Party Services</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              We use Stability AI for image processing. Your images are sent to their API for processing and are subject
              to their privacy policy. Stability AI does not store images processed through their API.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Cookies and Tracking</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              We use minimal cookies for essential functionality only. We do not use tracking cookies or third-party
              analytics.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Data Security</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data during transmission. All
              communications are encrypted using HTTPS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Your Rights</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Since we don't store your images or personal data, there is no data to access, modify, or delete. Rate
              limiting data is automatically purged after 24 hours.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Changes to This Policy</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              We may update this privacy policy from time to time. We will notify users of any material changes by
              updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Contact Us</h2>
            <p className="text-neutral-600 leading-relaxed">
              If you have questions about this Privacy Policy, contact us at{" "}
              {siteConfig.contactEmail ? (
                <a href={`mailto:${siteConfig.contactEmail}`} className="text-coral hover:underline">
                  {siteConfig.contactEmail}
                </a>
              ) : (
                <a href="/contact" className="text-coral hover:underline">
                  our contact page
                </a>
              )}
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
