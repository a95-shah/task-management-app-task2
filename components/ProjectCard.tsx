'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { OptimisticProject } from '@/lib/types'

interface ProjectCardProps {
  project: OptimisticProject
  onDelete: (id: string) => void
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const formattedDate = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      className={`group relative bg-gray-900 border rounded-xl p-5 transition-all duration-200 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 ${
        project._optimistic
          ? 'border-white/5 opacity-70'
          : 'border-white/10'
      }`}
    >
      {/* Optimistic indicator */}
      {project._optimistic && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
      )}

      <Link href={`/dashboard/project/${project.id}`} className="block mb-4">
        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-sm text-gray-400 mt-1.5 line-clamp-2">{project.description}</p>
        )}
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-xs text-gray-500">{formattedDate}</span>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
            aria-label="Delete project"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onDelete(project.id)
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
