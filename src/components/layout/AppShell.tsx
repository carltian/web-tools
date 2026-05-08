import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { SeoManager } from '@/components/SeoManager'
import { PrivacyStrip } from '@/components/layout/PrivacyStrip'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'

/**
 * 全局壳：左侧目录 + 顶栏 + 主内容 Outlet。
 */
export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-full">
      <SeoManager />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-full flex-1 flex-col md:pl-0">
        <TopNav onOpenMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-slate-50/80 px-4 py-6 md:px-8">
          <div className="mx-auto max-w-3xl">
            <PrivacyStrip />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
