import { lazy, Suspense } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { SITE_BRAND } from '@/config/site'

const HomePage = lazy(async () => {
  const m = await import('@/features/home/HomePage')
  return { default: m.HomePage }
})
const ComingSoonPage = lazy(async () => {
  const m = await import('@/features/ComingSoonPage')
  return { default: m.ComingSoonPage }
})
const PdfCompressPage = lazy(async () => {
  const m = await import('@/features/pdf-compress/PdfCompressPage')
  return { default: m.PdfCompressPage }
})
const PdfToDocxPage = lazy(async () => {
  const m = await import('@/features/pdf-docx/PdfToDocxPage')
  return { default: m.PdfToDocxPage }
})
const DocxToPdfPage = lazy(async () => {
  const m = await import('@/features/pdf-docx/DocxToPdfPage')
  return { default: m.DocxToPdfPage }
})

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">加载中…</div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <HomePage />
          </Suspense>
        ),
        handle: {
          title: SITE_BRAND,
          documentTitle: `${SITE_BRAND}｜PDF压缩·PDF互转Word·本机浏览器（免上传）`,
          seoDescription:
            `${SITE_BRAND} 提供 PDF 压缩、PDF↔Word（docx）互转，全程在您本机浏览器运行，零服务器上传。想找「浏览器 PDF 压缩」「pdf 互转 word」类工具的用户可直接使用各功能页。`,
        },
      },
      {
        path: 'coming-soon',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ComingSoonPage />
          </Suspense>
        ),
        handle: {
          title: '敬请期待',
          documentTitle: `更多PDF与文档工具敬请期待｜${SITE_BRAND}`,
          seoDescription:
            `${SITE_BRAND} 将陆续增加更多浏览器内本机文档工具，仍坚持不上传、不占云端。`,
        },
      },
      {
        path: 'pdf/compress',
        element: (
          <Suspense fallback={<PageFallback />}>
            <PdfCompressPage />
          </Suspense>
        ),
        handle: {
          title: 'PDF 压缩',
          documentTitle: `PDF压缩减小体积｜浏览器本机免费｜${SITE_BRAND}`,
          seoDescription:
            `${SITE_BRAND} PDF 压缩：在浏览器里无损策略性重编码图片以减小 PDF 体积，可调画质与分辨率。适合搜索「浏览器 pdf 压缩」「pdf 体积压缩」的场景，文件不离开您的电脑。`,
        },
      },
      {
        path: 'pdf/to-docx',
        element: (
          <Suspense fallback={<PageFallback />}>
            <PdfToDocxPage />
          </Suspense>
        ),
        handle: {
          title: 'PDF 转 Word',
          documentTitle: `PDF转Word(docx)｜浏览器本机互转｜${SITE_BRAND}`,
          seoDescription:
            `${SITE_BRAND} 将 PDF 文字抽取为 Word（.docx），实现 PDF 与 Word 互转的一侧能力。本机浏览器转换，不上传服务器；适合「pdf 转 word」「pdf 互转」检索需求。`,
        },
      },
      {
        path: 'docx/to-pdf',
        element: (
          <Suspense fallback={<PageFallback />}>
            <DocxToPdfPage />
          </Suspense>
        ),
        handle: {
          title: 'Word 转 PDF',
          documentTitle: `Word转PDF(docx)｜浏览器本机互转｜${SITE_BRAND}`,
          seoDescription:
            `${SITE_BRAND} 将 .docx 在浏览器内生成为 PDF，配合 PDF 转 Word 完成双向互转闭环。无云端处理，注重「word 转 pdf」「docx 转 pdf」检索的用户可直接使用。`,
        },
      },
    ],
  },
])

/**
 * 根组件：挂载浏览器路由表。
 */
export default function App() {
  return <RouterProvider router={router} />
}
