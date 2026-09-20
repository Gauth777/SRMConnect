create table if not exists public.saved_projects (
  student_id uuid not null references public.students(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, project_id)
);

create index if not exists saved_projects_project_id_idx
  on public.saved_projects(project_id);

alter table public.saved_projects enable row level security;

revoke all on table public.saved_projects from anon, authenticated;
grant all on table public.saved_projects to service_role;
