import { useMemo, useState } from 'react'
import { AdSlot } from '@/components/layout/AdSlot'
import { HistoryPanel } from '@/components/history/HistoryPanel'
import { JobProgress } from '@/components/jobs/JobProgress'
import { downloadBlob } from '@/lib/download'
import { convertDocxToPdfBlob } from '@/lib/pdf/docxToPdf'
import { saveHistoryEntry } from '@/lib/storage/historyDb'
import { getAutoDownload, setAutoDownload } from '@/lib/settings'
import type { JobState } from '@/types/job'

const MAX_MB = 48
const idleJob: JobState = { stage: 'idle', progress: 0, message: '' }

/**
 * Word 转 PDF：经由 HTML 渲染，适合版式不极端复杂的文档。
 */
export function DocxToPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [marginMm, setMarginMm] = useState(12)
  const [scale, setScale] = useState(2)
  const [imageQuality, setImageQuality] = useState(0.92)
  const [job, setJob] = useState<JobState>(idleJob)
  const [running, setRunning] = useState(false)
  const [autoDl, setAutoDl] = useState(() => getAutoDownload())

  const tooLarge = useMemo(() => {
    if (!file) return false
    return file.size > MAX_MB * 1024 * 1024
  }, [file])

  const run = async () => {
    if (!file || tooLarge) return
    setRunning(true)
    setJob({ stage: 'parsing', progress: 0, message: '准备中…' })
    try {
      const buf = await file.arrayBuffer()
      const blob = await convertDocxToPdfBlob(
        buf,
        { orientation, marginMm, scale, imageQuality },
        setJob,
      )
      const base = file.name.replace(/\.docx$/i, '')
      const outputName = `${base || 'document'}.pdf`
      const data = await blob.arrayBuffer()
      await saveHistoryEntry({
        id: crypto.randomUUID(),
        tool: 'docx2pdf',
        createdAt: Date.now(),
        sourceName: file.name,
        outputName,
        mime: 'application/pdf',
        params: { orientation, marginMm, scale, imageQuality },
        size: data.byteLength,
        data,
      })
      if (autoDl) {
        downloadBlob(blob, outputName)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setJob({ stage: 'error', progress: 0, message: '处理失败', error: msg })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <AdSlot />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-emerald-900/90">
          <strong className="text-emerald-800">文件不离开您的设备</strong>
          ：不会在后台上传或存储，转换仅在本机浏览器内完成。
        </p>
        <p className="mt-2 text-sm text-slate-600">
          使用 Word→HTML→PDF 管线，页眉脚注、复杂域与部分样式可能与桌面 Word 有差异。
        </p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">选择 .docx</span>
            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null)
                setJob(idleJob)
              }}
            />
          </label>
          {tooLarge ? (
            <p className="text-sm text-amber-700">文件超过 {MAX_MB}MB。</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              纸张方向
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value === 'landscape' ? 'landscape' : 'portrait')
                }
              >
                <option value="portrait">纵向</option>
                <option value="landscape">横向</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              页边距（mm）
              <input
                type="number"
                min={4}
                max={32}
                value={marginMm}
                onChange={(e) => setMarginMm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              渲染倍率（清晰度）
              <input
                type="range"
                min={1}
                max={3}
                step={0.25}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="mt-1 w-full"
              />
              <span className="text-xs text-slate-500">{scale}x</span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              导出图片质量
              <input
                type="range"
                min={0.72}
                max={1}
                step={0.01}
                value={imageQuality}
                onChange={(e) => setImageQuality(Number(e.target.value))}
                className="mt-1 w-full"
              />
              <span className="text-xs text-slate-500">{imageQuality.toFixed(2)}</span>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={autoDl}
              onChange={(e) => {
                const v = e.target.checked
                setAutoDl(v)
                setAutoDownload(v)
              }}
            />
            处理完成后自动下载结果
          </label>

          <button
            type="button"
            disabled={!file || tooLarge || running}
            onClick={() => void run()}
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {running ? '转换中…' : '转换为 PDF'}
          </button>
          <JobProgress state={job} />
        </div>
      </div>
      <HistoryPanel filterTool="docx2pdf" />
    </div>
  )
}
