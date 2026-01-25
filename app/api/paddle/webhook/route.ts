import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

import {
  EntitlementRecord,
  getEarlyBirdSold,
  getPriceConfig,
  incrementEarlyBirdSold,
  resolveTierFromPriceId,
  saveEntitlement,
} from "@/lib/entitlements"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 })
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function getWebhookSecret() {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error("PADDLE_WEBHOOK_SECRET is not configured")
  }
  return secret
}

function verifySignature(rawBody: string, header: string | null) {
  if (!header) return false
  // Paddle Billing (PB) format: t=<timestamp>;h1=<signature>
  const parts = Object.fromEntries(
    header
      .split(";")
      .map((p) => p.trim().split("="))
      .filter((p) => p.length === 2) as [string, string][],
  )
  const timestamp = parts["t"]
  const h1 = parts["h1"]
  if (!timestamp || !h1) return false

  const secret = getWebhookSecret()
  const signedPayload = `${timestamp}:${rawBody}`
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(h1))
  } catch {
    return false
  }
}

type WebhookBody = {
  event_type?: string
  type?: string
  data?: any
}

function extractPriceId(data: any) {
  return (
    data?.items?.[0]?.price?.id ||
    data?.items?.[0]?.price_id ||
    data?.object?.items?.[0]?.price_id ||
    data?.object?.items?.[0]?.price?.id ||
    null
  )
}

function extractQuantity(data: any) {
  const qty =
    data?.items?.[0]?.quantity ||
    data?.object?.items?.[0]?.quantity ||
    data?.quantity ||
    1
  return typeof qty === "number" && qty > 0 ? qty : 1
}

function extractInstallId(data: any) {
  return (
    data?.custom_data?.installId ||
    data?.customData?.installId ||
    data?.metadata?.installId ||
    data?.custom_data?.install_id ||
    data?.customData?.install_id ||
    data?.metadata?.install_id ||
    null
  )
}

function extractEmail(data: any) {
  const email =
    data?.customer?.email ||
    data?.object?.customer?.email ||
    data?.user?.email ||
    null
  return typeof email === "string" ? email : null
}

function extractIds(data: any) {
  return {
    subscriptionId: data?.id || data?.subscription_id || data?.object?.id || undefined,
    transactionId: data?.transaction_id || data?.object?.transaction_id || undefined,
  }
}

function isSuccessEvent(eventType: string) {
  // Minimal set for MVP: payment/subscription activated
  if (eventType.startsWith("transaction.")) {
    return eventType === "transaction.paid" || eventType === "transaction.completed"
  }
  if (eventType.startsWith("subscription.")) {
    return (
      eventType === "subscription.created" ||
      eventType === "subscription.activated" ||
      eventType === "subscription.updated"
    )
  }
  return false
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("paddle-signature")

  if (!verifySignature(rawBody, signature)) {
    return unauthorized("Invalid signature")
  }

  let body: WebhookBody
  try {
    body = JSON.parse(rawBody)
  } catch {
    return badRequest("Invalid JSON payload")
  }

  const eventType = body.event_type || body.type
  if (!eventType) {
    return badRequest("Missing event_type")
  }

  if (!isSuccessEvent(eventType)) {
    return NextResponse.json({ ok: true, ignored: eventType })
  }

  const priceId = extractPriceId(body.data)
  const tier = resolveTierFromPriceId(priceId)

  if (!priceId || !tier) {
    return NextResponse.json({ ok: true, ignored: "unmapped_price" })
  }

  const installId = extractInstallId(body.data)
  const email = extractEmail(body.data)
  const quantity = extractQuantity(body.data)
  const ids = extractIds(body.data)

  const record: EntitlementRecord = {
    tier,
    priceId,
    installId: installId || undefined,
    email: email || undefined,
    updatedAt: Date.now(),
    sourceEvent: eventType,
    subscriptionId: ids.subscriptionId,
    transactionId: ids.transactionId,
  }

  await saveEntitlement(record)
  if (tier === "early_bird") {
    await incrementEarlyBirdSold(quantity)
  }

  const counts = await getEarlyBirdSold().catch(() => 0)

  return NextResponse.json({
    ok: true,
    tier,
    priceId,
    installId: installId || null,
    email: email || null,
    sold: counts,
  })
}
