/**
 * 占位页：后续扩展更多工具时的默认提示。
 */
export function ComingSoonPage() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600">
      <p className="text-lg font-medium text-slate-800">更多工具敬请期待</p>
      <p className="mt-2 text-sm">可在路由与 `config/tools` 中扩展新入口。</p>
    </div>
  )
}
