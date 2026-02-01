"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/siteConfig"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

function SparklesIcon() {
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
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}

const navLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/christmas-wallpaper", label: "Christmas Wallpaper" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const mobileNav = [{ href: "/", label: "Home" }, ...navLinks]

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "backdrop-blur-md border-b",
        isScrolled ? "bg-white/90 border-neutral-200" : "bg-white/60 border-white/20",
      )}
    >
      <div className="container-custom relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            title={`${siteConfig.brandName} — AI image sharpener homepage`}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ff5733] flex items-center justify-center text-white group-hover:bg-[#ff7959] transition-colors">
              <SparklesIcon />
            </div>
            <span className="text-xl font-display font-bold text-[#ff5733] group-hover:text-[#ff7959] transition-colors">
              {siteConfig.brandName}
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                title={`${link.label} — ${siteConfig.brandName}`}
                className="text-sm font-medium text-neutral-600 hover:text-[#ff7959] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <SignedOut>
              <SignInButton mode="modal" redirectUrl={typeof window !== "undefined" ? window.location.href : "/"}>
                <button className="ml-2 rounded-full border border-[#ff5733] px-4 py-2 text-sm font-semibold text-[#ff5733] bg-white/80 hover:bg-[#ff5733]/10 transition-colors shadow-sm">
                  Sign in / Get Pro
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/70 px-3 py-2 text-[#ff5733] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5733]"
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span className="sr-only">{isMenuOpen ? "Close navigation" : "Open navigation"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen ? (
          <div className="md:hidden absolute left-0 right-0 top-full mt-2 px-4 pb-4">
            <div className="rounded-2xl border border-white/60 bg-white/95 shadow-lg shadow-black/5">
              <div className="flex flex-col divide-y divide-neutral-200">
                {mobileNav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 text-sm font-semibold text-neutral-700 hover:text-[#ff5733] focus-visible:bg-neutral-50"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
    {isMenuOpen ? <div className="md:hidden fixed inset-0 z-40 bg-black/10" onClick={closeMenu} /> : null}
    </>
  )
}
