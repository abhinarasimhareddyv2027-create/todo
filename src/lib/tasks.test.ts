import { describe, it, expect } from 'vitest'
import { validateTitle, visibleTasks, counts } from './tasks'
import type { Task } from '../types/task'
const mk = (id: string, title: string, done: boolean, d: string): Task =>
  ({ id, user_id: 'u', title, is_completed: done, created_at: d, updated_at: d })
const data = [mk('1', 'Buy milk', false, '2026-01-01'), mk('2', 'Write code', true, '2026-01-02'), mk('3', 'Buy bread', true, '2026-01-03')]
describe('tasks', () => {
  it('validates titles', () => { expect(validateTitle('  ')).toBeTruthy(); expect(validateTitle('a'.repeat(201))).toBeTruthy(); expect(validateTitle('ok')).toBeNull() })
  it('filters', () => { expect(visibleTasks(data, 'active', '').length).toBe(1); expect(visibleTasks(data, 'completed', '').length).toBe(2) })
  it('searches combined with filter', () => { expect(visibleTasks(data, 'completed', 'buy').map(t => t.id)).toEqual(['3']) })
  it('sorts newest first', () => { expect(visibleTasks(data, 'all', '')[0].id).toBe('3') })
  it('counts', () => { expect(counts(data)).toEqual({ total: 3, completed: 2, active: 1 }) })
})
