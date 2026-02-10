import "server-only"

import { kvGetJSON, kvIncrBy, kvSetJSON } from "./kv"

export type EntitlementTier = "early_bird" | "standard"

export type EntitlementRecord = {
  tier: EntitlementTier
  priceId: string
  email?: string
  installId?: string
  updatedAt: number
  sourceEvent?: string
  subscriptionId?: string
  transactionId?: string
  expiresAt?: number
  revokedAt?: number
}

const EARLY_BIRD_KEY = "earlybird:sold"

function getPriceIds() {
  const earlyBird = process.env.PADDLE_PRICE_ID_EARLY_BIRD || process.env.PADDLE_PRICE_ID_EARLYBIRD
  const standard = process.env.PADDLE_PRICE_ID_STANDARD

  return { earlyBird, standard }
}

export function resolveTierFromPriceId(priceId?: string | null): EntitlementTier | null {
  if (!priceId) return null
  const { earlyBird, standard } = getPriceIds()
  if (earlyBird && priceId === earlyBird) return "early_bird"
  if (standard && priceId === standard) return "standard"
  return null
}

function isValidEntitlementRecord(record: EntitlementRecord) {
  const now = Date.now()
  if (typeof record.revokedAt === "number" && Number.isFinite(record.revokedAt) && record.revokedAt <= now) {
    return false
  }
  if (typeof record.expiresAt === "number" && Number.isFinite(record.expiresAt) && record.expiresAt <= now) {
    return false
  }

  // For Creem, only treat first successful payment as a valid grant.
  // Older test data may have been written on `checkout.completed`; we must ignore it.
  if (record.sourceEvent?.startsWith("creem:")) {
    return record.sourceEvent === "creem:subscription.paid"
  }

  // Paddle/other sources: accept as-is.
  return true
}

function parseEntitlement(value: unknown): EntitlementRecord | null {
  if (!value) return null

  const parsed =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value) as unknown
          } catch {
            return null
          }
        })()
      : value

  if (!parsed || typeof parsed !== "object") return null

  const record = parsed as Partial<EntitlementRecord>
  if (record.tier !== "early_bird" && record.tier !== "standard") return null
  if (typeof record.priceId !== "string" || record.priceId.length === 0) return null
  if (typeof record.updatedAt !== "number" || !Number.isFinite(record.updatedAt)) return null

  // optional fields are not strictly validated
  return isValidEntitlementRecord(record as EntitlementRecord) ? (record as EntitlementRecord) : null
}

export async function getEntitlementByInstallId(installId?: string | null) {
  if (!installId) return null
  const value = await kvGetJSON<unknown>(`entitlement:${installId}`)
  return parseEntitlement(value)
}

export async function getEntitlementByEmail(email?: string | null) {
  if (!email) return null
  const value = await kvGetJSON<unknown>(`entitlement:email:${email.toLowerCase()}`)
  return parseEntitlement(value)
}

export async function saveEntitlement(record: EntitlementRecord) {
  if (!record.installId && !record.email) {
    throw new Error("saveEntitlement requires installId or email")
  }

  if (record.installId) {
    await kvSetJSON(`entitlement:${record.installId}`, record)
  }

  if (record.email) {
    await kvSetJSON(`entitlement:email:${record.email.toLowerCase()}`, record)
  }

  return record
}

export async function incrementEarlyBirdSold(amount = 1) {
  return kvIncrBy(EARLY_BIRD_KEY, amount)
}

export async function getEarlyBirdSold() {
  const current = await kvGetJSON<number | string>(EARLY_BIRD_KEY)

  const parsed =
    typeof current === "number"
      ? current
      : typeof current === "string" && current.trim().length > 0
        ? Number(current)
        : NaN

  return Number.isFinite(parsed) ? parsed : 0
}

export function getPriceConfig() {
  const { earlyBird, standard } = getPriceIds()
  return {
    earlyBirdPriceId: earlyBird || null,
    standardPriceId: standard || null,
  }
}
