// Hero event bus for session-scoped before/after pair updates
export type HeroPair = { originalUrl: string; resultUrl?: string | null }

export const HERO_SESSION_KEY = "heroPair:v1"

export const loadSessionPair = (): HeroPair | null => {
  if (typeof window === "undefined") return null
  try {
    const s = sessionStorage.getItem(HERO_SESSION_KEY)
    const parsed = s ? (JSON.parse(s) as HeroPair) : null
    if (!parsed) return null
    const isBlob = (value?: string | null) => typeof value === "string" && value.startsWith("blob:")
    if (isBlob(parsed.originalUrl) || isBlob(parsed.resultUrl ?? null)) {
      sessionStorage.removeItem(HERO_SESSION_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const saveSessionPair = (p: HeroPair) => {
  try {
    sessionStorage.setItem(HERO_SESSION_KEY, JSON.stringify(p))
  } catch {}
}

export const publishHeroUpdate = (p: HeroPair) => {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent<HeroPair>("hero:update", { detail: p }))
}

export const subscribeHeroUpdate = (cb: (p: HeroPair) => void) => {
  const handler = (e: Event) => cb((e as CustomEvent<HeroPair>).detail)
  window.addEventListener("hero:update", handler)
  return () => window.removeEventListener("hero:update", handler)
}
