import { useMemo, useState } from 'react'
import { AdSlot } from '@/components/layout/AdSlot'
import { HistoryPanel } from '@/components/history/HistoryPanel'
import { JobProgress } from '@/components/jobs/JobProgress'
import { downloadBlob } from '@/lib/download'
import { compressPdfByRasterize } from '@/lib/pdf/compressPdf'
import { computeVolumeShrinkPercent, formatFileSize } from '@/lib/pdf/compressStats'
import { saveHistoryEntry } from '@/lib/storage/historyDb'
import { getAutoDownload, setAutoDownload } from '@/lib/settings'
import type { JobState } from '@/types/job'

const MAX_MB = 48

const idleJob: JobState = { stage: 'idle', progress: 0, message: '' }

/** 最近一次成功压缩的体积对比，用于突出压缩率 */
interface CompressHighlight {
  originalBytes: number
  outputBytes: number
  /** 正数表示体积减小的百分比 */
  shrinkPercent: number
}

/**
 * PDF 压缩页面：栅格化各页并按 JPEG 质量编码后再封装为 PDF。
 */
export function PdfCompressPage() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(0.82)
  const [maxEdgePx, setMaxEdgePx] = useState(1680)
  const [job, setJob] = useState<JobState>(idleJob)
  const [running, setRunning] = useState(false)
  const [autoDl, setAutoDl] = useState(() => getAutoDownload())
  const [compressHighlight, setCompressHighlight] = useState<CompressHighlight | null>(null)

  const tooLarge = useMemo(() => {
    if (!file) return false
    return file.size > MAX_MB * 1024 * 1024
  }, [file])

  const onPickFile = (f: File | null) => {
    setFile(f)
    setJob(idleJob)
    setCompressHighlight(null)
  }

  const run = async () => {
    if (!file || tooLarge) return
    setRunning(true)
    setCompressHighlight(null)
    setJob({ stage: 'parsing', progress: 0, message: '准备中…' })
    try {
      const buf = await file.arrayBuffer()
      const bytes = await compressPdfByRasterize(
        buf,
        { quality, maxEdgePx },
        setJob,
      )
      const base = file.name.replace(/\.pdf$/i, '')
      const outputName = `${base || 'compressed'}-compressed.pdf`
      const stored = bytes.slice()
      const originalBytes = file.size
      const outputBytes = stored.byteLength
      const shrinkPercent = computeVolumeShrinkPercent(originalBytes, outputBytes)

      await saveHistoryEntry({
        id: crypto.randomUUID(),
        tool: 'compress',
        createdAt: Date.now(),
        sourceName: file.name,
        outputName,
        mime: 'application/pdf',
        params: {
          quality,
          maxEdgePx,
          shrinkPercent,
          originalBytes,
          outputBytes,
        },
        size: outputBytes,
        data: stored.buffer,
      })

      setCompressHighlight({ originalBytes, outputBytes, shrinkPercent })

      if (autoDl) {
        downloadBlob(new Blob([stored], { type: 'application/pdf' }), outputName)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setJob({
        stage: 'error',
        progress: 0,
        message: '处理失败',
        error: msg,
      })
    } finally {
      setRunning(false)
    }
  }

  const toggleAutoDl = (v: boolean) => {
    setAutoDl(v)
    setAutoDownload(v)
  }

  return (
    <div>
      <AdSlot />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-emerald-900/90">
          <strong className="text-emerald-800">仅在您本机处理</strong>
          ：PDF 不会上传至任何服务器。
        </p>
        <p className="mt-2 text-sm text-slate-600">
          通过逐页渲染并重新压缩图片来减小体积，适合扫描件与插图为主的 PDF。含大量矢量文字时会变为图片，无法再选中文字。
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">选择 PDF</span>
            <input
              type="file"
              accept="application/pdf"
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {file ? (
            <p className="text-xs text-slate-500">
              已选：{file.name}（{(file.size / (1024 * 1024)).toFixed(2)} MB）
            </p>
          ) : null}
          {tooLarge ? (
            <p className="text-sm text-amber-700">文件超过 {MAX_MB}MB，请先在本地拆分或可能占用过多内存。</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 flex justify-between text-sm font-medium text-slate-700">
                JPEG 质量
                <span className="font-normal text-slate-500">{quality.toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={0.55}
                max={0.95}
                step={0.01}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 flex justify-between text-sm font-medium text-slate-700">
                长边最大像素
                <span className="font-normal text-slate-500">{maxEdgePx}</span>
              </span>
              <input
                type="range"
                min={960}
                max={2400}
                step={40}
                value={maxEdgePx}
                onChange={(e) => setMaxEdgePx(Number(e.target.value))}
                className="w-full"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={autoDl}
              onChange={(e) => toggleAutoDl(e.target.checked)}
            />
            处理完成后自动下载结果
          </label>

          <button
            type="button"
            disabled={!file || tooLarge || running}
            onClick={() => void run()}
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {running ? '处理中…' : '开始压缩'}
          </button>

          <JobProgress state={job} />

          <CompressResultBanner highlight={compressHighlight} />
        </div>
      </div>
      <HistoryPanel filterTool="compress" />
    </div>
  )
}

interface CompressResultBannerProps {
  highlight: CompressHighlight | null
}

/**
 * 压缩完成后展示的体积对比与「减小百分之几」高光提示。
 */
function CompressResultBanner({ highlight }: CompressResultBannerProps) {
  if (!highlight) return null

  const { originalBytes, outputBytes, shrinkPercent } = highlight
  const before = formatFileSize(originalBytes)
  const after = formatFileSize(outputBytes)

  if (shrinkPercent >= 45) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50/90 to-yellow-50 p-5 shadow-md ring-1 ring-amber-100/80">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-amber-800">
          优秀压缩表现
        </p>
        <p className="mt-3 text-center text-4xl font-extrabold tabular-nums tracking-tight text-amber-900 sm:text-5xl">
          体积减小 {shrinkPercent}%
        </p>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-amber-900/90">
          由 <span className="font-semibold tabular-nums">{before}</span> 降至{' '}
          <span className="font-semibold tabular-nums">{after}</span>，文件更小、更易分享，
          <span className="whitespace-nowrap">仍仅保存在您设备上。</span>
        </p>
      </div>
    )
  }

  if (shrinkPercent > 0) {
    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50/90 p-5 shadow-sm">
        <p className="text-center text-3xl font-bold tabular-nums text-sky-900 sm:text-4xl">
          体积减小 {shrinkPercent}%
        </p>
        <p className="mt-2 text-center text-sm text-sky-800/95">
          {before} → {after} · 更小体积，加载更快。
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-center text-lg font-semibold text-slate-800">
        {shrinkPercent < 0 ? '本次体积未减小' : '本次与原文件基本持平'}
      </p>
      <p className="mt-2 text-center text-sm text-slate-600">
        {before} → {after}
        {shrinkPercent < 0
          ? `（约增大 ${Math.abs(shrinkPercent)}%，多为画质/分辨率所致，可适当调低画质或分辨率再试）`
          : ''}
      </p>
    </div>
  )
}
