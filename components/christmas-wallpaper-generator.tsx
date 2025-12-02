"use client"

import Link from "next/link"
import { useState, type MouseEvent } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const artStyles = [
  { label: "Realistic photo", key: "realistic" as const },
  { label: "Cute cartoon", key: "cartoon" as const },
  { label: "Pixel art", key: "pixel" as const },
  { label: "Cinematic", key: "cinematic" as const },
]

const SCENE_IDEAS = {
  cozy: "Cozy Christmas living room with fireplace, decorated tree and warm lights",
  minimal: "Minimal snowy landscape with a single pine tree and soft pastel sky",
  village: "Cute isometric Christmas village with tiny houses, snow and Christmas lights",
  bokeh: "Soft Christmas bokeh lights with warm festive colors, abstract background",
} as const

const sceneIdeaButtons = [
  { key: "cozy", label: "Cozy living room", value: SCENE_IDEAS.cozy },
  { key: "minimal", label: "Minimal snow landscape", value: SCENE_IDEAS.minimal },
  { key: "village", label: "Cute Christmas village", value: SCENE_IDEAS.village },
  { key: "bokeh", label: "Bokeh lights background", value: SCENE_IDEAS.bokeh },
]

type OutputOption = {
  id: "desktop" | "iphone" | "android"
  label: string
  size: "desktop" | "phone"
}

const outputOptions: OutputOption[] = [
  { id: "desktop", label: "Desktop 4K", size: "desktop" },
  { id: "iphone", label: "iPhone wallpaper", size: "phone" },
  { id: "android", label: "Android wallpaper", size: "phone" },
]

export function ChristmasWallpaperGenerator() {
  const [selectedArtStyle, setSelectedArtStyle] = useState<(typeof artStyles)[number]["key"]>(artStyles[0].key)
  const [sceneDescription, setSceneDescription] = useState("")
  const [selectedOutput, setSelectedOutput] = useState<OutputOption>(outputOptions[0])
  const [selectedSize, setSelectedSize] = useState<"desktop" | "phone">(outputOptions[0].size)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-christmas-wallpaper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artStyle: selectedArtStyle,
          scene: sceneDescription,
          outputType: selectedSize,
        }),
      })

      const data: { ok: boolean; imageUrl?: string; error?: string } = await response.json()
      if (!data.ok || !data.imageUrl) {
        setError(data.error ?? "Something went wrong while generating your wallpaper.")
        return
      }

      setGeneratedUrl(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error while generating.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOutputSelect = (option: OutputOption) => {
    setSelectedOutput(option)
    setSelectedSize(option.size)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 shadow-sm">
        <p className="text-sm text-neutral-600 mb-6">
          Choose an art style and describe your scene. We’ll combine both so you can generate AI Christmas wallpapers in one click.
        </p>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-neutral-900 mb-3">Art style</p>
            <div className="flex flex-wrap gap-2">
              {artStyles.map((style) => (
                <button
                  key={style.key}
                  type="button"
                  onClick={() => setSelectedArtStyle(style.key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm border transition-colors",
                    selectedArtStyle === style.key
                      ? "bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]"
                      : "border-neutral-200 text-neutral-600 hover:border-[#FF6B35]/50 hover:text-[#FF6B35]",
                  )}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-neutral-900">Scene description</span>
            <p className="text-xs text-neutral-500 mt-1">
              Describe the Christmas scene you want. We’ll combine this with your selected art style.
            </p>
            <textarea
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#FF6B35] focus:ring-0 outline-none min-h-[120px]"
              placeholder="Cozy Christmas living room with fireplace, decorated tree and warm lights"
              value={sceneDescription}
              onChange={(event) => setSceneDescription(event.target.value)}
            />
          </label>
          <div>
            <p className="text-xs font-semibold text-neutral-500 mb-2">Quick scene ideas</p>
            <div className="flex flex-wrap gap-2">
              {sceneIdeaButtons.map((idea) => (
                <button
                  key={idea.key}
                  type="button"
                  onClick={() => setSceneDescription(idea.value)}
                  className="px-4 py-2 rounded-full text-xs border border-neutral-200 text-neutral-600 hover:border-[#FF6B35]/50 hover:text-[#FF6B35] transition-colors"
                >
                  {idea.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-900 mb-3">Output type</p>
            <div className="flex flex-wrap gap-2">
              {outputOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOutputSelect(option)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm border transition-colors",
                    selectedOutput.id === option.id
                      ? "bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]"
                      : "border-neutral-200 text-neutral-600 hover:border-[#FF6B35]/50 hover:text-[#FF6B35]",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Generating…" : "Generate Christmas Wallpaper"}
          </Button>

          {error ? (
            <p className="text-sm text-red-500 font-medium" aria-live="polite">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 shadow-sm flex flex-col">
        <div
          className={cn(
            "w-full rounded-2xl bg-neutral-100 border border-dashed border-neutral-300 flex items-center justify-center text-center text-sm text-neutral-500 p-6",
            selectedSize === "desktop" ? "aspect-[16/9]" : "aspect-[9/16]",
          )}
        >
          {generatedUrl ? (
            <img
              src={generatedUrl}
              alt="AI generated Christmas wallpaper"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-2xl shadow-lg"
            />
          ) : (
            "AI Christmas wallpaper preview will appear here once it is generated."
          )}
        </div>

        {generatedUrl ? (
          <a
            href={generatedUrl}
            download
            className="mt-6 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-[#FF6B35] text-white transition-colors hover:bg-[#ff8c63]"
          >
            Download wallpaper
          </a>
        ) : null}

        <div className="mt-4">
          <Button variant="outline" asChild className="w-full h-11 justify-center">
            <Link href="/">Sharpen &amp; upscale in Imgsharer</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
