begin;

create or replace function public.list_staff_users()
returns table(
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
declare
  v_role text := public.current_staff_role();
begin
  if v_role is null or v_role not in ('super_admin','head_department') then
    raise exception 'administrative_permission_required';
  end if;

  return query
  select
    u.id,
    u.username::text,
    u.name::text,
    u.email::text,
    u.role::text,
    u.department::text,
    u.is_active,
    coalesce(u.permissions, '[]'::jsonb),
    u.created_at
  from public.users as u
  where u.is_active = true
    and (
      v_role = 'super_admin'
      or u.role::text in ('employee','supervisor')
      or u.id = auth.uid()
    )
  order by u.created_at asc nulls last, u.name asc;
end;
$$;

revoke all on function public.list_staff_users() from public, anon;
grant execute on function public.list_staff_users() to authenticated;

commit;

