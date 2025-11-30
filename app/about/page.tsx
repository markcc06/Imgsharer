import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { siteConfig } from "@/config/siteConfig"

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.brandName}`,
  description: `Learn why we built ${siteConfig.brandName} and how we craft useful, delightful AI tools for better image clarity.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/about`,
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: `About Us | ${siteConfig.brandName}`,
    description: `Learn why we built ${siteConfig.brandName} and how we craft useful, delightful AI tools for better image clarity.`,
    url: `${siteConfig.siteUrl}/about`,
  },
  twitter: {
    card: "summary",
    title: `About Us | ${siteConfig.brandName}`,
    description: `Learn why we built ${siteConfig.brandName} and how we craft useful, delightful AI tools for better image clarity.`,
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: siteConfig.brandName,
      url: siteConfig.siteUrl,
    },
    {
      "@type": "WebSite",
      name: siteConfig.brandName,
      url: siteConfig.siteUrl,
    },
  ],
}

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-16 px-4 bg-neutral-50">
        <div className="max-w-3xl mx-auto space-y-8">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
          <h1 className="text-4xl font-display font-bold text-neutral-900">About Us</h1>
          <div className="space-y-6 text-neutral-700 leading-relaxed">
          <p>
            We’re a small startup team full of curiosity and passion — just ordinary people who love to build and explore.
            What makes us different is our willingness to experiment, create, and bring useful AI tools to life.
          </p>
          <p>
            The idea for {siteConfig.brandName} came directly from our daily work. Before building this project, we were a small
            team working in digital media and content creation — producing tons of photos for travel blogs, food reviews,
            and lifestyle stories.
          </p>
          <p>
            Many of those photos looked great in composition but had to be discarded simply because they weren’t clear
            enough. It felt like such a waste — the question “how to make a photo less blurry” kept coming up in our minds
            again and again.
          </p>
          <p>
            That’s when one of our AI enthusiasts built a small internal tool to fix photo clarity issues. It saved us a huge
            amount of time and effort in image editing, so we thought — why not turn it into a public product and share it
            with others who care about visual quality and creative expression?
          </p>
          <p>
            {siteConfig.brandName} is the result of that idea. It’s still in its early stage, but every feature and every detail has
            been crafted with care. We’ll keep improving it based on your feedback and our own ideas, bringing more fun and
            creative features in the future.
          </p>
          <p>
            Your support and feedback mean everything to us — feel free to reach out anytime through our Contact page.
          </p>
        </div>

          <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-neutral-900">FAQ</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-neutral-800">Is {siteConfig.brandName} free?</h3>
                <p className="text-neutral-700 text-sm">
                  We offer a free tier for light use; advanced features may be introduced over time.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Will you add batch processing?</h3>
                <p className="text-neutral-700 text-sm">We’re exploring it based on user feedback.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
