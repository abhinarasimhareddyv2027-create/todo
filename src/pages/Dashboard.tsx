import { useMemo, useRef, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Plus, Trash2, Pencil, Check, X, Search, LogOut, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTasks } from '../hooks/useTasks'
import { counts, validateTitle, visibleTasks } from '../lib/tasks'
import type { Filter } from '../types/task'
const CODE = `const { data } = await supabase
  .from('tasks')
  .select('*')
  .order('created_at', { ascending: false })`
export default function Dashboard({ session }: { session: Session }) {
  const { tasks, loading, error, setError, add, update, remove, clearCompleted, deleteAll } = useTasks(session.user.id)
  const [title, setTitle] = useState(''); const [verr, setVerr] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all'); const [q, setQ] = useState('')
  const [editId, setEditId] = useState<string | null>(null); const [editVal, setEditVal] = useState('')
  const [busy, setBusy] = useState(false); const [ok, setOk] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const shown = useMemo(() => visibleTasks(tasks, filter, q), [tasks, filter, q])
  const c = counts(tasks)
  const flash = (m: string) => { setOk(m); setTimeout(() => setOk(null), 2500) }
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (busy) return
    const v = validateTitle(title); setVerr(v); if (v) return
    setBusy(true); if (await add(title)) { setTitle(''); flash('Task added.') }; setBusy(false); inputRef.current?.focus()
  }
  const saveEdit = async (id: string) => {
    const v = validateTitle(editVal); if (v) { setError(v); return }
    await update(id, { title: editVal.trim() }); setEditId(null); flash('Task updated.')
  }
  const onDeleteAll = async () => { if (tasks.length && window.confirm('Delete ALL tasks? This cannot be undone.')) { await deleteAll(); flash('All tasks deleted.') } }
  return (
    <div className="page">
      <header className="top"><div><h1><span className="navy">Project 03</span> <span className="blue">To-Do List App</span></h1>
        <p className="sub">A simple app to add, delete, complete, and save tasks.</p></div>
        <button className="btn ghost" onClick={() => supabase.auth.signOut()}><LogOut size={16} aria-hidden /> Sign out</button></header>
      <div className="main card">
        <aside className="info">
          <section className="mini"><h2>What You’ll Build</h2><p>A secure, realtime to-do app that saves your tasks online.</p></section>
          <section className="mini"><h2>Skills You’ll Practice</h2><p>React, TypeScript, Supabase, SQL, Row Level Security, deployment.</p></section>
          <section className="mini"><h2>Core Features</h2><p>Add, edit, complete, delete, filter, search and sync across devices.</p></section>
        </aside>
        <section className="tasks" aria-labelledby="mt">
          <h2 id="mt">My Tasks</h2>
          <form onSubmit={submit} className="row" noValidate>
            <input ref={inputRef} aria-label="New task" placeholder="Add a new task…" value={title} maxLength={220} onChange={e => { setTitle(e.target.value); setVerr(null) }} aria-invalid={!!verr} />
            <button className="btn" disabled={busy}><Plus size={16} aria-hidden /> Add Task</button>
          </form>
          {verr && <p role="alert" className="err">{verr}</p>}
          {error && <p role="alert" className="err">{error} <button className="link" onClick={() => setError(null)}>Dismiss</button></p>}
          {ok && <p role="status" className="ok">{ok}</p>}
          <div className="row"><div className="search"><Search size={16} aria-hidden /><input aria-label="Search tasks" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} /></div>
            <div role="group" aria-label="Filter tasks" className="seg">
              {(['all', 'active', 'completed'] as Filter[]).map(f => <button key={f} aria-pressed={filter === f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</button>)}</div></div>
          <p className="stats" aria-live="polite">{c.total} total · {c.active} active · {c.completed} completed</p>
          {loading ? <p role="status" className="empty">Loading tasks…</p> : shown.length === 0 ?
            <p className="empty">{tasks.length === 0 ? 'No tasks yet. Add your first one above!' : 'No tasks match your search or filter.'}</p> :
            <ul className="list">{shown.map(t => (
              <li key={t.id} className={t.is_completed ? 'done' : ''}>
                <input type="checkbox" aria-label={`Mark "${t.title}" ${t.is_completed ? 'incomplete' : 'complete'}`} checked={t.is_completed} onChange={() => update(t.id, { is_completed: !t.is_completed })} />
                {editId === t.id ? <input className="edit" autoFocus aria-label="Edit task" value={editVal} maxLength={220} onChange={e => setEditVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(t.id); if (e.key === 'Escape') setEditId(null) }} /> : <span>{t.title}</span>}
                {editId === t.id ? <>
                  <button className="icon" aria-label="Save" onClick={() => saveEdit(t.id)}><Check size={16} /></button>
                  <button className="icon" aria-label="Cancel" onClick={() => setEditId(null)}><X size={16} /></button></> : <>
                  <button className="icon" aria-label={`Edit "${t.title}"`} onClick={() => { setEditId(t.id); setEditVal(t.title) }}><Pencil size={16} /></button>
                  <button className="icon danger" aria-label={`Delete "${t.title}"`} onClick={() => remove(t.id)}><Trash2 size={16} /></button></>}
              </li>))}</ul>}
          <div className="row end"><button className="btn ghost" onClick={clearCompleted} disabled={!c.completed}>Clear completed</button>
            <button className="btn ghost danger" onClick={onDeleteAll} disabled={!c.total}>Delete all</button></div>
        </section>
      </div>
      <section className="code" aria-label="Code sample"><pre><code>{CODE}</code></pre><span className="badge"><CheckCircle2 size={14} aria-hidden /> Completed</span></section>
    </div>
  )
}
