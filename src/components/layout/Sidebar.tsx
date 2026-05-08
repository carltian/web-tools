import { Link, NavLink, useNavigate } from 'react-router-dom'
import { SITE_BRAND } from '@/config/site'
import { TOOL_NAV_GROUPS } from '@/config/tools'

interface SidebarProps {
  /** 移动端侧栏是否展开，用于覆盖层与动画 */
  open: boolean
  /** 关闭侧栏（通常在导航后触发） */
  onClose: () => void
}

/**
 * 左侧工具目录：按配置分组渲染，可扩展；窄屏下为抽屉式。
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate()

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white shadow-sm transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-100 px-4 py-4">
          <Link
            to="/"
            className="block text-[15px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-lg"
            onClick={() => onClose()}
          >
            {SITE_BRAND}
          </Link>
          <p className="mt-2 rounded-lg bg-emerald-50 px-2 py-1.5 text-[11px] font-medium leading-snug text-emerald-900 ring-1 ring-emerald-100">
            <span className="font-semibold">零后台上传：</span>
            全部在您电脑上完成，云端不存副本，隐私有保障
          </p>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
          {TOOL_NAV_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={`${group.id}-${item.path}`}>
                    {item.enabled ? (
                      <NavLink
                        to={item.path}
                        onClick={() => onClose()}
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-2 text-sm transition ${
                            isActive
                              ? 'bg-sky-50 font-medium text-sky-800'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`
                        }
                      >
                        <span className="block">{item.title}</span>
                        <span className="mt-0.5 block text-xs font-normal text-slate-500">
                          {item.description}
                        </span>
                      </NavLink>
                    ) : (
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-50"
                        onClick={() => {
                          void navigate('/coming-soon')
                          onClose()
                        }}
                      >
                        <span className="block">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-400">{item.description}</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
            广告位预留
          </div>
        </div>
      </aside>
      {open ? (
        <button
          type="button"
          aria-label="关闭菜单"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => onClose()}
        />
      ) : null}
    </>
  )
}
