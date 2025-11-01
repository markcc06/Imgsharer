"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // Parse HTML content to extract headings
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, "text/html")
    const headingElements = doc.querySelectorAll("h2, h3")

    const extractedHeadings: Heading[] = Array.from(headingElements).map((heading, index) => {
      const text = heading.textContent || ""
      // Generate ID from text or use existing ID
      const id =
        heading.id ||
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      const level = Number.parseInt(heading.tagName.substring(1))

      // Add ID to actual DOM element if it doesn't have one
      const actualElement = document.querySelector(`h${level}:nth-of-type(${index + 1})`)
      if (actualElement && !actualElement.id) {
        actualElement.id = id
      }

      return { id, text, level }
    })

    setHeadings(extractedHeadings)
  }, [content])

  useEffect(() => {
    // Set up intersection observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-100px 0px -66%",
        threshold: 0,
      },
    )

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // Offset for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      })
      // Update URL without triggering navigation
      window.history.pushState(null, "", `#${id}`)
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="toc-container">
      <div className="toc-content">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Table of Contents</h2>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id} className={cn(heading.level === 3 && "ml-4")}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={cn(
                  "block text-sm transition-colors hover:text-coral",
                  activeId === heading.id ? "text-coral font-medium" : "text-neutral-600",
                  heading.level === 3 && "text-xs",
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
