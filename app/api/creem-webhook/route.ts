import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { kvGetJSON, kvSetJSON } from "@/lib/kv"
import { incrementEarlyBirdSold, saveEntitlement } from "@/lib/entitlements"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Tier = "early_bird" | "standard"

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
  return extractString(payload?.object?.customer?.email) || null
}

function extractSubscriptionId(payload: any) {
  return extractString(payload?.object?.subscription?.id) || extractString(payload?.object?.subscription) || null
}

function extractOrderId(payload: any) {
  return extractString(payload?.object?.order?.id) || extractString(payload?.object?.order) || null
}

function isGrantEvent(eventType: string) {
  return eventType === "checkout.completed" || eventType === "subscription.paid" || eventType === "subscription.active"
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
  const eventType = extractString(payload?.eventType) || extractString(payload?.event_type) || null
  if (!eventType) return NextResponse.json({ ok: true, ignored: "missing_event_type" })

  if (eventId) {
    const seen = await kvGetJSON<boolean>(`creem:event:${eventId}`).catch(() => null)
    if (seen) {
      return NextResponse.json({ ok: true, deduped: true })
    }
    await kvSetJSON(`creem:event:${eventId}`, true).catch(() => null)
  }

  if (!isGrantEvent(eventType)) {
    return NextResponse.json({ ok: true, ignored: eventType })
  }

  const productId = extractProductId(payload)
  if (!productId) return NextResponse.json({ ok: true, ignored: "missing_product_id" })

  const tier = resolveTierFromProductId(productId)
  if (!tier) return NextResponse.json({ ok: true, ignored: "unmapped_product" })

  const installId = extractInstallId(payload)
  if (!installId) return NextResponse.json({ ok: true, ignored: "missing_install_id" })

  const email = extractEmail(payload)
  const subscriptionId = extractSubscriptionId(payload)
  const orderId = extractOrderId(payload)

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
    await incrementEarlyBirdSold(1).catch(() => null)
  }

  return NextResponse.json({ ok: true })
}

