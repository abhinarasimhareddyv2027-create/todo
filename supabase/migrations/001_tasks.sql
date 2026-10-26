create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_user_created_idx on public.tasks (user_id, created_at desc);
alter table public.tasks enable row level security;
create policy "select own" on public.tasks for select to authenticated using (auth.uid() = user_id);
create policy "insert own" on public.tasks for insert to authenticated with check (auth.uid() = user_id);
create policy "update own" on public.tasks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.tasks for delete to authenticated using (auth.uid() = user_id);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger tasks_updated before update on public.tasks for each row execute function public.set_updated_at();
create or replace function public.limit_tasks() returns trigger language plpgsql as $$
begin if (select count(*) from public.tasks where user_id = new.user_id) >= 500 then
  raise exception 'Task limit reached'; end if; return new; end $$;
create trigger tasks_limit before insert on public.tasks for each row execute function public.limit_tasks();
alter table public.tasks replica identity full;
alter publication supabase_realtime add table public.tasks;
