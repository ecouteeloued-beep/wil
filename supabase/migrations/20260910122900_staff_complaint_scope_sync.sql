-- Staff complaint synchronization policy.
-- All authenticated staff roles can see and update cloud complaints so new submissions
-- and workflow changes remain synchronized across every dashboard.
drop policy if exists "Role scoped complaint read" on public.complaints;
create policy "Role scoped complaint read" on public.complaints
  for select to authenticated
  using (public.current_staff_role() in ('wali', 'chef_cabinet', 'super_admin', 'head_department', 'supervisor', 'employee'));

drop policy if exists "Role scoped complaint update" on public.complaints;
create policy "Role scoped complaint update" on public.complaints
  for update to authenticated
  using (public.current_staff_role() in ('wali', 'chef_cabinet', 'super_admin', 'head_department', 'supervisor', 'employee'))
  with check (public.current_staff_role() in ('wali', 'chef_cabinet', 'super_admin', 'head_department', 'supervisor', 'employee'));
