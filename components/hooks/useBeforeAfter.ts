"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"

export function useBeforeAfter(initialPosition = 40) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(percentage)
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true)
      updatePosition(e.clientX)
    },
    [updatePosition],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging) return
      updatePosition(e.clientX)
    },
    [isDragging, updatePosition],
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      setPosition((prev) => Math.max(0, prev - 2))
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      setPosition((prev) => Math.min(100, prev + 2))
    } else if (e.key === "Escape") {
      const target = e.currentTarget as HTMLElement | null
      target?.blur()
    }
  }, [])

  const handleMobileToggle = useCallback(() => {
    setPosition((prev) => (prev < 50 ? 70 : 30))
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
      return () => {
        window.removeEventListener("pointermove", handlePointerMove)
        window.removeEventListener("pointerup", handlePointerUp)
      }
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  return {
    position,
    isDragging,
    isMobile,
    containerRef,
    handlePointerDown,
    handleKeyDown,
    handleMobileToggle,
  }
}
