# 从 0 到上线：把一个「浏览器里用的 PDF / Word 工具站」装进 Vercel

> 一篇偏**部署与可被搜索引擎理解**的实践笔记：Vite SPA 接上 Vercel 时，`vercel.json`、构建期环境变量与产物如何咬合；顺带讨论在**无 SSR**前提下做 SEO 的边界与可操作空间。示例线上：<https://web-tools-nu.vercel.app/>

<!-- 插图占位：封面——部署架构简图或 Vercel 仪表盘截图 -->

## 引言：问题界定

工程形态是典型 **React + Vite SPA**：HTML 骨架几乎固定，内容由客户端路由挂载。上架到 Vercel 这类静态边缘托管时，真正需要讲清楚的往往不是「点了哪个菜单」，而是：

1. **子路径深链 / 刷新** 时，CDN 如何把请求交回 **`index.html`**；  
2. **爬虫与用户代理**看到的 `title`、`description`、`canonical`、**sitemap** 是否与你的**线上根域**对齐——其中一部分必须在**构建时**写死到文件或 bundle 里。  

站内 PDF / Word 能力为纯前端处理，本篇**不写功能说明书**，细节见仓库源码。

<!-- 插图占位：（可选）仓库目录树中与部署相关的文件：`vercel.json`、`vite.config.ts`、`src/components/SeoManager.tsx`、`src/config/site.ts`-->

---

## 一、前期工作（刻意压缩）

- 本地：**`npm install` → `npm run dev`** 开发，**`npm run build`** 产出 **`dist/`**。  
- Git：至少需要 **至少一次 commit** 再 **`git push`**，否则远程分支可能没有可推送对象；远程若已存在 `origin`，用 **`git remote set-url`** 切换 HTTPS/SSH 即可。  

以上点到为止——默认读者熟悉 Node 前端工程日常。

---

## 二、Vercel：配置逐项说清

### 2.1 为什么必须配置 SPA 回写（`rewrites`）

访问 **`/pdf/compress`** 时，边缘节点会先在 **`dist`** 查找是否存在**同名静态文件**。SPA 没有这个物理路径，若没有把「未命中文件」的请求交给 **`index.html`**，将得到 **404**。

根目录 **[`vercel.json`](../vercel.json)** 核心是：

```json
"framework": "vite",
"buildCommand": "npm run build",
"outputDirectory": "dist",
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```

可读性拆解：

| 项 | 意图 |
|----|------|
| `framework` + `buildCommand` + `outputDirectory` | 与 **Vite 约定**对齐，避免在 Dashboard 与仓库两处「各写一套」时对不上号。 |
| `rewrites → index.html` | 对**没有对应静态实体**的路径做 **fallback**，把控制权交还给前端路由（如 React Router）。 |
| **与静态文件的先后关系**（Vercel 行为）：已存在于 **`dist`** 的路径（`**/assets/**`、`/favicon.svg`、下文生成的 **`/sitemap.xml`**、`/robots.txt`）会**先于**重写被返回——这就是为什么可以把 sitemap/robots 当作**真实静态文件**部署，而不会误被改写成 HTML。 |

若团队不用 `vercel.json` 而只靠 UI 勾选，也需确认具备**等效的 SPA Fallback**——这是外链分享、广告投放落地页最常踩的第一个坑。

### 2.2 `VITE_SITE_URL`：构建期「钉死」域名

仓库在 **[`vite.config.ts`](../vite.config.ts)** 的 **`closeBundle`** 里写入：

- **`dist/sitemap.xml`**：各工具的 `<loc>` 必须是 **绝对 URL**  
- **`dist/robots.txt`**：**`Sitemap: https://.../sitemap.xml`**  

数据源来自 **`loadEnv`** 读取的 **`VITE_SITE_URL`**（去掉末尾 **`/`** 再拼接）。因此在 Vercel：

1. **Settings → Environment Variables** → 对 **Production** 设置：`VITE_SITE_URL = https://web-tools-nu.vercel.app`（示例）。  
2. **保存后必须触发一次包含 Build 的部署**（如 **Redeploy**）；仅改运行时配置不能改写已上传的 **`dist/sitemap.xml`**。  
3. 接上**自定义域名**后，应将变量更新为 **`https://你的canonical主域`** 再构建发布，避免出现「人用 A 域名访问、sitemap / robots 却仍指向 `.vercel.app`」的长期不一致——对收录与跳转信号都不友好。  
4. **Preview 分支**：若不单独配置预览 URL，Preview 产物里的 sitemap **可能仍有「生产域名」**，这是常见权衡：要么只对 Production 较真 sitemap，要么为 Preview **单独一组**变量并接受多套文件；本文不展开 CI 拓扑。

