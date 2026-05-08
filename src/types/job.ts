/** 转换任务阶段，用于进度文案与百分比划分 */
export type JobStage = 'idle' | 'parsing' | 'processing' | 'writing' | 'done' | 'error'

/** 运行中任务对外暴露的状态 */
export interface JobState {
  stage: JobStage
  /** 0–100 */
  progress: number
  message: string
  error?: string
}
