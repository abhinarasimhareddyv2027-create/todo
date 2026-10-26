# To-Do List App (React + TypeScript + Supabase)
## Local setup
1. `npm install`; copy `.env.example` to `.env.local` and fill in your Supabase URL + publishable (anon) key. **Never** use the service-role key in the frontend.
2. `npm run dev` · `npm test` · `npm run build`
## Supabase
1. Create a project at supabase.com.
2. SQL Editor → run `supabase/migrations/001_tasks.sql` (table, RLS, triggers, Realtime publication).
3. Authentication → URL Configuration: set Site URL to your Vercel URL; add `http://localhost:5173` and the Vercel URL to Redirect URLs. Keep "Confirm email" on.
4. Database → Replication: confirm `tasks` is in `supabase_realtime`.
## GitHub & Vercel
`git init && git add . && git commit -m "init" && git branch -M main`, create a GitHub repo, `git remote add origin <url> && git push -u origin main`.
In Vercel: Add New → Project → import the repo (Vite preset auto-detected) → add env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` → Deploy.
## Verify after deploy
Sign up + verify email; add/edit/complete/delete tasks; reload (persistence); open two browsers signed in to the same account (realtime); sign in as a second user and confirm you cannot see the first user's tasks; test on mobile.
## Production checklist
RLS on · no secret keys in repo · redirect URLs set · email confirmation on · build passes · tests pass.
