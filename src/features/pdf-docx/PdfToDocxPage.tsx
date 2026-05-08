import { useMemo, useState } from 'react'
import { AdSlot } from '@/components/layout/AdSlot'
import { HistoryPanel } from '@/components/history/HistoryPanel'
import { JobProgress } from '@/components/jobs/JobProgress'
import { downloadBlob } from '@/lib/download'
import { convertPdfToDocx } from '@/lib/pdf/pdfToDocx'
import type { PdfToDocxMode } from '@/lib/pdf/pdfToDocx'
import { saveHistoryEntry } from '@/lib/storage/historyDb'
import { getAutoDownload, setAutoDownload } from '@/lib/settings'
import type { JobState } from '@/types/job'

const MAX_MB = 48
const idleJob: JobState = { stage: 'idle', progress: 0, message: '' }

/**
 * PDF 转 Word：抽取文本生成 docx。
 */
export function PdfToDocxPage() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<PdfToDocxMode>('byPage')
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
      const out = await convertPdfToDocx(buf, { mode }, setJob)
      const base = file.name.replace(/\.pdf$/i, '')
      const outputName = `${base || 'document'}.docx`
      const u8 = new Uint8Array(out.byteLength)
      u8.set(out)
      await saveHistoryEntry({
        id: crypto.randomUUID(),
        tool: 'pdf2docx',
        createdAt: Date.now(),
        sourceName: file.name,
        outputName,
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        params: { mode },
        size: u8.byteLength,
        data: u8.buffer,
      })
      if (autoDl) {
        downloadBlob(
          new Blob([u8], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          }),
          outputName,
        )
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
          从 PDF 提取可复制的文字并写入 Word。扫描版 PDF 无法识别为文字时，结果可能近似为空。
        </p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">选择 PDF</span>
            <input
              type="file"
              accept="application/pdf"
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

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">段落策略</legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                checked={mode === 'byPage'}
                onChange={() => setMode('byPage')}
              />
              按页分节（每页小标题）
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                checked={mode === 'continuous'}
                onChange={() => setMode('continuous')}
              />
              连续正文（不分页标题）
            </label>
          </fieldset>

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
            {running ? '转换中…' : '开始转换'}
          </button>
          <JobProgress state={job} />
        </div>
      </div>
      <HistoryPanel filterTool="pdf2docx" />
    </div>
  )
}
