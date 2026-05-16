'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus, OptimisticTask } from '@/lib/types'
import TaskCard from './TaskCard'
import CreateTaskForm from './CreateTaskForm'
import { useToast } from './ui/Toast'

interface TaskBoardProps {
  projectId: string
  initialTasks: Task[]
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'Todo', color: 'border-gray-500/50' },
  { status: 'in_progress', label: 'In Progress', color: 'border-yellow-500/50' },
  { status: 'done', label: 'Done', color: 'border-green-500/50' },
]

export default function TaskBoard({ projectId, initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = useState<OptimisticTask[]>(initialTasks)
  const supabase = createClient()
  const { showToast } = useToast()

  // Track pending optimistic IDs so the realtime handler can find them
  // Maps optimisticId -> { title, status } for matching incoming realtime events
  const pendingOptimisticRef = useRef<Map<string, { title: string; status: TaskStatus }>>(new Map())

  // Subscribe to realtime changes on tasks table for this project
  useEffect(() => {
    const channel = supabase
      .channel(`tasks-realtime-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task
            setTasks((prev) => {
              // Case 1: We already have this exact task by real ID (insert response beat us)
              if (prev.some((t) => t.id === newTask.id)) {
                return prev.map((t) =>
                  t.id === newTask.id ? { ...newTask, _optimistic: false } : t
                )
              }

              // Case 2: Find a matching optimistic item to replace
              // Check pending optimistic map for a match by title + status
              let matchedOptimisticId: string | null = null
              for (const [optId, meta] of pendingOptimisticRef.current.entries()) {
                if (meta.title === newTask.title && meta.status === newTask.status) {
                  matchedOptimisticId = optId
                  break
                }
              }

              if (matchedOptimisticId) {
                // Clean up the pending tracker
                pendingOptimisticRef.current.delete(matchedOptimisticId)
                // Replace the optimistic item with the real one
                return prev.map((t) =>
                  t.id === matchedOptimisticId ? { ...newTask, _optimistic: false } : t
                )
              }

              // Case 3: Entirely new task (e.g., from another user/tab)
              return [...prev, newTask]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Task
            setTasks((prev) =>
              prev.map((t) => (t.id === updated.id ? { ...updated, _optimistic: false } : t))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id as string
            setTasks((prev) => prev.filter((t) => t.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, projectId])

  // Optimistic create task
  const handleCreateTask = useCallback(
    async (title: string, description: string, status: TaskStatus) => {
      const optimisticId = crypto.randomUUID()
      const optimisticTask: OptimisticTask = {
        id: optimisticId,
        project_id: projectId,
        title,
        description: description || null,
        status,
        created_at: new Date().toISOString(),
        _optimistic: true,
      }

      // Register in the pending tracker so realtime handler can find it
      pendingOptimisticRef.current.set(optimisticId, { title, status })

      setTasks((prev) => [...prev, optimisticTask])

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title,
          description: description || null,
          status,
        })
        .select()
        .single()

      if (error) {
        // Clean up pending tracker and rollback
        pendingOptimisticRef.current.delete(optimisticId)
        setTasks((prev) => prev.filter((t) => t.id !== optimisticId))
        showToast(error.message, 'error')
        return
      }

      // Clean up pending tracker
      pendingOptimisticRef.current.delete(optimisticId)

      setTasks((prev) => {
        // If realtime already replaced the optimistic item, we might have the real ID already
        const hasRealItem = prev.some((t) => t.id === data.id)
        const hasOptimistic = prev.some((t) => t.id === optimisticId)

        if (hasRealItem && !hasOptimistic) {
          // Realtime already handled it — just ensure it's not marked optimistic
          return prev.map((t) =>
            t.id === data.id ? { ...data, _optimistic: false } : t
          )
        }

        if (hasOptimistic) {
          // Normal case: replace the optimistic item with real data
          return prev.map((t) =>
            t.id === optimisticId ? { ...data, _optimistic: false } : t
          )
        }

        // Fallback: shouldn't happen, but add the real item just in case
        return [...prev, { ...data, _optimistic: false }]
      })
      showToast('Task created!', 'success')
    },
    [supabase, projectId, showToast]
  )

  // Optimistic update task status
  const handleUpdateStatus = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      const previousTasks = tasks

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      )

      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) {
        setTasks(previousTasks)
        showToast(error.message, 'error')
      }
    },
    [supabase, tasks, showToast]
  )

  // Optimistic delete task
  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      const previousTasks = tasks

      setTasks((prev) => prev.filter((t) => t.id !== taskId))

      const { error } = await supabase.from('tasks').delete().eq('id', taskId)

      if (error) {
        setTasks(previousTasks)
        showToast(error.message, 'error')
      } else {
        showToast('Task deleted', 'success')
      }
    },
    [supabase, tasks, showToast]
  )

  // Deduplicate tasks by ID to prevent React key warnings in edge cases
  const deduplicatedTasks = Array.from(
    new Map(tasks.map((t) => [t.id, t])).values()
  )

  return (
    <div>
      {/* Create task form */}
      <CreateTaskForm onCreateTask={handleCreateTask} />

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {COLUMNS.map((column) => {
          const columnTasks = deduplicatedTasks.filter((t) => t.status === column.status)

          return (
            <div
              key={column.status}
              className={`bg-gray-900/50 border-t-2 ${column.color} rounded-xl p-4`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  {column.label}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[120px]">
                {columnTasks.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-gray-600 text-sm">
                    No tasks
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdateStatus={handleUpdateStatus}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
