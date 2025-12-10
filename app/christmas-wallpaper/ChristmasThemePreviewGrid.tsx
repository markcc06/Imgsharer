"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import type { ChristmasWallpaper } from "./wallpapers"
import type { ThemePreview } from "./themePreviews"
import {
  THEME_PREVIEWS,
  getFallbackImages,
  getImageOptionsForTheme,
} from "./themePreviews"

type PreviewWithImage = ThemePreview & {
  previewImage: ChristmasWallpaper
  imageOptions: ChristmasWallpaper[]
}

function getRandomItem<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function createInitialPreviews(): PreviewWithImage[] {
  return THEME_PREVIEWS.map((theme) => {
    const options = getImageOptionsForTheme(theme.slug)
    const resolvedOptions = options.length > 0 ? options : getFallbackImages(theme.slug)
    const fallbackThumbnail = theme.fallbackImages?.[0] ?? "/wallpapers/christmas-phone-cozy.png"
    const previewImage = resolvedOptions[0] ?? {
      id: `${theme.slug}-placeholder`,
      src: fallbackThumbnail,
      highResSrc: fallbackThumbnail,
      thumbnailSrc: fallbackThumbnail,
      downloadName: `${theme.slug}.png`,
      themes: [theme.slug],
    }

    return {
      ...theme,
      imageOptions: resolvedOptions,
      previewImage,
    }
  })
}

export function ChristmasThemePreviewGrid() {
  const [previews, setPreviews] = useState<PreviewWithImage[]>(() => createInitialPreviews())

  useEffect(() => {
    const randomized = shuffleArray(createInitialPreviews()).map((preview) => {
      const previewImage =
        getRandomItem(preview.imageOptions) ?? preview.previewImage

      return {
        ...preview,
        previewImage,
      }
    })

    setPreviews(randomized)
  }, [])

  return (
    <section id="featured-wallpapers" className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1a1a1a] md:text-xl">
            Featured Christmas wallpapers from each theme
          </h2>
          <p className="mt-1 text-xs text-neutral-600 md:text-sm">
            Get a quick glimpse of every style. Tap a card to open the full collection for that theme.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {previews.map((theme) => (
          <Link
            key={theme.slug}
            href={`${theme.href}#wallpaper-${theme.previewImage.id}`}
            className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-neutral-100">
              <Image
                src={theme.previewImage.thumbnailSrc || theme.previewImage.src}
                alt={theme.title}
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </div>

            <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2">
              <h3 className="text-sm font-semibold text-[#1a1a1a]">{theme.title}</h3>
              <p className="line-clamp-2 text-xs text-neutral-600">{theme.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
