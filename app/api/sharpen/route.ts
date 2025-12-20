import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit, checkDailyRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"
import { RATE_LIMIT_PER_MINUTE, RATE_LIMIT_PER_DAY } from "@/lib/constants"

console.log("[SERVER] Sharpen route module loading...")

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const MAX_UPLOAD = 8_000_000 // 8MB

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

export async function POST(request: NextRequest) {
  console.log("[SERVER] POST function called")

  try {
    const apiToken = process.env.REPLICATE_API_TOKEN

    console.log("[SERVER] API Token exists:", !!apiToken)

    if (!apiToken) {
      console.error("[SERVER] Missing REPLICATE_API_TOKEN")
      return NextResponse.json({ error: "Missing REPLICATE_API_TOKEN" }, { status: 500 })
    }

    const identifier = getRateLimitIdentifier(request)
    console.log("[SERVER] Rate limit identifier:", identifier)

    const minuteLimit = checkRateLimit(identifier, RATE_LIMIT_PER_MINUTE, 60 * 1000)
    if (!minuteLimit.allowed) {
      console.log("[SERVER] Rate limit exceeded (per minute)")
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again in a minute.",
          resetAt: minuteLimit.resetAt,
        },
        { status: 429 },
      )
    }

    const dailyLimit = checkDailyRateLimit(identifier, RATE_LIMIT_PER_DAY)
    if (!dailyLimit.allowed) {
      console.log("[SERVER] Rate limit exceeded (daily)")
      return NextResponse.json(
        {
          error: "Daily rate limit exceeded. Please try again tomorrow.",
          resetAt: dailyLimit.resetAt,
        },
        { status: 429 },
      )
    }

    console.log("[SERVER] Parsing form data...")
    const form = await request.formData()
    const file = form.get("image") as File | null
    const scale = Number.parseInt((form.get("scale") as string) || "4", 10)
    const faceEnhance = (form.get("face_enhance") as string) === "true"

    console.log("[SERVER] File received:", !!file, "Size:", file?.size)
    console.log("[SERVER] Scale:", scale, "Face enhance:", faceEnhance)

    if (!file) {
      console.error("[SERVER] No image in request")
      return NextResponse.json({ error: "No image" }, { status: 400 })
    }

    if (file.size > MAX_UPLOAD) {
      console.error("[SERVER] File too large:", file.size)
      return NextResponse.json(
        {
          error: `Payload too large (${file.size} bytes > ${MAX_UPLOAD} bytes)`,
        },
        { status: 413 },
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
      return NextResponse.json({ error: errorText }, { status: createRes.status })
    }

    const prediction = await createRes.json()
    console.log("[SERVER] Prediction created:", prediction.id, "Status:", prediction.status)

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
        return NextResponse.json({ error: errorText }, { status: pollRes.status })
      }

      finalPrediction = await pollRes.json()
      console.log("[SERVER] Poll", pollCount, "Status:", finalPrediction.status)
    }

    if (finalPrediction.status === "failed") {
      console.error("[SERVER] Prediction failed:", finalPrediction.error)
      return NextResponse.json({ error: finalPrediction.error || "Prediction failed" }, { status: 500 })
    }

    if (finalPrediction.status !== "succeeded") {
      console.error("[SERVER] Prediction timeout")
      return NextResponse.json({ error: "Processing timeout" }, { status: 504 })
    }

    const out = finalPrediction.output as any
    const imageUrl = Array.isArray(out)
      ? out[0]
      : typeof out === "string"
        ? out
        : (out?.image ?? out?.[0]?.image ?? null)

    if (!imageUrl) {
      console.error("[SERVER] No image URL in prediction.output:", out)
      return NextResponse.json({ error: "No output image URL" }, { status: 502 })
    }

    console.log("[SERVER] Fetching image from Replicate URL:", imageUrl)

    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error("[SERVER] Failed to fetch image from Replicate:", imageResponse.status)
      return NextResponse.json({ error: "Failed to download processed image" }, { status: 502 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBase64 = arrayBufferToBase64(imageBuffer)
    console.log("[SERVER] Image downloaded and converted to base64, size:", imageBase64.length, "chars")

    return NextResponse.json({
      imageBase64,
      remaining: dailyLimit.remaining,
    })
  } catch (err: any) {
    console.error("[SERVER] Caught error:", err?.message)
    console.error("[SERVER] Error stack:", err?.stack)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}

console.log("[SERVER] Sharpen route module loaded successfully")
