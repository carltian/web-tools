export {}

declare module 'react-router' {
  /** 路由 handle：顶栏标题、SEO 文档标题与 meta 描述 */
  interface RouteHandle {
    title?: string
    /** 浏览器标签完整标题；不填则用「title｜浏览器PDF工具箱」 */
    documentTitle?: string
    /** 该页独立 meta description，利于工具类长尾词 */
    seoDescription?: string
  }
}
