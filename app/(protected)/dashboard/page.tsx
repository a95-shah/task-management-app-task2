import { createClient } from '@/lib/supabase/server'
import type { Project } from '@/lib/types'
import ProjectList from '@/components/ProjectList'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('created_by', user!.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Failed to load projects</p>
          <p className="text-gray-500 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <p className="text-gray-400 mt-1">Manage your projects and tasks</p>
      </div>

      <ProjectList
        initialProjects={(projects as Project[]) ?? []}
        userId={user!.id}
      />
    </div>
  )
}
