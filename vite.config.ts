import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'https://example.com').replace(/\/$/, '')

  let outDirResolved = path.resolve(__dirname, 'dist')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        /** 构建结束后写入站点地图与 robots，便于爬虫发现各工具页（请将 VITE_SITE_URL 改为正式域名）。 */
        name: 'seo-sitemap-and-robots',
        configResolved(cfg) {
          outDirResolved = path.resolve(cfg.root, cfg.build.outDir)
        },
        closeBundle() {
          const routes = [
            '/',
            '/pdf/compress',
            '/pdf/to-docx',
            '/docx/to-pdf',
            '/coming-soon',
          ]
          const urlEntries = routes
            .map((p) => {
              const loc = p === '/' ? `${siteUrl}/` : `${siteUrl}${p}`
              const priority = p === '/' ? '1.0' : '0.8'
              return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
            })
            .join('\n')
          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
          fs.mkdirSync(outDirResolved, { recursive: true })
          fs.writeFileSync(path.join(outDirResolved, 'sitemap.xml'), sitemap, 'utf8')
          const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
          fs.writeFileSync(path.join(outDirResolved, 'robots.txt'), robots, 'utf8')
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['pdfjs-dist'],
    },
  }
})
