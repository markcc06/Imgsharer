export interface SharpenRequest {
  image: string // base64 encoded image
  captchaToken: string
}

export interface SharpenResponse {
  success: boolean
  sharpenedImage?: string // base64 encoded
  error?: string
  remainingRequests?: number
}

export interface RateLimitInfo {
  allowed: boolean
  remaining: number
  resetAt: number
}
