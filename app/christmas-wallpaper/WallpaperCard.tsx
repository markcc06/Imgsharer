"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Share2 } from "lucide-react"

import type { ChristmasWallpaper } from "./wallpapers"
import { useUploadUI } from "@/lib/stores/upload-ui"
import { useToast } from "@/hooks/use-toast"

interface WallpaperCardProps {
  wallpaper: ChristmasWallpaper
  themeLabel: string
  themeSlug: string
}

export function WallpaperCard({ wallpaper, themeLabel, themeSlug }: WallpaperCardProps) {
  const { openWithWallpaper } = useUploadUI()
  const { toast } = useToast()
  const router = useRouter()

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

  const handleOpenDetail = () => {
    router.push(`/christmas-wallpaper/${themeSlug}/${wallpaper.id}`)
  }

  const handleShare = async (event: React.MouseEvent) => {
    event.stopPropagation()
    const path = `/christmas-wallpaper/${themeSlug}/${wallpaper.id}`
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${path}` : path

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
        toast({
          title: "Link copied",
          description: "Wallpaper link is ready to share.",
        })
      } else {
        throw new Error("Clipboard not available")
      }
    } catch {
      toast({
        title: "Unable to copy link",
        description: url,
      })
    }
  }

  return (
    <div
      id={`wallpaper-${wallpaper.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white"
    >
      <div
        className="relative cursor-pointer"
        onClick={handleOpenDetail}
      >
        <button
          type="button"
          onClick={handleShare}
          className="pointer-events-auto absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md transition-opacity duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Copy wallpaper link"
        >
          <Share2 className="h-4 w-4" />
        </button>
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
          className="group relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 text-sm font-bold text-white shadow-md shadow-yellow-500/20 border border-yellow-400/50 transition-all duration-300 hover:from-amber-400 hover:to-yellow-300 hover:shadow-lg hover:shadow-yellow-500/40 active:scale-95"
        >
          <span className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            ✨
          </span>
          <span>Unlock 4K</span>
        </button>
      </div>
    </div>
  )
}
