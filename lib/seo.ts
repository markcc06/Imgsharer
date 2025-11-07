import type { RawBlogPost } from "./blog-data"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.imagesharpenerai.pro"

export function buildArticleJsonLd(post: RawBlogPost, publishedAtISO: string, updatedAtISO?: string) {
  const url = `${SITE_URL}/blog/${post.slug}`

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title.en,
    description: post.metaDescription?.en || "",
    datePublished: publishedAtISO,
    dateModified: updatedAtISO || publishedAtISO,
    author: { "@type": "Person", name: "Imgsharer Team" },
    publisher: {
      "@type": "Organization",
      name: "Imgsharer",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
  }
}
