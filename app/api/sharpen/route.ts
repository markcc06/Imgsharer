import sharp from "sharp"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { currentUser, getAuth, clerkClient } from "@clerk/nextjs/server"
import {
  RATE_LIMIT_PER_DAY_FREE,
  RATE_LIMIT_PER_DAY_PRO,
  RATE_LIMIT_PER_HOUR_PRO,
} from "@/lib/constants"
import { getEarlyBirdSold, getEntitlementByEmail, getPriceConfig } from "@/lib/entitlements"
import { kvExpire, kvGetJSON, kvIncrBy, kvSetJSON } from "@/lib/kv"
import { SHARPEN_JOB_TTL_SECONDS, type SharpenJob } from "@/lib/sharpen-job"

console.log("[SERVER] Sharpen route module loading...")

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const MAX_UPLOAD = 8_000_000 // 8MB
const INSTALL_COOKIE = "install_id"

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ""
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function extractOutputUrl(output: any): string | null {
  if (!output) return null
  if (typeof output === "string") return output
  if (Array.isArray(output)) {
    const first = output[0]
    return typeof first === "string" ? first : first?.image ?? null
  }
  if (typeof output === "object") {
    if (typeof output.image === "string") return output.image
    if (output.image && typeof output.image === "object") {
      const nested = (output.image as any).url
      if (typeof nested === "string") return nested
    }
  }
  return null
}

function safeOutputUrl(raw: string | null): string | null {
  if (!raw) return null
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.length <= 4096 ? raw : null
  }
  return null
}

function getInstallId(request: NextRequest) {
  const header = request.headers.get("x-install-id")?.trim()
  if (header) return header
  const cookieStore = cookies()
  const existing = cookieStore.get(INSTALL_COOKIE)?.value
  if (existing) return existing
  return null
}

