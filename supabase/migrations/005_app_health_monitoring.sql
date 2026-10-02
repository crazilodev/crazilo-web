-- ==============================================================================
-- 005_app_health_monitoring.sql
-- Ekodrix Application Health Monitoring Schema
-- ==============================================================================

-- 1. Create app_health table
create table if not exists public.app_health (
  id integer primary key,
  created_at timestamptz not null default now()
);

-- 2. Insert default health row
insert into public.app_health (id)
values (1)
on conflict (id) do nothing;

-- 3. Enable Row Level Security (RLS)
alter table public.app_health enable row level security;

-- 4. Policies for RLS (Read-only for health checks)
drop policy if exists "Allow health check read" on public.app_health;

create policy "Allow health check read"
on public.app_health
for select
to anon, authenticated
using (true);
