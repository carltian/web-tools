import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { HistoryEntry } from '@/types/history'

/** IndexedDB 数据库名称 */
const DB_NAME = 'tools-web-history'
const DB_VERSION = 1
const STORE = 'history'

interface AppDB extends DBSchema {
  [STORE]: {
    key: string
    value: HistoryEntry
  }
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null

/**
 * 获取（并懒初始化）历史记录数据库实例。
 */
function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE)) {
          database.createObjectStore(STORE, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

/**
 * 写入一条历史记录（覆盖同 id）。
 */
export async function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  const db = await getDB()
  await db.put(STORE, entry)
}

/**
 * 按时间倒序返回全部历史元数据与数据。
 */
export async function listHistoryEntries(): Promise<HistoryEntry[]> {
  const db = await getDB()
  const all = await db.getAll(STORE)
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 删除单条历史。
 */
export async function deleteHistoryEntry(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
}

/**
 * 清空全部历史。
 */
export async function clearHistory(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE)
}
