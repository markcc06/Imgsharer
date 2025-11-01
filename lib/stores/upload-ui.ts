"use client"
import { create } from "zustand"

type UploadUIState = {
  isOpen: boolean
  isLockingBody: boolean
  file: File | null
  objectUrl?: string
  open: (file?: File) => void
  close: () => void
  setFile: (f: File | null) => void
  setObjectUrl: (u?: string) => void
  reset: () => void
}

export const useUploadUI = create<UploadUIState>((set, get) => ({
  isOpen: false,
  isLockingBody: false,
  file: null,
  objectUrl: undefined,
  open: (file) => {
    console.log("[v0] Store: open called with file:", file?.name)
    if (!get().isLockingBody) {
      document.body.classList.add("overflow-hidden")
    }
    set({ isOpen: true, isLockingBody: true })
    if (file) set({ file })
    console.log("[v0] Store: modal opened, isOpen:", true)
  },
  close: () => {
    console.log("[v0] Store: close called")
    const url = get().objectUrl
    if (url) {
      console.log("[v0] Store: revoking objectUrl")
      URL.revokeObjectURL(url)
    }
    document.body.classList.remove("overflow-hidden")
    set({ isOpen: false, isLockingBody: false, file: null, objectUrl: undefined })
    console.log("[v0] Store: modal closed, state reset")
  },
  setFile: (f) => {
    console.log("[v0] Store: setFile called with:", f?.name)
    set({ file: f })
  },
  setObjectUrl: (u) => {
    console.log("[v0] Store: setObjectUrl called with:", u ? "URL" : "undefined")
    set({ objectUrl: u })
  },
  reset: () => {
    console.log("[v0] Store: reset called")
    const url = get().objectUrl
    if (url) {
      console.log("[v0] Store: revoking objectUrl in reset")
      URL.revokeObjectURL(url)
    }
    document.body.classList.remove("overflow-hidden")
    set({ isOpen: false, isLockingBody: false, file: null, objectUrl: undefined })
    console.log("[v0] Store: state reset complete")
  },
}))
