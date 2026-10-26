export interface Task { id: string; user_id: string; title: string; is_completed: boolean; created_at: string; updated_at: string }
export type Filter = 'all' | 'active' | 'completed'
