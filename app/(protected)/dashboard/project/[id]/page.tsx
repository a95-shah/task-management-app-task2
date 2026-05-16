import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Project, Task } from '@/lib/types'
import TaskBoard from '@/components/TaskBoard'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('created_by', user.id)
    .single()

  if (projectError || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 text-lg mb-4">Project not found</p>
        <Link
          href="/dashboard"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  // Fetch tasks for this project
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-white">{(project as Project).title}</h1>
        {(project as Project).description && (
          <p className="text-gray-400 mt-2">{(project as Project).description}</p>
        )}
      </div>

      {/* Task Board */}
      {tasksError ? (
        <div className="text-center py-10">
          <p className="text-red-400">Failed to load tasks: {tasksError.message}</p>
        </div>
      ) : (
        <TaskBoard
          projectId={id}
          initialTasks={(tasks as Task[]) ?? []}
        />
      )}
    </div>
  )
}
