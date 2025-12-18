import { createHmac, timingSafeEqual } from "crypto"

export const EXT_TOKEN_AUDIENCE = "imgsharer_ext"
export const EXT_TOKEN_SCOPE = "upscale"
export const EXT_TOKEN_TTL_SECONDS = 10 * 60 // 10 minutes

export type ExtTokenClaims = {
  aud: string
  scope: string
  iat: number
  exp: number
}

export class ExtTokenError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

function getSecret() {
  const secret = process.env.EXT_TOKEN_SECRET
  if (!secret) {
    throw new ExtTokenError("EXT_TOKEN_SECRET is not configured", "MISSING_SECRET")
  }
  return secret
}

function base64UrlEncode(value: Buffer | Uint8Array) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function base64UrlDecode(segment: string) {
  return Buffer.from(segment, "base64url")
}

function createSignature(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest()
}

export async function issueExtToken() {
  const secret = getSecret()
  const header = { alg: "HS256", typ: "JWT" }
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + EXT_TOKEN_TTL_SECONDS
  const payload: ExtTokenClaims = {
    aud: EXT_TOKEN_AUDIENCE,
    scope: EXT_TOKEN_SCOPE,
    iat,
    exp,
  }

  const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)))
  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(payload)))
  const data = `${encodedHeader}.${encodedPayload}`
  const signature = createSignature(data, secret)
  const encodedSignature = base64UrlEncode(signature)

  return {
    token: `${data}.${encodedSignature}`,
    expiresAt: exp * 1000,
  }
}

export async function verifyExtToken(token: string): Promise<ExtTokenClaims> {
  const secret = getSecret()
  const parts = token.split(".")
  if (parts.length !== 3) {
    throw new ExtTokenError("Malformed token", "MALFORMED")
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts

  let header: any
  let payload: ExtTokenClaims

  try {
    header = JSON.parse(base64UrlDecode(encodedHeader).toString("utf8"))
    payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"))
  } catch {
    throw new ExtTokenError("Unable to parse token", "MALFORMED")
  }

  if (header?.alg !== "HS256") {
    throw new ExtTokenError("Unsupported signing algorithm", "UNSUPPORTED_ALG")
  }

  const data = `${encodedHeader}.${encodedPayload}`
  const expectedSignature = createSignature(data, secret)
  const signature = base64UrlDecode(encodedSignature)

  if (expectedSignature.length !== signature.length || !timingSafeEqual(expectedSignature, signature)) {
    throw new ExtTokenError("Invalid token signature", "INVALID_SIGNATURE")
  }

  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== "number" || payload.exp <= now) {
    throw new ExtTokenError("Token expired", "EXPIRED")
  }

  if (payload.aud !== EXT_TOKEN_AUDIENCE) {
    throw new ExtTokenError("Invalid audience", "INVALID_AUDIENCE")
  }

  if (payload.scope !== EXT_TOKEN_SCOPE) {
    throw new ExtTokenError("Insufficient scope", "INVALID_SCOPE")
  }

  return payload
}

