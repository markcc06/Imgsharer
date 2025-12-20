import sharp from "sharp"
import Replicate from "replicate"
import { NextRequest, NextResponse } from "next/server"

import { ExtTokenError, verifyExtToken } from "@/lib/ext-jwt"
import { checkDailyRateLimit, checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 120

const MAX_IMAGE_BYTES = 6_000_000 // ~6MB
const VALID_SCALES = new Set([2, 4])
const EXT_RATE_LIMIT_PER_MINUTE = 20
const EXT_DAILY_LIMIT = 6

class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getReplicateModel() {
  return process.env.REPLICATE_UPSCALE_MODEL || "nightmareai/real-esrgan"
}

function getReplicateModelIdentifier(): `${string}/${string}` {
  const model = getReplicateModel()
  if (!model.includes("/")) {
    throw new HttpError(500, "REPLICATE_UPSCALE_MODEL must be in the form owner/model.")
  }
  return model as `${string}/${string}`
}

function getReplicateTargetLabel() {
  return `${getReplicateModel()}@hidden`
}

let replicateClient: Replicate | null = null

function getReplicateClient() {
  const apiToken = process.env.REPLICATE_API_TOKEN
  if (!apiToken) {
    throw new HttpError(500, "REPLICATE_API_TOKEN is not configured on the server.")
  }
  if (!replicateClient) {
    replicateClient = new Replicate({
      auth: apiToken,
    })
  }
  return replicateClient
}

export async function POST(request: NextRequest) {
  try {
    const token = extractBearerToken(request)
    const installId = getInstallIdFromHeader(request)
    if (!installId) {
      throw new HttpError(400, "Missing installId. Provide X-Install-Id header.")
    }
    try {
      await verifyExtToken(token, { installId })
    } catch (error) {
      if (error instanceof ExtTokenError) {
        if (error.code === "INVALID_SCOPE" || error.code === "INVALID_AUDIENCE") {
          throw new HttpError(403, "Token does not have permission to use this endpoint.")
        }
        if (error.code === "INSTALL_ID_MISMATCH" || error.code === "MISSING_INSTALL_ID") {
          throw new HttpError(403, "Token does not match this device. Request a new token.")
        }
        if (error.code === "EXPIRED") {
          throw new HttpError(401, "Token expired. Request a new token from /api/ext/token.")
        }
        throw new HttpError(401, "Invalid token. Please request a new one.")
      }
      throw error
    }

    const identifierBase = `${getRateLimitIdentifier(request)}:${installId}`
    const limit = checkRateLimit(`${identifierBase}:ext-upscale`, EXT_RATE_LIMIT_PER_MINUTE, 60 * 1000)
    if (!limit.allowed) {
      throw new HttpError(429, "Too many upscale requests. Please slow down.")
    }
    const daily = checkDailyRateLimit(`${identifierBase}:ext-upscale-daily`, EXT_DAILY_LIMIT)
    if (!daily.allowed) {
      throw new HttpError(429, "Daily free limit reached. Please try again tomorrow.")
    }

    const contentType = request.headers.get("content-type")?.toLowerCase() || ""
    let scale: number
    let faceEnhance: boolean
    let input: { buffer: Buffer; mimeType: string }

    if (contentType.includes("application/json")) {
      const parsed = await parseJsonPayload(request)
      scale = parsed.scale
      faceEnhance = parsed.faceEnhance
      input = { buffer: parsed.buffer, mimeType: parsed.mimeType }
    } else if (contentType.includes("multipart/form-data")) {
      const form = await request.formData()
      scale = parseScale(form.get("scale"))
      faceEnhance = (form.get("face_enhance") as string) === "true"
      const resolved = await resolveImageInput(form)
      input = resolved
    } else {
      throw new HttpError(415, "Unsupported Content-Type. Use application/json or multipart/form-data.")
    }

    const resized = await resizeInputForScale(input, scale)
    const dataUri = bufferToDataUri(resized.buffer, input.mimeType || "application/octet-stream")
    const result = await runReplicateUpscale({ dataUri, scale, faceEnhance })

    return NextResponse.json({
      jobId: result.jobId,
      outputImageUrl: result.outputImageUrl,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof ExtTokenError) {
      const status = error.code === "MISSING_SECRET" ? 500 : 401
      return NextResponse.json({ error: error.message }, { status })
    }

    console.error(`[EXT][UPSCALE] Unexpected error (replicate=${getReplicateTargetLabel()})`, error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}

function extractBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    throw new HttpError(401, "Missing Authorization header.")
  }
  const parts = authHeader.trim().split(/\s+/)
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    throw new HttpError(401, "Authorization header must be formatted as: Bearer <token>.")
  }
  return parts[1]
}

function getInstallIdFromHeader(request: NextRequest) {
  const installId = request.headers.get("x-install-id")?.trim()
  return installId || null
}

async function resolveImageInput(form: FormData): Promise<{ buffer: Buffer; mimeType: string }> {
  const imageUrlInput = (form.get("image_url") as string | null)?.trim()
  const blob = form.get("image_blob")

  if (imageUrlInput) {
    return downloadImageFromUrl(imageUrlInput)
  }

  if (blob instanceof File) {
    if (blob.size > MAX_IMAGE_BYTES) {
      throw new HttpError(413, `Image blob too large (${blob.size} bytes > ${MAX_IMAGE_BYTES} bytes limit).`)
    }
    const arrayBuffer = await blob.arrayBuffer()
    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType: blob.type || "application/octet-stream",
    }
  }

  throw new HttpError(400, "Provide either image_blob or image_url.")
}

