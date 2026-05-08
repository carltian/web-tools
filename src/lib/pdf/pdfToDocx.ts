import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import type { JobState } from '@/types/job'
import { ensurePdfWorker } from '@/lib/pdf/setupPdfJs'

export type PdfToDocxMode = 'byPage' | 'continuous'

export interface PdfToDocxOptions {
  mode: PdfToDocxMode
}

/**
 * 从 PDF 抽取纯文本并生成 docx 文件（版式以文字为主，不还原复杂排版）。
 */
export async function convertPdfToDocx(
  fileBuffer: ArrayBuffer,
  options: PdfToDocxOptions,
  onProgress: (state: JobState) => void,
): Promise<Uint8Array> {
  await ensurePdfWorker()
  const pdfjs = await import('pdfjs-dist')
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(fileBuffer.slice(0)) })
  onProgress({ stage: 'parsing', progress: 4, message: '正在打开 PDF…' })
  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  const paragraphs: Paragraph[] = []

  for (let i = 1; i <= numPages; i += 1) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const strings = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .filter(Boolean)
    const pageText = strings.join(' ').replace(/\s+/g, ' ').trim()
    const pct = 4 + Math.floor((i / numPages) * 80)
    onProgress({
      stage: 'processing',
      progress: pct,
      message: `正在抽取文本：第 ${i} / ${numPages} 页`,
    })

    if (options.mode === 'byPage') {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: `第 ${i} 页`, bold: true })],
        }),
      )
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: pageText || '（本页无文本）' })],
        }),
      )
    } else {
      if (pageText) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: pageText })] }))
      }
    }
  }

  if (options.mode === 'continuous' && paragraphs.length === 0) {
    paragraphs.push(
      new Paragraph({ children: [new TextRun({ text: '未抽取到可识别文本，可能是扫描版 PDF。' })] }),
    )
  }

  onProgress({ stage: 'writing', progress: 90, message: '正在生成 Word 文档…' })
  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  })
  const blob = await Packer.toBlob(doc)
  const buf = await blob.arrayBuffer()
  const out = new Uint8Array(buf)
  onProgress({ stage: 'done', progress: 100, message: '完成' })
  return out
}
