import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { kvGetJSON, kvIncrBy, kvSetJSON } from "@/lib/kv"
import {
  getEntitlementByEmail,
  getEntitlementByInstallId,
  incrementEarlyBirdSold,
  saveEntitlement,
  type EntitlementRecord,
} from "@/lib/entitlements"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Tier = "early_bird" | "standard"
type SubscriptionIdentity = { email?: string; installId?: string }

const GRANT_EVENT = "subscription.paid"
const REFUND_EVENTS = new Set([
  "refund.succeeded",
  "refund.completed",
  "order.refunded",
  "subscription.refunded",
  "payment.refunded",
  "charge.refunded",
])
const CANCEL_REQUEST_EVENTS = new Set(["subscription.canceled", "subscription.cancelled"])
const CANCEL_EFFECTIVE_EVENTS = new Set(["subscription.ended", "subscription.expired", "subscription.terminated"])
const CANCELLED_STATUSES = new Set(["canceled", "cancelled", "cancel_at_period_end", "scheduled_for_cancellation"])
const ENDED_STATUSES = new Set(["expired", "ended", "terminated", "inactive"])

function getWebhookSecret() {
  const secret = process.env.CREEM_WEBHOOK_SECRET
  if (!secret) throw new Error("CREEM_WEBHOOK_SECRET is not configured")
  return secret
}

function verifySignature(rawBody: string, signature: string | null) {
  if (!signature) return false
  const secret = getWebhookSecret()
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

function resolveTierFromProductId(productId: string): Tier | null {
  const earlyBird = process.env.CREEM_PRODUCT_ID_EARLY_BIRD
  const standard = process.env.CREEM_PRODUCT_ID_STANDARD
  if (earlyBird && productId === earlyBird) return "early_bird"
  if (standard && productId === standard) return "standard"
  return null
}

function extractString(value: unknown) {
  return typeof value === "string" ? value : null
}

function extractProductId(payload: any) {
  return (
    extractString(payload?.object?.product?.id) ||
    extractString(payload?.object?.product) ||
    extractString(payload?.object?.order?.product) ||
    extractString(payload?.object?.subscription?.product?.id) ||
    extractString(payload?.object?.subscription?.product) ||
    null
  )
}

function extractInstallId(payload: any) {
  const meta = payload?.object?.metadata ?? payload?.object?.subscription?.metadata ?? null
  return extractString(meta?.installId) || extractString(meta?.install_id) || null
}

function extractEmail(payload: any) {
  return (
    extractString(payload?.object?.customer?.email) ||
    extractString(payload?.object?.subscription?.customer?.email) ||
    extractString(payload?.object?.email) ||
    null
  )
}

function extractSubscriptionId(payload: any) {
  return (
    extractString(payload?.object?.id) ||
    extractString(payload?.object?.subscription?.id) ||
    extractString(payload?.object?.subscription) ||
    null
  )
}

function extractOrderId(payload: any) {
  return extractString(payload?.object?.order?.id) || extractString(payload?.object?.order) || null
}

function normalizeEventType(eventType: string) {
  return eventType.trim().toLowerCase()
}

function parseTimestampMs(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1_000_000_000_000 ? Math.trunc(value) : Math.trunc(value * 1000)
  }

  if (typeof value !== "string") return null
  const raw = value.trim()
  if (!raw) return null

  const asNumber = Number(raw)
  if (Number.isFinite(asNumber)) {
    return asNumber > 1_000_000_000_000 ? Math.trunc(asNumber) : Math.trunc(asNumber * 1000)
  }

  const asDate = Date.parse(raw)
  return Number.isFinite(asDate) ? asDate : null
}

function extractPeriodEndMs(payload: any) {
  const candidates = [
    payload?.object?.current_period_end,
    payload?.object?.subscription?.current_period_end,
    payload?.object?.currentPeriodEnd,
    payload?.object?.subscription?.currentPeriodEnd,
    payload?.object?.period_end,
    payload?.object?.subscription?.period_end,
    payload?.object?.ends_at,
    payload?.object?.subscription?.ends_at,
    payload?.object?.cancel_at,
    payload?.object?.subscription?.cancel_at,
  ]

  for (const candidate of candidates) {
    const parsed = parseTimestampMs(candidate)
    if (parsed !== null) return parsed
  }

  return null
}

