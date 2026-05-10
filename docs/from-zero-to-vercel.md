# 从 0 到上线：把一个「浏览器里用的 PDF / Word 工具站」装进 Vercel

> 记录「浏览器PDF工具箱」从本地搭建到推代码、部署到 Vercel 的实操流程。线上地址：<https://web-tools-nu.vercel.app/>

<!-- 插图占位：封面——站点名 + URL -->

## 一、想做成什么样

- **只做纯前端**：在用户本机浏览器里完成 PDF 压缩、PDF ↔ Word（.docx）互转。
- **强调隐私**：文件不向自家后台上传，历史与成品可走浏览器 **IndexedDB**。
- **用着顺手**：左侧工具目录 + 顶栏；各工具有进度、可调参数、本地历史与再次下载。
- **能被搜到**：基础 SEO（标题/描述/站点地图等），品牌名里带「浏览器」「PDF」「工具箱」等常见检索词。

<!-- 插图占位：首页或侧栏整体效果 -->

## 二、本地如何从 0 开始

### 技术选型（本项目实际采用）

| 维度 | 选择 |
|------|------|
| 脚手架 | Vite |
| 框架 | React + TypeScript |
| 样式 | Tailwind CSS |
| 路由 | React Router |
| PDF / 文档能力 | pdf-lib、pdfjs-dist、docx、mammoth、html2pdf 等 |
| 本地历史 | IndexedDB（idb） |

### 常用命令

```bash
npm install
npm run dev    # 本地开发
npm run build  # 生产构建，产物在 dist/
```

开发时在浏览器打开终端里提示的本地地址即可预览、改代码。

<!-- 插图占位：终端 npm run dev + 浏览器本地页 -->

## 三、项目结构上做了哪些事（便于复刻）

1. **壳布局**：`AppShell` — 侧栏导航、顶栏、`PrivacyStrip`（隐私说明）、主内容 `Outlet`。
2. **工具页**：PDF 压缩、`/pdf/to-docx`、`/docx/to-pdf` 等独立路由，按需 `lazy` 分包。
3. **存储与任务**：IndexedDB 写入历史记录与输出文件；统一的进度条组件展示阶段与百分比。
4. **SEO**：`SeoManager` 随路由更新 `title`、description、canonical、OG/Twitter；构建插件写入 **`dist/sitemap.xml`**、**`dist/robots.txt`**。
5. **站点名与配置**：`src/config/site.ts` 统一管理品牌文案与默认 SEO；**正式上线域名**通过环境变量注入（见下文）。

<!-- 插图占位：三个功能页拼图或分列截图 -->

## 四、代码进 GitHub

1. 初始化仓库、配置 **`.gitignore`**（务必忽略 `node_modules`、`dist` 等）。
2. **`git add` + `git commit`**：至少要有**一次提交**，否则推送时可能出现「没有可推送的 `main`」一类错误。
3. 关联远程：`git remote add origin <仓库地址>`。若提示 **remote origin already exists**，用  
   `git remote set-url origin <地址>`  
   把远程改成 HTTPS 或 SSH 即可。
4. `git push -u origin main` 推到 GitHub，供 Vercel 一键导入。

<!-- 插图占位：GitHub 仓库页（可做打码） -->

## 五、装进 Vercel：核心步骤

**当前线上预览：** <https://web-tools-nu.vercel.app/>

### 1. 导入项目

在 [Vercel](https://vercel.com/new) → **Import** 选中该 GitHub 仓库；框架识别为 **Vite**，构建一般为 `npm run build`，输出目录 **`dist`**。

### 2. SPA 不要刷新 404

单页应用在子路径（如 `/pdf/compress`）**直接打开或刷新**时，需要服务器回退到 `index.html`。本项目在仓库根目录提供 **`vercel.json`**，配置 `rewrites` 与 `outputDirectory: dist` 等，由 Vercel 按静态文件优先、其余回退首页的方式服务。

### 3. 环境变量（强烈建议配置）

在 Vercel → **Settings → Environment Variables** → **Production** 增加：

| 变量名 | 示例值 |
|--------|--------|
| `VITE_SITE_URL` | `https://web-tools-nu.vercel.app`（**不要**末尾 `/`） |

保存后对项目执行一次 **Redeploy**，这样构建得到的 **sitemap / robots** 以及运行时的 **canonical、og:url** 才会与正式域名一致。若之后绑定**自定义域名**，请把 `VITE_SITE_URL` 改成新根地址并再次部署。

### 4. 验证清单

- [ ] 首页与各工具子页可点击进入。
- [ ] 浏览器直接访问并刷新子路径（如 `/pdf/compress`）无 404。
- [ ] 访问 `/sitemap.xml`、`/robots.txt` 内容中的域名正确。
- [ ] 小文件跑一遍压缩/互转：进度、下载、本地历史正常。

<!-- 插图占位：Vercel 环境变量与 Redeploy 界面（可打码） -->

## 六、流程串起来（一张图式小结）

```text
本地 Vite 项目 → 功能与 SEO 补齐 → Git 提交 → 推送到 GitHub
        → Vercel 导入仓库 → 配置 VITE_SITE_URL → Redeploy → 线上可访问
```

把「从 0 到上线」压成一句话：**先在本机用 Vite + React 把工具跑通并提交到 Git，再用 Vercel 接构建与托管，用 `vercel.json` 解决 SPA 路由，用环境变量把站点地图和社交分享链接钉在你的正式域名上。**

---

*文档与代码同仓维护；部署细节亦见仓库根目录 [README.md](../README.md)、[.env.example](../.env.example)、[vercel.json](../vercel.json)。*
