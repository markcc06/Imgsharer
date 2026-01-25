import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { getEarlyBirdSold, getEntitlementByInstallId, getPriceConfig } from "@/lib/entitlements"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getOrCreateInstallId(request: NextRequest) {
  const header = request.headers.get("x-install-id")?.trim()
  if (header) return header
  const existing = request.cookies.get("install_id")?.value
  if (existing) return existing
  return crypto.randomUUID()
}

export async function GET(request: NextRequest) {
  const installId = getOrCreateInstallId(request)
  const entitlement = installId ? await getEntitlementByInstallId(installId) : null
  const earlyBirdSold = await getEarlyBirdSold().catch(() => 0)
  const prices = getPriceConfig()

  const response = NextResponse.json({
    installId,
    entitlement,
    earlyBirdSold,
    prices,
  })

  if (installId && !request.cookies.get("install_id")) {
    response.cookies.set("install_id", installId, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
  }

  return response
}
