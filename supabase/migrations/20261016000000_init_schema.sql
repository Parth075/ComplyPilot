-- ====================================================================
-- ComplyPilot Production Database Schema & Row-Level Security (RLS)
-- Source of Truth: ComplyPilot-Project-Docs.md (PRD / TRD / Backend Schema)
-- ====================================================================

-- 1. Enable required PostgreSQL extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- 2. User Roles Enum Type
do $$ begin
  create type user_role as enum ('employee', 'manager', 'hr_admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type task_status as enum ('not_started', 'in_progress', 'pending_review', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type document_status as enum ('uploaded', 'pending_review', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type compliance_cadence as enum ('one_time', 'annual', 'quarterly');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type compliance_status as enum ('pending', 'completed', 'overdue');
exception
  when duplicate_object then null;
end $$;

-- ====================================================================
-- 3. Table Definitions
-- ====================================================================

-- 3.1 PROFILES TABLE (Linked 1:1 to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'employee',
  department text not null default 'General',
  manager_id uuid references public.profiles(id) on delete set null,
  start_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Helper function to inspect current user role
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 3.2 ONBOARDING TEMPLATES TABLE
create table if not exists public.onboarding_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_target text not null default 'All teams',
  status text not null default 'Active' check (status in ('Active', 'Draft')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3.3 TEMPLATE TASKS TABLE
create table if not exists public.template_tasks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.onboarding_templates(id) on delete cascade,
  title text not null,
  category text not null default 'Getting started',
  description text default '',
  due_offset_days int not null default 0,
  due_window text not null default 'Day 1',
  owner_role text not null default 'Employee',
  required boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3.4 EMPLOYEE TASKS TABLE
-- Allows HR to edit due dates and add ad-hoc tasks as required in project docs
create table if not exists public.employee_tasks (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  template_task_id uuid references public.template_tasks(id) on delete set null,
  title text not null,
  category text not null default 'Getting started',
  description text default '',
  status task_status not null default 'not_started',
  due_date text not null default 'Day 1',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3.5 DOCUMENTS TABLE
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  employee_task_id uuid references public.employee_tasks(id) on delete set null,
  name text not null,
  type text not null default 'PDF Document',
  storage_path text not null,
  status document_status not null default 'uploaded',
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id) on delete set null
);

-- 3.6 POLICIES TABLE
create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  section text not null default 'General',
  body text not null default '',
  storage_path text,
  version int not null default 1,
  status text not null default 'Published' check (status in ('Published', 'Draft')),
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

-- 3.7 POLICY CHUNKS TABLE (pgvector for RAG similarity search)
create table if not exists public.policy_chunks (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  section_ref text not null,
  created_at timestamptz not null default now()
);

-- 3.8 COMPLIANCE REQUIREMENTS TABLE
create table if not exists public.compliance_requirements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  group_name text not null default 'Policy acknowledgement',
  applies_to_role text,
  cadence compliance_cadence not null default 'one_time',
  due_window text not null default 'Within 5 days',
  policy_id uuid references public.policies(id) on delete set null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3.9 COMPLIANCE RECORDS TABLE
create table if not exists public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  requirement_id uuid not null references public.compliance_requirements(id) on delete cascade,
  status compliance_status not null default 'pending',
  due_date text not null default 'Within 5 days',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3.10 AUDIT LOG TABLE
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ====================================================================
-- 4. Vector Similarity Search Function for RAG
-- ====================================================================
create or replace function public.match_policy_chunks(
  query_embedding vector(1536),
  match_threshold float default 0.65,
  match_count int default 4
)
returns table (
  id uuid,
  policy_id uuid,
  content text,
  section_ref text,
  similarity float
)
language plpgsql
stable
security definer
as $$
begin
  return query
  select
    pc.id,
    pc.policy_id,
    pc.content,
    pc.section_ref,
    1 - (pc.embedding <=> query_embedding) as similarity
  from public.policy_chunks pc
  inner join public.policies p on p.id = pc.policy_id
  where p.status = 'Published'
    and (1 - (pc.embedding <=> query_embedding)) > match_threshold
  order by pc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ====================================================================
-- 5. Row-Level Security (RLS) Policies
-- Source: Section 4 "Row-level access rules"
-- ====================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.onboarding_templates enable row level security;
alter table public.template_tasks enable row level security;
alter table public.employee_tasks enable row level security;
alter table public.documents enable row level security;
alter table public.policies enable row level security;
alter table public.policy_chunks enable row level security;
alter table public.compliance_requirements enable row level security;
alter table public.compliance_records enable row level security;
alter table public.audit_log enable row level security;

-- 5.1 PROFILES POLICIES
-- Employee: read own row only
-- Manager: read own row + direct reports
-- HR Admin: read/update all
create policy "profiles_select_policy" on public.profiles
for select using (
  auth.uid() = id
  or public.current_user_role() = 'hr_admin'
  or (public.current_user_role() = 'manager' and manager_id = auth.uid())
);

create policy "profiles_update_policy" on public.profiles
for update using (
  auth.uid() = id
  or public.current_user_role() = 'hr_admin'
);

create policy "profiles_insert_policy" on public.profiles
for insert with check (true);

-- 5.2 ONBOARDING TEMPLATES & TEMPLATE TASKS POLICIES
-- Employee & Manager: no access
-- HR Admin: read/write all
create policy "templates_admin_all" on public.onboarding_templates
for all using (
  public.current_user_role() = 'hr_admin'
);

create policy "template_tasks_admin_all" on public.template_tasks
for all using (
  public.current_user_role() = 'hr_admin'
);

-- 5.3 EMPLOYEE TASKS POLICIES
-- Employee: read own / update own
-- Manager: read direct reports' tasks
-- HR Admin: read/write all (including due date edits and ad-hoc task creation)
create policy "employee_tasks_select" on public.employee_tasks
for select using (
  employee_id = auth.uid()
  or public.current_user_role() = 'hr_admin'
  or (public.current_user_role() = 'manager' and exists (
    select 1 from public.profiles where id = employee_tasks.employee_id and manager_id = auth.uid()
  ))
);

create policy "employee_tasks_update" on public.employee_tasks
for update using (
  employee_id = auth.uid()
  or public.current_user_role() = 'hr_admin'
);

create policy "employee_tasks_insert" on public.employee_tasks
for insert with check (
  public.current_user_role() = 'hr_admin'
  or employee_id = auth.uid()
);

create policy "employee_tasks_delete" on public.employee_tasks
for delete using (
  public.current_user_role() = 'hr_admin'
);

-- 5.4 DOCUMENTS POLICIES
-- Employee: insert/read own
-- Manager: read direct reports' documents
-- HR Admin: read/write all (review/approve/reject)
create policy "documents_select" on public.documents
for select using (
  employee_id = auth.uid()
  or public.current_user_role() = 'hr_admin'
  or (public.current_user_role() = 'manager' and exists (
    select 1 from public.profiles where id = documents.employee_id and manager_id = auth.uid()
  ))
);

create policy "documents_insert" on public.documents
for insert with check (
  employee_id = auth.uid()
  or public.current_user_role() = 'hr_admin'
);

create policy "documents_update" on public.documents
for update using (
  public.current_user_role() = 'hr_admin'
);

-- 5.5 POLICIES & POLICY CHUNKS POLICIES
-- Authenticated users: read all (required for Policy Q&A / RAG)
-- HR Admin: read/write all
create policy "policies_select" on public.policies
for select using (
  auth.role() = 'authenticated'
);

create policy "policies_admin_write" on public.policies
for all using (
  public.current_user_role() = 'hr_admin'
);

create policy "policy_chunks_select" on public.policy_chunks
for select using (
  auth.role() = 'authenticated'
);

create policy "policy_chunks_admin_write" on public.policy_chunks
for all using (
  public.current_user_role() = 'hr_admin'
);

-- 5.6 COMPLIANCE REQUIREMENTS POLICIES
create policy "compliance_req_select" on public.compliance_requirements
for select using (
  auth.role() = 'authenticated'
);

create policy "compliance_req_admin_write" on public.compliance_requirements
for all using (
  public.current_user_role() = 'hr_admin'
);

-- 5.7 COMPLIANCE RECORDS POLICIES
-- Employee: read own
-- Manager: read direct reports'
-- HR Admin: read/write all
create policy "compliance_records_select" on public.compliance_records
for select using (
  employee_id = auth.uid()
  or public.current_user_role() = 'hr_admin'
  or (public.current_user_role() = 'manager' and exists (
    select 1 from public.profiles where id = compliance_records.employee_id and manager_id = auth.uid()
  ))
);

create policy "compliance_records_admin_write" on public.compliance_records
for all using (
  public.current_user_role() = 'hr_admin'
);

-- 5.8 AUDIT LOG POLICIES
-- Employee & Manager: no access
-- HR Admin: read all; insert allowed for authenticated HR operations & system triggers
create policy "audit_log_select" on public.audit_log
for select using (
  public.current_user_role() = 'hr_admin'
);

create policy "audit_log_insert" on public.audit_log
for insert with check (
  auth.role() = 'authenticated'
);

-- ====================================================================
-- 6. New User Trigger on auth.users
-- ====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role user_role := 'employee';
  user_full_name text := '';
  user_dept text := 'General';
begin
  -- Inspect user metadata if passed during signup/invitation
  if new.raw_user_meta_data->>'role' in ('employee', 'manager', 'hr_admin') then
    assigned_role := (new.raw_user_meta_data->>'role')::user_role;
  end if;

  user_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(new.email, '@', 1)
  );

  if new.raw_user_meta_data->>'department' is not null then
    user_dept := new.raw_user_meta_data->>'department';
  end if;

  insert into public.profiles (id, full_name, role, department, start_date)
  values (new.id, user_full_name, assigned_role, user_dept, current_date)
  on conflict (id) do update
  set full_name = excluded.full_name,
      department = excluded.department;

  return new;
exception
  when others then
    -- Log warning to Postgres logs instead of failing signup
    raise warning 'handle_new_user exception: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ====================================================================
-- 7. Storage Bucket Setup (documents & policies)
-- ====================================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('policies', 'policies', false)
on conflict (id) do nothing;

-- Storage RLS: documents bucket
create policy "documents_storage_employee_read_own" on storage.objects
for select using (
  bucket_id = 'documents' and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.current_user_role() = 'hr_admin'
  )
);

create policy "documents_storage_employee_insert_own" on storage.objects
for insert with check (
  bucket_id = 'documents' and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.current_user_role() = 'hr_admin'
  )
);

-- Storage RLS: policies bucket
create policy "policies_storage_authenticated_read" on storage.objects
for select using (
  bucket_id = 'policies' and auth.role() = 'authenticated'
);

create policy "policies_storage_admin_write" on storage.objects
for all using (
  bucket_id = 'policies' and public.current_user_role() = 'hr_admin'
);
