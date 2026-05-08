import mammoth from 'mammoth'
import html2pdf from 'html2pdf.js'
import type { JobState } from '@/types/job'

export interface DocxToPdfOptions {
  /** 纸张方向 */
  orientation: 'portrait' | 'landscape'
  /** 页边距 mm */
  marginMm: number
  /** html2canvas 分辨率倍率 */
  scale: number
  /** 生成图片质量 0–1 */
  imageQuality: number
}

/**
 * 将 docx 转 HTML 再使用 html2pdf 导出 PDF（版式为 Web 渲染结果）。
 */
export async function convertDocxToPdfBlob(
  fileBuffer: ArrayBuffer,
  options: DocxToPdfOptions,
  onProgress: (state: JobState) => void,
): Promise<Blob> {
  onProgress({ stage: 'parsing', progress: 6, message: '正在解析 Word…' })
  const { value: html } = await mammoth.convertToHtml(
    { arrayBuffer: fileBuffer.slice(0) },
    {},
  )
  const wrapper = document.createElement('div')
  wrapper.className = 'docx-html-root text-gray-900'
  wrapper.style.padding = '12px'
  wrapper.style.boxSizing = 'border-box'
  wrapper.innerHTML = html || '<p>（空文档）</p>'
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-10000px'
  wrapper.style.top = '0'
  wrapper.style.width = '210mm'
  document.body.appendChild(wrapper)

  onProgress({ stage: 'processing', progress: 35, message: '正在排版 HTML…' })

  const opt = {
    margin: options.marginMm,
    filename: 'export.pdf',
    image: { type: 'jpeg' as const, quality: options.imageQuality },
    html2canvas: {
      scale: options.scale,
      useCORS: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: options.orientation,
    },
    pagebreak: { mode: ['css', 'legacy'] as const },
  }

  try {
    onProgress({ stage: 'writing', progress: 55, message: '正在渲染 PDF…' })
    const blob = (await html2pdf().set(opt).from(wrapper).outputPdf('blob')) as Blob
    onProgress({ stage: 'done', progress: 100, message: '完成' })
    return blob
  } finally {
    document.body.removeChild(wrapper)
  }
}
