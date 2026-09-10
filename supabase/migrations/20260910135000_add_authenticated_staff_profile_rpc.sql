-- Return only the authenticated user's active staff profile.
create or replace function public.get_my_staff_profile()
returns table (
  id uuid,
  username text,
  name text,
  email text,
  role text,
  department text,
  phone text,
  is_active boolean
)
language sql stable security definer set search_path = public
as $$
  select u.id, u.username, u.name, u.email, u.role, u.department, u.phone, u.is_active
  from public.users u
  where u.id = auth.uid() and u.is_active = true
  limit 1;
$$;
revoke all on function public.get_my_staff_profile() from public, anon;
grant execute on function public.get_my_staff_profile() to authenticated;
