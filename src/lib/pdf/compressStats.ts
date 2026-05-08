/**
 * 根据压缩前后字节数计算体积变化百分比（四舍五入为整数）。
 * 正数表示相对原文件减小的占比；若为负则表示输出更大。
 */
export function computeVolumeShrinkPercent(originalBytes: number, outputBytes: number): number {
  if (originalBytes <= 0) return 0
  return Math.round((1 - outputBytes / originalBytes) * 100)
}

/**
 * 将字节数格式化为易读字符串（KB / MB）。
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
