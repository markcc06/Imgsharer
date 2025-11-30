import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import type { Metadata } from "next"
import { getAllBlogPosts } from "@/lib/blog-data"
import { paginate } from "@/lib/pagination"
import { buildLandingMetadata } from "@/lib/seo-config"

export const runtime = "edge"

export const metadata: Metadata = {
  ...buildLandingMetadata("/blog"),
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const rawPage = searchParams.page
  const pageParam = Array.isArray(rawPage) ? rawPage[0] : rawPage
  const parsedPage = Number.parseInt(pageParam ?? "1", 10)
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const posts = getAllBlogPosts()
  const { slice, current, totalPages } = paginate(posts, currentPage, 5)

  const baseParams = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || typeof value === "undefined") continue
    if (Array.isArray(value)) {
      value.forEach((v) => baseParams.append(key, v))
    } else {
      baseParams.set(key, value)
    }
  }

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(baseParams)
    if (page > 1) {
      params.set("page", page.toString())
    } else {
      params.delete("page")
    }
    const query = params.toString()
    return query ? `/blog?${query}` : "/blog"
  }

  const prevUrl = current > 1 ? buildPageUrl(current - 1) : null
  const nextUrl = current < totalPages ? buildPageUrl(current + 1) : null

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">Blog</h1>
            <p className="text-lg text-neutral-600">Tips, tutorials, and insights on AI image enhancement</p>
          </div>

          <div className="grid gap-6">
            {slice.map((post) => (
              <Card key={post.slug} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <time className="text-sm text-neutral-500">
                      {post.publishedAtDisplay}
                    </time>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-coral inline-flex items-center px-2 py-1 bg-coral/10 rounded-full">
                      <span className="sr-only">Category:</span>
                      {post.category}
                    </h3>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-neutral-900">{post.title.en}</h2>
                  <p className="text-neutral-600 leading-relaxed">{post.metaDescription.en}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-coral font-medium hover:underline inline-flex items-center gap-1 group"
                  >
                    Read more
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-between text-sm text-neutral-600">
              {prevUrl ? (
                <Link href={prevUrl} className="hover:text-neutral-900">
                  ← Previous
                </Link>
              ) : (
                <span className="text-neutral-400">← Previous</span>
              )}
              <span>
                Page {current} of {totalPages}
              </span>
              {nextUrl ? (
                <Link href={nextUrl} className="hover:text-neutral-900">
                  Next →
                </Link>
              ) : (
                <span className="text-neutral-400">Next →</span>
              )}
            </nav>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
