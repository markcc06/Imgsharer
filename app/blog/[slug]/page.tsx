import { getBlogPost, getAllBlogSlugs } from "@/lib/blog-data"
import type { Metadata } from "next"
import BlogPostClientPage from "./BlogPostClientPage"

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPost(params.slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: `${post.title.en} | Imgsharer Blog`,
    description: post.metaDescription.en,
    keywords: post.keywords.join(", "),
    openGraph: {
      title: post.title.en,
      description: post.metaDescription.en,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: ["Imgsharer"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title.en,
      description: post.metaDescription.en,
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)

  return <BlogPostClientPage post={post} params={params} />
}
