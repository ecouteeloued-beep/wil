begin;

-- Deprecated executive positions are no longer assignable. Existing accounts are
-- kept for audit/history but deactivated until Super Admin assigns an approved role.
update public.users
set is_active = false,
    role = 'supervisor'
where role in ('wali', 'chef_cabinet');

alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role in ('super_admin', 'head_department', 'supervisor', 'employee'));

create or replace function public.can_access_complaint(p_complaint_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.complaints c
    join public.users u on u.id = auth.uid() and u.is_active = true
    where c.id = p_complaint_id
      and (
        u.role in ('super_admin')
        or (u.role = 'head_department' and c.assigned_department = u.department)
        or (u.role = 'supervisor' and (
          c.assigned_user_id = u.id or c.assigned_department = u.department or c.assigned_user_id is null
        ))
        or (u.role = 'employee' and c.assigned_user_id = u.id)
      )
  );
$$;

create or replace function public.list_staff_users()
returns table (id uuid, username text, name text, email text, role text, department text, is_active boolean, permissions jsonb, created_at timestamptz)
language plpgsql security definer set search_path = public, extensions
as $$
begin
  if public.current_staff_role() <> 'super_admin' then
    raise exception 'administrative_permission_required' using errcode = '42501';
  end if;
  return query
  select u.id, u.username, u.name, u.email, u.role::text, u.department, u.is_active,
         coalesce(u.permissions, '[]'::jsonb), u.created_at
  from public.users u
  order by u.created_at asc nulls last, u.name asc;
end;
$$;
revoke all on function public.list_staff_users() from public, anon;
grant execute on function public.list_staff_users() to authenticated;

drop function if exists public.list_staff_complaints();
create function public.list_staff_complaints()
returns table (
  id uuid, tracking_id text, citizen_name text, category text, municipality text,
  daira text, neighborhood text, subject text, description text, meeting_request text,
  status text, priority text, assigned_department text, assigned_user_id uuid,
  deadline timestamptz, official_response jsonb, timeline jsonb, created_at timestamptz,
  updated_at timestamptz, attachments jsonb
)
language sql stable security definer set search_path = public
as $$
  select c.id, c.tracking_id, c.citizen_name, c.category, c.municipality, c.daira,
    c.neighborhood, c.subject, c.description, c.meeting_request, c.status, c.priority,
    c.assigned_department, c.assigned_user_id, c.deadline, c.official_response,
    c.timeline, c.created_at, c.updated_at,
    case when jsonb_typeof(c.attachments) = 'array' then c.attachments else '[]'::jsonb end
  from public.complaints c
  where public.is_active_staff() and (
    public.current_staff_role() = 'super_admin'
    or (public.current_staff_role() = 'head_department' and c.assigned_department = (select department from public.users where id=auth.uid()))
    or (public.current_staff_role() = 'supervisor' and (c.assigned_user_id=auth.uid() or c.assigned_department=(select department from public.users where id=auth.uid()) or c.assigned_user_id is null))
    or (public.current_staff_role() in ('employee','head_department') and c.assigned_user_id=auth.uid())
  ) order by c.created_at desc limit 1000;
$$;
revoke all on function public.list_staff_complaints() from public;
grant execute on function public.list_staff_complaints() to authenticated;

-- No client may use deprecated roles through the workflow RPC.
create or replace function public.update_complaint_workflow(
  p_tracking_id text, p_status text default null, p_priority text default null,
  p_assigned_department text default null, p_assigned_user_id uuid default null,
  p_official_response jsonb default null
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare v_old public.complaints; v_role text;
begin
  v_role := public.current_staff_role();
  if v_role is null then raise exception 'authenticated staff required'; end if;
  select * into v_old from public.complaints where upper(tracking_id)=upper(trim(p_tracking_id)) for update;
  if not found then raise exception 'complaint not found'; end if;
  if not public.can_access_complaint(v_old.id) then raise exception 'not authorized'; end if;
  if p_status is not null and length(trim(p_status)) > 60 then raise exception 'invalid status'; end if;
  if p_priority is not null and trim(p_priority) not in ('عادي','متوسط','عاجل','قصوى') then raise exception 'invalid priority'; end if;
  update public.complaints set
    status=coalesce(nullif(trim(p_status),''),status), priority=coalesce(nullif(trim(p_priority),''),priority),
    assigned_department=coalesce(nullif(trim(p_assigned_department),''),assigned_department),
    assigned_user_id=coalesce(p_assigned_user_id,assigned_user_id), official_response=coalesce(p_official_response,official_response)
  where id=v_old.id;
  insert into public.audit_logs(user_id, user_name, action, details)
  select auth.uid()::text, u.name, 'complaint_workflow_update', jsonb_build_object('tracking_id',v_old.tracking_id,'old_status',v_old.status,'new_status',coalesce(nullif(trim(p_status),''),v_old.status))
  from public.users u where u.id=auth.uid();
  return true;
end;
$$;
revoke all on function public.update_complaint_workflow(text,text,text,text,uuid,jsonb) from public;
grant execute on function public.update_complaint_workflow(text,text,text,text,uuid,jsonb) to authenticated;

commit;
