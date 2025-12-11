"use client"

import type { ChristmasWallpaper } from "./wallpapers"
import { useUploadUI } from "@/lib/stores/upload-ui"

interface WallpaperDetailActionsProps {
  wallpaper: ChristmasWallpaper
  themeLabel: string
}

export function WallpaperDetailActions({ wallpaper, themeLabel }: WallpaperDetailActionsProps) {
  const { openWithWallpaper } = useUploadUI()

  const handleUnlock4K = () => {
    openWithWallpaper({
      previewSrc: wallpaper.src,
      highResSrc: wallpaper.highResSrc,
      downloadName: wallpaper.downloadName,
    })
  }

  const downloadHref = wallpaper.src || wallpaper.thumbnailSrc

  return (
    <aside className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-[#1a1a1a]">
          {themeLabel} Christmas wallpaper
        </h1>
        <p className="text-xs text-neutral-600">
          Save a quick preview or unlock the full 4K version of this wallpaper.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={downloadHref}
          download={wallpaper.downloadName}
          className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-800 shadow-sm transition hover:border-[#FF6B35]/60 hover:bg-[#FF6B35]/5"
        >
          Download preview
        </a>
        <button
          type="button"
          onClick={handleUnlock4K}
          className="group relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 text-sm font-bold text-white shadow-md shadow-yellow-500/20 border border-yellow-400/50 transition-all duration-300 hover:from-amber-400 hover:to-yellow-300 hover:shadow-lg hover:shadow-yellow-500/40 active:scale-95"
        >
          <span className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            ✨
          </span>
          <span>Unlock 4K</span>
        </button>
      </div>

      <p className="text-[11px] leading-relaxed text-neutral-500">
        The 4K download uses a high-resolution version of this image so it looks crisp on modern
        phones, tablets, and desktop screens.
      </p>
    </aside>
  )
}

