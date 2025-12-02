"use client"

import Link from "next/link"
import { useState, type MouseEvent } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ArtStyleKey = "realistic" | "cartoon" | "pixel" | "cinematic"

const artStyles: { label: string; key: ArtStyleKey }[] = [
  { label: "Realistic photo", key: "realistic" },
  { label: "Cute cartoon", key: "cartoon" },
  { label: "Pixel art", key: "pixel" },
  { label: "Cinematic", key: "cinematic" },
]

type SceneIdeaKey = "cozy" | "minimal" | "cute" | "bokeh" | "desktop"

const sceneIdeaButtons: { key: SceneIdeaKey; label: string; value: string }[] = [
  {
    key: "cozy",
    label: "Cozy living room",
    value: "Cozy Christmas living room with fireplace, decorated tree and warm lights",
  },
  {
    key: "minimal",
    label: "Minimal snow landscape",
    value: "Minimal snowy landscape with a single pine tree and soft pastel sky",
  },
  {
    key: "cute",
    label: "Cute cartoon Christmas",
    value: "Cute cartoon Christmas scene with playful characters, gifts and twinkling lights",
  },
  {
    key: "bokeh",
    label: "Aesthetic bokeh lights",
    value: "Soft Christmas bokeh lights with warm festive colors, abstract background",
  },
  {
    key: "desktop",
    label: "4K desktop scene",
    value: "Wide 4K Christmas desktop scene with snowy mountains and glowing city lights",
  },
]

const SCENE_IDEA_MAP = sceneIdeaButtons.reduce(
  (acc, idea) => {
    acc[idea.key] = idea.value
    return acc
  },
  {} as Record<SceneIdeaKey, string>,
)

const DEFAULT_SCENE_KEY: SceneIdeaKey = "cozy"

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
  const [selectedArtStyle, setSelectedArtStyle] = useState<ArtStyleKey>(artStyles[0].key)
  const [selectedSceneIdea, setSelectedSceneIdea] = useState<SceneIdeaKey>(DEFAULT_SCENE_KEY)
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

    const resolvedScene =
      sceneDescription.trim().length > 0
        ? sceneDescription.trim()
        : SCENE_IDEA_MAP[selectedSceneIdea] ?? SCENE_IDEA_MAP[DEFAULT_SCENE_KEY]

    try {
      const response = await fetch("/api/generate-christmas-wallpaper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artStyle: selectedArtStyle,
          scene: resolvedScene,
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

  const handleSceneIdeaClick = (key: SceneIdeaKey, value: string) => {
    setSceneDescription(value)
    setSelectedSceneIdea(key)
  }

  const handleOutputSelect = (option: OutputOption) => {
    setSelectedOutput(option)
    setSelectedSize(option.size)
  }

  return (
    <div className="grid gap-8 lg:gap-10 lg:grid-cols-2">
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 shadow-sm space-y-6">
        <p className="text-sm text-neutral-600">
          Choose an art style and describe your scene. We’ll combine both so you can generate AI Christmas wallpapers in one click.
        </p>

        <div className="space-y-6">
          <div>
            <p className="text-base font-semibold text-neutral-900 mb-3">Art style</p>
            <div className="flex flex-wrap gap-2">
              {artStyles.map((style) => (
                <button
                  key={style.key}
                  type="button"
                  onClick={() => setSelectedArtStyle(style.key)}
                  className={cn(
                    "px-4 py-2.5 rounded-full text-sm border transition-colors",
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

          <label className="block space-y-2">
            <div>
              <span className="text-base font-semibold text-neutral-900">Scene description</span>
              <p className="text-xs text-neutral-500 mt-1">
              Describe the Christmas scene you want. We’ll combine this with your selected art style.
            </p>
            </div>
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
                  onClick={() => handleSceneIdeaClick(idea.key, idea.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs border transition-colors",
                    selectedSceneIdea === idea.key
                      ? "border-[#FF6B35] text-[#FF6B35] bg-[#FF6B35]/10"
                      : "border-neutral-200 text-neutral-600 hover:border-[#FF6B35]/50 hover:text-[#FF6B35]",
                  )}
                >
                  {idea.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-base font-semibold text-neutral-900 mb-3">Output type</p>
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