async function addWatermark(buffer: Buffer) {
  try {
    const metadata = await sharp(buffer).metadata()
    const width = metadata.width || 1200
    const height = metadata.height || 800

    const brandColor = "#ff5733"
    const iconSize = Math.max(48, Math.min(120, Math.round(Math.min(width, height) * 0.08)))
    const padding = Math.max(12, Math.round(iconSize * 0.45))
    const x = Math.max(padding, width - iconSize - padding)
    const y = Math.max(padding, height - iconSize - padding)
    const ringStroke = Math.max(2, Math.round(iconSize * 0.08))
    const svg = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(${x}, ${y})" opacity="0.85">
          <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="${iconSize / 2}" fill="${brandColor}" fill-opacity="0.28" />
          <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="${iconSize / 2 - ringStroke}" fill="none" stroke="${brandColor}" stroke-opacity="0.45" stroke-width="${ringStroke}" />
          <g transform="translate(${iconSize / 2 - 12}, ${iconSize / 2 - 12}) scale(${iconSize / 24})" fill="white" fill-opacity="0.9">
            <path d="M12 2 9.6 8.6 2.6 9.4 8 13.9 6.6 21 12 17.5 17.4 21 16 13.9 21.4 9.4 14.4 8.6z"/>
          </g>
        </g>
      </svg>
    `)
    return sharp(buffer).composite([{ input: svg, gravity: "southeast" }]).jpeg({ quality: 94 }).toBuffer()
  } catch (error) {
    console.warn("[SERVER] Watermark failed, returning original", error)
    return buffer
  }
}

export async function POST(request: NextRequest) {
  console.log("[SERVER] POST function called")

  try {
    const apiToken = process.env.REPLICATE_API_TOKEN

    console.log("[SERVER] API Token exists:", !!apiToken)

    if (!apiToken) {
      console.error("[SERVER] Missing REPLICATE_API_TOKEN")
      return NextResponse.json({ error: "Missing REPLICATE_API_TOKEN" }, { status: 500 })
    }

    const installId = getInstallId(request)
    const cookieStore = cookies()
    const { userId } = getAuth(request)
    let email: string | null = null
    if (userId) {
      try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null
      } catch (err) {
        console.warn("[SERVER] clerk getUser failed", err)
      }
    }
    if (!email && userId) {
      const user = await currentUser().catch(() => null)
      email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null
    }
    const entitlementByEmail = email ? await getEntitlementByEmail(email) : null
    const entitlement = entitlementByEmail
    const identifier = email || installId || "anonymous"
    const freeIdentifier = installId || email || identifier

    const now = new Date()
    const utcDay = now.toISOString().slice(0, 10) // YYYY-MM-DD UTC
    const utcHour = `${utcDay}-${now.getUTCHours().toString().padStart(2, "0")}` // hour bucket in UTC

    const checkAndIncr = async (key: string, limit: number) => {
      const current = await kvGetJSON<number>(key).catch(() => null)
      const count = typeof current === "number" ? current : 0
      if (count >= limit) return { allowed: false, count }
      const next = await kvIncrBy(key, 1).catch(() => limit + 1)
      return { allowed: next <= limit, count: next }
    }

    const attachInstallCookie = (res: NextResponse) => {
      if (installId && !cookieStore.get(INSTALL_COOKIE)) {
        res.cookies.set(INSTALL_COOKIE, installId, {
          httpOnly: false,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        })
      }
      return res
    }

    console.log("[SERVER] Rate limit identifier:", identifier, "installId:", installId)

    let remaining: number | null = null

    // Pro limits (hour + day) using KV (UTC buckets)
    if (entitlement) {
      const hourKey = `usage:pro:${identifier}:hour:${utcHour}`
      const hourLimit = await checkAndIncr(hourKey, RATE_LIMIT_PER_HOUR_PRO)
      if (!hourLimit.allowed) {
        console.log("[SERVER] Rate limit exceeded (pro per hour)")
        return attachInstallCookie(
          NextResponse.json(
            {
              error: "Usage limit exceeded. Please try again later.",
              limit: "pro_hour",
              resetAt: null,
            },
            { status: 429 },
          ),
        )
      }

      const dayKey = `usage:pro:${identifier}:day:${utcDay}`
      const proDaily = await checkAndIncr(dayKey, RATE_LIMIT_PER_DAY_PRO)
      if (!proDaily.allowed) {
        console.log("[SERVER] Rate limit exceeded (pro daily)")
        return attachInstallCookie(
          NextResponse.json(
            {
              error: "Usage limit exceeded. Please try again later.",
              limit: "pro_daily",
              resetAt: null,
            },
            { status: 429 },
          ),
        )
      }
    } else {
      // Free daily limit only
      const dayKey = `usage:free:${freeIdentifier}:day:${utcDay}`
      const dailyLimit = await checkAndIncr(dayKey, RATE_LIMIT_PER_DAY_FREE)
      if (!dailyLimit.allowed) {
        console.log("[SERVER] Rate limit exceeded (free daily)")
        return attachInstallCookie(
          NextResponse.json(
            {
              error: "Usage limit exceeded. Please try again tomorrow.",
              limit: "free_daily",
              dailyLimit: RATE_LIMIT_PER_DAY_FREE,
              resetAt: null,
            },
            { status: 429 },
          ),
        )
      }
      remaining = Math.max(0, RATE_LIMIT_PER_DAY_FREE - (dailyLimit.count ?? 0))
    }

    console.log("[SERVER] Parsing form data...")
    const form = await request.formData()
    const file = form.get("image") as File | null
    const scale = Number.parseInt((form.get("scale") as string) || "4", 10)
    const faceEnhance = (form.get("face_enhance") as string) === "true"
    const responseFormatRaw =
      (form.get("response_format") as string | null)?.trim().toLowerCase() ||
      request.headers.get("x-response-format")?.trim().toLowerCase()
    const wantsBinary = responseFormatRaw === "image" || responseFormatRaw === "binary" || responseFormatRaw === "blob"
    const asyncRaw =
      (form.get("async") as string | null)?.trim().toLowerCase() ||
      request.headers.get("x-async")?.trim().toLowerCase()
    const wantsAsync = asyncRaw === "1" || asyncRaw === "true" || asyncRaw === "yes"

    console.log("[SERVER] File received:", !!file, "Size:", file?.size)
    console.log("[SERVER] Scale:", scale, "Face enhance:", faceEnhance)

    if (!file) {
      console.error("[SERVER] No image in request")
      return attachInstallCookie(NextResponse.json({ error: "No image" }, { status: 400 }))
    }

    if (file.size > MAX_UPLOAD) {
      console.error("[SERVER] File too large:", file.size)
      return attachInstallCookie(
        NextResponse.json(
          {
            error: `Payload too large (${file.size} bytes > ${MAX_UPLOAD} bytes)`,
          },
          { status: 413 },
        ),
      )
    }

    if (scale > 4 && !entitlement) {
      const priceConfig = getPriceConfig()
      const earlyBirdSold = await getEarlyBirdSold().catch(() => 0)
      return attachInstallCookie(
        NextResponse.json(
          {
            error: "pro_required",
            message: "6x/8x upscaling is available for Pro plans. Please upgrade to continue.",
            prices: priceConfig,
            earlyBirdSold,
          },
          { status: 402 },
        ),
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = arrayBufferToBase64(arrayBuffer)
    const mimeType = file.type || "image/jpeg"
    const dataUri = `data:${mimeType};base64,${base64}`

    console.log("[SERVER] Image converted to data URI, size:", dataUri.length, "chars")

    const predictionPayload = {
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      input: {
        image: dataUri,
        scale: scale,
        face_enhance: faceEnhance,
      },
    }

    console.log("[SERVER] Creating Replicate prediction with real-esrgan...")
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(predictionPayload),
    })

    if (!createRes.ok) {
      const errorText = await createRes.text()
      console.error("[SERVER] Replicate create error:", errorText)
      return attachInstallCookie(NextResponse.json({ error: errorText }, { status: createRes.status }))
    }

    const prediction = await createRes.json()
    console.log("[SERVER] Prediction created:", prediction.id, "Status:", prediction.status)

    if (wantsAsync) {
      const jobId = prediction?.id as string | undefined
      if (!jobId) {
        return attachInstallCookie(NextResponse.json({ error: "Missing prediction id" }, { status: 502 }))
      }

      const outputUrl = safeOutputUrl(extractOutputUrl(prediction?.output))
      const now = Date.now()
      const job: SharpenJob = {
        jobId,
        status: prediction?.status || "starting",
        createdAt: now,
        updatedAt: now,
        installId: installId ?? null,
        email: email ?? null,
        isPro: !!entitlement,
        scale,
        faceEnhance,
        remaining: entitlement ? null : remaining,
        outputUrl: outputUrl ?? null,
        error: prediction?.error ?? null,
      }
      const jobKey = `sharpen:job:${jobId}`
      try {
        await kvSetJSON(jobKey, job)
        await kvExpire(jobKey, SHARPEN_JOB_TTL_SECONDS)
      } catch (err) {
        console.warn("[SERVER] Failed to persist job to KV", err)
      }

      return attachInstallCookie(
        NextResponse.json({
          jobId,
          status: job.status,
          remaining: job.remaining,
        }),
      )
    }

    let pollCount = 0
    const maxPolls = 60 // 60 seconds max
    let finalPrediction = prediction

    while (finalPrediction.status !== "succeeded" && finalPrediction.status !== "failed" && pollCount < maxPolls) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      pollCount++

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${finalPrediction.id}`, {
        headers: {
          Authorization: `Token ${apiToken}`,
        },
      })

      if (!pollRes.ok) {
        const errorText = await pollRes.text()
        console.error("[SERVER] Replicate poll error:", errorText)
        return attachInstallCookie(NextResponse.json({ error: errorText }, { status: pollRes.status }))
      }

      finalPrediction = await pollRes.json()
      console.log("[SERVER] Poll", pollCount, "Status:", finalPrediction.status)
    }

    if (finalPrediction.status === "failed") {
      console.error("[SERVER] Prediction failed:", finalPrediction.error)
      return attachInstallCookie(
        NextResponse.json({ error: finalPrediction.error || "Prediction failed" }, { status: 500 }),
      )
    }

    if (finalPrediction.status !== "succeeded") {
      console.error("[SERVER] Prediction timeout")
      return attachInstallCookie(NextResponse.json({ error: "Processing timeout" }, { status: 504 }))
    }

    const out = finalPrediction.output as any
    const imageUrl = Array.isArray(out)
      ? out[0]
      : typeof out === "string"
        ? out
        : (out?.image ?? out?.[0]?.image ?? null)

    if (!imageUrl) {
      console.error("[SERVER] No image URL in prediction.output:", out)
      return attachInstallCookie(NextResponse.json({ error: "No output image URL" }, { status: 502 }))
    }

    console.log("[SERVER] Fetching image from Replicate URL:", imageUrl)

    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error("[SERVER] Failed to fetch image from Replicate:", imageResponse.status)
      return attachInstallCookie(NextResponse.json({ error: "Failed to download processed image" }, { status: 502 }))
    }

    const downloaded = Buffer.from(await imageResponse.arrayBuffer())
    const finalBuffer = entitlement ? downloaded : await addWatermark(downloaded)
    const outputMime =
      entitlement
        ? imageResponse.headers.get("content-type")?.split(";")[0] || "image/png"
        : "image/jpeg"

    if (wantsBinary) {
      const binaryResponse = new NextResponse(new Uint8Array(finalBuffer), {
        status: 200,
        headers: {
          "Content-Type": outputMime,
          "Cache-Control": "no-store",
        },
      })
      if (!entitlement && typeof remaining === "number") {
        binaryResponse.headers.set("x-remaining", String(remaining))
      }
      return attachInstallCookie(binaryResponse)
    }

    const imageBase64 = finalBuffer.toString("base64")
    console.log("[SERVER] Image downloaded and converted to base64, size:", imageBase64.length, "chars")

    return attachInstallCookie(
      NextResponse.json({
        imageBase64,
        imageMime: outputMime,
        remaining: entitlement ? null : remaining,
      }),
    )
  } catch (err: any) {
    console.error("[SERVER] Caught error:", err?.message)
    console.error("[SERVER] Error stack:", err?.stack)
    const response = NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
    return response
  }
}

console.log("[SERVER] Sharpen route module loaded successfully")
