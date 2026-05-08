import { Link } from 'react-router-dom'
import { SITE_BRAND } from '@/config/site'
import { TOOL_NAV_GROUPS } from '@/config/tools'

/**
 * 站点首页：展示可用工具入口与简短说明。
 */
export function HomePage() {
  const enabledItems = TOOL_NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.enabled)

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          <span className="text-teal-800">{SITE_BRAND}</span>
          <span className="mt-2 block text-lg font-semibold leading-snug text-slate-800 md:text-xl">
            PDF 压缩 · PDF↔Word 互转，专供浏览器本机使用
          </span>
        </h1>
        <p className="mt-2 text-xs text-slate-500">
          若您在找「浏览器 pdf 压缩」「pdf 互转 word」类工具，可直接使用下方入口；全程不上传云端。
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          <strong className="text-emerald-900">隐私优先：</strong>
          您选择的文件只会在本机内存中处理，结果可写入浏览器本地存储（IndexedDB），
          <span className="font-semibold text-emerald-800">任何环节都不会上传到云端</span>，
          他人与运营方均无法访问您的文档内容。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          PDF 压缩通过逐页栅格化实现，可能失去可选中文本；PDF↔Word 以文字与简易版式为主，复杂排版与扫描版 PDF 效果有限。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {enabledItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow"
          >
            <h2 className="font-medium text-slate-900">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            <span className="mt-3 inline-block text-sm font-medium text-sky-600">进入 →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
