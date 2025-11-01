import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.imagesharpenerai.pro"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const blogModule = require("@/lib/blog-data")
    const posts = (blogModule?.blogPosts ?? blogModule?.default ?? []) as Array<{ slug?: string }>

    for (const post of posts) {
      if (post?.slug) {
        entries.push({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      }
    }
  } catch (error) {
    // Silently ignore missing module or other issues.
  }

  return entries
}

