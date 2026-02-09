export type BillingMode = "off" | "audit" | "live"

export function getBillingMode(): BillingMode {
  const raw = (process.env.NEXT_PUBLIC_BILLING_MODE ?? "").toLowerCase()
  if (raw === "off" || raw === "audit" || raw === "live") return raw

  // Safety default: never expose billing features in production unless explicitly enabled.
  if (process.env.NODE_ENV === "production") return "off"
  return "live"
}

export const billingMode = getBillingMode()
export const billingLive = billingMode === "live"
export const billingAudit = billingMode === "audit"
export const billingEnabled = billingMode !== "off"

