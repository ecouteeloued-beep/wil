begin;

create or replace function public.list_staff_users()
returns table(id uuid, username text, name text, email text, role text, department text, is_active boolean, permissions jsonb, created_at timestamptz)
language plpgsql security definer set search_path = public, extensions
as $$
declare v_actor public.users;
begin
  select * into v_actor from public.users where id=auth.uid() and is_active=true;
  if v_actor.id is null or v_actor.role not in ('super_admin','head_department') then raise exception 'administrative_permission_required'; end if;
  return query
    select u.id,u.username,u.name,u.email,u.role::text,u.department,u.is_active,coalesce(u.permissions,'[]'::jsonb),u.created_at
    from public.users u
    where u.is_active=true
      and (v_actor.role='super_admin' or u.role in ('employee','supervisor') or u.id=auth.uid())
    order by u.created_at asc nulls last,u.name asc;
end;
$$;

revoke all on function public.list_staff_users() from public, anon;
grant execute on function public.list_staff_users() to authenticated;

commit;

