-- ============================================================
-- الصلاحيات الحكومية الدقيقة — ولاية الوادي
-- ============================================================
-- النموذج المعتمد:
-- wali: وصول شامل وقراءة/توجيه/رد واعتماد.
-- super_admin: إدارة تقنية وأمن النظام فقط، دون تحكم في الشكاوى أو قرارات الولاية.
-- supervisor: رقابة ومعالجة وتوجيه ورفع/اعتماد الردود ضمن نطاق الخلية.
-- employee: الملفات المسندة إليه فقط، مع معالجة وإعداد رد دون اعتماد نهائي.
--
-- نفّذ هذا الملف بعد schema.sql من Supabase SQL Editor.
-- لا تعتمد على إخفاء الأزرار في الواجهة؛ RLS هو الحاجز الأمني الحقيقي.

begin;

-- دوال مساعدة آمنة لتجنب تكرار الاستعلامات وتجنب recursion في users policies.
create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.role
  from public.users u
  where u.id = auth.uid()
    and u.is_active = true
  limit 1;
$$;

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_active = true
  );
$$;

create or replace function public.can_access_complaint(p_complaint_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.complaints c
    join public.users u on u.id = auth.uid() and u.is_active = true
    where c.id = p_complaint_id
      and (
        u.role = 'wali'
        or (u.role = 'supervisor' and (
          c.assigned_user_id = u.id
          or c.assigned_department = u.department
          or c.assigned_user_id is null
        ))
        or (u.role in ('employee', 'head_department') and c.assigned_user_id = u.id)
      )
  );
$$;

grant execute on function public.current_staff_role() to anon, authenticated;
grant execute on function public.is_active_staff() to anon, authenticated;
grant execute on function public.can_access_complaint(uuid) to authenticated;

-- إزالة السياسات السابقة قبل إنشاء النسخة الدقيقة.
drop policy if exists "Allow staff to read own profile" on public.users;
drop policy if exists "Allow staff read users" on public.users;
drop policy if exists "Allow staff to manage users" on public.users;
drop policy if exists "Allow staff to read complaints" on public.complaints;
drop policy if exists "Allow staff to update complaints" on public.complaints;
drop policy if exists "Allow staff read/write internal notes" on public.internal_notes;
drop policy if exists "Allow staff to insert audit logs" on public.audit_logs;
drop policy if exists "Allow staff to read audit logs" on public.audit_logs;

-- حذف سياسات هذا الملف أيضاً لجعل التنفيذ متكرراً وآمناً.
drop policy if exists "Staff read own profile" on public.users;
drop policy if exists "Executives read all users" on public.users;
drop policy if exists "Wali manages users" on public.users;
drop policy if exists "Super admin manages technical user fields" on public.users;
drop policy if exists "Public submits complaints" on public.complaints;
drop policy if exists "Role scoped complaint read" on public.complaints;
drop policy if exists "Role scoped complaint update" on public.complaints;
drop policy if exists "Scoped internal notes read" on public.internal_notes;
drop policy if exists "Scoped internal notes insert" on public.internal_notes;
drop policy if exists "Scoped internal notes update" on public.internal_notes;
drop policy if exists "Staff insert own audit logs" on public.audit_logs;
drop policy if exists "Authorized audit log read" on public.audit_logs;

-- ملفات المستخدمين: كل موظف يرى ملفه؛ الوالي وsuper_admin يديران المستخدمين.
create policy "Staff read own profile" on public.users
  for select to authenticated
  using (id = auth.uid() and is_active = true);

create policy "Executives read all users" on public.users
  for select to authenticated
  using (public.current_staff_role() in ('wali', 'super_admin'));

create policy "Wali manages users" on public.users
  for all to authenticated
  using (public.current_staff_role() = 'wali')
  with check (public.current_staff_role() = 'wali');

create policy "Super admin manages technical user fields" on public.users
  for update to authenticated
  using (public.current_staff_role() = 'super_admin')
  with check (public.current_staff_role() = 'super_admin');

-- الشكاوى: الإدراج العام فقط، أما القراءة والتعديل فحسب الدور والنطاق.
create policy "Public submits complaints" on public.complaints
  for insert to anon, authenticated
  with check (
    tracking_id is not null
    and citizen_name is not null
    and phone_encrypted is not null
    and subject is not null
    and category is not null
  );

create policy "Role scoped complaint read" on public.complaints
  for select to authenticated
  using (
    public.current_staff_role() = 'wali'
    or (
      public.current_staff_role() = 'supervisor'
      and (assigned_user_id = auth.uid()
        or assigned_department = (select department from public.users where id = auth.uid())
        or assigned_user_id is null)
    )
    or (
      public.current_staff_role() in ('employee', 'head_department')
      and assigned_user_id = auth.uid()
    )
  );

create policy "Role scoped complaint update" on public.complaints
  for update to authenticated
  using (
    public.current_staff_role() = 'wali'
    or (public.current_staff_role() = 'supervisor' and (
      assigned_user_id = auth.uid()
      or assigned_department = (select department from public.users where id = auth.uid())
      or assigned_user_id is null
    ))
    or (public.current_staff_role() in ('employee', 'head_department') and assigned_user_id = auth.uid())
  )
  with check (public.current_staff_role() in ('wali', 'super_admin', 'supervisor', 'employee', 'head_department'));

-- حذف الشكاوى ممنوع على جميع الأدوار من أجل سلامة السجل الإداري.
drop policy if exists "Allow deleting complaints" on public.complaints;

-- الملاحظات الداخلية: لا تظهر إلا لمن يستطيع رؤية الشكوى نفسها.
create policy "Scoped internal notes read" on public.internal_notes
  for select to authenticated
  using (public.can_access_complaint(complaint_id));

create policy "Scoped internal notes insert" on public.internal_notes
  for insert to authenticated
  with check (public.can_access_complaint(complaint_id));

create policy "Scoped internal notes update" on public.internal_notes
  for update to authenticated
  using (public.can_access_complaint(complaint_id))
  with check (public.can_access_complaint(complaint_id));

-- سجل التدقيق: القراءة للوالي وsuper_admin والمشرف؛ الإضافة للموظفين الموثقين فقط.
create policy "Staff insert own audit logs" on public.audit_logs
  for insert to authenticated
  with check (user_id = auth.uid()::text and public.is_active_staff());

create policy "Authorized audit log read" on public.audit_logs
  for select to authenticated
  using (public.current_staff_role() in ('wali', 'super_admin', 'supervisor'));

commit;

-- تحقق من المستخدمين والصلاحيات بعد التنفيذ.
select id, name, email, role, department, is_active
from public.users
order by created_at desc
limit 100;
