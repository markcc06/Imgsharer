import { siteConfig } from "./siteConfig"

export type HeroBullet = {
  title: string
  body: string
  icon?: string
}

export type StepItem = {
  title: string
  body: string
}

export type FaqItem = {
  question: string
  answer: string
}

export type LandingConfig = {
  slug: string
  path: string
  metaTitle: string
  metaDescription: string
  heroBadge?: string
  heroTitle: string
  heroSubtitle: string
  heroDescription?: string
  heroCtaLabel: string
  heroBullets?: HeroBullet[]
  heroEyebrow?: string
  howItWorksTitle: string
  howItWorksSubtitle?: string
  howItWorksSteps: StepItem[]
  useCasesTitle?: string
  useCasesDescription?: string
  useCasesItems?: StepItem[]
  faqTitle?: string
  faqItems?: FaqItem[]
}

export type RelatedSolution = {
  title: string
  description: string
  href: string
  ctaLabel: string
  iconBg: string
  iconColor: string
  iconEmoji: string
}

export type ToolConfig = {
  toolId: string
  primaryKeyword: string
  defaultMetaTitle: string
  defaultMetaDescription: string
  primaryCtaLabel: string
  apiEndpoint: string
  maxFileSizeMb: number
  allowedMimeTypes: string[]
  relatedSection: {
    eyebrow: string
    title: string
    description: string
  }
  relatedSolutions: RelatedSolution[]
  landings: LandingConfig[]
}

