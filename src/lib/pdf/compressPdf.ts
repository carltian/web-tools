import { PDFDocument } from 'pdf-lib'
import type { JobState } from '@/types/job'
import { ensurePdfWorker } from '@/lib/pdf/setupPdfJs'

export interface CompressOptions {
  /** JPEG 质量 0–1 */
  quality: number
  /** 长边最大像素，用于控制分辨率 */
  maxEdgePx: number
}

/** 将 canvas 转为 JPEG 二进制 */
function canvasToJpegBytes(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('无法编码图片'))
          return
        }
        void blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)))
      },
      'image/jpeg',
      quality,
    )
  })
}

/**
 * 通过「逐页栅格化再嵌入 JPEG」的方式压缩 PDF 体积，并汇报进度。
 */
export async function compressPdfByRasterize(
  fileBuffer: ArrayBuffer,
  options: CompressOptions,
  onProgress: (state: JobState) => void,
): Promise<Uint8Array> {
  await ensurePdfWorker()
  const pdfjs = await import('pdfjs-dist')
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(fileBuffer.slice(0)) })
  onProgress({
    stage: 'parsing',
    progress: 5,
    message: '正在解析 PDF…',
  })
  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  const outPdf = await PDFDocument.create()
  for (let i = 1; i <= numPages; i += 1) {
    const page = await pdf.getPage(i)
    const base = page.getViewport({ scale: 1 })
    const longest = Math.max(base.width, base.height)
    const scale = Math.min(1, options.maxEdgePx / longest)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建画布上下文')
    await page.render({ canvasContext: ctx, viewport, canvas }).promise
    const jpegBytes = await canvasToJpegBytes(canvas, options.quality)
    const image = await outPdf.embedJpg(jpegBytes)
    const pdfPage = outPdf.addPage([image.width, image.height])
    pdfPage.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
    const pct = 5 + Math.floor((i / numPages) * 90)
    onProgress({
      stage: 'processing',
      progress: pct,
      message: `正在压缩第 ${i} / ${numPages} 页…`,
    })
  }
  onProgress({ stage: 'writing', progress: 96, message: '正在写入新 PDF…' })
  const bytes = await outPdf.save()
  onProgress({ stage: 'done', progress: 100, message: '完成' })
  return bytes
}
