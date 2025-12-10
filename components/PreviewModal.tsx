"use client"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { useUploadUI } from "@/lib/stores/upload-ui"
import UploadDropzone from "@/components/UploadDropzone"
import { ImageUploader } from "@/components/image-uploader"

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export default function PreviewModal() {
  const { isOpen, close, file, objectUrl, pendingWallpaper } = useUploadUI()

  console.log(
    "[v0] PreviewModal render - isOpen:",
    isOpen,
    "file:",
    file?.name,
    "objectUrl:",
    objectUrl ? "exists" : "null",
    "pendingWallpaper:",
    pendingWallpaper ? "exists" : "null",
  )

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log("[v0] ESC key pressed, closing modal")
        close()
      }
    }
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [close])

  if (typeof window === "undefined") return null
  if (!isOpen) return null

  const shouldShowUploader = !!file || !!pendingWallpaper

  return createPortal(
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => {
          console.log("[v0] Backdrop clicked, closing modal")
          close()
        }}
      />
      {/* Panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-5xl rounded-2xl bg-white/95 backdrop-blur-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => {
              console.log("[v0] Close button clicked")
              close()
            }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-neutral-900/10 hover:bg-neutral-900/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5 text-neutral-900" />
          </button>

          {!shouldShowUploader ? (
            <>
              {console.log("[v0] Rendering UploadDropzone (no file, no pending wallpaper)")}
              <UploadDropzone mode="modal" />
            </>
          ) : (
            <>
              {console.log(
                "[v0] Rendering ImageUploader",
                file ? `with file: ${file.name}` : "with pending wallpaper",
              )}
              <ImageUploader
                initialImage={file ? { image: objectUrl || "", fileName: file.name } : undefined}
                onSharpenComplete={() => {}}
              />
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
