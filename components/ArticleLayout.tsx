import type { ReactNode } from "react"

interface ArticleLayoutProps {
  children: ReactNode
}

export function ArticleLayout({ children }: ArticleLayoutProps) {
  return (
    <div className="flex-1 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto prose prose-neutral">{children}</div>
    </div>
  )
}
