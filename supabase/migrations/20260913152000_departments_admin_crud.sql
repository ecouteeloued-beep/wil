begin;

alter table public.departments add column if not exists is_active boolean not null default true;

create or replace function public.list_staff_departments()
returns table (id uuid, name text, code text, is_active boolean, users_count bigint, active_files bigint)
language sql stable security definer set search_path = public as $$
  select d.id, d.name, d.code, d.is_active,
    (select count(*) from public.users u where u.department = d.name and u.is_active)::bigint,
    (select count(*) from public.complaints c where c.assigned_department = d.name and c.status not in ('تم الحل','تمت المعالجة','مغلق','مغلقة'))::bigint
  from public.departments d
  where public.current_staff_role() in ('head_department','super_admin')
  order by d.name asc;
$$;

create or replace function public.create_staff_department(p_name text, p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if public.current_staff_role() not in ('head_department','super_admin') then raise exception 'administrative_permission_required'; end if;
  if nullif(trim(p_name),'') is null or nullif(trim(p_code),'') is null then raise exception 'department_name_and_code_required'; end if;
  insert into public.departments(name, code) values (trim(p_name), trim(p_code)) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.update_staff_department(p_id uuid, p_name text, p_code text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if public.current_staff_role() not in ('head_department','super_admin') then raise exception 'administrative_permission_required'; end if;
  update public.departments set name = trim(p_name), code = trim(p_code) where id = p_id;
  if not found then raise exception 'department_not_found'; end if;
  return true;
end;
$$;

create or replace function public.set_staff_department_active(p_id uuid, p_is_active boolean)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if public.current_staff_role() not in ('head_department','super_admin') then raise exception 'administrative_permission_required'; end if;
  update public.departments set is_active = p_is_active where id = p_id;
  if not found then raise exception 'department_not_found'; end if;
  return true;
end;
$$;

revoke all on function public.list_staff_departments() from public, anon;
grant execute on function public.list_staff_departments() to authenticated;
revoke all on function public.create_staff_department(text,text) from public, anon;
grant execute on function public.create_staff_department(text,text) to authenticated;
revoke all on function public.update_staff_department(uuid,text,text) from public, anon;
grant execute on function public.update_staff_department(uuid,text,text) to authenticated;
revoke all on function public.set_staff_department_active(uuid,boolean) from public, anon;
grant execute on function public.set_staff_department_active(uuid,boolean) to authenticated;

commit;
