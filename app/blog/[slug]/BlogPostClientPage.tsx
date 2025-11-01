"use client"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { ArticleLayout } from "@/components/ArticleLayout"
import Link from "next/link"
import { notFound } from "next/navigation"

interface BlogPostClientPageProps {
  post: {
    slug: string
    title: { en: string }
    metaDescription: { en: string }
    keywords: string[]
    publishedAt: string
    updatedAt: string | null
    category: string
    body: { en: string }
    cta: { en: string }
  } | null
  params: { slug: string }
}

export default function BlogPostClientPage({ post, params }: BlogPostClientPageProps) {
  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <ArticleLayout>
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
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <span className="text-sm text-neutral-400">
                • Updated{" "}
                {new Date(post.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
            <span className="text-xs px-2 py-1 bg-coral/10 text-coral rounded-full">{post.category}</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-8 text-balance">{post.title.en}</h1>
        </header>

        {/* Article content */}
        <article className="article-content">
          <div dangerouslySetInnerHTML={{ __html: post.body.en }} />
        </article>

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

        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title.en,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt || post.publishedAt,
              author: {
                "@type": "Organization",
                name: "Imgsharer",
              },
              publisher: {
                "@type": "Organization",
                name: "Imgsharer",
                logo: {
                  "@type": "ImageObject",
                  url: "https://imagesharpenerai.pro/icon.png",
                },
              },
              description: post.metaDescription.en,
              keywords: post.keywords.join(", "),
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://imagesharpenerai.pro/blog/${post.slug}`,
              },
            }),
          }}
        />
      </ArticleLayout>
      <Footer />
    </main>
  )
}
