## Key Technical Notes

### 1. API Logic
- `/api/sharpen` uses Replicate model (clarity-upscaler)
- Input limit: 4MB
- Output: JPEG (Base64 → buffer)
- Error handling: "Cannot read properties of undefined (reading 'includes')" fixed in v0.5.3

### 2. Core Components
- HeroUploader.tsx → main entry
- PreviewModal.tsx → process and download logic
- CardFormStore → state manager

### 3. UI Framework
- TailwindCSS + Shadcn/UI + Lucide Icons