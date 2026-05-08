import type { JobState } from '@/types/job'

interface JobProgressProps {
  state: JobState
}

/**
 * 统一的任务进度条与阶段说明。
 */
export function JobProgress({ state }: JobProgressProps) {
  if (state.stage === 'idle') return null
  const err = state.stage === 'error'
  return (
    <div
      className={`rounded-xl border p-4 ${
        err ? 'border-red-200 bg-red-50/80' : 'border-sky-100 bg-white'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
        <span className={err ? 'font-medium text-red-800' : 'text-slate-700'}>
          {state.message}
        </span>
        {!err ? <span className="tabular-nums text-slate-500">{Math.round(state.progress)}%</span> : null}
      </div>
      {!err ? (
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
            style={{ width: `${Math.min(100, Math.max(0, state.progress))}%` }}
          />
        </div>
      ) : (
        <p className="text-sm text-red-700">{state.error}</p>
      )}
    </div>
  )
}
