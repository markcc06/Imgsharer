"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"

import { CHRISTMAS_WALLPAPERS } from "@/app/christmas-wallpaper/wallpapers"
import { useUploadUI } from "@/lib/stores/upload-ui"

export function WallpaperDeepLinker() {
  const searchParams = useSearchParams()
  const { openWithWallpaper } = useUploadUI()
  const hasOpenedRef = useRef(false)

  useEffect(() => {
    if (hasOpenedRef.current) return

    const imgParam = searchParams.get("img")
    if (!imgParam) return

    const decoded = decodeURIComponent(imgParam)

    const match = CHRISTMAS_WALLPAPERS.find(
      (wallpaper) => wallpaper.id === decoded || wallpaper.downloadName === decoded,
    )

    if (!match) return

    openWithWallpaper({
      previewSrc: match.src,
      highResSrc: match.highResSrc,
      downloadName: match.downloadName,
    })

    hasOpenedRef.current = true
  }, [searchParams, openWithWallpaper])

  return null
}
