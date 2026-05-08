/**
 * 站点对外名称：嵌入高频检索词「浏览器」「PDF」「工具箱」，便于用户搜索 PDF 压缩、互转等场景时发现本站。
 */
export const SITE_BRAND = '浏览器PDF工具箱'

/**
 * 结构化数据等处使用的完整称谓（强调本机、非云端加工）。
 */
export const SITE_NAME_FULL = `${SITE_BRAND}·本机版`

/**
 * 默认浏览器标题（长尾词覆盖：压缩、互转、转Word）。
 */
export const SITE_DEFAULT_DOCUMENT_TITLE =
  `${SITE_BRAND}｜PDF压缩与PDF互转Word·本机浏览器免费（不上传）`

/**
 * 全站默认 meta description（各路由可覆盖）。
 */
export const SITE_DEFAULT_SEO_DESCRIPTION =
  `${SITE_BRAND}：在浏览器里免费完成 PDF 压缩、PDF 与 Word 互转（PDF↔docx）。文件只在您的电脑本机处理，不向服务器上传，搜索「浏览器 PDF 压缩」「PDF 转 Word」「Word 转 PDF」即可直达同类功能。`

/**
 * 逗号分隔关键词：紧贴「PDF压缩」「PDF互转」「浏览器pdf」等真实检索用语。
 */
export const SITE_SEO_KEYWORDS =
  [
    SITE_BRAND,
    'PDF压缩',
    '浏览器PDF压缩',
    'PDF互转',
    'PDF转Word',
    'Word转PDF',
    'PDF转docx',
    'docx转PDF',
    'PDF体积压缩',
    '网页PDF工具',
    '本机PDF工具',
    '免费PDF压缩',
    '浏览器pdf转换',
    'PDF在线转换本机',
    '隐私PDF',
    'PDF工具箱',
  ].join(',')

/**
 * 解析站点绝对根地址：优先构建时注入的 `VITE_SITE_URL`，否则在浏览器用当前 origin。
 */
export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    return fromEnv.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

/**
 * 根据路径拼出当前页的规范 URL（用于 canonical / og:url）。
 */
export function getCanonicalUrl(pathname: string): string {
  const base = getSiteOrigin()
  if (!base) return ''
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${path === '//' ? '/' : path}`
}