async function parseJsonPayload(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.")
  }

  const scale = parseScale(body?.scale)
  const faceRaw = body?.face_enhance
  const faceEnhance =
    typeof faceRaw === "boolean" ? faceRaw : typeof faceRaw === "string" ? faceRaw.toLowerCase() === "true" : false
  const image = await resolveJsonImageInput(body)

  return {
    buffer: image.buffer,
    mimeType: image.mimeType,
    scale,
    faceEnhance,
  }
}

async function resolveJsonImageInput(body: any): Promise<{ buffer: Buffer; mimeType: string }> {
  const imageUrlInput = typeof body?.image_url === "string" ? body.image_url.trim() : ""
  const imageInput = typeof body?.image === "string" ? body.image.trim() : ""

  if (imageUrlInput) {
    return downloadImageFromUrl(imageUrlInput)
  }

  if (imageInput) {
    if (imageInput.startsWith("data:")) {
      return parseDataUriImage(imageInput)
    }
    if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
      return downloadImageFromUrl(imageInput)
    }
    throw new HttpError(400, "image must be a valid data URI or http(s) URL.")
  }

  throw new HttpError(400, "Provide image or image_url in request body.")
}

async function downloadImageFromUrl(imageUrlInput: string): Promise<{ buffer: Buffer; mimeType: string }> {
  let parsed: URL
  try {
    parsed = new URL(imageUrlInput)
  } catch {
    throw new HttpError(400, "image_url must be a valid URL.")
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new HttpError(400, "image_url must use http or https.")
  }

  const response = await fetch(imageUrlInput)
  if (!response.ok) {
    throw new HttpError(400, `Unable to download image (status ${response.status}).`)
  }

  const contentLength = Number(response.headers.get("content-length") || "0")
  if (contentLength && contentLength > MAX_IMAGE_BYTES) {
    throw new HttpError(413, `Remote image too large (${contentLength} bytes > ${MAX_IMAGE_BYTES} bytes limit).`)
  }

  const arrayBuffer = await response.arrayBuffer()
  if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
    throw new HttpError(413, `Downloaded image too large (${arrayBuffer.byteLength} bytes > ${MAX_IMAGE_BYTES}).`)
  }

  const mime = response.headers.get("content-type")?.split(";")[0] || "application/octet-stream"
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: mime,
  }
}

function parseDataUriImage(dataUri: string): { buffer: Buffer; mimeType: string } {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUri)
  if (!match) {
    throw new HttpError(400, "image must be a base64 data URI.")
  }
  const [, mimeTypeRaw, base64Data] = match
  let buffer: Buffer
  try {
    buffer = Buffer.from(base64Data, "base64")
  } catch {
    throw new HttpError(400, "image data URI is not valid base64.")
  }

  if (!buffer.length) {
    throw new HttpError(400, "Image data is empty.")
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new HttpError(413, `Image data too large (${buffer.length} bytes > ${MAX_IMAGE_BYTES} bytes limit).`)
  }

  return {
    buffer,
    mimeType: mimeTypeRaw || "application/octet-stream",
  }
}

function bufferToDataUri(buffer: Buffer | ArrayBuffer, mimeType: string) {
  const base64 = Buffer.isBuffer(buffer) ? buffer.toString("base64") : Buffer.from(buffer).toString("base64")
  return `data:${mimeType || "application/octet-stream"};base64,${base64}`
}

function parseScale(raw: unknown) {
  let scale: number
  if (typeof raw === "number" && Number.isFinite(raw)) {
    scale = raw
  } else if (typeof raw === "string" && raw.trim().length > 0) {
    scale = Number.parseInt(raw, 10)
  } else {
    scale = 2
  }

  if (!VALID_SCALES.has(scale)) {
    throw new HttpError(400, "Invalid scale. Only 2 or 4 are allowed.")
  }

  return scale
}

