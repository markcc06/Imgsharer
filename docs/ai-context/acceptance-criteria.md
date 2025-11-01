# Acceptance Criteria — Imgsharer

## A. 核心流程
1. 首页 Hero “Drop your image here, or click to browse”
   - 点击后可正常弹出文件选择；选择后直接进入 Preview Modal
   - 处理期间出现遮罩或明显 Loading，页面不可误触
2. Preview Modal
   - 可选择 `strength/preset`
   - 点击处理 → `POST /api/sharpen` 调用成功（无 4xx/5xx；失败有可读提示）
   - 返回图可预览/下载；关闭后页面恢复
3. 回到首页
   - **Hero Uploader 依然可用**；页面未新增第二个 uploader；不需要滚动到其它区域才能继续

## B. Blog
1. `/blog`：列表按 `publishedAt` **倒序**；卡片包含日期、分类、标题、摘要、`Read more` 链接
2. `/blog/[slug]`：**SSG** 输出；注入 **BlogPosting JSON-LD**  
   - 必备字段：`headline`, `datePublished`, `author`, `image`, `url`, `description`
3. 详情页内：显著的 **Back to Home** 按钮，返回 `/`
4. Blog 列表页：提供语言切换（EN / [其它]），切换后不影响路由与 SEO（如仅 UI 文案切换）

## C. SEO & 资源
1. 站点 favicon、主图、hero 背景图：`alt/title` **不缺失**
2. `metadataBase` 正确；首页/文章页含 canonical
3. 首页/文章页 `meta description` 字数合理（120–160）
4. 文章页含内链**回首页**与**相关内容**（可选）

## D. 构建与质量
- `pnpm i && pnpm build` 通过，无 type error
- 所有改动仅限 Guardrails 白名单中的目录/文件