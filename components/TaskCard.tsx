'use client'

import { useState } from 'react'
import type { TaskStatus, OptimisticTask } from '@/lib/types'

interface TaskCardProps {
  task: OptimisticTask
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void
  onDelete: (taskId: string) => void
  onEdit: () => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export default function TaskCard({ task, onUpdateStatus, onDelete, onEdit }: TaskCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div
      className={`group bg-gray-800/80 border rounded-lg p-3.5 transition-all duration-200 hover:border-white/20 ${
        task._optimistic ? 'border-white/5 opacity-70' : 'border-white/10'
      }`}
    >
      {/* Title */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-white leading-snug line-clamp-2">{task.title}</h4>
        {task._optimistic && (
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shrink-0 mt-1" />
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Status select */}
      <div className="mb-3">
        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
          className="w-full text-xs bg-gray-700/50 border border-white/10 rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.3rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.2em 1.2em',
            paddingRight: '1.8rem',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        {!showConfirm ? (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit()}
              className="text-gray-500 hover:text-blue-400 transition-colors p-1 rounded text-xs"
              aria-label="Edit task"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded text-xs"
              aria-label="Delete task"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onDelete(task.id)
                setShowConfirm(false)
              }}
              className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 bg-red-900/30 rounded transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
