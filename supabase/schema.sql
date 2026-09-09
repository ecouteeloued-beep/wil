-- =========================================================================
-- خلية الإصغاء لولاية الوادي - Supabase PostgreSQL Production Schema & RLS
-- =========================================================================

-- 1. Enable UUID and pgcrypto for secure hashing & encryption
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. ENUMS
create type user_role_enum as enum ('super_admin', 'admin', 'department_head', 'agent', 'wali');
create type complaint_status_enum as enum ('جديد', 'قيد المعالجة', 'مكتمل', 'مرفوض');
create type complaint_priority_enum as enum ('عادي', 'متوسط', 'عاجل');

-- 3. USERS TABLE (Linked with Supabase Auth)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  role user_role_enum not null default 'agent',
  department_id uuid,
  municipality_id uuid,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. DEPARTMENTS & MUNICIPALITIES
create table public.departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.municipalities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. COMPLAINTS TABLE (Encrypted sensitive PII)
create table public.complaints (
  id uuid default uuid_generate_v4() primary key,
  tracking_id text unique not null,
  citizen_name text not null,
  national_id_encrypted text not null, -- Encrypted at rest via PGP
  phone_encrypted text not null, -- Encrypted at rest via PGP
  category text not null,
  municipality text not null,
  subject text not null,
  description text not null,
  status complaint_status_enum default 'جديد' not null,
  priority complaint_priority_enum default 'عادي' not null,
  assigned_department_id uuid references public.departments(id),
  assigned_user_id uuid references public.users(id),
  deadline timestamp with time zone not null,
  pin_hash text not null, -- Server-side hashed tracking PIN
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. INTERNAL NOTES TABLE
create table public.internal_notes (
  id uuid default uuid_generate_v4() primary key,
  complaint_id uuid references public.complaints(id) on delete cascade not null,
  user_id uuid references public.users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. AUDIT LOGS TABLE
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. NOTIFICATIONS TABLE
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info',
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.departments enable row level security;
alter table public.municipalities enable row level security;
alter table public.users enable row level security;
alter table public.complaints enable row level security;
alter table public.internal_notes enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- Public Reference Data Policies
create policy "Allow public read on departments" on public.departments
  for select using (true);

create policy "Allow public read on municipalities" on public.municipalities
  for select using (true);

-- Users policies
create policy "Allow users to read own profile or admins read all" on public.users
  for select using (
    auth.uid() = id or 
    exists (select 1 from public.users where id = auth.uid() and role in ('super_admin', 'admin', 'wali'))
  );

-- Complaints policies
-- 1. Citizen & Public Complaint Submission
create policy "Allow citizens to submit new complaints" on public.complaints
  for insert to anon, authenticated
  with check (tracking_id is not null and subject is not null and category is not null);

-- 2. Staff, Admins and Tracking Queries
create policy "Allow viewing complaints for tracking and dashboard" on public.complaints
  for select to anon, authenticated
  using (true);

-- 3. Updating Complaints
create policy "Allow updating complaints" on public.complaints
  for update to anon, authenticated
  using (true);

-- Internal Notes (Staff only)
create policy "Staff can read and write internal notes" on public.internal_notes
  for all using (
    exists (select 1 from public.users where id = auth.uid())
  );

-- Audit logs policies (Super Admin and Wali only)
create policy "Only Super Admin and Wali can view audit logs" on public.audit_logs
  for select using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role in ('super_admin', 'wali')
    )
  );

-- Secure RPC Function for Citizen Status Tracking (Masks sensitive internal fields)
create or replace function public.track_complaint(
  p_tracking_id text,
  p_phone text
)
returns table (
  tracking_id text,
  category text,
  municipality text,
  subject text,
  status complaint_status_enum,
  priority complaint_priority_enum,
  created_at timestamp with time zone,
  deadline timestamp with time zone
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    c.tracking_id,
    c.category,
    c.municipality,
    c.subject,
    c.status,
    c.priority,
    c.created_at,
    c.deadline
  from public.complaints c
  where upper(trim(c.tracking_id)) = upper(trim(p_tracking_id))
    and (c.phone_encrypted = p_phone or p_phone is null);
end;
$$;

