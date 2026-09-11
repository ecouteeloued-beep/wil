-- Production hardening: least privilege, server-side workflow, masked staff data,
-- private attachment metadata, and removal of client-controlled timeline writes.
begin;

-- Never expose the complaints table directly to browser roles. All reads/writes use
-- narrowly scoped RPCs so sensitive columns cannot be selected accidentally.
revoke all on table public.complaints from anon, authenticated;
revoke all on table public.audit_logs from anon, authenticated;
grant select, insert on table public.audit_logs to authenticated;
revoke all on table public.internal_notes from anon, authenticated;
grant select, insert, update on table public.internal_notes to authenticated;
revoke all on table public.internal_messages from anon, authenticated;
grant select, insert, update on table public.internal_messages to authenticated;
revoke all on table public.users from anon, authenticated;
grant select on table public.users to authenticated;
revoke all on table public.departments from anon, authenticated;
grant select on table public.departments to anon, authenticated;
revoke all on table public.municipalities from anon, authenticated;
grant select on table public.municipalities to anon, authenticated;

-- Helper functions are never API endpoints.
revoke all on function public.current_staff_role() from anon, authenticated;
revoke all on function public.is_active_staff() from anon, authenticated;
revoke all on function public.can_access_complaint(uuid) from anon, authenticated;

-- Public functions are deliberately limited to the citizen flow.
revoke all on function public.resolve_login_identifier(text) from public;
grant execute on function public.resolve_login_identifier(text) to anon;
revoke all on function public.submit_complaint(jsonb) from public;
grant execute on function public.submit_complaint(jsonb) to anon, authenticated;
revoke all on function public.track_complaint(text, text, text) from public;
grant execute on function public.track_complaint(text, text, text) to anon, authenticated;

-- Staff-only RPCs. Explicit grants avoid default PUBLIC execution.
revoke all on function public.admin_reset_staff_password(uuid, text) from public;
grant execute on function public.admin_reset_staff_password(uuid, text) to authenticated;
revoke all on function public.admin_update_staff_account(uuid, text, text, text, text, text, text, boolean) from public;
grant execute on function public.admin_update_staff_account(uuid, text, text, text, text, text, text, boolean) to authenticated;
revoke all on function public.admin_update_staff_permissions(uuid, jsonb) from public;
grant execute on function public.admin_update_staff_permissions(uuid, jsonb) to authenticated;
revoke all on function public.get_my_staff_profile() from public;
grant execute on function public.get_my_staff_profile() to authenticated;
revoke all on function public.list_message_recipients() from public;
grant execute on function public.list_message_recipients() to authenticated;
revoke all on function public.mark_internal_message_read(uuid) from public;
grant execute on function public.mark_internal_message_read(uuid) to authenticated;

-- Disable the realtime publication for complaints: replica payloads contain columns
-- that cannot be protected at column level. Staff clients must use the masked RPC.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime drop table public.complaints; exception when others then null; end;
  end if;
end $$;

-- Safe staff list: no phone, NIN, PIN, or raw attachment contents.
drop function if exists public.list_staff_complaints();
create or replace function public.list_staff_complaints()
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
    public.current_staff_role() in ('wali','chef_cabinet')
    or (public.current_staff_role() = 'head_department' and c.assigned_department = (select department from public.users where id=auth.uid()))
    or (public.current_staff_role() = 'supervisor' and (c.assigned_user_id=auth.uid() or c.assigned_department=(select department from public.users where id=auth.uid()) or c.assigned_user_id is null))
    or (public.current_staff_role() in ('employee','head_department') and c.assigned_user_id=auth.uid())
  ) order by c.created_at desc limit 1000;
$$;
revoke all on function public.list_staff_complaints() from public;
grant execute on function public.list_staff_complaints() to authenticated;

-- Server-side workflow update. Client cannot replace timeline, attachments, or
-- sensitive fields. A real event is appended from the database.
drop function if exists public.update_complaint_workflow(text, text, text, text, uuid, jsonb);
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
  if not public.can_access_complaint(v_old.id) and v_role not in ('wali','chef_cabinet') then raise exception 'not authorized'; end if;
  if p_status is not null and length(trim(p_status)) > 60 then raise exception 'invalid status'; end if;
  if p_priority is not null and trim(p_priority) not in ('عادي','متوسط','عاجل','قصوى') then raise exception 'invalid priority'; end if;
  update public.complaints set
    status=coalesce(nullif(trim(p_status),''),status),
    priority=coalesce(nullif(trim(p_priority),''),priority),
    assigned_department=coalesce(nullif(trim(p_assigned_department),''),assigned_department),
    assigned_user_id=coalesce(p_assigned_user_id,assigned_user_id),
    official_response=coalesce(p_official_response,official_response)
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
