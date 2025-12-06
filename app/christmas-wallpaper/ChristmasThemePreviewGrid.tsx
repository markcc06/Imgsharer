"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import type { ThemePreview } from "./themePreviews"
import {
  THEME_PREVIEWS,
  getFallbackImages,
  getImageOptionsForTheme,
} from "./themePreviews"

type PreviewWithImage = ThemePreview & {
  previewImage: string
  imageOptions: string[]
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
    const previewImage = resolvedOptions[0] ?? ""

    return {
      ...theme,
      imageOptions: resolvedOptions,
      previewImage,
    }
  })
}

function getDownloadFileName(src: string, slug: string) {
  const parts = src.split("/")
  const original = parts[parts.length - 1] ?? ""
  const extension = original.includes(".") ? original.slice(original.lastIndexOf(".")) : ".png"
  const baseName = slug.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "")
  return `${baseName}${extension}`
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
            href={theme.href}
            className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-neutral-100">
              <Image
                src={theme.previewImage}
                alt={theme.title}
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition group-hover:opacity-100">
                <div className="absolute inset-x-0 bottom-3 flex justify-center">
                  <a
                    href={theme.previewImage}
                    download
                    download={getDownloadFileName(theme.previewImage, theme.slug)}
                    onClick={(event) => event.stopPropagation()}
                    className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#1a1a1a] shadow-md transition hover:bg-white"
                  >
                    Download
                  </a>
                </div>
              </div>
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
