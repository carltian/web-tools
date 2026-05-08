/**
 * 全局隐私说明条：置于主内容顶部，强调零上传与本机处理。
 */
export function PrivacyStrip() {
  return (
    <div
      className="mb-6 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-white to-sky-50/80 px-4 py-4 shadow-sm sm:px-5"
      role="status"
    >
      <div className="flex flex-wrap items-start gap-3">
        <span className="text-2xl leading-none" aria-hidden>
          🔒
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-base font-semibold tracking-tight text-emerald-950">
            您的文件<strong className="text-emerald-700">不会上传到任何后台</strong>，
            <strong className="text-emerald-700">仅在您本机</strong>
            浏览器中处理
          </p>
          <p className="text-sm leading-relaxed text-emerald-900/85">
            转换与压缩全程在内存与本地 IndexedDB 中完成，无云端服务器参与，从源头降低泄露风险，
            <span className="font-medium text-emerald-950">隐私性更好</span>，适合敏感文档。
          </p>
        </div>
      </div>
    </div>
  )
}
