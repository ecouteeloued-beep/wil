begin;

create or replace function public.list_staff_users()
returns table (
  id uuid,
  username text,
  name text,
  email text,
  role text,
  department text,
  is_active boolean,
  permissions jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if public.current_staff_role() not in ('wali', 'super_admin') then
    raise exception 'administrative_permission_required' using errcode = '42501';
  end if;

  return query
  select u.id, u.username, u.name, u.email, u.role::text, u.department,
         u.is_active, coalesce(u.permissions, '[]'::jsonb), u.created_at
  from public.users u
  order by u.created_at asc nulls last, u.name asc;
end;
$$;

revoke all on function public.list_staff_users() from public, anon;
grant execute on function public.list_staff_users() to authenticated;

commit;
