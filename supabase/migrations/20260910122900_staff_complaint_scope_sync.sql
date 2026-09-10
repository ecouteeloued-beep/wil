-- Staff can see new unassigned complaints; assigned complaints remain scoped.
drop policy if exists "Role scoped complaint read" on public.complaints;
create policy "Role scoped complaint read" on public.complaints
  for select to authenticated
  using (
    public.current_staff_role() in ('wali', 'chef_cabinet', 'super_admin')
    or (public.current_staff_role() in ('head_department', 'supervisor', 'employee') and assigned_department is null and assigned_user_id is null)
    or (public.current_staff_role() = 'head_department' and assigned_department = (select department from public.users where id = auth.uid()))
    or (public.current_staff_role() = 'supervisor' and (assigned_user_id = auth.uid() or assigned_department = (select department from public.users where id = auth.uid()) or (assigned_user_id is null and assigned_department is null)))
    or (public.current_staff_role() = 'employee' and assigned_user_id = auth.uid())
  );

drop policy if exists "Role scoped complaint update" on public.complaints;
create policy "Role scoped complaint update" on public.complaints
  for update to authenticated
  using (
    public.current_staff_role() in ('wali', 'chef_cabinet', 'super_admin')
    or (public.current_staff_role() = 'head_department' and assigned_department = (select department from public.users where id = auth.uid()))
    or (public.current_staff_role() = 'supervisor' and (assigned_user_id = auth.uid() or assigned_department = (select department from public.users where id = auth.uid()) or (assigned_user_id is null and assigned_department is null)))
    or (public.current_staff_role() = 'employee' and assigned_user_id = auth.uid())
  )
  with check (public.current_staff_role() in ('wali', 'chef_cabinet', 'super_admin', 'head_department', 'supervisor', 'employee'));
