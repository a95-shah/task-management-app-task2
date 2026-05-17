'use client'

import { useState, useEffect } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import type { OptimisticTask } from '@/lib/types'

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (id: string, title: string, description: string) => void
  task: OptimisticTask | null
}

export default function EditTaskModal({
  isOpen,
  onClose,
  onEdit,
  task,
}: EditTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title)
      setDescription(task.description || '')
      setError(null)
    }
  }, [task, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Task title is required.')
      return
    }

    if (task) {
      onEdit(task.id, title.trim(), description.trim())
    }
    onClose()
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  if (!task) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-task-title" className="block text-sm font-medium text-gray-300 mb-1.5">
            Task Title <span className="text-red-400">*</span>
          </label>
          <input
            id="edit-task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            maxLength={100}
            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="edit-task-description" className="block text-sm font-medium text-gray-300 mb-1.5">
            Description
          </label>
          <textarea
            id="edit-task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  )
}
