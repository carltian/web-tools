import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  deleteHistoryEntry,
  listHistoryEntries,
} from '@/lib/storage/historyDb'
import type { HistoryEntry } from '@/types/history'
import type { ToolKind } from '@/types/tool'

/** 将工具类型映射为中文标签 */
function toolLabel(tool: ToolKind): string {
  switch (tool) {
    case 'compress':
      return 'PDF 压缩'
    case 'pdf2docx':
      return 'PDF→Word'
    case 'docx2pdf':
      return 'Word→PDF'
    default:
      return '其他'
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

interface HistoryPanelProps {
  /** 仅展示某一种工具的条目，缺省展示全部 */
  filterTool?: ToolKind
}

/**
 * 历史记录列表：本地 IndexedDB，支持下载与删除。
 */
export function HistoryPanel({ filterTool }: HistoryPanelProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [busy, setBusy] = useState(false)

  const visible = useMemo(
    () => (filterTool ? entries.filter((e) => e.tool === filterTool) : entries),
    [entries, filterTool],
  )

  const refresh = useCallback(async (): Promise<void> => {
    const list = await listHistoryEntries()
    setEntries(list)
  }, [])

  useEffect(() => {
    let alive = true
    void listHistoryEntries().then((list) => {
      if (alive) setEntries(list)
    })
    return () => {
      alive = false
    }
  }, [])

  /** 将缓存的 ArrayBuffer 封装为 Blob 并触发浏览器下载 */
  const downloadEntry = (entry: HistoryEntry) => {
    const blob = new Blob([entry.data], { type: entry.mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = entry.outputName
    a.click()
    URL.revokeObjectURL(url)
  }

  const onDelete = async (id: string) => {
    setBusy(true)
    try {
      await deleteHistoryEntry(id)
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const onClear = async () => {
    if (!visible.length) return
    const ok = window.confirm('确定删除列表中的本地记录？（不影响源文件）')
    if (!ok) return
    setBusy(true)
    try {
      for (const e of visible) {
        await deleteHistoryEntry(e.id)
      }
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">本地历史</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            onClick={() => void refresh()}
            disabled={busy}
          >
            刷新
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-100 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
            onClick={() => void onClear()}
            disabled={busy || !visible.length}
          >
            清空
          </button>
        </div>
      </div>
      {!visible.length ? (
        <p className="text-sm text-slate-500">暂无记录。处理完成后会自动出现在此（仅存于本机浏览器）。</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((e) => (
            <li
              key={e.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{e.outputName}</p>
                <p className="text-xs text-slate-500">
                  {toolLabel(e.tool)} · {formatBytes(e.size)} ·{' '}
                  {new Date(e.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-700"
                  onClick={() => downloadEntry(e)}
                >
                  下载
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  onClick={() => void onDelete(e.id)}
                  disabled={busy}
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
