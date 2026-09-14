begin;

-- Return the real citizen fields needed by the staff directory and citizen follow-up.
drop function if exists public.list_staff_complaints();
create or replace function public.list_staff_complaints()
returns table(
  id uuid, tracking_id text, citizen_name text, first_name text, last_name text,
  birth_date date, gender text, residence_daira text, residence_municipality text,
  full_address text, citizen_phone text, category text, municipality text, daira text,
  neighborhood text, subject text, description text, meeting_request text, status text,
  priority text, assigned_department text, assigned_user_id uuid, deadline timestamptz,
  official_response jsonb, timeline jsonb, created_at timestamptz, updated_at timestamptz,
  attachments jsonb
)
language sql stable security definer set search_path = public as $$
  select c.id, c.tracking_id, c.citizen_name, c.first_name, c.last_name,
    c.birth_date, c.gender, c.residence_daira, c.residence_municipality,
    c.full_address, c.citizen_phone, c.category, c.municipality, c.daira,
    c.neighborhood, c.subject, c.description, c.meeting_request, c.status,
    c.priority, c.assigned_department, c.assigned_user_id, c.deadline,
    c.official_response, c.timeline, c.created_at, c.updated_at,
    case when jsonb_typeof(c.attachments)='array' then c.attachments else '[]'::jsonb end
  from public.complaints c
  where public.is_active_staff()
    and (public.current_staff_role() in ('head_department','super_admin')
      or (public.current_staff_role() = 'supervisor' and
        (c.assigned_user_id=auth.uid() or c.assigned_department=(select department from public.users where id=auth.uid()) or c.assigned_user_id is null))
      or (public.current_staff_role() = 'employee' and c.assigned_user_id=auth.uid()))
  order by c.created_at desc limit 1000;
$$;
revoke all on function public.list_staff_complaints() from public, anon;
grant execute on function public.list_staff_complaints() to authenticated;

-- Persist workflow, timeline, response and attachments in one authoritative server-side transaction.
drop function if exists public.update_complaint_workflow(text,text,text,text,uuid,jsonb);
create or replace function public.update_complaint_workflow(
  p_tracking_id text, p_status text default null, p_priority text default null,
  p_assigned_department text default null, p_assigned_user_id uuid default null,
  p_official_response jsonb default null, p_timeline jsonb default null,
  p_attachments jsonb default null
) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_old public.complaints; v_role text; v_department text;
begin
  v_role := public.current_staff_role();
  if v_role is null or not public.is_active_staff() then raise exception 'authenticated staff required'; end if;
  select * into v_old from public.complaints where upper(tracking_id)=upper(trim(p_tracking_id)) for update;
  if not found then raise exception 'complaint not found'; end if;
  if not public.can_access_complaint(v_old.id) and v_role not in ('head_department','super_admin') then raise exception 'not authorized'; end if;
  if p_assigned_department is not null then
    if not exists (select 1 from public.departments d where d.name=trim(p_assigned_department) and d.is_active) then raise exception 'invalid_department'; end if;
    v_department := trim(p_assigned_department);
  end if;
  if p_assigned_user_id is not null and not exists (select 1 from public.users u where u.id=p_assigned_user_id and u.is_active and (v_department is null or u.department=v_department)) then raise exception 'invalid_assigned_user'; end if;
  update public.complaints set
    status=coalesce(nullif(trim(p_status),''),status),
    priority=coalesce(nullif(trim(p_priority),''),priority),
    assigned_department=coalesce(v_department,assigned_department),
    assigned_user_id=coalesce(p_assigned_user_id,assigned_user_id),
    official_response=coalesce(p_official_response,official_response),
    timeline=coalesce(p_timeline,timeline),
    attachments=coalesce(p_attachments,attachments),
    updated_at=timezone('utc',now())
  where id=v_old.id;
  insert into public.audit_logs(user_id,user_name,action,details)
    select auth.uid()::text,u.name,'complaint_workflow_update',jsonb_build_object('tracking_id',v_old.tracking_id,'old_status',v_old.status,'new_status',coalesce(nullif(trim(p_status),''),v_old.status))
    from public.users u where u.id=auth.uid();
  return true;
end; $$;
revoke all on function public.update_complaint_workflow(text,text,text,text,uuid,jsonb,jsonb,jsonb) from public, anon;
grant execute on function public.update_complaint_workflow(text,text,text,text,uuid,jsonb,jsonb,jsonb) to authenticated;

commit;
