"use client"

import type { ComponentProps } from "react"
import { ImageEnhancerHero } from "../image-enhancer-free/ImageEnhancerHero"

export function BlurryPhotoHero(props: ComponentProps<typeof ImageEnhancerHero>) {
  return <ImageEnhancerHero {...props} />
}
