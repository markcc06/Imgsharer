"use client"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { ArticleLayout } from "@/components/ArticleLayout"
import { buildArticleJsonLd } from "@/lib/seo"
import type { BlogPost } from "@/lib/blog-data"
import Link from "next/link"
import { notFound } from "next/navigation"

interface BlogPostClientPageProps {
  post: BlogPost | null
  params: { slug: string }
  relatedPosts: BlogPost[]
}

export default function BlogPostClientPage({ post, params, relatedPosts }: BlogPostClientPageProps) {
  if (!post) {
    notFound()
  }

  const publishedIso = post.publishedAt
  const updatedIso = post.updatedAt ?? post.publishedAt
  const articleJsonLd = buildArticleJsonLd(post, publishedIso, updatedIso)

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <ArticleLayout>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Blog
        </Link>

        {/* Article header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <time className="text-sm text-neutral-500">
              {post.publishedAtDisplay}
            </time>
            {post.updatedAtDisplay && (
              <span className="text-sm text-neutral-400">• Updated {post.updatedAtDisplay}</span>
            )}
            <span className="text-xs px-2 py-1 bg-coral/10 text-coral rounded-full">{post.category}</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-8 text-balance">{post.title.en}</h1>
        </header>

        {/* Article content */}
        <article className="article-content">
          <div dangerouslySetInnerHTML={{ __html: post.body.en }} />
        </article>

        {relatedPosts.length > 0 && (
          <section className="mt-12 border-t border-neutral-200 pt-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Related articles</h3>
            <ul className="space-y-3">
              {relatedPosts.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/blog/${related.slug}`}
                    className="text-coral font-medium hover:underline"
                  >
                    {related.title.en}
                  </Link>
                  {related.metaDescription.en && (
                    <p className="text-sm text-neutral-600">{related.metaDescription.en}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-coral/10 to-coral/5 rounded-2xl border border-coral/20">
          <p className="text-lg font-medium text-neutral-900 mb-4">{post.cta.en}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white rounded-full font-medium hover:bg-coral/90 transition-colors"
          >
            Try Free Now →
          </Link>
        </div>
      </ArticleLayout>
      <Footer />
    </main>
  )
}
