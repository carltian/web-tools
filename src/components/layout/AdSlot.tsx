import type { ReactNode } from 'react'

interface AdSlotProps {
  /** 可选：后续嵌入联盟脚本时可传入自定义节点 */
  children?: ReactNode
  className?: string
}

/**
 * 主内容区顶部横幅广告位占位。
 */
export function AdSlot({ children, className = '' }: AdSlotProps) {
  return (
    <div
      className={`mb-6 flex min-h-[72px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm text-slate-400 ${className}`}
    >
      {children ?? '广告位（横幅）'}
    </div>
  )
}
