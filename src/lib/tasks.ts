import type { Task, Filter } from '../types/task'
export function validateTitle(t: string): string | null {
  const v = t.trim()
  if (!v) return 'Please enter a task.'
  if (v.length > 200) return 'Task must be 200 characters or fewer.'
  return null
}
export function visibleTasks(tasks: Task[], filter: Filter, q: string): Task[] {
  const s = q.trim().toLowerCase()
  return tasks
    .filter(t => filter === 'all' || (filter === 'active' ? !t.is_completed : t.is_completed))
    .filter(t => !s || t.title.toLowerCase().includes(s))
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
}
export const counts = (tasks: Task[]) => {
  const completed = tasks.filter(t => t.is_completed).length
  return { total: tasks.length, completed, active: tasks.length - completed }
}
