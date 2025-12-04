import fs from "fs"
import path from "path"

import { CHRISTMAS_THEMES } from "./themes"

export type ChristmasWallpaper = {
  id: string
  src: string
  alt: string
  themes: string[]
}

const WALLPAPERS_ROOT = path.join(process.cwd(), "public", "wallpapers")

// Map from folder name under /public/wallpapers to theme slug
const THEME_FOLDER_MAP: Record<string, string> = {
  "Cozy Christmas wallpapers": "cute-wallpaper-for-christmas",
  "Cyber Steam-Punk wallpapers": "winter-cabin-at-night",
  "Christmas Tree wallpapers": "christmas-tree-lights",
  "Horror Christmas wallpapers": "ice-castle-queen",
  "Cosmic Christmas wallpapers": "cosmic-space-christmas",
  "Cute Robots wallpapers": "cute-christmas-robots",
  "Pastel Candy wallpapers": "pastel-candy-christmas",
  "Snow Aesthetic wallpapers": "snowy-forest-aesthetic",
}

const themeBySlug = new Map(CHRISTMAS_THEMES.map((theme) => [theme.slug, theme]))

function safeReadDir(dir: string): string[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name)
  } catch {
    return []
  }
}

function isImageFile(filename: string): boolean {
  return /\.(png|jpe?g|webp|svg)$/i.test(filename)
}

function toId(themeSlug: string, filename: string): string {
  const basename = filename.replace(/\.[^/.]+$/, "")
  return `${themeSlug}-${basename}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-")
}

function buildAlt(themeSlug: string): string {
  const theme = themeBySlug.get(themeSlug)
  const themeName = theme?.name ?? "Christmas"
  return `AI-generated ${themeName} Christmas wallpaper`
}

function buildWallpapersFromFolders(): ChristmasWallpaper[] {
  const wallpapers: ChristmasWallpaper[] = []

  for (const [folderName, themeSlug] of Object.entries(THEME_FOLDER_MAP)) {
    const dirPath = path.join(WALLPAPERS_ROOT, folderName)
    const files = safeReadDir(dirPath).filter(isImageFile)

    const alt = buildAlt(themeSlug)

    for (const filename of files) {
      const src = `/wallpapers/${folderName}/${filename}`
      wallpapers.push({
        id: toId(themeSlug, filename),
        src,
        alt,
        themes: [themeSlug],
      })
    }
  }

  return wallpapers
}

export const CHRISTMAS_WALLPAPERS: ChristmasWallpaper[] = buildWallpapersFromFolders()
