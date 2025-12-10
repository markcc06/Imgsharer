import { CHRISTMAS_WALLPAPERS, type ChristmasWallpaper } from "./wallpapers"

export type ThemePreview = {
  slug: string
  title: string
  description: string
  href: string
  fallbackImages?: string[]
}

const DEFAULT_PREVIEW_IMAGE = "/wallpapers/christmas-phone-cozy.png"

export const THEME_PREVIEWS: ThemePreview[] = [
  {
    slug: "cute-wallpaper-for-christmas",
    title: "Cozy Christmas",
    description: "Warm fireplaces, glowing trees and soft lights for a snug Christmas mood.",
    href: "/christmas-wallpaper/cute-wallpaper-for-christmas",
    fallbackImages: [
      "/wallpapers/Cozy Christmas wallpapers/:wallpapers:Cozy Christmas 01.png",
      "/wallpapers/Cozy Christmas wallpapers/new 1.png",
    ],
  },
  {
    slug: "winter-cabin-at-night",
    title: "Cyber Steam-Punk",
    description: "Retro-futuristic streets, glowing cables and armored silhouettes in the snow.",
    href: "/christmas-wallpaper/winter-cabin-at-night",
    fallbackImages: [
      "/wallpapers/Cyber Steam-Punk wallpapers/:wallpapers:Cyber Steam-Punk 01.png",
      "/wallpapers/Cyber Steam-Punk wallpapers/new 24.png",
    ],
  },
  {
    slug: "christmas-tree-lights",
    title: "Christmas Tree Lights",
    description: "Classic trees, ornaments and bokeh fairy lights for timeless wallpapers.",
    href: "/christmas-wallpaper/christmas-tree-lights",
    fallbackImages: [
      "/wallpapers/Christmas Tree wallpapers/:wallpapers:Christmas Tree 01.png",
      "/wallpapers/Christmas Tree wallpapers/new 15.png",
    ],
  },
  {
    slug: "ice-castle-queen",
    title: "Horror Christmas",
    description: "Eerie mansions, ghostly silhouettes and flickering red-green lights.",
    href: "/christmas-wallpaper/ice-castle-queen",
    fallbackImages: [
      "/wallpapers/Horror Christmas wallpapers/new 39.png",
      "/wallpapers/Horror Christmas wallpapers/new 48.png",
    ],
  },
  {
    slug: "cosmic-space-christmas",
    title: "Cosmic Christmas",
    description: "Galaxies, planets and nebulae with a festive color palette.",
    href: "/christmas-wallpaper/cosmic-space-christmas",
    fallbackImages: [
      "/wallpapers/Cosmic Christmas wallpapers/:wallpapers:Cosmic Christmas 01.png",
      "/wallpapers/Cosmic Christmas wallpapers/new 19.png",
    ],
  },
  {
    slug: "cute-christmas-robots",
    title: "Cute Robots",
    description: "Adorable Christmas robots, neon gifts and sci‑fi toy shop vibes.",
    href: "/christmas-wallpaper/cute-christmas-robots",
    fallbackImages: [
      "/wallpapers/Cute Robots wallpapers/:wallpapers:Cute Robots 01.png",
      "/wallpapers/Cute Robots wallpapers/new 16.png",
    ],
  },
  {
    slug: "pastel-candy-christmas",
    title: "Pastel Candy",
    description: "Candy clouds, marshmallows and soft pastel gradients for dreamy screens.",
    href: "/christmas-wallpaper/pastel-candy-christmas",
    fallbackImages: [
      "/wallpapers/Pastel Candy wallpapers/out-0 (29).png",
      "/wallpapers/Pastel Candy wallpapers/out-0 (30).png",
    ],
  },
  {
    slug: "snowy-forest-aesthetic",
    title: "Snow Aesthetic",
    description: "Minimal snowy forests, soft light and calm winter horizons.",
    href: "/christmas-wallpaper/snowy-forest-aesthetic",
    fallbackImages: [
      "/wallpapers/Snow Aesthetic wallpapers/:wallpapers:Snow Aesthetic 01.png",
      "/wallpapers/Snow Aesthetic wallpapers/:wallpapers:Snow Aesthetic 02.png",
    ],
  },
]

export function getImageOptionsForTheme(slug: string, limit = 12): ChristmasWallpaper[] {
  return CHRISTMAS_WALLPAPERS.filter((wallpaper) => wallpaper.themes.includes(slug)).slice(0, limit)
}

export function getFallbackImages(slug: string): ChristmasWallpaper[] {
  const theme = THEME_PREVIEWS.find((preview) => preview.slug === slug)
  if (theme?.fallbackImages?.length) {
    return theme.fallbackImages.map((src, index) => {
      const parts = src.split("/")
      const fileName = parts[parts.length - 1] || `${slug}-${index + 1}.png`
      return {
        id: `${slug}-fallback-${index}`,
        src,
        highResSrc: src,
        thumbnailSrc: src,
        downloadName: fileName,
        themes: [slug],
      }
    })
  }
  const defaultParts = DEFAULT_PREVIEW_IMAGE.split("/")
  const defaultFileName = defaultParts[defaultParts.length - 1] || "christmas-wallpaper.png"
  return [
    {
      id: `${slug}-fallback-0`,
      src: DEFAULT_PREVIEW_IMAGE,
      thumbnailSrc: DEFAULT_PREVIEW_IMAGE,
      highResSrc: DEFAULT_PREVIEW_IMAGE,
      downloadName: defaultFileName,
      themes: [slug],
    },
  ]
}
