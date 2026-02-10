import type { Metadata } from "next"
import { billingMode } from "@/config/billing"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Refund Policy | ImgSharer",
  description: "ImgSharer refund policy and terms for paid subscriptions",
  robots: {
    index: billingMode === "live",
    follow: billingMode === "live",
  },
}

export default function RefundPage() {
  if (billingMode === "off") {
    notFound()
  }
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
      <p className="text-sm text-gray-600 mb-8">Last updated: February 10, 2026</p>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Standard Refund Policy</h2>
          <p>
            We offer a 7-day refund period from the date of purchase for all ImgSharer Pro subscriptions, subject to the
            conditions outlined below.
          </p>

          <h3 className="text-xl font-semibold mt-4 mb-2">1.1 Eligibility Criteria</h3>
          <p>To be eligible for a refund, you must meet all of the following conditions:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Request submitted within 7 days of original purchase date</li>
            <li>Usage limited to fewer than 10 image processing operations</li>
            <li>No evidence of abuse or violation of our Terms of Service</li>
            <li>Request sent via email to support@imagesharpenerai.pro with your order number</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">1.2 How to Request a Refund</h3>
          <p>To request a refund:</p>
          <ol className="list-decimal pl-6 mb-4">
            <li>
              Send an email to{" "}
              <a href="mailto:support@imagesharpenerai.pro" className="text-blue-600 hover:underline">
                support@imagesharpenerai.pro
              </a>
            </li>
            <li>Include your Creem order number or transaction ID</li>
            <li>Briefly explain the reason for your refund request</li>
            <li>Allow up to 7 business days for processing</li>
          </ol>
          <p>Approved refunds will be returned to your original payment method through Creem&apos;s payment system.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. EU Consumer Rights</h2>
          <p>
            For customers in the European Union: By clicking &quot;Start Using Pro Features&quot; and accessing paid
            functionality, you explicitly agree to waive your 14-day EU withdrawal right under Directive 2011/83/EU
            Article 16(m). This allows immediate access to digital content.
          </p>
          <p className="mt-2">
            If you do not waive this right, you may exercise your 14-day cooling-off period but will not be able to
            access Pro features during this time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Special Circumstances</h2>
          <p>We may issue full refunds outside the standard 7-day window in the following cases:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Technical Issues:</strong> Persistent technical problems that prevent you from using Pro features,
              and which we are unable to resolve within a reasonable timeframe
            </li>
            <li>
              <strong>Billing Errors:</strong> Duplicate charges, incorrect subscription tier charges, or unauthorized
              transactions
            </li>
            <li>
              <strong>Force Majeure:</strong> Natural disasters, pandemics, or other extraordinary events that prevent
              service usage (documentation may be required)
            </li>
          </ul>
          <p>Special circumstance refunds are evaluated on a case-by-case basis and require supporting documentation.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Abuse Prevention</h2>
          <p>We reserve the right to deny refund requests in cases of:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Multiple refund requests from the same user, email address, or payment method</li>
            <li>Evidence of account sharing, reselling, or commercial abuse</li>
            <li>Bulk account creation or fraudulent activity</li>
            <li>Usage that significantly exceeds stated limits before refund request</li>
          </ul>
          <p>Accounts identified as abusing the refund policy may be permanently banned from future purchases.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Non-Refundable Scenarios</h2>
          <p>Refunds will <strong>not</strong> be issued in the following cases:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Requests made after the 7-day window (except special circumstances outlined in Section 3)</li>
            <li>Change of mind after extensive usage (10+ image operations)</li>
            <li>Subscription renewals (you must cancel before the renewal date to avoid charges)</li>
            <li>Partial subscription periods (we do not offer prorated refunds for unused time)</li>
            <li>Promotional or discounted subscriptions obtained through third-party coupon codes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Processing Time</h2>
          <p>
            Refund requests are typically processed within 7 business days of approval. Depending on your payment
            provider, it may take an additional 5-10 business days for funds to appear in your account.
          </p>
          <p className="mt-2">
            You will receive email confirmation once your refund has been processed through Creem&apos;s system.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Cancellation vs. Refund</h2>
          <p>
            <strong>Important distinction:</strong> Cancelling your subscription prevents future charges but does not
            refund the current period. If you wish to both cancel and receive a refund, you must:
          </p>
          <ol className="list-decimal pl-6 mb-4">
            <li>Submit a refund request per Section 1.2 (if within 7 days and eligible)</li>
            <li>Separately cancel your subscription to prevent auto-renewal</li>
          </ol>
          <ul className="list-disc pl-6 mb-4">
            <li>Approved refunds take effect immediately and Pro access is removed once the refund is confirmed</li>
            <li>Subscription cancellation takes effect at the end of the current billing period</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
          <p>For refund-related questions or concerns, please contact us at:</p>
          <p className="mt-2">
            <strong>Email:</strong>{" "}
            <a href="mailto:support@imagesharpenerai.pro" className="text-blue-600 hover:underline">
              support@imagesharpenerai.pro
            </a>
          </p>
          <p className="mt-2">Please include your order number or transaction ID for faster processing.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Policy Updates</h2>
          <p>
            We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon
            posting to this page. Continued use of ImgSharer after policy changes constitutes acceptance of the updated
            terms.
          </p>
          <p className="mt-2">
            For significant changes, we will notify active subscribers via email at least 7 days before the changes take
            effect.
          </p>
        </section>
      </div>
    </div>
  )
}
