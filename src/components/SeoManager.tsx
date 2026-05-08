import { useEffect } from 'react'
import { useLocation, useMatches } from 'react-router-dom'
import {
  SITE_BRAND,
  SITE_DEFAULT_DOCUMENT_TITLE,
  SITE_DEFAULT_SEO_DESCRIPTION,
  SITE_NAME_FULL,
  SITE_SEO_KEYWORDS,
  getCanonicalUrl,
  getSiteOrigin,
} from '@/config/site'

type RouteHandleSEO = {
  title?: string
  /** 浏览器标签完整标题；缺省时用「页名｜品牌」 */
  documentTitle?: string
  /** 该页的 meta description */
  seoDescription?: string
}

/**
 * 写入或更新 head 中的 meta / link（单例节点，避免重复标签）。
 */
function upsertMetaByName(name: string, content: string) {
  if (!content) return
  const sel = `meta[name="${CSS.escape(name)}"]`
  let el = document.head.querySelector(sel) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * 写入或更新 OG / Twitter 的 property / name 标签。
 */
function upsertMetaByProperty(property: string, content: string) {
  if (!content) return
  const sel = `meta[property="${CSS.escape(property)}"]`
  let el = document.head.querySelector(sel) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * 写入或更新 link[rel].
 */
function upsertLink(rel: string, href: string) {
  if (!href) return
  const sel = `link[rel="${CSS.escape(rel)}"]`
  let el = document.head.querySelector(sel) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * 注入 JSON-LD（WebApplication），便于搜索引擎展示站点类型信息。
 */
function injectJsonLd(canonicalUrl: string) {
  const id = 'browser-pdf-toolbox-jsonld'
  let script = document.getElementById(id) as HTMLScriptElement | null
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME_FULL,
    alternateName: [SITE_BRAND, 'PDF压缩', 'PDF互转', 'PDF工具箱', '浏览器pdf压缩'],
    description: SITE_DEFAULT_SEO_DESCRIPTION,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web)',
    browserRequirements: 'Requires JavaScript.',
    url: canonicalUrl || undefined,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
    featureList: [
      'PDF 体积压缩（本机）',
      'PDF 转 Word（.docx）',
      'Word 转 PDF',
      '不向服务器上传源文件',
    ],
  }

  const text = JSON.stringify(payload)
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = text
}

/**
 * 随路由同步 document.title、description、canonical 与 OG/Twitter 标签。
 */
export function SeoManager() {
  const location = useLocation()
  const matches = useMatches()

  useEffect(() => {
    const leaf = matches[matches.length - 1]
    const handle = leaf?.handle as RouteHandleSEO | undefined
    const pathname = location.pathname

    const pageTitle =
      handle?.documentTitle ??
      (handle?.title ? `${handle.title}｜${SITE_BRAND}` : SITE_DEFAULT_DOCUMENT_TITLE)
    document.title = pageTitle

    const description = handle?.seoDescription?.trim() || SITE_DEFAULT_SEO_DESCRIPTION
    upsertMetaByName('description', description)
    upsertMetaByName('keywords', SITE_SEO_KEYWORDS)

    const origin = getSiteOrigin()
    const canonical =
      pathname && origin ? getCanonicalUrl(pathname) || `${origin}${pathname}` : ''

    upsertLink('canonical', canonical)

    const ogUrl = canonical || `${typeof window !== 'undefined' ? window.location.href : ''}`
    upsertMetaByProperty('og:type', 'website')
    upsertMetaByProperty('og:site_name', SITE_NAME_FULL)
    upsertMetaByProperty('og:title', pageTitle)
    upsertMetaByProperty('og:description', description)
    upsertMetaByProperty('og:url', ogUrl)
    upsertMetaByProperty('og:locale', 'zh_CN')

    upsertMetaByName('twitter:card', 'summary_large_image')
    upsertMetaByName('twitter:title', pageTitle)
    upsertMetaByName('twitter:description', description)

    injectJsonLd(canonical || ogUrl)
  }, [location.pathname, location.search, matches])

  return null
}
