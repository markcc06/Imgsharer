# System Overview — Imgsharer

## Stack & Versions
- Framework: Next.js (App Router) — [version: 13/14/15?]
- Runtime: Node [v18.x 推荐]
- Package Manager: pnpm
- UI: Tailwind CSS, [shadcn/ui?]（如有）
- State Mgmt: [Zustand/Context/None]
- Images: Next/Image [yes/no]
- Analytics: [GA4/None]
- SEO: Metadata API + JSON-LD（Blog Post schema）

## Routes (Public)
- `/` — Landing + Hero uploader（主上传入口，**必须可点击触发上传**）
- `/blog` — Blog 列表（**最新在最上**）
- `/blog/[slug]` — 文章详情（**SSG**）
- `/faq` — FAQ
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service

## API Routes
- `POST /api/sharpen` — 调用外部服务锐化 / 放大  
  - 外部服务：**Replicate** [是/否]  
  - 端点/模型名：`[填型号或链接]`  
  - 主要入参：`file/objectUrl`, `strength`, `preset`（Portrait/Product/Etc）  
  - 主要出参：`imageUrl`（或二进制流）  
  - **超时与重试**：`[策略]`

## Env Variables (.env)
- `REPLICATE_API_TOKEN` — **必填**（见控制台报错）  
- `NEXT_PUBLIC_SITE_URL` — 用于 canonical/OG（如 `https://www.imagesharpenerai.pro`）  
- `[其它还有就列出来，例如 SENTRY_DSN/…]`

> 请创建 `./.env.example`，至少包含：