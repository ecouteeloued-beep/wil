begin;

create or replace function public.count_staff_complaints()
returns bigint
language sql
stable
security definer
set search_path = public, extensions
as $$
  select count(*)::bigint
  from public.complaints c
  where c.status = 'جديد'
    and public.is_active_staff() and (
      public.current_staff_role() in ('wali','chef_cabinet','super_admin','head_department')
      or (public.current_staff_role() = 'supervisor' and (c.assigned_user_id=auth.uid() or c.assigned_department=(select department from public.users where id=auth.uid()) or c.assigned_user_id is null))
      or (public.current_staff_role() = 'employee' and c.assigned_user_id=auth.uid())
    );
$$;
revoke all on function public.count_staff_complaints() from public, anon;
grant execute on function public.count_staff_complaints() to authenticated;

commit;
