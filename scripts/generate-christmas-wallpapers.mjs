#!/usr/bin/env node

import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const PUBLIC_WALLPAPER_DIR = path.join(ROOT, "public", "wallpapers")
const THUMBNAIL_ROOT = path.join(PUBLIC_WALLPAPER_DIR, "thumbnails")
const OUTPUT_FILE = path.join(ROOT, "app", "christmas-wallpaper", "wallpapers.ts")

const THEME_DIRECTORIES = [
  {
    dir: "Cozy Christmas wallpapers",
    slug: "cute-wallpaper-for-christmas",
    altText: "Cozy Christmas wallpaper",
  },
  {
    dir: "Cyber Steam-Punk wallpapers",
    slug: "winter-cabin-at-night",
    altText: "Cyber Steam-Punk Christmas wallpaper",
  },
  {
    dir: "Christmas Tree wallpapers",
    slug: "christmas-tree-lights",
    altText: "Christmas Tree wallpaper",
  },
  {
    dir: "Horror Christmas wallpapers",
    slug: "ice-castle-queen",
    altText: "Horror Christmas wallpaper",
  },
  {
    dir: "Cosmic Christmas wallpapers",
    slug: "cosmic-space-christmas",
    altText: "Cosmic Christmas wallpaper",
  },
  {
    dir: "Cute Robots wallpapers",
    slug: "cute-christmas-robots",
    altText: "Cute Robots Christmas wallpaper",
  },
  {
    dir: "Pastel Candy wallpapers",
    slug: "pastel-candy-christmas",
    altText: "Pastel Candy Christmas wallpaper",
  },
  {
    dir: "Snow Aesthetic wallpapers",
    slug: "snowy-forest-aesthetic",
    altText: "Snow Aesthetic Christmas wallpaper",
  },
]

const VALID_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"])

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

async function getFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => VALID_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, "en"))
  } catch (error) {
    console.error(`Failed to read directory: ${dir}`, error)
    return []
  }
}

async function buildWallpaperData() {
  const wallpapers = []
  const downloadCounters = new Map()

  for (const theme of THEME_DIRECTORIES) {
    const themeDir = path.join(PUBLIC_WALLPAPER_DIR, theme.dir)
    const thumbnailDir = path.join(THUMBNAIL_ROOT, theme.dir)
    await fs.mkdir(thumbnailDir, { recursive: true })
    const files = await getFiles(themeDir)

    for (const file of files) {
      const absoluteFilePath = path.join(themeDir, file)
      const baseName = slugify(file.replace(/\.[^.]+$/, ""))
      const thumbnailFileName = `${baseName}.webp`
      const thumbnailAbsolutePath = path.join(thumbnailDir, thumbnailFileName)
      const thumbnailRelativePath = `/wallpapers/thumbnails/${theme.dir}/${thumbnailFileName}`
      const extension = path.extname(file) || ".png"
      const downloadCount = (downloadCounters.get(theme.slug) ?? 0) + 1
      downloadCounters.set(theme.slug, downloadCount)
      const downloadName = `${theme.slug}-${String(downloadCount).padStart(2, "0")}${extension}`

      try {
        const thumbnailExists = await fs
          .access(thumbnailAbsolutePath)
          .then(() => true)
          .catch(() => false)

        if (!thumbnailExists) {
          await sharp(absoluteFilePath)
            .resize({ width: 800, height: 1200, fit: "inside", withoutEnlargement: true })
            .toFormat("webp", { quality: 70 })
            .toFile(thumbnailAbsolutePath)
        }
      } catch (error) {
        console.warn(`Failed to generate thumbnail for ${absoluteFilePath}`, error)
      }

      let blurDataURL = ""
      try {
        const blurBuffer = await sharp(absoluteFilePath)
          .resize({ width: 24 })
          .toFormat("webp", { quality: 40 })
          .toBuffer()
        blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`
      } catch (error) {
        console.warn(`Failed to generate blur placeholder for ${absoluteFilePath}`, error)
      }

      wallpapers.push({
        id: `${theme.slug}-${slugify(file)}`,
        src: `/wallpapers/${theme.dir}/${file}`,
        thumbnailSrc: thumbnailRelativePath,
        blurDataURL,
        downloadName,
        alt: `AI-generated ${theme.altText}`,
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
    thumbnailSrc: "${wallpaper.thumbnailSrc}",
    blurDataURL: "${wallpaper.blurDataURL}",
    downloadName: "${wallpaper.downloadName}",
    alt: "${wallpaper.alt}",
    themes: ["${wallpaper.themes[0]}"],
  }`,
    )
    .join(",\n")

  return `export type ChristmasWallpaper = {
  id: string
  src: string
  thumbnailSrc: string
  blurDataURL: string
  downloadName: string
  alt: string
  themes: string[]
}

export const CHRISTMAS_WALLPAPERS: ChristmasWallpaper[] = [
${entries}
]
`
}

async function main() {
  const wallpapers = await buildWallpaperData()
  const fileContent = buildFileContent(wallpapers)
  await fs.writeFile(OUTPUT_FILE, fileContent)
  console.log(`Updated ${OUTPUT_FILE} with ${wallpapers.length} wallpapers.`)
}

main().catch((error) => {
  console.error("Failed to generate wallpapers.ts", error)
  process.exit(1)
})
