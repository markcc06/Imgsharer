import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { currentUser, getAuth, clerkClient } from "@clerk/nextjs/server"

import { kvExpire, kvGetJSON, kvSetJSON } from "@/lib/kv"
import { SHARPEN_JOB_TTL_SECONDS, type SharpenJob } from "@/lib/sharpen-job"
import { getEntitlementByEmail } from "@/lib/entitlements"

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
  if (!userId) return null
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null
  } catch (err) {
    console.warn("[SERVER] clerk getUser failed", err)
  }
  const user = await currentUser().catch(() => null)
  return user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null
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
    const email = await getEmail(request)
    const installMatch = job.installId && installId && job.installId === installId
    const emailMatch = job.email && email && job.email === email
    if ((job.installId || job.email) && !installMatch && !emailMatch) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    if (job.status === "failed") {
      return NextResponse.json(
        { jobId, status: job.status, error: job.error || "Prediction failed", remaining: job.remaining },
        { status: 200 },
      )
    }

    if (job.status === "succeeded" && (jobSnapshot.outputUrl || rawOutputIsData)) {
      return NextResponse.json(
        {
          jobId,
          status: job.status,
          resultUrl: `/api/sharpen/result?jobId=${encodeURIComponent(jobId)}`,
          remaining: job.remaining,
        },
        { status: 200 },
      )
    }

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
    const outputUrl = safeOutputUrl(extractOutputUrl(prediction?.output))
    const effectiveEmail = normalizeEmail(job.email) ?? (installMatch ? normalizeEmail(email) : null)
    const entitlementNow =
      !job.isPro && effectiveEmail ? await getEntitlementByEmail(effectiveEmail).catch(() => null) : null
    const updated: SharpenJob = {
      ...jobSnapshot,
      status,
      updatedAt: Date.now(),
      outputUrl: outputUrl ?? jobSnapshot.outputUrl ?? null,
      email: jobSnapshot.email ?? (installMatch ? normalizeEmail(email) : jobSnapshot.email),
      isPro: jobSnapshot.isPro || !!entitlementNow,
      error: prediction?.error ?? null,
    }

    try {
      await kvSetJSON(jobKey, updated)
      await kvExpire(jobKey, SHARPEN_JOB_TTL_SECONDS)
    } catch (err) {
      console.warn("[SERVER] Failed to persist job update", err)
    }

    if (status === "failed") {
      return NextResponse.json(
        { jobId, status, error: updated.error || "Prediction failed", remaining: updated.remaining },
        { status: 200 },
      )
    }

    if (status === "succeeded") {
      return NextResponse.json(
        {
          jobId,
          status,
          resultUrl: `/api/sharpen/result?jobId=${encodeURIComponent(jobId)}`,
          remaining: updated.remaining,
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      { jobId, status, remaining: updated.remaining },
      { status: 200 },
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}

function normalizeEmail(email: string | null) {
  return typeof email === "string" && email.trim().length > 0 ? email.trim().toLowerCase() : null
}
