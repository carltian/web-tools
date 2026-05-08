const AUTO_DL_KEY = 'tools-web:autodownload'

/**
 * 读取是否在处理完成后自动下载结果（默认开启）。
 */
export function getAutoDownload(): boolean {
  if (typeof localStorage === 'undefined') return true
  return localStorage.getItem(AUTO_DL_KEY) !== '0'
}

/**
 * 持久化自动下载偏好。
 */
export function setAutoDownload(enabled: boolean): void {
  localStorage.setItem(AUTO_DL_KEY, enabled ? '1' : '0')
}
