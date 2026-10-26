import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
type Mode = 'signin' | 'signup' | 'reset'
export default function Auth() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (busy) return; setBusy(true); setMsg(null)
    const redirect = window.location.origin
    const r = mode === 'signin' ? await supabase.auth.signInWithPassword({ email, password })
      : mode === 'signup' ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirect } })
      : await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirect })
    if (r.error) setMsg({ ok: false, text: r.error.message })
    else if (mode === 'signup') setMsg({ ok: true, text: 'Check your email to verify your account.' })
    else if (mode === 'reset') setMsg({ ok: true, text: 'Password reset email sent.' })
    setBusy(false)
  }
  return (
    <main className="auth card">
      <h1><span className="navy">Project 03</span><br /><span className="blue">To-Do List App</span></h1>
      <form onSubmit={submit} aria-label={mode}>
        <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
        {mode !== 'reset' && <label>Password<input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} /></label>}
        <button className="btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</button>
        {msg && <p role={msg.ok ? 'status' : 'alert'} className={msg.ok ? 'ok' : 'err'}>{msg.text}</p>}
      </form>
      <p className="links">
        {mode !== 'signin' && <button className="link" onClick={() => setMode('signin')}>Sign in</button>}
        {mode !== 'signup' && <button className="link" onClick={() => setMode('signup')}>Sign up</button>}
        {mode !== 'reset' && <button className="link" onClick={() => setMode('reset')}>Forgot password?</button>}
      </p>
    </main>
  )
}