function extractSubscriptionStatus(payload: any) {
  const status =
    extractString(payload?.object?.status) || extractString(payload?.object?.subscription?.status) || extractString(payload?.status)
  return status ? status.toLowerCase() : null
}

function isGrantEvent(eventType: string) {
  // For our recurring plans, grant entitlement only on the first successful payment.
  // Other events like checkout.completed/subscription.active can fire multiple times (or before payment),
  // which would incorrectly decrement Early Bird multiple times.
  return eventType === GRANT_EVENT
}

function isRefundEvent(eventType: string, payload: any) {
  if (REFUND_EVENTS.has(eventType)) return true
  if (eventType.includes("refunded")) return true

  const status =
    extractString(payload?.object?.refund?.status) ||
    extractString(payload?.object?.order?.status) ||
    extractString(payload?.object?.status)
  return typeof status === "string" && status.toLowerCase() === "refunded"
}

function isCancellationRequestEvent(eventType: string, status: string | null, periodEndMs: number | null) {
  if (CANCEL_REQUEST_EVENTS.has(eventType)) {
    return typeof periodEndMs === "number" && periodEndMs > Date.now()
  }
  return eventType === "subscription.updated" && !!status && CANCELLED_STATUSES.has(status) && !!periodEndMs && periodEndMs > Date.now()
}

function isCancellationEffectiveEvent(eventType: string, status: string | null, periodEndMs: number | null) {
  if (CANCEL_EFFECTIVE_EVENTS.has(eventType)) return true
  if (eventType === "subscription.deleted") return true
  if (eventType === "subscription.updated" && !!status && ENDED_STATUSES.has(status)) return true
  if (
    (CANCEL_REQUEST_EVENTS.has(eventType) || eventType === "subscription.updated") &&
    !!status &&
    CANCELLED_STATUSES.has(status) &&
    (!periodEndMs || periodEndMs <= Date.now())
  ) {
    return true
  }
  return false
}

function getSubscriptionIdentityKey(subscriptionId: string) {
  return `creem:subscription:${subscriptionId}:identity`
}

async function resolveIdentity(payload: any, subscriptionId: string | null): Promise<SubscriptionIdentity> {
  let installId = extractInstallId(payload) || undefined
  let email = extractEmail(payload)?.toLowerCase() || undefined

  if (subscriptionId && (!installId || !email)) {
    const mapped = await kvGetJSON<{ installId?: string | null; email?: string | null }>(getSubscriptionIdentityKey(subscriptionId)).catch(
      () => null,
    )
    const mappedInstallId = typeof mapped?.installId === "string" && mapped.installId.trim().length > 0 ? mapped.installId : undefined
    const mappedEmail =
      typeof mapped?.email === "string" && mapped.email.trim().length > 0 ? mapped.email.trim().toLowerCase() : undefined
    installId = installId || mappedInstallId
    email = email || mappedEmail
  }

  return { installId, email }
}

async function saveSubscriptionIdentity(subscriptionId: string | null, identity: SubscriptionIdentity) {
  if (!subscriptionId) return
  const payload = {
    installId: identity.installId ?? null,
    email: identity.email ?? null,
  }
  await kvSetJSON(getSubscriptionIdentityKey(subscriptionId), payload).catch(() => null)
}

async function getEntitlement(identity: SubscriptionIdentity) {
  const byEmail = identity.email ? await getEntitlementByEmail(identity.email).catch(() => null) : null
  if (byEmail) return byEmail
  const byInstall = identity.installId ? await getEntitlementByInstallId(identity.installId).catch(() => null) : null
  return byInstall
}

async function saveMutatedEntitlement(
  existing: EntitlementRecord,
  identity: SubscriptionIdentity,
  patch: Partial<Pick<EntitlementRecord, "expiresAt" | "revokedAt" | "subscriptionId" | "transactionId">>,
) {
  await saveEntitlement({
    ...existing,
    email: existing.email || identity.email,
    installId: existing.installId || identity.installId,
    updatedAt: Date.now(),
    expiresAt: patch.expiresAt ?? existing.expiresAt,
    revokedAt: patch.revokedAt ?? existing.revokedAt,
    subscriptionId: patch.subscriptionId ?? existing.subscriptionId,
    transactionId: patch.transactionId ?? existing.transactionId,
  })
}

