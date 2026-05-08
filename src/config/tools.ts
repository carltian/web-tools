import type { ToolKind } from '@/types/tool'

/** 侧栏单条导航配置 */
export interface ToolNavItem {
  id: ToolKind
  path: string
  title: string
  description: string
  enabled: boolean
}

/** 分组后的导航，便于后续扩展「更多工具」 */
export interface ToolNavGroup {
  id: string
  title: string
  items: ToolNavItem[]
}

/** 全站工具目录定义：新增工具时在此追加并在路由注册 */
export const TOOL_NAV_GROUPS: ToolNavGroup[] = [
  {
    id: 'docs',
    title: '文档工具',
    items: [
      {
        id: 'compress',
        path: '/pdf/compress',
        title: 'PDF 压缩',
        description: '将页面栅格化并降低图片质量以减小体积',
        enabled: true,
      },
      {
        id: 'pdf2docx',
        path: '/pdf/to-docx',
        title: 'PDF 转 Word',
        description: '抽取文本生成 .docx（以文字为主）',
        enabled: true,
      },
      {
        id: 'docx2pdf',
        path: '/docx/to-pdf',
        title: 'Word 转 PDF',
        description: '通过 HTML 中间层导出 PDF',
        enabled: true,
      },
    ],
  },
  {
    id: 'future',
    title: '更多',
    items: [
      {
        id: 'placeholder',
        path: '/coming-soon',
        title: '敬请期待',
        description: '后续可在此挂载图片/音视频等工具',
        enabled: false,
      },
    ],
  },
]
