import sharp from "sharp"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { currentUser, getAuth, clerkClient } from "@clerk/nextjs/server"

import { kvExpire, kvGetJSON, kvSetJSON } from "@/lib/kv"
import { SHARPEN_JOB_TTL_SECONDS, type SharpenJob } from "@/lib/sharpen-job"
import { getEntitlementByEmail, getEntitlementByInstallId } from "@/lib/entitlements"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function getInstallId(request: NextRequest) {
  const header = request.headers.get("x-install-id")?.trim()
  if (header) return header
  const cookieStore = cookies()
  const existing = cookieStore.get("install_id")?.value
  if (existing) return existing
  return null
}

async function getEmail(request: NextRequest) {
  const { userId } = getAuth(request)
  let email: string | null = null
  try {
    if (userId) {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null
    }
  } catch (err) {
    console.warn("[SERVER] clerk getUser failed", err)
  }
  if (!email) {
    const user = await currentUser().catch(() => null)
    email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null
  }
  return email
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

function normalizeEmail(email: string | null) {
  return typeof email === "string" && email.trim().length > 0 ? email.trim().toLowerCase() : null
}

function safeOutputUrl(raw: string | null): string | null {
  if (!raw) return null
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.length <= 4096 ? raw : null
  }
  return null
}

function sanitizeJobForStorage(job: SharpenJob) {
  return {
    jobId: job.jobId,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    installId: job.installId ?? null,
    email: job.email ?? null,
    isPro: !!job.isPro,
    scale: job.scale,
    faceEnhance: !!job.faceEnhance,
    remaining: typeof job.remaining === "number" ? job.remaining : null,
    outputUrl: safeOutputUrl(job.outputUrl) ?? null,
    error: typeof job.error === "string" ? job.error.slice(0, 2000) : null,
  } satisfies SharpenJob
}

function parseDataUriImage(dataUri: string): { buffer: Buffer; mimeType: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUri)
  if (!match) return null
  const [, mimeTypeRaw, base64Data] = match
  try {
    const buffer = Buffer.from(base64Data, "base64")
    return { buffer, mimeType: mimeTypeRaw || "image/png" }
  } catch {
    return null
  }
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

export async function GET(request: NextRequest) {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN
    if (!apiToken) {
      return NextResponse.json({ error: "Missing REPLICATE_API_TOKEN" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")?.trim()
    if (!jobId) {
      return NextResponse.json({ error: "missing_job_id" }, { status: 400 })
    }

    const jobKey = `sharpen:job:${jobId}`
    const job = await kvGetJSON<SharpenJob>(jobKey)
    if (!job) {
      return NextResponse.json({ error: "job_not_found" }, { status: 404 })
    }

    const jobSnapshot = sanitizeJobForStorage(job)
    const rawOutputUrl = typeof job.outputUrl === "string" ? job.outputUrl : null
    const rawOutputIsData = !!rawOutputUrl && rawOutputUrl.startsWith("data:")

    const installId = getInstallId(request)
    const { userId } = getAuth(request)
    const email = await getEmail(request)
    const installMatch = job.installId && installId && job.installId === installId
    const emailMatch = job.email && email && job.email === email
    if ((job.installId || job.email) && !installMatch && !emailMatch) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const requestEmail = normalizeEmail(email)
    const jobEmail = normalizeEmail(job.email)
    const entitlementByRequest = requestEmail ? await getEntitlementByEmail(requestEmail).catch(() => null) : null
    const entitlementByJob =
      !entitlementByRequest && jobEmail && jobEmail !== requestEmail
        ? await getEntitlementByEmail(jobEmail).catch(() => null)
        : null
    const entitlementByInstall =
      !entitlementByRequest && !entitlementByJob && userId && installId
        ? await getEntitlementByInstallId(installId).catch(() => null)
        : null

    const effectiveIsPro = job.isPro || !!entitlementByRequest || !!entitlementByJob || !!entitlementByInstall

    if (effectiveIsPro && (!job.isPro || (!job.email && requestEmail))) {
      try {
        await kvSetJSON(jobKey, {
          ...jobSnapshot,
          isPro: true,
          email: jobSnapshot.email ?? (installMatch || !job.installId ? requestEmail : jobSnapshot.email),
          updatedAt: Date.now(),
        })
        await kvExpire(jobKey, SHARPEN_JOB_TTL_SECONDS)
      } catch {}
    }

    let outputUrl = jobSnapshot.outputUrl ?? (rawOutputIsData ? rawOutputUrl : null)
    if (!outputUrl) {
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
        headers: {
          Authorization: `Token ${apiToken}`,
        },
      })
      if (!pollRes.ok) {
        const errorText = await pollRes.text()
        return NextResponse.json({ error: errorText }, { status: pollRes.status })
      }

      const prediction = await pollRes.json()
      const status = prediction?.status || "processing"
      const extractedRaw = extractOutputUrl(prediction?.output)
      const extracted = safeOutputUrl(extractedRaw)
      const updated: SharpenJob = {
        ...jobSnapshot,
        status,
        updatedAt: Date.now(),
        outputUrl: extracted ?? jobSnapshot.outputUrl ?? null,
        error: prediction?.error ?? null,
      }
      try {
        await kvSetJSON(jobKey, updated)
        await kvExpire(jobKey, SHARPEN_JOB_TTL_SECONDS)
      } catch (err) {
        console.warn("[SERVER] Failed to persist job update", err)
      }

      if (status !== "succeeded") {
        return NextResponse.json({ error: "job_not_ready" }, { status: 409 })
      }
      if (updated.outputUrl) {
        outputUrl = updated.outputUrl
      } else if (typeof extractedRaw === "string" && extractedRaw.startsWith("data:")) {
        outputUrl = extractedRaw
      }
    }

    if (!outputUrl) {
      return NextResponse.json({ error: "missing_output_url" }, { status: 502 })
    }

    let downloaded: Buffer
    let sourceMime = "image/png"
    if (outputUrl.startsWith("data:")) {
      const parsed = parseDataUriImage(outputUrl)
      if (!parsed) {
        return NextResponse.json({ error: "Invalid output data" }, { status: 502 })
      }
      downloaded = parsed.buffer
      sourceMime = parsed.mimeType
    } else {
      const imageResponse = await fetch(outputUrl)
      if (!imageResponse.ok) {
        return NextResponse.json({ error: "Failed to download processed image" }, { status: 502 })
      }
      downloaded = Buffer.from(await imageResponse.arrayBuffer())
      sourceMime = imageResponse.headers.get("content-type")?.split(";")[0] || "image/png"
    }

    const finalBuffer = effectiveIsPro ? downloaded : await addWatermark(downloaded)
    const outputMime = effectiveIsPro ? sourceMime : "image/jpeg"

    return new NextResponse(new Uint8Array(finalBuffer), {
      status: 200,
      headers: {
        "Content-Type": outputMime,
        "Cache-Control": "no-store",
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}
