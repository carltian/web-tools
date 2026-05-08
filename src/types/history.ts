import type { ToolKind } from './tool'

/** 本地历史一条记录（不含二进制时用于列表展示） */
export interface HistoryMeta {
  id: string
  tool: ToolKind
  createdAt: number
  sourceName: string
  outputName: string
  mime: string
  /** 参数快照，便于在历史中展示 */
  params: Record<string, unknown>
  /** 输出大小（字节） */
  size: number
}

/** IndexedDB 中存储的完整实体 */
export interface HistoryEntry extends HistoryMeta {
  data: ArrayBuffer
}
