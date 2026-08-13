# Imgsharer — AI Image Sharpening & HD Wallpaper Generator

Imgsharer is an AI-powered image enhancement platform for removing blur, upscaling photos, sharpening details, and browsing curated HD wallpapers.

Built with **Next.js 14**, **TypeScript**, and **Vercel**, the project focuses on speed, usability, and high-quality visual output.

- **Live site:** https://www.imgsharer.pro/
- **Christmas wallpapers:** https://www.imgsharer.pro/christmas-wallpaper
- **AI wallpaper collections:** https://www.imgsharer.pro/wallpapers

## Features

### AI image enhancement
- Remove blur and noise from low-quality photos
- Sharpen faces, objects, and landscapes
- AI-driven upscaling for clearer output
- Workflows for selfies, product images, wallpapers, and artwork

### HD & 4K wallpapers
- Curated themed wallpaper collections
- Mobile, desktop, ultrawide, and 4K formats
- Fast previews and one-click downloads

### Performance & UX
- Next.js App Router architecture
- Responsive UI
- Vercel deployment
- JPEG/WEBP image delivery and optimization

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Deployment | Vercel |
| Styling | Tailwind CSS |
| Images | Sharp / AI-generated asset pipeline |
| SEO | Dynamic metadata, sitemap, Open Graph |

## Project structure

```text
app/
components/
config/
hooks/
lib/
public/
scripts/
styles/
types/
```

Wallpaper collections are optimized for performance and discoverability. Image metadata and thumbnails can be generated with project scripts.

## Local development

Requirements:
- Node.js 20.10–20.x or 22.x
- pnpm

```bash
pnpm install
pnpm dev
```

Create a `.env.local` file for services you enable locally. Never commit real secrets.

Example Replicate variables:

```bash
REPLICATE_API_TOKEN="your-token"
REPLICATE_UPSCALE_MODEL="owner/model-name"
REPLICATE_UPSCALE_VERSION="model-version"
```

Other integrations used by the production application may require their own environment variables. Keep all credentials outside source control.

## Useful scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm wallpapers:sync
pnpm ctx:snapshot
```

## Deployment

The production application is deployed on Vercel with GitHub integration. Deployment configuration and credentials should remain in the deployment environment, not in the repository.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the recommended workflow.

Good contribution areas include:
- UI and accessibility improvements
- Image-processing workflows
- Performance improvements
- Wallpaper collection tooling
- Documentation and tests

## Security

Please do not disclose credentials or security-sensitive issues in public issues. See [SECURITY.md](SECURITY.md).

## Project links

- Live app: https://www.imgsharer.pro/
- Repository: https://github.com/markcc06/Imgsharer

## License

A formal open-source license has not yet been selected for this repository. Until a license is added, copyright remains with the repository owner and normal copyright restrictions apply.
