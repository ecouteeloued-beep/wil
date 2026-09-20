begin;

-- Return the real assignee name for the staff dashboard. Contact data remains redacted.
drop function if exists public.list_staff_complaints();
create function public.list_staff_complaints()
returns table(
  id uuid, tracking_id text, citizen_name text, first_name text, last_name text,
  birth_date date, gender text, residence_daira text, residence_municipality text,
  full_address text, citizen_phone text, category text, municipality text, daira text,
  neighborhood text, subject text, description text, meeting_request text, status text,
  priority text, assigned_department text, assigned_user_id uuid, assigned_to_name text,
  deadline timestamptz, official_response jsonb, timeline jsonb, created_at timestamptz,
  updated_at timestamptz, attachments jsonb
)
language sql stable security definer set search_path = public
as $$
  select c.id, c.tracking_id, c.citizen_name, c.first_name, c.last_name,
    c.birth_date, c.gender, c.residence_daira, c.residence_municipality,
    c.full_address, null::text, c.category, c.municipality, c.daira,
    c.neighborhood, c.subject, c.description, c.meeting_request, c.status,
    c.priority, c.assigned_department, c.assigned_user_id, assignee.name,
    c.deadline, c.official_response, c.timeline, c.created_at, c.updated_at,
    case when jsonb_typeof(c.attachments) = 'array' then c.attachments else '[]'::jsonb end
  from public.complaints c
  left join public.users assignee on assignee.id = c.assigned_user_id
  where public.is_active_staff() and (
    public.current_staff_role() in ('head_department', 'super_admin')
    or (public.current_staff_role() = 'supervisor' and (
      c.assigned_user_id = auth.uid()
      or c.assigned_department = (select department from public.users where id = auth.uid())
      or c.assigned_user_id is null
    ))
    or (public.current_staff_role() = 'employee' and c.assigned_user_id = auth.uid())
  )
  order by c.created_at desc
  limit 1000;
$$;
revoke all on function public.list_staff_complaints() from public, anon;
grant execute on function public.list_staff_complaints() to authenticated;

-- رئيس الديوان receives the complete server-approved permission catalog.
update public.users
set permissions = '["view_all","view_department","view_assigned","assign_grievance","executive_directive","approve_reply","draft_reply","export_reports","manage_users","view_audit_logs","manage_settings","internal_messages"]'::jsonb
where role = 'head_department' and is_active = true;

commit;
