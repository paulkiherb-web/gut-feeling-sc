create table if not exists public.intensive_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  course text not null,
  effort text not null,
  title text not null,
  duration_days integer not null default 14,
  status text not null default 'active',
  payload jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_id)
);

create table if not exists public.intensive_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  correction_id text not null,
  plan_id text,
  effort text not null,
  title text not null,
  description text,
  scheduled_for timestamptz,
  status text not null default 'suggested',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, correction_id)
);

alter table public.intensive_plans enable row level security;
alter table public.intensive_corrections enable row level security;

drop policy if exists "Users manage own intensive_plans" on public.intensive_plans;
create policy "Users manage own intensive_plans"
on public.intensive_plans
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own intensive_corrections" on public.intensive_corrections;
create policy "Users manage own intensive_corrections"
on public.intensive_corrections
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
