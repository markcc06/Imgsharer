import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import type { Metadata } from "next"
import { blogPosts } from "@/lib/blog-data"

export const metadata: Metadata = {
  title: "Blog - Free AI Image Sharpener Tips & Use Cases | Imgsharer",
  description:
    "Learn how to unblur photos, sharpen product images, enhance selfies, and fix blurry screenshots with AI. Free tutorials and tips.",
}

export default function BlogPage() {
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
            {blogPosts.map((post) => (
              <Card key={post.slug} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <time className="text-sm text-neutral-500">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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
        </div>
      </div>
      <Footer />
    </main>
  )
}
