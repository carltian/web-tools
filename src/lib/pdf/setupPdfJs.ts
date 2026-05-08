/**
 * 配置 pdf.js worker，在任意使用 pdfjs 的模块之前调用一次即可。
 */
export async function ensurePdfWorker(): Promise<void> {
  const pdfjs = await import('pdfjs-dist')
  // Vite：以 URL 方式引入 worker，避免打包路径问题
  const worker = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)
  pdfjs.GlobalWorkerOptions.workerSrc = worker.toString()
}
