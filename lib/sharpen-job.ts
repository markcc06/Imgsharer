export type SharpenJobStatus = "starting" | "processing" | "succeeded" | "failed"

export type SharpenJob = {
  jobId: string
  status: SharpenJobStatus
  createdAt: number
  updatedAt: number
  installId: string | null
  email: string | null
  isPro: boolean
  scale: number
  faceEnhance: boolean
  remaining: number | null
  outputUrl: string | null
  error: string | null
}

export const SHARPEN_JOB_TTL_SECONDS = 60 * 60 * 2