export const toolConfig: ToolConfig = {
  toolId: "imgsharer-sharpen",
  primaryKeyword: "ai image sharpener",
  defaultMetaTitle: "Free AI Image Sharpener Instantly Enhance Photo Clarity",
  defaultMetaDescription:
    "Free AI image sharpener to enhance and restore photo clarity. Upload a picture, sharpen in seconds, then download crystal-clear results. Private and fast.",
  primaryCtaLabel: "Sharpen my image",
  apiEndpoint: "/api/sharpen",
  maxFileSizeMb: 8,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  relatedSection: {
    eyebrow: "More ways to use Imgsharer",
    title: "Fix blurry photos and enhance images with AI",
    description:
      "Choose the option that matches your problem best. All tools use the same secure, AI-powered engine behind Imgsharer.",
  },
  relatedSolutions: [
    {
      title: "Fix blurry photos",
      description: "Upload a blurry picture and let our AI sharpen faces, edges, and fine details in seconds.",
      href: "/blurry-photo",
      ctaLabel: "Fix blurry photo",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      iconEmoji: "✨",
    },
    {
      title: "Free image enhancer",
      description: "Improve photo clarity and contrast for free, without installing any apps or plugins.",
      href: "/image-enhancer-free",
      ctaLabel: "Enhance my image",
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-500",
      iconEmoji: "🪄",
    },
    {
      title: "Why are my photos blurry?",
      description: "Learn the common causes of blurry photos and use Imgsharer’s AI to make pictures clearer in a few clicks.",
      href: "/make-picture-clear",
      ctaLabel: "Learn & fix",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      iconEmoji: "💡",
    },
  ],
  landings: [
    {
      slug: "home",
      path: "/",
      metaTitle: "Free AI Image Sharpener Instantly Enhance Photo Clarity",
      metaDescription:
        "Free AI image sharpener to enhance and restore photo clarity. Upload a picture, sharpen in seconds, then download crystal-clear results. Private and fast.",
      heroBadge: "AI-Powered Enhancement",
      heroTitle: "Free AI Image Sharpener & Upscaler",
      heroSubtitle: "Enhance Photos and Fix Blurry Images in Seconds",
      heroDescription:
        "Use our free AI image sharpener and AI image upscaler to remove blur from photos online, fix blurry pictures, and enhance photo detail in one click. Upload any AI picture or regular photo and get a clearer, sharper download in seconds.",
      heroCtaLabel: "Upload an image",
      heroBullets: [
        { title: "Lightning Fast", body: "" },
        { title: "Secure & Private", body: "" },
        { title: "AI-Enhanced", body: "" },
      ],
      howItWorksTitle: "How It Works",
      howItWorksSubtitle: "Three simple steps to enhance your images with AI",
      howItWorksSteps: [
        {
          title: "Upload your image",
          body: "Drag and drop or click to select your photo from your device",
        },
        {
          title: "AI sharpens in seconds",
          body: "Our AI enhances clarity and detail instantly with advanced algorithms",
        },
        {
          title: "Download the result",
          body: "Get your enhanced image in high quality, ready to use anywhere",
        },
      ],
      useCasesTitle: `Why Choose ${siteConfig.brandName}`,
      useCasesDescription: "Professional image enhancement made simple and secure",
      useCasesItems: [
        {
          title: "Crisp results, free to start",
          body: "Professional-grade sharpening at no cost. Get started instantly without any payment.",
        },
        {
          title: "Private: processed securely",
          body: "Your images stay private and secure. We never store or share your photos.",
        },
        {
          title: "Works with JPEG, PNG, WebP",
          body: "Support for all common image formats. Upload any photo and get great results.",
        },
      ],
    },
    {
      slug: "blurry-photo",
      path: "/blurry-photo",
      metaTitle: "Fix Blurry Photos Online Free | Imgsharer AI Photo Enhancer",
      metaDescription:
        "Fix blurry photos online with Imgsharer. Use our free AI image sharpener and enhancer to remove blur from photos online, sharpen CVS photos and prints, and recover clear detail in seconds.",
      heroBadge: "Fix blurry photos online free",
      heroTitle: "Fix Blurry Photos with AI Image Enhancer",
      heroSubtitle:
        "Remove blur from photos online free, restore CVS photos, and rescue shaky phone shots with Imgsharer’s AI image enhancer.",
      heroDescription:
        "Upload a blurry photo, CVS print, or low-light shot and let Imgsharer’s AI photo enhancer sharpen faces, edges, and fine details in seconds — no apps, no Photoshop, and no signup.",
      heroCtaLabel: "Fix my blurry photo",
      heroBullets: [
        {
          title: "Fix blurry phone photos",
          body: "Fix blurry phone photos and soft faces from shaky hands or low-light selfies.",
          icon: "📱",
        },
        {
          title: "Enhance CVS photos",
          body: "Enhance CVS photos and printed receipts so text stays readable and colors pop again.",
          icon: "🧾",
        },
        {
          title: "No-app AI enhancer",
          body: "Remove blur from photos online for free in your browser using the same AI image enhancer.",
          icon: "🖥️",
        },
      ],
      howItWorksTitle: "How to fix a blurry photo with Imgsharer",
      howItWorksSteps: [
        {
          title: "Upload your blurry photo",
          body: "Upload a blurry picture, CVS photo, or scanned print straight from your phone or laptop.",
        },
        {
          title: "Let AI enhance and unblur",
          body: "The AI image enhancer sharpens faces, edges, and text so blur is reduced and detail comes back.",
        },
        {
          title: "Download a clearer image",
          body: "Download a sharper version ready to share, print, or send back to CVS for reprinting.",
        },
      ],
      useCasesTitle: "When to use the blurry photo fixer",
      useCasesDescription:
        "Built for blurry phone snapshots, CVS photos and prints, and old family photos that look soft or out of focus.",
      useCasesItems: [
        {
          title: "Shaky phone photos",
          body: "Fix low-light or motion-blur selfies and phone shots so faces look intentional instead of smeared.",
        },
        {
          title: "CVS photos and prints",
          body: "Scan or snap your CVS photos, boost contrast, and recover detail in faded prints and receipts.",
        },
        {
          title: "Old family pictures",
          body: "Restore old scanned prints that look blurry or soft so memories stay clear for the next share or reprint.",
        },
      ],
      faqTitle: "Blurry photo FAQ",
      faqItems: [
        {
          question: "Why are my photos blurry?",
          answer:
            "Blurry photos usually happen because of camera shake, low light, or focus issues. Our AI helps recover usable detail so your shots don’t go to waste.",
        },
        {
          question: "Can AI really fix a blurry photo?",
          answer:
            "AI can sharpen faces, edges, and text well enough for the web or small prints. It can’t invent missing pixels, but it makes blur far less noticeable.",
        },
        {
          question: "Will this work on CVS photos and prints?",
          answer:
            "Yes. Scan or photograph your CVS prints, upload them here, and let the AI enhance contrast, remove blur, and prep them for a fresh reprint.",
        },
      ],
    },
    {
      slug: "image-enhancer-free",
      path: "/image-enhancer-free",
      metaTitle: "Free Image Enhancer – Unblur Photos & Fix CVS Prints | Imgsharer",
      metaDescription:
        "Use Imgsharer’s image enhancer free to unblur photos online, fix CVS prints, and boost detail in seconds. No apps or plugins required — just upload, enhance, and download.",
      heroBadge: "Free image enhancer online",
      heroTitle: "Enhance photos with our image enhancer free",
      heroSubtitle:
        "Use Imgsharer’s AI image enhancer free to boost clarity, contrast, and detail. Unblur image free in your browser and make scanned prints, phone shots, and CVS photos look crisp again.",
      heroDescription:
        "Upload any photo or CVS print, let AI enhance faces and textures, and download a sharper version in seconds — no apps, no Photoshop, and no sign-up.",
      heroCtaLabel: "Enhance my image",
      heroBullets: [
        {
          title: "Boost detail instantly",
          body: "Enhance phone shots and soften edges so every portrait and product photo looks crisp again.",
          icon: "✨",
        },
        {
          title: "Refresh CVS photos",
          body: "Upload scanned CVS photos or receipts and let AI clean noise, boost contrast, and revive color.",
          icon: "🧾",
        },
        {
          title: "Unblur image free online",
          body: "Everything runs in the browser—no apps or plugins. Just upload, enhance, and download a clearer file.",
          icon: "🖥️",
        },
      ],
      howItWorksTitle: "How to enhance a photo with Imgsharer",
      howItWorksSteps: [
        {
          title: "Upload your image",
          body: "Drop in a blurry photo, CVS photo, or scanned print straight from your device.",
        },
        {
          title: "Let AI enhance and unblur",
          body: "Imgsharer’s AI analyzes faces, edges, and textures to sharpen detail, reduce blur, and improve contrast.",
        },
        {
          title: "Download a clearer result",
          body: "Preview the changes and download a cleaner, sharper image that’s ready to share or print.",
        },
      ],
      useCasesTitle: "Make every photo look clear and print-ready",
      useCasesDescription:
        "From quick phone snapshots to scanned CVS photos, Imgsharer’s free image enhancer cleans up noise, restores detail, and makes your pictures ready to share or print.",
      useCasesItems: [
        {
          title: "Enhance photo detail for free",
          body: "Use our image enhancer free to sharpen soft edges, recover textures, and make low-contrast shots look crisp again in just a few clicks.",
        },
        {
          title: "Perfect for CVS photos and scanned prints",
          body: "Scan or snap your CVS photos, then let AI reduce blur, boost contrast, and correct color so your prints look fresh instead of faded.",
        },
        {
          title: "Unblur image free in your browser",
          body: "Everything runs online in your browser — no downloads or plugins. Just upload, enhance, and save a clearer image for free.",
        },
      ],
    },
    {
      slug: "make-picture-clear",
      path: "/make-picture-clear",
      metaTitle: "Make Pictures Clear Online | Imgsharer",
      metaDescription:
        "Make pictures clear online with Imgsharer. Use AI to make any picture more clear, sharpen blurry photos, and recover detail fast.",
      heroBadge: "Make pictures clearer online",
      heroTitle: "Make pictures clear and fix blurry photos with AI",
      heroSubtitle:
        "Use Imgsharer’s AI to make any picture more clear, sharpen blurry photos, and recover detail in seconds. Learn how to fix blurry photos online without apps or complicated tools.",
      heroDescription:
        "Upload any photo or CVS print, let AI enhance faces and textures, and download a sharper version in seconds — no apps, no Photoshop, and no sign-up.",
      heroCtaLabel: "Make my picture clearer",
      heroBullets: [
        {
          title: "Make pictures more clear online",
          body: "Upload a blurry photo or low-quality picture and let AI sharpen edges, reduce haze, and make the image clear enough to share or print.",
          icon: "📷",
        },
        {
          title: "Fix blurry photos from your phone",
          body: "Rescue shaky phone shots, soft faces, and motion blur so your favorite selfies and travel photos look sharp again.",
          icon: "🤳",
        },
        {
          title: "How to fix blurry photos without apps",
          body: "Everything runs in your browser — no apps or Photoshop. Just upload, enhance, and download a clearer image for free.",
          icon: "💡",
        },
      ],
      useCasesTitle: "When to make pictures clearer",
      useCasesDescription: "Ideal for blurry phone snapshots, CVS photos, and old family pictures that need clearer detail.",
      useCasesItems: [
        {
          title: "Make pictures more clear online",
          body: "Upload a blurry photo or low-quality picture and let AI sharpen edges, reduce haze, and make the image clear enough to share or print.",
        },
        {
          title: "Fix blurry photos from your phone",
          body: "Rescue shaky phone shots, soft faces, and motion blur so your favorite selfies and travel photos look sharp again.",
        },
        {
          title: "How to fix blurry photos without apps",
          body: "Everything runs in your browser — no apps or Photoshop. Just upload, enhance, and download a clearer image for free.",
        },
      ],
      howItWorksTitle: "How to make a picture clearer with Imgsharer",
      howItWorksSteps: [
        {
          title: "Upload your blurry picture",
          body: "Drop in a blurry photo, phone shot, or scanned picture straight from your device.",
        },
        {
          title: "Let AI sharpen and unblur",
          body: "Imgsharer’s AI analyzes faces, edges, and textures to boost clarity and reduce blur automatically.",
        },
        {
          title: "Download a clearer photo",
          body: "Preview the result and download a sharper, more usable version ready to share, print, or post.",
        },
      ],
      faqTitle: "Make picture clear FAQ",
      faqItems: [
        {
          question: "Why are my photos blurry?",
          answer:
            "Photos get blurry from camera shake, low light, or focus issues. Imgsharer restores usable detail so your pictures don’t go to waste.",
        },
        {
          question: "Can AI really fix a blurry photo?",
          answer:
            "AI can sharpen faces, edges, and text well enough for web or small prints. It can’t rebuild missing pixels, but it reduces blur dramatically.",
        },
        {
          question: "Will this work on CVS photos and prints?",
          answer:
            "Yes. Scan or photograph your CVS prints, upload them here, and let AI boost contrast, remove blur, and prep them for a fresh reprint.",
        },
      ],
    },
  ],
}

export function getLandingConfig(slugOrPath: string): LandingConfig | undefined {
  const normalizedPath = slugOrPath.startsWith("/") ? slugOrPath : `/${slugOrPath}`
  return toolConfig.landings.find((landing) => landing.slug === slugOrPath || landing.path === normalizedPath)
}
