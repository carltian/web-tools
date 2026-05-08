import { useMemo } from 'react'
import { useMatches, useNavigate } from 'react-router-dom'
import { SITE_BRAND } from '@/config/site'

interface TopNavProps {
  /** 打开移动端侧栏 */
  onOpenMenu: () => void
}

/**
 * 顶栏：展示当前页标题（来自路由 handle）与菜单按钮。
 */
export function TopNav({ onOpenMenu }: TopNavProps) {
  const matches = useMatches()
  const navigate = useNavigate()

  const title = useMemo(() => {
    const last = matches[matches.length - 1]
    const handle = last?.handle as { title?: string } | undefined
    return handle?.title ?? SITE_BRAND
  }, [matches])

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
          onClick={() => onOpenMenu()}
          aria-label="打开菜单"
        >
          <span className="text-lg">☰</span>
        </button>
        <div>
          <p className="text-base font-semibold text-slate-900">{title}</p>
        </div>
      </div>
      <button
        type="button"
        className="hidden rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 sm:block"
        onClick={() => void navigate('/')}
      >
        返回首页
      </button>
    </header>
  )
}
