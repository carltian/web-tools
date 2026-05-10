# 浏览器PDF工具箱（tools-web）

**浏览器PDF工具箱** 这个站名刻意带上「浏览器」「PDF」「工具箱」三个高频搜索词，方便用户在搜「浏览器 pdf 压缩」「pdf 压缩」「PDF 互转」「pdf 转 word」一类需求时更容易命中本站（具体排名仍取决于域名权重、外链与页面质量）。

本站提供：**PDF 压缩**、**PDF↔Word（docx）互转**；全部在您本机浏览器中执行，不向服务器上传源文件。

## 本地运行

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
npm run preview
```

产物含 `sitemap.xml` 与 `robots.txt`（域名见下方 SEO 小节）。

## Vercel 部署

1. 在 [Vercel Dashboard](https://vercel.com/new) 导入本仓库（或通过 Vercel CLI `vercel` 链接项目）。  
2. **Framework Preset** 选 **Vite**，或保持自动识别；构建命令 `npm run build`，输出目录 **`dist`**（仓库根目录的 [vercel.json](vercel.json) 已写明，并包含 SPA 重写，避免 `/pdf/compress` 等路由刷新 404）。  
3. 在 Vercel → **Settings → Environment Variables** 为 **Production**（以及需要的话 Preview）添加：  
   - `VITE_SITE_URL` = 你的线上根地址，例如 `https://xxxxx.vercel.app` 或自定义域名（**不要**末尾斜杠）。  
   这样构建产物里的 `sitemap.xml`、`robots.txt` 以及运行时的 `canonical` / `og:url` 才会指向正确域名。  
4. 保存变量后 **Redeploy** 一次，使新构建带上环境变量。

## SEO 与上线（其他静态托管）

详见 [.env.example](.env.example)：设置 `VITE_SITE_URL` 后构建，以获得正确的 `canonical` / 站点地图地址。非 Vercel 时仍需为 SPA 配置 **history fallback**（与 Vercel 中 `rewrites` 等效）。

## 能力边界

- **PDF 压缩**：逐页栅格化并重新压缩图片体积；矢量文稿会变不可搜索图片。
- **PDF → DOCX**：抽取文本为主；扫描件效果差。
- **DOCX → PDF**：经 HTML 渲染，复杂版式可能与 Word 有别。

## 隐私

文件与历史仅存用户本机浏览器（IndexedDB）；清除站点数据后将丢失。
