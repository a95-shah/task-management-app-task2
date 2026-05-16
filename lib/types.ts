export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Project {
  id: string
  title: string
  description: string | null
  created_at: string
  created_by: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  created_at: string
}

// Used for optimistic UI — marks items that haven't been confirmed by server
export interface OptimisticProject extends Project {
  _optimistic?: boolean
}

export interface OptimisticTask extends Task {
  _optimistic?: boolean
}
