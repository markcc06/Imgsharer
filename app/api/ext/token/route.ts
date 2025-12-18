import { NextRequest, NextResponse } from "next/server"

import { ExtTokenError, issueExtToken } from "@/lib/ext-jwt"
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TOKEN_RATE_LIMIT_PER_MINUTE = 30

export async function POST(request: NextRequest) {
  try {
    const identifier = `${getRateLimitIdentifier(request)}:ext-token`
    const minuteLimit = checkRateLimit(identifier, TOKEN_RATE_LIMIT_PER_MINUTE, 60 * 1000)
    if (!minuteLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many token requests. Please wait a moment before trying again.",
          resetAt: minuteLimit.resetAt,
        },
        { status: 429 },
      )
    }

    const { token, expiresAt } = await issueExtToken()
    return NextResponse.json({
      token,
      expiresAt,
    })
  } catch (error) {
    if (error instanceof ExtTokenError && error.code === "MISSING_SECRET") {
      return NextResponse.json(
        {
          error: "EXT_TOKEN_SECRET is not configured on the server.",
        },
        { status: 500 },
      )
    }

    console.error("[EXT][TOKEN] Error issuing token", error)
    return NextResponse.json(
      {
        error: "Unable to issue token.",
      },
      { status: 500 },
    )
  }
}

