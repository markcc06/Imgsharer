import { toolConfig } from "@/config/toolConfig"

export function getToolApiEndpoint() {
  return toolConfig.apiEndpoint
}

export function getToolUploadLimits() {
  const maxFileSizeBytes = toolConfig.maxFileSizeMb * 1024 * 1024
  return {
    maxFileSizeMb: toolConfig.maxFileSizeMb,
    maxFileSizeBytes,
    allowedMimeTypes: toolConfig.allowedMimeTypes,
  }
}
