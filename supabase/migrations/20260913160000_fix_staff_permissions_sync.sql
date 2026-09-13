begin;

drop function if exists public.get_my_staff_profile();
create function public.get_my_staff_profile()
returns table (id uuid, username text, name text, email text, role text, department text, phone text, is_active boolean, permissions jsonb)
language sql stable security definer set search_path = public as $$
  select u.id, u.username, u.name, u.email, u.role, u.department, u.phone, u.is_active, coalesce(u.permissions, '[]'::jsonb)
  from public.users u where u.id = auth.uid() and u.is_active = true limit 1;
$$;
revoke all on function public.get_my_staff_profile() from public, anon;
grant execute on function public.get_my_staff_profile() to authenticated;

create or replace function public.list_staff_users()
returns table (id uuid, username text, name text, email text, role text, department text, is_active boolean, permissions jsonb, created_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if public.current_staff_role() not in ('head_department','super_admin') then raise exception 'administrative_permission_required' using errcode = '42501'; end if;
  return query select u.id, u.username, u.name, u.email, u.role::text, u.department, u.is_active, coalesce(u.permissions, '[]'::jsonb), u.created_at from public.users u order by u.created_at asc nulls last, u.name asc;
end;
$$;
revoke all on function public.list_staff_users() from public, anon;
grant execute on function public.list_staff_users() to authenticated;

create or replace function public.admin_update_staff_account(p_user_id uuid, p_username text, p_name text, p_email text, p_phone text, p_department text, p_role text, p_is_active boolean)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if public.current_staff_role() not in ('head_department','super_admin') then raise exception 'administrative_permission_required'; end if;
  if p_role not in ('super_admin','head_department','supervisor','employee') then raise exception 'invalid_role'; end if;
  update public.users set username=nullif(trim(p_username),''), name=trim(p_name), email=lower(trim(p_email)), phone=nullif(trim(p_phone),''), department=nullif(trim(p_department),''), role=p_role, is_active=p_is_active where id=p_user_id;
  if not found then raise exception 'staff_profile_not_found'; end if;
  update auth.users set email=lower(trim(p_email)), raw_user_meta_data=coalesce(raw_user_meta_data,'{}'::jsonb)||jsonb_build_object('name',trim(p_name)) where id=p_user_id;
end;
$$;
revoke all on function public.admin_update_staff_account(uuid,text,text,text,text,text,text,boolean) from public, anon;
grant execute on function public.admin_update_staff_account(uuid,text,text,text,text,text,text,boolean) to authenticated;

create or replace function public.admin_update_staff_permissions(p_user_id uuid, p_permissions jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if public.current_staff_role() not in ('head_department','super_admin') then raise exception 'administrative_permission_required'; end if;
  update public.users set permissions=case when jsonb_typeof(p_permissions)='array' then p_permissions else '[]'::jsonb end where id=p_user_id;
  if not found then raise exception 'staff_profile_not_found'; end if;
end;
$$;
revoke all on function public.admin_update_staff_permissions(uuid,jsonb) from public, anon;
grant execute on function public.admin_update_staff_permissions(uuid,jsonb) to authenticated;

commit;
