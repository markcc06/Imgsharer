"use client"
import { useRef, useEffect, useState } from "react"
import type React from "react"
import Image from "next/image"
import { useUploadUI } from "@/lib/stores/upload-ui"
import { uploaderBridge } from "@/lib/uploader-bridge"

export default function HeroBgBeforeAfter({
  src,
  afterSrc,
  alt = "Professional portrait of an elegant Caucasian woman, landscape 16:9",
  initial = 50,
}: { src: string; afterSrc?: string; alt?: string; initial?: number }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [cut, setCut] = useState(initial)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const animationFrameRef = useRef<number | null>(null)
  const lastInteractionTimeRef = useRef<number>(Date.now())
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const animationStateRef = useRef({
    startTime: 0,
    direction: 1,
    pauseUntil: 0,
  })

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    el.style.setProperty("--cut", `${cut}%`)
  }, [cut])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const animate = (timestamp: number) => {
      if (!isAutoPlaying || !isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      const state = animationStateRef.current

      if (state.pauseUntil > timestamp) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      if (state.startTime === 0) {
        state.startTime = timestamp
      }

      const elapsed = timestamp - state.startTime
      const duration = 6000
      const progress = Math.min(elapsed / duration, 1)

      const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
      const easedProgress = easeInOut(progress)

      const minPos = 15
      const maxPos = 85
      let newCut: number

      if (state.direction === 1) {
        newCut = minPos + (maxPos - minPos) * easedProgress
      } else {
        newCut = maxPos - (maxPos - minPos) * easedProgress
      }

      setCut(newCut)

      if (progress >= 1) {
        state.pauseUntil = timestamp + 2000
        state.direction *= -1
        state.startTime = 0
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isAutoPlaying, isVisible])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now()
      const timeSinceLastInteraction = now - lastInteractionTimeRef.current

      if (timeSinceLastInteraction >= 3000 && !isAutoPlaying) {
        setIsAutoPlaying(true)
        animationStateRef.current.startTime = 0
      }
    }

    const intervalId = setInterval(checkInactivity, 500)
    return () => clearInterval(intervalId)
  }, [isAutoPlaying])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAutoPlaying(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let dragging = false
    const toPct = (clientX: number) => {
      const r = root.getBoundingClientRect()
      const pct = ((clientX - r.left) / r.width) * 100
      return Math.max(10, Math.min(90, pct))
    }
    const onDown = (e: MouseEvent | TouchEvent) => {
      dragging = true
      setIsAutoPlaying(false)
      lastInteractionTimeRef.current = Date.now()
      const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      setCut(toPct(x))
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return
      const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      requestAnimationFrame(() => setCut(toPct(x)))
    }
    const onUp = () => {
      dragging = false
      lastInteractionTimeRef.current = Date.now()
    }

    root.addEventListener("mousedown", onDown, { passive: true })
    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseup", onUp, { passive: true })
    root.addEventListener("touchstart", onDown, { passive: true })
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("touchend", onUp, { passive: true })
    return () => {
      root.removeEventListener("mousedown", onDown)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      root.removeEventListener("touchstart", onDown)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onUp)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        setIsAutoPlaying(false)
        lastInteractionTimeRef.current = Date.now()
        setCut((c) => Math.max(10, c - (e.shiftKey ? 8 : 2)))
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        setIsAutoPlaying(false)
        lastInteractionTimeRef.current = Date.now()
        setCut((c) => Math.min(90, c + (e.shiftKey ? 8 : 2)))
      } else if (e.key === "Home") {
        e.preventDefault()
        setIsAutoPlaying(false)
        lastInteractionTimeRef.current = Date.now()
        setCut(10)
      } else if (e.key === "End") {
        e.preventDefault()
        setIsAutoPlaying(false)
        lastInteractionTimeRef.current = Date.now()
        setCut(90)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const divider = root.querySelector<HTMLDivElement>("[data-divider]")
    const fg = document.querySelector<HTMLElement>("[data-hero-foreground]")
    if (!divider || !fg) return
    const update = () => {
      const dr = divider.getBoundingClientRect()
      const fr = fg.getBoundingClientRect()
      const dx = Math.min(Math.abs(dr.left - fr.left), Math.abs(dr.left - fr.right))
      const op = dx < 8 ? 0 : dx < 16 ? (dx - 8) / 8 : 1
      divider.style.opacity = String(op)
    }
    const id = setInterval(update, 50)
    window.addEventListener("resize", update)
    update()
    return () => {
      clearInterval(id)
      window.removeEventListener("resize", update)
    }
  }, [])

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    useUploadUI.getState().open()
    // Wait a tick for the modal to render, then trigger picker
    setTimeout(() => {
      uploaderBridge.pick?.()
    }, 100)
  }

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-10 overflow-hidden"
      style={{ "--cut": "50%" } as React.CSSProperties}
      aria-label={alt}
      role="img"
    >
      <img
        src={src || "/placeholder.svg"}
        alt="AI image sharpener hero background with vintage portrait"
        title="AI image sharpener hero background"
        className="sr-only"
        itemProp="image"
      />

      <div
        className="absolute inset-0 w-full h-full"
        style={{ minWidth: "120%", minHeight: "120%", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <Image
          src={src || "/placeholder.svg"}
          alt="AI image sharpener hero background with vintage portrait"
          title="AI image sharpener hero background"
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover select-none will-change-[filter]"
          style={{
            objectFit: "cover",
            objectPosition: "center 35%",
            filter: "blur(10px)",
          }}
        />
      </div>

      <div
        className="absolute inset-0 w-full h-full"
        style={{ minWidth: "120%", minHeight: "120%", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      >
        {afterSrc ? (
          <img
            src={afterSrc || "/placeholder.svg"}
            alt="AI image sharpener hero background with vintage portrait"
            title="AI image sharpener hero background"
            className="pointer-events-none object-cover select-none will-change-[clip-path] w-full h-full"
            style={{
              objectFit: "cover",
              objectPosition: "center 35%",
              clipPath: "polygon(var(--cut) 0%, 100% 0%, 100% 100%, var(--cut) 100%)",
            }}
          />
        ) : (
          <Image
            src={src || "/placeholder.svg"}
            alt="AI image sharpener hero background with vintage portrait"
            title="AI image sharpener hero background"
            fill
            priority
            sizes="100vw"
            className="pointer-events-none object-cover select-none will-change-[clip-path]"
            style={{
              objectFit: "cover",
              objectPosition: "center 35%",
              clipPath: "polygon(var(--cut) 0%, 100% 0%, 100% 100%, var(--cut) 100%)",
              filter: "contrast(1.06) saturate(1.08) brightness(1.02)",
            }}
          />
        )}
      </div>

      <div
        className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white"
        aria-hidden="true"
      >
        Before
      </div>
      <div
        className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white"
        aria-hidden="true"
      >
        After
      </div>

      <div
        data-divider
        className="absolute top-0 bottom-0 w-[3px] bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.25)] transition-opacity duration-200 ease-out will-change-[opacity,transform] z-20"
        style={{ left: "var(--cut)" }}
      >
        <button
          aria-label="Adjust comparison"
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-7 w-7 md:h-8 md:w-8 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 rounded-full bg-white text-black shadow-lg ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-grab active:cursor-grabbing flex items-center justify-center"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-neutral-700">
            <path
              d="M6 4L2 8L6 12M10 4L14 8L10 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        className="absolute inset-0 z-30 cursor-pointer"
        onClick={handleUploadClick}
        aria-label="Click to upload image"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleUploadClick(e as any)
          }
        }}
      />
    </div>
  )
}
