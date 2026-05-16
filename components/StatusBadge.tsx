import type { TaskStatus } from '@/lib/types'

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: {
    label: 'Todo',
    className: 'bg-gray-700/50 text-gray-300 border-gray-600/50',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  },
  done: {
    label: 'Done',
    className: 'bg-green-900/40 text-green-300 border-green-700/50',
  },
}

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  )
}
