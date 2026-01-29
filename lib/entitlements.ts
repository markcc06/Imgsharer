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

export async function getEntitlementByInstallId(installId?: string | null) {
  if (!installId) return null
  return kvGetJSON<EntitlementRecord>(`entitlement:${installId}`)
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
