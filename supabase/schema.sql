-- =========================================================================
-- خلية الإصغاء والتكفل بانشغالات المواطن — ولاية الوادي
-- Supabase PostgreSQL Production Schema, Realtime & RLS Policies
-- =========================================================================

-- 1. تفعيل الامتدادات الضرورية (UUID & تشفير البيانات)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. جدول المستخدمين والموظفين (Users & Staff)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  role text not null default 'agent' check (role in ('super_admin', 'admin', 'supervisor', 'department_head', 'agent', 'wali', 'employee')),
  department text,
  municipality text,
  phone text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. جدول الهيئات والمديريات الولائية (Departments)
create table if not exists public.departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. جدول بلديات ولاية الوادي الـ 22 (Municipalities)
create table if not exists public.municipalities (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  daira text not null,
  code text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. جدول العرائض والانشغالات المركزي (Complaints Table)
create table if not exists public.complaints (
  id uuid default uuid_generate_v4() primary key,
  tracking_id text unique not null,
  citizen_name text not null,
  national_id_encrypted text, -- رقم التعريف الوطني (NIN)
  phone_encrypted text,       -- رقم هاتف المواطن
  category text not null,     -- قطاع الانشغال (سكن، مياه، طرقات...)
  municipality text not null, -- بلدية الانشغال
  daira text default 'الوادي', -- دائرة الانشغال
  neighborhood text,          -- الحي أو التجمع السكاني
  subject text not null,      -- عنوان وموضوع العريضة
  description text not null,  -- الشرح والتفاصيل
  status text not null default 'جديد', -- (جديد، تم التوجيه، قيد المعالجة، بانتظار الرد، تم الحل، مغلق ومسوى)
  priority text not null default 'عادي', -- (عادي، متوسط، عاجل)
  assigned_department text,
  assigned_user_id uuid references public.users(id),
  deadline timestamp with time zone default (now() + interval '15 days'),
  pin_hash text, -- الرمز السري للبحث والمتابعة
  attachments jsonb default '[]'::jsonb, -- المرفقات والوثائق الرسمية المرفقة
  official_response jsonb,               -- الرد الإداري الرسمي
  timeline jsonb default '[]'::jsonb,    -- السجل الزمني للإجراءات
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. جدول الملاحظات الداخلية والتحقيقات الإدارية (Internal Notes)
create table if not exists public.internal_notes (
  id uuid default uuid_generate_v4() primary key,
  complaint_id uuid references public.complaints(id) on delete cascade not null,
  author_name text not null,
  author_role text,
  content text not null,
  is_confidential boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. جدول سجل التدقيق الرقمي (Audit Logs)
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id text,
  user_name text,
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. دالة ومحفّز التحديث التلقائي لتاريخ التعديل (Updated_At Trigger)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_complaints_updated_at on public.complaints;
create trigger set_complaints_updated_at
  before update on public.complaints
  for each row
  execute function public.handle_updated_at();

-- =========================================================================
-- إعدادات التزامن اللحظي (Supabase Realtime Publication)
-- =========================================================================
-- تمكين الاستماع المباشر لجدول العرائض في قنوات Realtime
alter table public.complaints replica identity full;

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table public.complaints;
  end if;
exception
  when others then null;
end $$;

-- =========================================================================
-- سياسات أمان البيانات على مستوى الصفوف (Row Level Security - RLS)
-- =========================================================================

alter table public.departments enable row level security;
alter table public.municipalities enable row level security;
alter table public.users enable row level security;
alter table public.complaints enable row level security;
alter table public.internal_notes enable row level security;
alter table public.audit_logs enable row level security;

-- 1. الدلائل المرجعية (القراءة عامة للجميع)
drop policy if exists "Allow public read on departments" on public.departments;
create policy "Allow public read on departments" on public.departments
  for select using (true);

drop policy if exists "Allow public read on municipalities" on public.municipalities;
create policy "Allow public read on municipalities" on public.municipalities
  for select using (true);

-- الموظف الموثق يقرأ ملفه فقط لإتمام تسجيل الدخول وتحديد الصلاحيات.
drop policy if exists "Allow staff to read own profile" on public.users;
create policy "Allow staff to read own profile" on public.users
  for select to authenticated
  using (id = auth.uid() and is_active = true);

-- 2. إرسال العرائض: الإدراج العام فقط، دون قراءة أو تعديل مباشر.
drop policy if exists "Allow citizens to submit new complaints" on public.complaints;
create policy "Allow citizens to submit new complaints" on public.complaints
  for insert to anon, authenticated
  with check (tracking_id is not null and citizen_name is not null and phone_encrypted is not null and subject is not null and category is not null);

-- حذف أسماء السياسات القديمة المتساهلة عند إعادة تطبيق المخطط.
drop policy if exists "Allow viewing complaints for tracking and dashboard" on public.complaints;
drop policy if exists "Allow updating complaints" on public.complaints;
drop policy if exists "Allow staff read/write internal notes" on public.internal_notes;
drop policy if exists "Allow insert audit logs" on public.audit_logs;
drop policy if exists "Allow read audit logs" on public.audit_logs;

-- الموظفون الموثقون فقط يمكنهم قراءة وتعديل الشكاوى.
drop policy if exists "Allow staff to read complaints" on public.complaints;
create policy "Allow staff to read complaints" on public.complaints
  for select to authenticated
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_active = true));

drop policy if exists "Allow staff to update complaints" on public.complaints;
create policy "Allow staff to update complaints" on public.complaints
  for update to authenticated
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_active = true))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_active = true));

