"use client"

import type React from "react"
import { useState } from "react"
import { Reveal } from "./reveal"
import { BlurPanel } from "./blur-panel"
import { AnimatedText } from "./animated-text"
import Link from "next/link"
import { billingLive } from "@/config/billing"

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isValid, setIsValid] = useState(true)

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateEmail(email)) {
      setIsSubmitted(true)
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }

  return (
    <section className="py-20 lg:py-32 bg-neutral-50">
      <div className="container-custom">
        <Reveal>
          <div className="max-w-2xl mx-auto">
            <BlurPanel className="p-8 lg:p-12 bg-white/40 backdrop-blur-md grain-texture">
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-[#e63b14] mb-4">
                  <AnimatedText text="Stay updated on " delay={0.2} />
                  <span className="italic font-light text-[#ff7959]">
                    <AnimatedText text="AI imaging." delay={0.5} />
                  </span>
                </h2>
                <p className="text-lg text-neutral-600">
                  Be the first to discover new features, AI insights, and exclusive tips for better image enhancement.
                </p>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MailIcon className="text-neutral-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setIsValid(true)
                      }}
                      placeholder="Enter your email address"
                      className={`w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border rounded-full text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        !isValid ? "border-red-300 focus:ring-red-500" : "border-[#ffe0d3] focus:ring-[#ff5733]"
                      }`}
                    />
                  </div>

                  {!isValid && (
                    <p className="text-sm text-red-600 text-center transition-all duration-200">
                      Please enter a valid email address
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#ff5733] text-white py-4 rounded-full font-medium hover:bg-[#ff7959] active:bg-[#e63b14] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Subscribe to Newsletter
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 transition-all duration-300">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">Welcome to Imgsharer</h3>
                  <p className="text-neutral-600">
                    Thank you for subscribing. You'll receive our next newsletter with exclusive insights and AI imaging
                    tips.
                  </p>
                </div>
              )}

              <p className="text-xs text-neutral-500 text-center mt-6">
                We respect your privacy. Unsubscribe at any time.
                {billingLive ? (
                  <>
                    {" "}
                    Read our{" "}
                    <Link href="/privacy" className="underline hover:text-[#ff5733] transition-colors">
                      Privacy Policy
                    </Link>
                    .
                  </>
                ) : null}
              </p>
            </BlurPanel>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
