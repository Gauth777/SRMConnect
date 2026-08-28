begin;

-- SRM Connect core application schema.
-- Supabase Auth remains the identity provider; public.profiles references auth.users.

create type public.user_role as enum ('STUDENT', 'FACULTY', 'ADMIN');
create type public.user_status as enum ('ACTIVE', 'INACTIVE', 'BLOCKED');
create type public.verification_status as enum ('PENDING', 'VERIFIED', 'REJECTED');
create type public.faculty_advisor_role as enum ('FA', 'AA', 'BOTH', 'NEITHER');
create type public.project_post_type as enum ('PROJECT', 'HACKATHON', 'RESEARCH', 'INHOUSE', 'GUEST_LECTURE', 'WORKSHOP');
create type public.project_mode as enum ('ONLINE', 'OFFLINE', 'HYBRID');
create type public.skill_level as enum ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ANY_LEVEL');
create type public.project_status as enum ('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED');
create type public.application_status as enum ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null,
  status public.user_status not null default 'ACTIVE',
  phone_number text,
  bio text,
  avatar_url text,
  profile_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  registration_no text not null unique,
  dob date,
  gender text,
  department text,
  program text,
  specialization text,
  current_year integer check (current_year is null or current_year between 1 and 6),
  cgpa double precision check (cgpa is null or (cgpa >= 0 and cgpa <= 10)),
  batch text,
  skills jsonb not null default '[]'::jsonb check (jsonb_typeof(skills) = 'array'),
  interests text[] not null default '{}',
  project_types text[] not null default '{}',
  preferred_roles text[] not null default '{}',
  career_goal text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  resume_url text,
  other_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_registration_no_format check (registration_no ~ '^RA[0-9]{13}$')
);

create table public.faculty (
  id uuid primary key references public.profiles(id) on delete cascade,
  employee_id text not null unique,
  designation text,
  advisor_role public.faculty_advisor_role,
  experience_years integer check (experience_years is null or experience_years >= 0),
  campus text,
  department text,
  domains text[] not null default '{}',
  current_subjects text[] not null default '{}',
  previous_subjects text[] not null default '{}',
  skills text[] not null default '{}',
  verification_status public.verification_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint faculty_employee_id_format check (employee_id ~ '^[A-Za-z0-9]{4,20}$')
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  post_type public.project_post_type not null,
  title varchar(100) not null,
  domain text not null,
  description varchar(500) not null,
  mode public.project_mode not null,
  skills text[] not null default '{}',
  skill_level public.skill_level not null,
  slots integer not null check (slots between 1 and 20),
  duration text not null,
  deadline date not null,
  additional_requirements text,
  required_docs text[] not null default array['resume']::text[],
  status public.project_status not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_description_length check (char_length(description) between 50 and 500)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.application_status not null default 'PENDING',
  cover_letter text,
  github_url text,
  portfolio_url text,
  document_urls jsonb not null default '{}'::jsonb check (jsonb_typeof(document_urls) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, student_id)
);

create index projects_faculty_id_idx on public.projects(faculty_id);
create index projects_status_deadline_idx on public.projects(status, deadline);
create index applications_project_status_idx on public.applications(project_id, status);
create index applications_student_status_idx on public.applications(student_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger students_set_updated_at
before update on public.students
for each row execute function public.set_updated_at();

create trigger faculty_set_updated_at
before update on public.faculty
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

-- Core application tables are server-owned. The browser authenticates with
-- Supabase Auth, then calls NestJS; it does not CRUD these tables directly.
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.faculty enable row level security;
alter table public.projects enable row level security;
alter table public.applications enable row level security;

revoke all on table public.profiles, public.students, public.faculty, public.projects, public.applications from anon, authenticated;
grant all on table public.profiles, public.students, public.faculty, public.projects, public.applications to service_role;

grant usage on type public.user_role, public.user_status, public.verification_status,
  public.faculty_advisor_role, public.project_post_type, public.project_mode,
  public.skill_level, public.project_status, public.application_status to service_role;

commit;