-- تتبع المواطن يتم عبر دالة محدودة تعيد السجل المطابق للرقم والهاتف فقط.
create or replace function public.track_complaint(p_tracking_id text, p_phone text)
returns setof public.complaints
language sql
security definer
set search_path = public
as $$
  select c.* from public.complaints c
  where upper(c.tracking_id) = upper(trim(p_tracking_id))
    and c.phone_encrypted = trim(p_phone)
  limit 1;
$$;
revoke all on function public.track_complaint(text, text) from public;
grant execute on function public.track_complaint(text, text) to anon, authenticated;

-- البيانات الداخلية لا تكون مكشوفة للزوار.
drop policy if exists "Allow staff read/write internal notes" on public.internal_notes;
create policy "Allow staff read/write internal notes" on public.internal_notes
  for all to authenticated
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_active = true))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_active = true));

drop policy if exists "Allow insert audit logs" on public.audit_logs;
create policy "Allow staff to insert audit logs" on public.audit_logs
  for insert to authenticated
  with check (user_id = auth.uid()::text);

drop policy if exists "Allow read audit logs" on public.audit_logs;
create policy "Allow staff to read audit logs" on public.audit_logs
  for select to authenticated
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_active = true));

-- =========================================================================
-- بيانات أولية: بلديات ولاية الوادي الـ 22
-- =========================================================================
insert into public.municipalities (name, daira, code) values
  ('الوادي', 'الوادي', '3901'),
  ('البياضة', 'البياضة', '3902'),
  ('الرباح', 'الرباح', '3903'),
  ('قمار', 'قمار', '3904'),
  ('الرقيبة', 'الرقيبة', '3905'),
  ('المقرن', 'المقرن', '3906'),
  ('الدبيلة', 'الدبيلة', '3907'),
  ('حاسي خليفة', 'حاسي خليفة', '3908'),
  ('الطالب العربي', 'الطالب العربي', '3909'),
  ('أمية ونسه', 'أمية ونسه', '3910'),
  ('كوينين', 'الوادي', '3911'),
  ('العقلة', 'الرباح', '3912'),
  ('النخلة', 'الرباح', '3913'),
  ('تغزوت', 'قمار', '3914'),
  ('ورماس', 'قمار', '3915'),
  ('الحمراية', 'الرقيبة', '3916'),
  ('سيدي عون', 'المقرن', '3917'),
  ('حساني عبد الكريم', 'الدبيلة', '3918'),
  ('الطريفاوي', 'حاسي خليفة', '3919'),
  ('بن قشة', 'الطالب العربي', '3920'),
  ('دوار الماء', 'الطالب العربي', '3921'),
  ('وادي العلندة', 'أمية ونسه', '3922')
on conflict (name) do nothing;
