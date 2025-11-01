export type ConsentCategories = {
  essential: true
  analytics: boolean
  ads: boolean
  personalization?: boolean
}

export type ConsentState = {
  granted: boolean
  categories: ConsentCategories
  updatedAt: number
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: any[]) => void
  }
}

const STORAGE_KEY = "imgsharer_consent"
const COOKIE_NAME = "imgsharer_consent"
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const parseConsent = (value: string | null): ConsentState | null => {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as ConsentState
    if (!parsed || typeof parsed !== "object") return null
    if (!parsed.categories || typeof parsed.categories !== "object") return null
    return normalizeConsent(parsed)
  } catch {
    return null
  }
}

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const cookies = document.cookie ? document.cookie.split("; ") : []
  const found = cookies.find((row) => row.startsWith(`${name}=`))
  if (!found) return null
  return decodeURIComponent(found.split("=").slice(1).join("="))
}

const normalizeConsent = (state: ConsentState): ConsentState => {
  const analytics = Boolean(state.categories?.analytics)
  const ads = Boolean(state.categories?.ads)
  const personalization = Boolean(state.categories?.personalization)
  return {
    granted: analytics || ads,
    updatedAt: typeof state.updatedAt === "number" ? state.updatedAt : Date.now(),
    categories: {
      essential: true,
      analytics,
      ads,
      personalization,
    },
  }
}

export const defaultDenied = (): ConsentState => ({
  granted: false,
  updatedAt: Date.now(),
  categories: {
    essential: true,
    analytics: false,
    ads: false,
    personalization: false,
  },
})

export const getStoredConsent = (): ConsentState | null => {
  if (typeof window === "undefined") return null

  try {
    const fromStorage = parseConsent(window.localStorage?.getItem(STORAGE_KEY) ?? null)
    if (fromStorage) return fromStorage
  } catch {}

  const fromCookie = parseConsent(getCookie(COOKIE_NAME))
  return fromCookie
}

export const storeConsent = (state: ConsentState): void => {
  if (typeof document === "undefined" || typeof window === "undefined") return
  const normalized = normalizeConsent({
    ...state,
    updatedAt: Date.now(),
  })
  const serialized = JSON.stringify(normalized)
  try {
    window.localStorage.setItem(STORAGE_KEY, serialized)
  } catch {}
  try {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(serialized)}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax`
  } catch {}
}

export const consentToModeArgs = (
  state: ConsentState,
): { ad_storage: "granted" | "denied"; analytics_storage: "granted" | "denied" } => ({
  ad_storage: state.categories.ads ? "granted" : "denied",
  analytics_storage: state.categories.analytics ? "granted" : "denied",
})

export const applyConsentToGtag = (state: ConsentState): void => {
  if (typeof window === "undefined") return
  if (typeof window.gtag !== "function") return
  window.gtag("consent", "update", consentToModeArgs(state))
}

export const loadGAIfAllowed = (measurementId: string, state: ConsentState): void => {
  if (typeof document === "undefined" || typeof window === "undefined") return
  if (!measurementId || !state.categories.analytics) return

  const scriptId = `ga-gtag-${measurementId}`
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script")
    script.id = scriptId
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)
  }

  const inlineId = `ga-inline-${measurementId}`
  if (!document.getElementById(inlineId)) {
    const inline = document.createElement("script")
    inline.id = inlineId
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `
    document.head.appendChild(inline)
  }
}

export const loadAdSenseIfAllowed = (pubId: string, state: ConsentState): void => {
  if (typeof document === "undefined") return
  if (!pubId || !state.categories.ads) return

  const scriptId = `adsense-${pubId}`
  if (document.getElementById(scriptId)) return

  const script = document.createElement("script")
  script.id = scriptId
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(pubId)}`
  script.crossOrigin = "anonymous"
  document.head.appendChild(script)
}
