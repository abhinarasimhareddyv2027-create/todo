import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../types/task'
export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const upsertLocal = (t: Task) => setTasks(p => {
    const i = p.findIndex(x => x.id === t.id)
    if (i === -1) return [t, ...p]
    if (+new Date(p[i].updated_at) > +new Date(t.updated_at)) return p
    const n = [...p]; n[i] = t; return n
  })
  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    if (error) setError('Could not load tasks. Please try again.'); else { setTasks(data as Task[]); setError(null) }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
    const ch = supabase.channel(`tasks-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, p => {
        if (p.eventType === 'DELETE') setTasks(x => x.filter(t => t.id !== (p.old as Task).id))
        else upsertLocal(p.new as Task)
      }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [userId, load])
  const add = async (title: string) => {
    const { data, error } = await supabase.from('tasks').insert({ title: title.trim() }).select().single()
    if (error) { setError('Could not add task.'); return false }
    upsertLocal(data as Task); return true
  }
  const update = async (id: string, patch: Partial<Pick<Task, 'title' | 'is_completed'>>) => {
    const { data, error } = await supabase.from('tasks').update(patch).eq('id', id).select().single()
    if (error) setError('Could not update task.'); else upsertLocal(data as Task)
  }
  const remove = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) setError('Could not delete task.'); else setTasks(p => p.filter(t => t.id !== id))
  }
  const clearCompleted = async () => {
    const { error } = await supabase.from('tasks').delete().eq('is_completed', true)
    if (error) setError('Could not clear completed tasks.'); else setTasks(p => p.filter(t => !t.is_completed))
  }
  const deleteAll = async () => {
    const { error } = await supabase.from('tasks').delete().eq('user_id', userId)
    if (error) setError('Could not delete tasks.'); else setTasks([])
  }
  return { tasks, loading, error, setError, add, update, remove, clearCompleted, deleteAll }
}
