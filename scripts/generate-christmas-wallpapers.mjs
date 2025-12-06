#!/usr/bin/env node

import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const PUBLIC_WALLPAPER_DIR = path.join(ROOT, "public", "wallpapers")
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

  for (const theme of THEME_DIRECTORIES) {
    const themeDir = path.join(PUBLIC_WALLPAPER_DIR, theme.dir)
    const files = await getFiles(themeDir)

    for (const file of files) {
      wallpapers.push({
        id: `${theme.slug}-${slugify(file)}`,
        src: `/wallpapers/${theme.dir}/${file}`,
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
    alt: "${wallpaper.alt}",
    themes: ["${wallpaper.themes[0]}"],
  }`,
    )
    .join(",\n")

  return `export type ChristmasWallpaper = {
  id: string
  src: string
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
