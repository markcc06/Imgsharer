# AI Guardrails — What can/can't be changed

## ✅ Allowed (White-list)
- UI 细节与样式（不改变业务流程）
- Blog 列表与详情（/app/blog/**）
- SEO 元信息（metadata, JSON-LD）
- 可访问性（aria/alt/label）
- Hero/Preview 的**无副作用交互优化**（例如：遮罩/滚动锁、重复 input 清理）

## ⛔ Do NOT touch (No-go)
- `/api/sharpen` 的**入参与返回结构**（除非需求明确要求）
- 环境变量的键名
- 状态管理全局 store 的字段名/语义（如有）
- 构建/部署配置（`next.config.mjs`）核心项
- 上传/下载**安全限制**（体积/类型白名单）

## UX Invariants（不变式）
- **Hero Uploader 必须可点可用**（即使用户刚关闭 Preview）
- 关闭 Preview 后**不产生第二个 Uploader**，也不出现“要回到 Preview 区域才能继续上传”
- Blog 详情使用 **SSG**；列表始终**最新在最上**；文章页含 **Back to Home**
- 图片 `alt` 与 favicon/title **不能缺失**

## Code Style
- TypeScript 严格模式通过
- `pnpm build` 必须成功；`eslint`（如配置）必须为 0 error