// Simple in-memory rate limiting (for production, use Redis/Upstash)
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Note: In serverless, this Map resets on cold starts
// For production, use Redis/Upstash for persistent rate limiting

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (entry && entry.resetAt < now) {
    rateLimitStore.delete(identifier)
  }

  const currentEntry = rateLimitStore.get(identifier)

  if (!currentEntry) {
    // Create new entry
    const resetAt = now + windowMs
    rateLimitStore.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (currentEntry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: currentEntry.resetAt }
  }

  // Increment count
  currentEntry.count++
  rateLimitStore.set(identifier, currentEntry)
  return { allowed: true, remaining: maxRequests - currentEntry.count, resetAt: currentEntry.resetAt }
}

export function getRateLimitIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"
  return ip
}

const dailyRateLimitStore = new Map<string, RateLimitEntry>()

export function checkDailyRateLimit(
  identifier: string,
  maxRequests: number,
): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const entry = dailyRateLimitStore.get(identifier)
  const windowMs = 24 * 60 * 60 * 1000 // 24 hours

  if (entry && entry.resetAt < now) {
    dailyRateLimitStore.delete(identifier)
  }

  const currentEntry = dailyRateLimitStore.get(identifier)

  if (!currentEntry) {
    const resetAt = now + windowMs
    dailyRateLimitStore.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (currentEntry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: currentEntry.resetAt }
  }

  currentEntry.count++
  dailyRateLimitStore.set(identifier, currentEntry)
  return { allowed: true, remaining: maxRequests - currentEntry.count, resetAt: currentEntry.resetAt }
}