运行时侧：**`src/config/site.ts`** 的 **`getSiteOrigin()`** 优先读 **`import.meta.env.VITE_SITE_URL`**（来自构建时注入）；未设置时在浏览器内退回到 **`window.location.origin`**，便于本地 **`npm run dev`**。理解「构建期静态文件 vs 运行时 JS」两分法，就少一半排障时间。

<!-- 插图占位：Vercel Env 表格 + Deployments 列表中一次完整 Build -->

### 2.3 部署后最短验证路径（与业务无关）

1. **深链**：新标签打开 **`…/pdf/compress`**，**⌘⇧R / Ctrl+F5** 强刷，应为 SPA 而非 404。  
2. **爬虫文件**：浏览器或 `curl` 打开 **`/sitemap.xml`、`/robots.txt`**，抽样检查 `<loc>` 与 **`Sitemap:`** 域名。  
3. **静态资源**：任取 **`/assets/`** 下带 hash 的 JS，验证可缓存、200。

---

## 三、SEO 思路：SPA 条件下的「能做什么」

先对齐预期：**不做 SSR / 不使用预渲染**时，爬虫看到的**首帧 HTML**里主体内容有限，主要依靠：

- **`index.html`** 中的**兜底** `<title>`、`<meta name="description">`、OG 静态占位；  
- 客户端 hydration 之后的 **`document.title`、`meta`、`link rel=canonical`、`og:*`** 更新（本项目由 **`src/components/SeoManager.tsx`** 随路由 **`useMatches` + handle** 同步）；  
- **独立静态文件**：**`sitemap.xml`**、**`robots.txt`** 帮爬虫枚举「有哪些 URL 值得来抓」——对工具站多路由尤其有用。

### 3.1 站内信息架构（简述）

- **路由级**：在 **`createBrowserRouter`** 的 **`handle`** 里挂 **`documentTitle`、`seoDescription`**，leaf 路由各写一段不与首页重复的描述——比全站共用一句 description 更受控。类型见 **`src/types/router.d.ts`**。  
- **`SeoManager`**：把上述字段落到真实 DOM，并维护 **canonical / og:url**（与 **`getCanonicalUrl`** 同源逻辑），减轻「分享卡片标题永远停在首页」的问题。  

### 3.2 关键词与品牌化：少用玄学、多用「可查到的词」

工具站常见的一种写法是：**站名本身就带检索意图**——例如本项目使用「**浏览器」「PDF」「工具箱**」等与真实搜索串重叠的短语；再在 **description / 长尾路由标题**里自然覆盖「PDF 压缩、互转 Word」等，而不是在 `keywords` 里机械堆砌。**`site.ts` / `App.tsx`** 中与 SEO 文案集中存放，也方便日后改口径而不散落在页面组件里。

同时要接受：**SPA + 仅靠客户端更新 meta**，不同搜索引擎爬虫对后续 JS 的执行程度不一；**结构化数据 JSON-LD**（`WebApplication` 等）可改善部分富结果候选，但并非排名保证——这是技术诚实，也方便读者设定 KPI。

### 3.3 **`sitemap` 路由表与代码的一致性**

[`vite.config.ts`](../vite.config.ts) 里的 **`routes`** 数组与 **`App.tsx`** 里的路径应**同源维护**——增删路由时两处一起改，否则「页面上有线、sitemap 里没条目」会失去一部分发现机会。可考虑后续抽成**单一常量**再由 Vite 与路由共同引用（当前文档不强制改架构，仅点出债）。

---

## 四、端到端链路（一段话收束）

**GitHub 作为主分支事实来源 → Vercel 拉仓库执行 `npm run build`，构建期写入 `dist`（含 sitemap / robots）→ `vercel.json` 在未命中静态文件时交出 `index.html` → 线上由 SeoManager 按路由补强 head → 用户在浏览器内完成运算。**  

把「上线」说清楚，无外乎：**静态宿主规则** + **构建期域名**两件事别打架。

---

*与实现细节同仓：[README](../README.md)、[.env.example](../.env.example)、[vercel.json](../vercel.json)、[vite.config.ts](../vite.config.ts)、[`src/components/SeoManager.tsx`](../src/components/SeoManager.tsx)、[`src/config/site.ts`](../src/config/site.ts)。*
