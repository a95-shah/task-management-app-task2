'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, OptimisticProject } from '@/lib/types'
import ProjectCard from './ProjectCard'
import CreateProjectModal from './CreateProjectModal'
import EditProjectModal from './EditProjectModal'
import EmptyState from './ui/EmptyState'
import Button from './ui/Button'
import { useToast } from './ui/Toast'

interface ProjectListProps {
  initialProjects: Project[]
  userId: string
}

export default function ProjectList({ initialProjects, userId }: ProjectListProps) {
  const [projects, setProjects] = useState<OptimisticProject[]>(initialProjects)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Edit state
  const [editProject, setEditProject] = useState<OptimisticProject | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const supabase = createClient()
  const { showToast } = useToast()

  // Subscribe to realtime changes on projects table
  useEffect(() => {
    const channel = supabase
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `created_by=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProject = payload.new as Project
            setProjects((prev) => {
              // Skip if we already have this project (optimistic)
              if (prev.some((p) => p.id === newProject.id)) {
                // Replace optimistic version with confirmed version
                return prev.map((p) =>
                  p.id === newProject.id ? { ...newProject, _optimistic: false } : p
                )
              }
              return [newProject, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id as string
            setProjects((prev) => prev.filter((p) => p.id !== deletedId))
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Project
            setProjects((prev) =>
              prev.map((p) => (p.id === updated.id ? { ...updated, _optimistic: false } : p))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  // Optimistic create
  const handleCreateProject = useCallback(
    async (title: string, description: string) => {
      const optimisticId = crypto.randomUUID()
      const optimisticProject: OptimisticProject = {
        id: optimisticId,
        title,
        description: description || null,
        created_at: new Date().toISOString(),
        created_by: userId,
        _optimistic: true,
      }

      // Optimistic: add immediately
      setProjects((prev) => [optimisticProject, ...prev])
      setShowCreateModal(false)

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title,
          description: description || null,
          created_by: userId,
        })
        .select()
        .single()

      if (error) {
        // Rollback
        setProjects((prev) => prev.filter((p) => p.id !== optimisticId))
        showToast(error.message, 'error')
        return
      }

      // Replace optimistic with real
      setProjects((prev) =>
        prev.map((p) => (p.id === optimisticId ? { ...data, _optimistic: false } : p))
      )
      showToast('Project created!', 'success')
    },
    [supabase, userId, showToast]
  )

  // Optimistic edit
  const handleEditProject = useCallback(
    async (projectId: string, title: string, description: string) => {
      const previousProjects = projects
      
      // Optimistic: update immediately
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, title, description, _optimistic: true } : p))
      )

      const { error } = await supabase
        .from('projects')
        .update({ title, description: description || null })
        .eq('id', projectId)

      if (error) {
        // Rollback
        setProjects(previousProjects)
        showToast(error.message, 'error')
      } else {
        showToast('Project updated!', 'success')
      }
    },
    [supabase, projects, showToast]
  )

  // Optimistic delete
  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      const previousProjects = projects

      // Optimistic: remove immediately
      setProjects((prev) => prev.filter((p) => p.id !== projectId))

      const { error } = await supabase.from('projects').delete().eq('id', projectId)

      if (error) {
        // Rollback
        setProjects(previousProjects)
        showToast(error.message, 'error')
      } else {
        showToast('Project deleted', 'success')
      }
    },
    [supabase, projects, showToast]
  )

  const openEditModal = (project: OptimisticProject) => {
    setEditProject(project)
    setShowEditModal(true)
  }

  return (
    <>
      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </div>

      {/* Projects grid */}
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start managing tasks."
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
              onEdit={() => openEditModal(project)}
            />
          ))}
        </div>
      )}

      {/* Create project modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
      />
      
      {/* Edit project modal */}
      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setTimeout(() => setEditProject(null), 200) // Clear after animation
        }}
        onEdit={handleEditProject}
        project={editProject}
      />
    </>
  )
}
