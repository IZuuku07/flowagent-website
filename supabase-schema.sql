-- Run once in your own Supabase Free project's SQL editor.
-- No browser or anonymous access to website records, customer data or credentials.
create table if not exists public.flowagent_documents (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.flowagent_documents enable row level security;
revoke all on public.flowagent_documents from public, anon, authenticated;
grant select, insert, update on public.flowagent_documents to service_role;
