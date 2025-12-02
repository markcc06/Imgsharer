"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/siteConfig"

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

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "backdrop-blur-md border-b",
        isScrolled ? "bg-white/90 border-neutral-200" : "bg-white/60 border-white/20",
      )}
    >
      <div className="container-custom">
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
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/faq"
              title="FAQ — AI image sharpener help center"
              className="text-sm font-medium text-neutral-600 hover:text-[#ff7959] transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/blog"
              title="Blog — tutorials and release notes"
              className="text-sm font-medium text-neutral-600 hover:text-[#ff7959] transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/about"
              title={`About ${siteConfig.brandName}`}
              className="text-sm font-medium text-neutral-600 hover:text-[#ff7959] transition-colors"
            >
              About
            </Link>
            <Link
              href="/christmas-wallpaper"
              title="Wallpaper Hub — seasonal AI wallpaper generator"
              className="text-sm font-medium text-neutral-600 hover:text-[#ff7959] transition-colors"
            >
              Wallpaper Hub
            </Link>
            <Link
              href="/contact"
              title={`Contact ${siteConfig.brandName}`}
              className="text-sm font-medium text-neutral-600 hover:text-[#ff7959] transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
