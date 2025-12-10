"use client"

import Image from "next/image"

import type { ChristmasWallpaper } from "./wallpapers"
import { useUploadUI } from "@/lib/stores/upload-ui"

interface WallpaperCardProps {
  wallpaper: ChristmasWallpaper
  themeLabel: string
}

export function WallpaperCard({ wallpaper, themeLabel }: WallpaperCardProps) {
  const { openWithWallpaper } = useUploadUI()

  const handleUnlock4K = () => {
    openWithWallpaper({
      previewSrc: wallpaper.src,
      highResSrc: wallpaper.highResSrc,
      downloadName: wallpaper.downloadName,
    })
  }

  // Regular download: use the preview image so Unlock 4K clearly feels like an upgrade.
  const downloadHref = wallpaper.src || wallpaper.thumbnailSrc
  const altText = `${themeLabel} Christmas wallpaper`

  return (
    <div
      id={`wallpaper-${wallpaper.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white"
    >
      <div className="relative">
        <Image
          src={wallpaper.thumbnailSrc || wallpaper.src}
          alt={altText}
          width={640}
          height={960}
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
          <div className="absolute inset-x-0 bottom-3 flex justify-center px-2">
            <a
              href={downloadHref}
              download={wallpaper.downloadName}
              className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#1a1a1a] shadow-md transition hover:bg-white"
            >
              Download
            </a>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-2">
        <p className="text-xs text-neutral-600 truncate">{themeLabel}</p>
        <button
          type="button"
          onClick={handleUnlock4K}
          className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-medium text-neutral-800 shadow-sm transition hover:border-[#FF6B35]/60 hover:bg-[#FF6B35]/5"
        >
          <span>✨</span>
          <span>Unlock 4K</span>
        </button>
      </div>
    </div>
  )
}
