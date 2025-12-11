"use client"

import Image from "next/image"

import type { ChristmasWallpaper } from "./wallpapers"

interface WallpaperDetailImageProps {
  wallpaper: ChristmasWallpaper
  alt: string
}

export function WallpaperDetailImage({ wallpaper, alt }: WallpaperDetailImageProps) {
  return (
    <div
      className="relative w-full bg-neutral-100"
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="relative mx-auto aspect-[9/16] w-full max-w-md md:max-w-none">
        <Image
          src={wallpaper.highResSrc || wallpaper.src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
          draggable={false}
          priority
        />
      </div>
    </div>
  )
}

