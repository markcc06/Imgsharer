# Imgsharer — AI Image Sharpening & HD Wallpaper Generator

Imgsharer is a modern, AI-powered image enhancement platform that makes it easy to **remove blur, upscale photos, sharpen details, and download curated HD wallpapers**.  
Built with **Next.js 15**, **TypeScript**, and **Vercel**, the project focuses on speed, usability, and high-quality visual output.

👉 **Live Site:** https://www.imgsharer.pro/  
👉 **Christmas Wallpapers Hub:** https://www.imgsharer.pro/christmas-wallpaper  
👉 **AI Wallpaper Collections:** https://www.imgsharer.pro/wallpapers  

---

## ✨ Features

### 🖼 AI Image Enhancement
- Remove blur and noise from low-quality photos  
- Smart sharpening for faces, objects, and landscapes  
- AI-driven upscaling for clearer, more detailed results  
- Perfect for selfies, product images, wallpapers, and artwork  

### 🎨 HD & 4K AI Wallpapers
- Curated themed wallpaper collections  
- Christmas, nature, pastel candy, robots, cosmic scenes, and more  
- Mobile, desktop, ultrawide, and 4K formats  
- Fast preview and one-click download  

### ⚡ Performance & UX
- Fully optimized using modern **Next.js App Router**  
- Instant page loads with Vercel Edge Network  
- Responsive UI for all devices  
- High-quality JPEG/WEBP wallpapers  

---

## 🔧 Tech Stack

| Layer | Technology |
|------|------------|
| Framework | **Next.js 15 (App Router)** |
| Language | **TypeScript** |
| Deployment | **Vercel** |
| Styling | **Tailwind CSS** |
| Images | Sharp / AI-generated asset pipeline |
| SEO | Dynamic metadata, sitemap, Open Graph |

---

## 📁 Project Structure

/app
/wallpapers
/christmas-wallpaper
/api
/components
/public
/styles

Each wallpaper collection is statically optimized for SEO and performance.  
Image metadata and thumbnails are generated via custom scripts.

---

## 🌐 Related Sites / Collections

- Christmas Wallpapers → https://www.imgsharer.pro/christmas-wallpaper  
- Mobile HD Wallpapers → https://www.imgsharer.pro/wallpapers/mobile  
- 4K AI Wallpapers → https://www.imgsharer.pro/wallpapers/4k  

(These links help Google establish the Imgsharer entity and improve authority.)

---

## 🚀 Development

```bash
pnpm install
pnpm dev

Create a .env.local file with your environment variables for image processing and deployment.

```bash
REPLICATE_API_TOKEN="your-token"
REPLICATE_UPSCALE_MODEL="owner/model-name"
REPLICATE_UPSCALE_VERSION="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

⸻

📦 Deployment

Imgsharer is deployed on Vercel with automatic GitHub integration.

Steps:
	1.	Push to main
	2.	Vercel triggers automatic build
	3.	Wallpapers and metadata sync scripts run post-build

⸻

🔍 SEO & Metadata

The project includes:
	•	Auto-generated sitemap
	•	Clean URL structure
	•	Pre-rendered wallpaper pages
	•	Optimized <meta> + OpenGraph previews
	•	Structured data for images

⸻

⭐ Contributing

Pull requests for:
	•	New wallpaper collections
	•	UI improvements
	•	Image optimization scripts
…are always welcome.

⸻

🔗 Project Links
	•	Live App: https://www.imgsharer.pro/
	•	GitHub Repo: this repository
	•	Contact: mark@imgsharer.pro (optional if you want)

⸻

📜 License

This project is licensed under a permissive license for educational and non-commercial use.
