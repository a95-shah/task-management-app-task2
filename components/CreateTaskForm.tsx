'use client'

import { useState } from 'react'
import type { TaskStatus } from '@/lib/types'
import Button from './ui/Button'

interface CreateTaskFormProps {
  onCreateTask: (title: string, description: string, status: TaskStatus) => void
}

export default function CreateTaskForm({ onCreateTask }: CreateTaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Task title is required.')
      return
    }

    if (title.trim().length < 2) {
      setError('Title must be at least 2 characters.')
      return
    }

    onCreateTask(title.trim(), description.trim(), status)
    setTitle('')
    setDescription('')
    setStatus('todo')
    setIsExpanded(false)
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-blue-500/30 transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add New Task
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-white/10 rounded-xl p-4"
    >
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            autoFocus
            maxLength={200}
            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          />
        </div>

        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Initial Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full text-sm bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded(false)
              setTitle('')
              setDescription('')
              setError(null)
            }}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Add Task
          </Button>
        </div>
      </div>
    </form>
  )
}
