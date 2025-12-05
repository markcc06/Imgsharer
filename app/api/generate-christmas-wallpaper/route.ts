import { NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

const MODEL_VERSION =
  "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc"

type ArtStyleKey = "realistic" | "cartoon" | "pixel" | "cinematic"

const STYLE_SUFFIX: Record<ArtStyleKey, string> = {
  realistic: "highly detailed realistic photo, 4k, soft lighting",
  cartoon: "cute 2D cartoon illustration, bold outlines, pastel colors",
  pixel: "isometric pixel art, 16-bit game style",
  cinematic: "cinematic lighting, shallow depth of field, bokeh background",
}

type GenerateRequest = {
  artStyle?: string
  scene?: string
  outputType?: string
}

const DEFAULT_SCENE = "Cozy Christmas living room with fireplace, decorated tree and warm lights"

const MAX_REQUESTS_PER_DAY = 6

type RateLimitEntry = {
  count: number
  resetAt: number
}

const globalForRateLimit = globalThis as typeof globalThis & {
  __imgsharerChristmasRateLimit?: Map<string, RateLimitEntry>
}

const rateLimitStore =
  globalForRateLimit.__imgsharerChristmasRateLimit ?? new Map<string, RateLimitEntry>()

if (!globalForRateLimit.__imgsharerChristmasRateLimit) {
  globalForRateLimit.__imgsharerChristmasRateLimit = rateLimitStore
}

function getNextResetTimestamp() {
  const now = new Date()
  const nextMidnightUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  return nextMidnightUtc
}

function getClientIp(req: Request) {
  const header = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip")
  if (!header) return "unknown"
  return header.split(",")[0]?.trim() || "unknown"
}

function getRateLimitEntry(ip: string) {
  const now = Date.now()
  const existing = rateLimitStore.get(ip)
  if (!existing || now >= existing.resetAt) {
    const fresh: RateLimitEntry = { count: 0, resetAt: getNextResetTimestamp() }
    rateLimitStore.set(ip, fresh)
    return fresh
  }
  return existing
}

function getArtStyleKey(style?: string): ArtStyleKey {
  if (style === "cartoon" || style === "pixel" || style === "cinematic" || style === "realistic") {
    return style
  }
  return "realistic"
}

function buildPrompt(scene: string | undefined, artStyle?: string) {
  const baseScene = scene && scene.trim().length > 0 ? scene.trim() : DEFAULT_SCENE
  const styleSuffix = STYLE_SUFFIX[getArtStyleKey(artStyle)]
  return `${baseScene}, ${styleSuffix}`
}

function getSize(_outputType: string | undefined) {
  return { width: 1024, height: 1536 }
}

export async function POST(req: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Missing Replicate API token configuration." },
      { status: 500 },
    )
  }

  try {
    const isProduction = process.env.NODE_ENV === "production"
    if (isProduction) {
      const clientIp = getClientIp(req)
      const usage = getRateLimitEntry(clientIp)
      if (usage.count >= MAX_REQUESTS_PER_DAY) {
        return NextResponse.json(
          {
            ok: false,
            error: "You've reached today's free Christmas wallpaper limit. Please come back tomorrow.",
          },
          { status: 429 },
        )
      }
      usage.count += 1
    }

    const body = (await req.json()) as GenerateRequest
    const { width, height } = getSize(body.outputType)
    const prompt = buildPrompt(body.scene, body.artStyle)

    const input = {
      width,
      height,
      prompt,
      refine: "expert_ensemble_refiner",
      apply_watermark: false,
      num_inference_steps: 25,
    }

    const output: unknown = await replicate.run(MODEL_VERSION, { input })

    let imageUrl: string | undefined

    if (Array.isArray(output) && output.length > 0) {
      const first = output[0] as any
      imageUrl =
        typeof first === "string"
          ? first
          : typeof first?.url === "function"
            ? first.url()
            : first?.url
    } else if (typeof output === "string") {
      imageUrl = output
    } else if (output && typeof (output as any).url === "string") {
      imageUrl = (output as any).url
    }

    if (!imageUrl) {
      return NextResponse.json(
        { ok: false, error: "No image URL returned from Replicate." },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, imageUrl })
  } catch (error: unknown) {
    console.error("Replicate error", error)
    const message =
      error instanceof Error && error.message.toLowerCase().includes("cuda out of memory")
        ? "Generation temporarily failed due to GPU limits. Please try again."
        : error instanceof Error
          ? error.message
          : "Unexpected error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
