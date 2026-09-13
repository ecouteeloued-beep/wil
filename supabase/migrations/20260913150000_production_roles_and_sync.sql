begin;

-- Production role model: no deprecated executive roles and no default/demo accounts.
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role in ('super_admin', 'head_department', 'supervisor', 'employee'));
alter table public.users alter column role set default 'employee';

-- رئيس الديوان: full administrative access; رئيس الخلية: monitoring, routing and guidance;
-- employee: assigned files only; super_admin: technical administration.
create or replace function public.can_access_complaint(p_complaint_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.complaints c
    join public.users u on u.id = auth.uid() and u.is_active
    where c.id = p_complaint_id
      and (
        u.role in ('head_department', 'super_admin')
        or (u.role = 'supervisor' and (c.assigned_user_id = u.id or c.assigned_department = u.department or c.assigned_user_id is null))
        or (u.role = 'employee' and c.assigned_user_id = u.id)
      )
  );
$$;

create or replace function public.list_staff_complaints()
returns table (
  id uuid, tracking_id text, citizen_name text, category text, municipality text,
  daira text, neighborhood text, subject text, description text, meeting_request text,
  status text, priority text, assigned_department text, assigned_user_id uuid,
  deadline timestamptz, official_response jsonb, timeline jsonb, created_at timestamptz,
  updated_at timestamptz, attachments jsonb
) language sql stable security definer set search_path = public as $$
  select c.id, c.tracking_id, c.citizen_name, c.category, c.municipality, c.daira,
    c.neighborhood, c.subject, c.description, c.meeting_request, c.status, c.priority,
    c.assigned_department, c.assigned_user_id, c.deadline, c.official_response,
    c.timeline, c.created_at, c.updated_at,
    case when jsonb_typeof(c.attachments) = 'array' then c.attachments else '[]'::jsonb end
  from public.complaints c
  where public.is_active_staff() and public.can_access_complaint(c.id)
  order by c.created_at desc limit 1000;
$$;
revoke all on function public.list_staff_complaints() from public;
grant execute on function public.list_staff_complaints() to authenticated;

-- Every insert and workflow update emits only non-sensitive metadata. Clients refetch through scoped RPC.
create or replace function public.publish_staff_complaint_event()
returns trigger language plpgsql security definer set search_path = public, realtime as $$
begin
  perform realtime.broadcast(
    'staff-complaints', 'complaint_change',
    jsonb_build_object('operation', TG_OP, 'tracking_id', coalesce(new.tracking_id, old.tracking_id), 'status', coalesce(new.status, old.status)), true
  );
  return coalesce(new, old);
end;
$$;
drop trigger if exists complaints_staff_event on public.complaints;
create trigger complaints_staff_event after insert or update on public.complaints
for each row execute function public.publish_staff_complaint_event();

commit;