async function revokeEntitlement(identity: SubscriptionIdentity, subscriptionId: string | null, orderId: string | null) {
  const existing = await getEntitlement(identity)
  if (!existing) return false
  await saveMutatedEntitlement(existing, identity, {
    revokedAt: Date.now(),
    subscriptionId: subscriptionId || existing.subscriptionId,
    transactionId: orderId || existing.transactionId,
  })
  return true
}

async function scheduleEntitlementExpiry(
  identity: SubscriptionIdentity,
  expiresAt: number,
  subscriptionId: string | null,
  orderId: string | null,
) {
  const existing = await getEntitlement(identity)
  if (!existing) return false
  await saveMutatedEntitlement(existing, identity, {
    expiresAt,
    subscriptionId: subscriptionId || existing.subscriptionId,
    transactionId: orderId || existing.transactionId,
  })
  return true
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("creem-signature")

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const eventId = extractString(payload?.id) || null
  const eventTypeRaw = extractString(payload?.eventType) || extractString(payload?.event_type) || null
  if (!eventTypeRaw) return NextResponse.json({ ok: true, ignored: "missing_event_type" })
  const eventType = normalizeEventType(eventTypeRaw)

  if (eventId) {
    const seen = await kvGetJSON<boolean>(`creem:event:${eventId}`).catch(() => null)
    if (seen) {
      return NextResponse.json({ ok: true, deduped: true })
    }
    await kvSetJSON(`creem:event:${eventId}`, true).catch(() => null)
  }

  const subscriptionId = extractSubscriptionId(payload)
  const orderId = extractOrderId(payload)
  const identity = await resolveIdentity(payload, subscriptionId)
  await saveSubscriptionIdentity(subscriptionId, identity)

  if (isGrantEvent(eventType)) {
    const productId = extractProductId(payload)
    if (!productId) return NextResponse.json({ ok: true, ignored: "missing_product_id" })

    const tier = resolveTierFromProductId(productId)
    if (!tier) return NextResponse.json({ ok: true, ignored: "unmapped_product" })

    const installId = identity.installId
    if (!installId) return NextResponse.json({ ok: true, ignored: "missing_install_id" })

    const email = identity.email

    // Idempotency: only grant once per subscription (subscription.paid also fires on renewals).
    // Use an atomic KV incr to avoid race conditions when multiple deliveries land at the same time.
    const grantKey = subscriptionId
      ? `creem:grant:subscription:${subscriptionId}`
      : orderId
        ? `creem:grant:order:${orderId}`
        : null

    if (grantKey) {
      const attempt = await kvIncrBy(grantKey, 1).catch(() => 0)
      if (attempt !== 1) {
        return NextResponse.json({ ok: true, deduped: true })
      }
    }

    await saveEntitlement({
      tier,
      priceId: productId,
      installId,
      email: email || undefined,
      updatedAt: Date.now(),
      sourceEvent: `creem:${eventType}`,
      subscriptionId: subscriptionId || undefined,
      transactionId: orderId || undefined,
    })

    if (tier === "early_bird") {
      await incrementEarlyBirdSold(1).catch((err) => {
        console.error("[creem] increment early bird failed", err)
        throw err
      })
    }

    return NextResponse.json({ ok: true })
  }

  if (isRefundEvent(eventType, payload)) {
    const revoked = await revokeEntitlement(identity, subscriptionId, orderId)
    return NextResponse.json({ ok: true, revoked })
  }

  const status = extractSubscriptionStatus(payload)
  const periodEndMs = extractPeriodEndMs(payload)

  if (isCancellationRequestEvent(eventType, status, periodEndMs)) {
    if (!periodEndMs) return NextResponse.json({ ok: true, ignored: "missing_period_end" })
    const scheduled = await scheduleEntitlementExpiry(identity, periodEndMs, subscriptionId, orderId)
    return NextResponse.json({ ok: true, scheduled, effectiveAt: periodEndMs })
  }

  if (isCancellationEffectiveEvent(eventType, status, periodEndMs)) {
    const revoked = await revokeEntitlement(identity, subscriptionId, orderId)
    return NextResponse.json({ ok: true, revoked })
  }

  return NextResponse.json({ ok: true, ignored: eventType })
}
