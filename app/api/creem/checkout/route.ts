import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { currentUser, getAuth } from "@clerk/nextjs/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Tier = "early_bird" | "standard"

function getCreemBaseUrl(apiKey: string) {
  if (apiKey.startsWith("creem_test_")) return "https://test-api.creem.io"
  return "https://api.creem.io"
}

function getRequiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function getProductId(tier: Tier) {
  if (tier === "early_bird") return getRequiredEnv("CREEM_PRODUCT_ID_EARLY_BIRD")
  return getRequiredEnv("CREEM_PRODUCT_ID_STANDARD")
}

function getPricingToken() {
  return process.env.NEXT_PUBLIC_PRICING_TOKEN ?? "prc-9b8f4c1d"
}

export async function POST(request: NextRequest) {
  try {
    // Use getAuth(request) so the session is parsed from this request, avoiding
    // cases where auth() loses context in route handlers.
    const { userId } = getAuth(request)
    const user = userId ? await currentUser().catch(() => null) : null
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null

    // Must be signed in before starting checkout, but do not hard-require fetching user profile/email here.
    // (In some dev setups/extensions, the profile fetch can fail even when the session is valid.)
    if (!userId) {
      return NextResponse.json({ error: "login_required" }, { status: 401 })
    }

    const provider = process.env.PAYMENT_PROVIDER ?? process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "paddle"
    if (provider !== "creem") {
      return NextResponse.json({ error: "creem_not_enabled" }, { status: 400 })
    }

    const apiKey = getRequiredEnv("CREEM_API_KEY")
    const baseUrl = getCreemBaseUrl(apiKey)

    const body = (await request.json().catch(() => null)) as
      | { tier?: Tier; installId?: string | null }
      | null

    const tier = body?.tier === "early_bird" || body?.tier === "standard" ? body.tier : null
    if (!tier) {
      return NextResponse.json({ error: "missing_tier" }, { status: 400 })
    }

    const installId = typeof body?.installId === "string" ? body.installId.trim() : ""
    if (!installId) {
      return NextResponse.json({ error: "missing_install_id" }, { status: 400 })
    }

    const productId = getProductId(tier)
    const requestId = crypto.randomUUID()
    const pricingToken = getPricingToken()
    const successUrl = `${request.nextUrl.origin}/pricing?token=${encodeURIComponent(pricingToken)}`

    const res = await fetch(`${baseUrl}/v1/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        product_id: productId,
        request_id: requestId,
        units: 1,
        success_url: successUrl,
        metadata: {
          installId,
          tier,
          ...(email ? { email } : {}),
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return NextResponse.json({ error: "creem_create_checkout_failed", details: text }, { status: 502 })
    }

    const data = (await res.json()) as { checkout_url?: string }
    const checkoutUrl = typeof data?.checkout_url === "string" ? data.checkout_url : ""
    if (!checkoutUrl) {
      return NextResponse.json({ error: "missing_checkout_url" }, { status: 502 })
    }

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error("[creem][checkout] error", error)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}
