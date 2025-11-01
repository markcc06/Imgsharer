"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const [language, setLanguage] = useState<"en" | "zh">("en")

  return (
    <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-full w-fit">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-4 py-1 text-sm transition-colors ${
          language === "en" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        English
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("zh")}
        className={`rounded-full px-4 py-1 text-sm transition-colors ${
          language === "zh" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        中文
      </Button>
    </div>
  )
}