async function resizeInputForScale(
  input: { buffer: Buffer; mimeType: string },
  scale: number,
): Promise<{ buffer: Buffer }> {
  const maxEdge = scale === 4 ? 768 : 1024
  const metadata = await sharp(input.buffer).metadata()

  let workingBuffer = input.buffer
  if (metadata.width && metadata.height) {
    const longest = Math.max(metadata.width, metadata.height)
    if (longest > maxEdge) {
      // Resize the longer edge down before inference to reduce latency/GPU cost.
      workingBuffer = await sharp(input.buffer)
        .resize({
          width: metadata.width >= metadata.height ? maxEdge : undefined,
          height: metadata.height > metadata.width ? maxEdge : undefined,
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer()
    }
  }

  return {
    buffer: workingBuffer,
  }
}

async function runReplicateUpscale({
  dataUri,
  scale,
  faceEnhance,
}: {
  dataUri: string
  scale: number
  faceEnhance: boolean
}) {
  if (typeof dataUri !== "string" || dataUri.length === 0) {
    throw new HttpError(400, "Image data URI is empty.")
  }

  const replicate = getReplicateClient()
  const replicateInput = {
    image: dataUri,
    scale,
    face_enhance: faceEnhance,
  }
  const safeInputLog = {
    scale: replicateInput.scale,
    face_enhance: replicateInput.face_enhance,
  }
  if (typeof replicateInput.image === "string") {
    const prefix = (replicateInput.image as string).slice(0, 5)
    console.log(`[EXT][UPSCALE] Replicate input image typeof=string prefix=${prefix}`)
  }

  let predictionId: string | null = null
  let output: unknown
  try {
    output = await replicate.run(getReplicateModelIdentifier(), { input: replicateInput }, (prediction) => {
      if (prediction?.id) {
        predictionId = prediction.id
      }
    })
  } catch (error) {
    const safeError =
      error instanceof Error ? { name: error.name, message: error.message } : { message: "Unknown error" }
    console.error(`[EXT][UPSCALE] Replicate run error (${getReplicateTargetLabel()})`, {
      input: safeInputLog,
      jobId: predictionId,
      error: safeError,
    })
    const message = error instanceof Error ? error.message : "Replicate request failed."
    throw new HttpError(502, message)
  }

  const outputImageUrl = extractOutputImageUrl(output)
  if (!outputImageUrl) {
    console.error(`[EXT][UPSCALE] Replicate missing output (${getReplicateTargetLabel()})`, {
      input: safeInputLog,
      jobId: predictionId,
    })
    throw new HttpError(502, "Replicate did not return an output image URL.")
  }

  const imageResponse = await fetch(outputImageUrl)
  if (!imageResponse.ok) {
    console.error(`[EXT][UPSCALE] Unable to download Replicate output (${getReplicateTargetLabel()})`, {
      input: safeInputLog,
      jobId: predictionId,
      status: imageResponse.status,
    })
    throw new HttpError(502, "Unable to download processed image.")
  }

  const resultBuffer = Buffer.from(await imageResponse.arrayBuffer())
  // Convert to WebP by default to reduce payload size for the extension UI.
  const webpBuffer = await sharp(resultBuffer)
    .webp({
      quality: 82,
    })
    .toBuffer()
  const metadata = await sharp(webpBuffer).metadata()

  return {
    jobId: predictionId,
    outputImageUrl: bufferToDataUri(webpBuffer, "image/webp"),
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  }
}

function extractOutputImageUrl(output: unknown): string | null {
  if (!output) {
    return null
  }

  if (typeof output === "string") {
    return output
  }

  if (Array.isArray(output)) {
    for (const candidate of output) {
      const nested = extractOutputImageUrl(candidate)
      if (nested) {
        return nested
      }
    }
    return null
  }

  if (typeof output === "object") {
    const value = output as { [key: string]: unknown }
    if (typeof (value as any).url === "function") {
      try {
        const urlValue = (value as any).url()
        if (typeof urlValue === "string") {
          return urlValue
        }
        if (urlValue && typeof urlValue.toString === "function") {
          return urlValue.toString()
        }
      } catch {
        // ignore
      }
    }

    if (typeof (value as any).url === "string") {
      return (value as any).url as string
    }

    if (typeof (value as any).image === "string") {
      return (value as any).image as string
    }

    if ((value as any).image) {
      const nestedImage = extractOutputImageUrl((value as any).image)
      if (nestedImage) {
        return nestedImage
      }
    }

    if (typeof (value as any).toString === "function") {
      const stringValue = (value as any).toString()
      if (typeof stringValue === "string" && stringValue.startsWith("http")) {
        return stringValue
      }
    }
  }

  return null
}
