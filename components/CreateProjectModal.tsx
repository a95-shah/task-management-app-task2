'use client'

import { useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (title: string, description: string) => void
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Project title is required.')
      return
    }

    if (title.trim().length < 2) {
      setError('Title must be at least 2 characters.')
      return
    }

    onCreate(title.trim(), description.trim())
    setTitle('')
    setDescription('')
    setError(null)
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="project-title" className="block text-sm font-medium text-gray-300 mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="project-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Project"
            autoFocus
            maxLength={100}
            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="project-description" className="block text-sm font-medium text-gray-300 mb-1.5">
            Description
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the project..."
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
          <Button type="submit">Create Project</Button>
        </div>
      </form>
    </Modal>
  )
}
