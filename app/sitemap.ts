import type { MetadataRoute } from "next"
import { getAllBlogPosts } from "@/lib/blog-data"

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
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
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

  const posts = getAllBlogPosts()

  for (const post of posts) {
    const lastModified = post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt)
    entries.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }

  return entries
}
