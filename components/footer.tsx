"use client"
import Link from "next/link"
import { siteConfig } from "@/config/siteConfig"
import { billingMode } from "@/config/billing"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const showBillingLinks = billingMode !== "off"
  const supportEmail = siteConfig.contactEmail ?? "support@imagesharpenerai.pro"

  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-display font-bold mb-4 text-[#e63b14]">{siteConfig.brandName}</h3>
            <p className="text-[#555555] text-sm leading-relaxed max-w-md">{siteConfig.tagline}</p>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-4 text-[#1a1a1a]">Info</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  title={`About ${siteConfig.brandName}`}
                  className="text-[#555555] hover:text-[#ff7959] hover:underline transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  title={`Contact ${siteConfig.brandName}`}
                  className="text-[#555555] hover:text-[#ff7959] hover:underline transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-[#1a1a1a]">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/faq"
                  title="FAQ — AI image sharpener help center"
                  className="text-[#555555] hover:text-[#ff7959] hover:underline transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  title="Blog — tutorials and release notes"
                  className="text-[#555555] hover:text-[#ff7959] hover:underline transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          {showBillingLinks ? (
            <div>
              <h4 className="font-semibold mb-4 text-[#1a1a1a]">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/pricing"
                    title="Pricing — plans and billing details"
                    className="text-[#555555] hover:text-[#ff7959] hover:underline transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    title="Terms of Service — usage and license"
                    className="text-[#555555] hover:text-[#ff7959] hover:underline transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    title="Privacy Policy — how we handle your data"
                    className="text-[#555555] hover:text-[#ff7959] hover:underline transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund"
                    title="Refund Policy — how refunds and cancellations work"
                    className="text-[#555555] hover:text-[#ff7959] hover:underline transition-colors"
                  >
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          ) : null}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#555555]">&copy; {currentYear} {siteConfig.brandName}. All rights reserved.</p>
          <p className="text-sm text-[#555555]">
            Support:{" "}
            <a href={`mailto:${supportEmail}`} className="hover:text-[#ff7959] hover:underline transition-colors">
              {supportEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
