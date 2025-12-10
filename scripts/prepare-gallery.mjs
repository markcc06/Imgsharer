#!/usr/bin/env node

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const PUBLIC_DIR = path.join(ROOT, "public")
const WALLPAPERS_ROOT = path.join(PUBLIC_DIR, "wallpapers")
const OUTPUT_FILE = path.join(ROOT, "app", "christmas-wallpaper", "wallpapers.ts")

/**
 * THEMES maps the logical slug used in routes to the actual
 * folder name under public/wallpapers.
 *
 * NOTE: Folder names must match the real directory names exactly.
 */
const THEMES = [
  {
    slug: "cute-wallpaper-for-christmas",
    dir: "Cozy Christmas wallpapers",
    code: "cozy-christmas",
  },
  {
    slug: "winter-cabin-at-night",
    dir: "Cyber Steam-Punk wallpapers",
    code: "cyber-steam-punk",
  },
  {
    slug: "christmas-tree-lights",
    dir: "Christmas Tree wallpapers",
    code: "christmas-tree",
  },
  {
    slug: "ice-castle-queen",
    dir: "Horror Christmas wallpapers",
    code: "horror-christmas",
  },
  {
    slug: "cosmic-space-christmas",
    dir: "Cosmic Christmas wallpapers",
    code: "cosmic-christmas",
  },
  {
    slug: "cute-christmas-robots",
    dir: "Cute Robots wallpapers",
    code: "cute-robots",
  },
  {
    slug: "pastel-candy-christmas",
    dir: "Pastel Candy wallpapers",
    code: "pastel-candy",
  },
  {
    slug: "snowy-forest-aesthetic",
    dir: "Snow Aesthetic wallpapers",
    code: "snow-aesthetic",
  },
]

const VALID_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"])

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function getSourceDir(themeDir) {
  const highResDir = path.join(WALLPAPERS_ROOT, themeDir, "high-res")
  const fallbackDir = path.join(WALLPAPERS_ROOT, themeDir)

  if (await exists(highResDir)) {
    return { dir: highResDir, isHighRes: true }
  }

  if (await exists(fallbackDir)) {
    console.warn(
      `[prepare-gallery] Warning: high-res directory missing for "${themeDir}". Using base folder as source.`,
    )
    return { dir: fallbackDir, isHighRes: false }
  }

  console.warn(`[prepare-gallery] Warning: no source directory for "${themeDir}". Skipping theme.`)
  return null
}

async function getFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => VALID_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "en"))
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function buildWallpapers() {
  const wallpapers = []

  for (const theme of THEMES) {
    const sourceInfo = await getSourceDir(theme.dir)
    if (!sourceInfo) continue

    const { dir: sourceDir, isHighRes } = sourceInfo
    const files = await getFiles(sourceDir)

    if (files.length === 0) {
      console.warn(`[prepare-gallery] Warning: no image files found in "${sourceDir}".`)
      continue
    }

    const previewDir = path.join(WALLPAPERS_ROOT, theme.dir, "preview")
    const thumbnailDir = path.join(WALLPAPERS_ROOT, "thumbnails", theme.dir)

    await ensureDir(previewDir)
    await ensureDir(thumbnailDir)

    let index = 0

    for (const file of files) {
      index += 1
      const ext = path.extname(file) || ".png"
      const baseName = file.slice(0, -ext.length)

      // Build a stable, human-friendly slug for filenames:
      // use the explicit theme code when provided, otherwise fall back to the theme slug.
      const themeBase = theme.code ? theme.code : slugify(theme.slug)
      const numeric = String(index).padStart(2, "0")
      const slugBase = `${themeBase}-${numeric}`

      const id = slugBase
      const downloadName = `${slugBase}${ext.toLowerCase()}`

      const sourceAbsolute = path.join(sourceDir, file)

      const previewFileName = `${slugBase}${ext.toLowerCase()}`
      const previewAbsolute = path.join(previewDir, previewFileName)
      const previewRelative = path
        .join("/wallpapers", theme.dir, "preview", previewFileName)
        .replace(/\\/g, "/")

      const thumbnailFileName = `${slugBase}.webp`
      const thumbnailAbsolute = path.join(thumbnailDir, thumbnailFileName)
      const thumbnailRelative = path
        .join("/wallpapers", "thumbnails", theme.dir, thumbnailFileName)
        .replace(/\\/g, "/")

      const highResRelative = path
        .join(
          "/wallpapers",
          theme.dir,
          isHighRes ? "high-res" : "",
          isHighRes ? file : baseName + ext,
        )
        .replace(/\\/g, "/")
        .replace(/\/+/g, "/")

      try {
        // Preview: 1080px wide, slight blur, quality 80
        await sharp(sourceAbsolute)
          .resize({ width: 1080, withoutEnlargement: true })
          .blur(2)
          .jpeg({ quality: 80 })
          .toFile(previewAbsolute)
      } catch (error) {
        console.warn(`[prepare-gallery] Failed to create preview for "${sourceAbsolute}":`, error)
      }

      try {
        // Thumbnail: 500px width
        await sharp(sourceAbsolute)
          .resize({ width: 500, withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(thumbnailAbsolute)
      } catch (error) {
        console.warn(`[prepare-gallery] Failed to create thumbnail for "${sourceAbsolute}":`, error)
      }

      wallpapers.push({
        id,
        src: previewRelative,
        highResSrc: highResRelative,
        thumbnailSrc: thumbnailRelative,
        downloadName,
        themes: [theme.slug],
      })
    }
  }

  return wallpapers
}

function buildFileContent(wallpapers) {
  const entries = wallpapers
    .map(
      (wallpaper) => `  {
    id: "${wallpaper.id}",
    src: "${wallpaper.src}",
    highResSrc: "${wallpaper.highResSrc}",
    thumbnailSrc: "${wallpaper.thumbnailSrc}",
    downloadName: "${wallpaper.downloadName}",
    themes: ["${wallpaper.themes[0]}"],
  }`,
    )
    .join(",\n")

  return `export interface ChristmasWallpaper {
  id: string
  src: string
  highResSrc: string
  thumbnailSrc: string
  downloadName: string
  themes: string[]
}

export const CHRISTMAS_WALLPAPERS: ChristmasWallpaper[] = [
${entries}
]
`
}

async function main() {
  try {
    const wallpapers = await buildWallpapers()

    if (wallpapers.length === 0) {
      console.warn(
        "[prepare-gallery] No wallpapers found. Skipping manifest update so existing data remains intact.",
      )
      return
    }

    const fileContent = buildFileContent(wallpapers)
    await fs.writeFile(OUTPUT_FILE, fileContent, "utf8")
    console.log(
      `[prepare-gallery] Updated ${path.relative(ROOT, OUTPUT_FILE)} with ${wallpapers.length} wallpapers.`,
    )
  } catch (error) {
    console.error("[prepare-gallery] Unexpected error:", error)
    process.exitCode = 1
  }
}

main()
