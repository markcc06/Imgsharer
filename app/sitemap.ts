import type { MetadataRoute } from "next"
import { getAllBlogPosts } from "@/lib/blog-data"
import { siteConfig } from "@/config/siteConfig"

const BASE_URL = siteConfig.siteUrl

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
      url: `${BASE_URL}/blurry-photo`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/image-enhancer-free`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/christmas-wallpaper`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/christmas-wallpaper/cute-wallpaper-for-christmas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/christmas-wallpaper/winter-cabin-at-night`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/christmas-wallpaper/christmas-tree-lights`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/christmas-wallpaper/ice-castle-queen`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/christmas-wallpaper/cosmic-space-christmas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/christmas-wallpaper/cute-christmas-robots`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/christmas-wallpaper/pastel-candy-christmas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/christmas-wallpaper/snowy-forest-aesthetic`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/make-picture-clear`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
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
    const lastModifiedIso = post.updatedAt ?? post.publishedAt ?? now.toISOString()
    const lastModified = new Date(lastModifiedIso)
    entries.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }

  return entries
}
