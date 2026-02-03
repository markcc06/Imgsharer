import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { getAuth, clerkClient } from "@clerk/nextjs/server"

import { kvExpire, kvGetJSON, kvSetJSON } from "@/lib/kv"
import { SHARPEN_JOB_TTL_SECONDS, type SharpenJob } from "@/lib/sharpen-job"

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
    return null
  }
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

    if (job.status === "succeeded" && job.outputUrl) {
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
    const outputUrl = extractOutputUrl(prediction?.output)
    const updated: SharpenJob = {
      ...job,
      status,
      updatedAt: Date.now(),
      outputUrl: outputUrl ?? job.outputUrl ?? null,
      error: prediction?.error ?? null,
    }

    await kvSetJSON(jobKey, updated)
    await kvExpire(jobKey, SHARPEN_JOB_TTL_SECONDS)

    if (status === "failed") {
      return NextResponse.json(
        { jobId, status, error: updated.error || "Prediction failed", remaining: updated.remaining },
        { status: 200 },
      )
    }

    if (status === "succeeded") {
      if (!updated.outputUrl) {
        return NextResponse.json({ error: "No output image URL" }, { status: 502 })
      }
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
