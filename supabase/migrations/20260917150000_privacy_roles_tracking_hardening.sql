begin;

-- Preserve existing settings and data while adding explicit staff rank/position metadata.
alter table public.users add column if not exists rank text;
alter table public.users add column if not exists position text;

update public.users
set
  rank = coalesce(nullif(trim(rank), ''), case
    when role = 'head_department' then 'رئيس الديوان'
    when role = 'super_admin' then 'تقني النظام'
    when role = 'supervisor' then 'مسؤول خلية'
    else 'موظف مكلف'
  end),
  position = coalesce(nullif(trim(position), ''), case
    when role = 'head_department' then 'رئيس الديوان'
    when role = 'super_admin' then 'تقني النظام'
    when role = 'supervisor' then 'مسؤول خلية الإصغاء والتكفل'
    else 'موظف معالج وميداني'
  end);

-- The head of cabinet is the operational authority and must retain every
-- currently supported permission without changing any user's custom settings.
insert into public.role_permissions(role, permission) values
  ('head_department','view_all'),
  ('head_department','view_department'),
  ('head_department','view_assigned'),
  ('head_department','assign_grievance'),
  ('head_department','executive_directive'),
  ('head_department','approve_reply'),
  ('head_department','draft_reply'),
  ('head_department','export_reports'),
  ('head_department','manage_users'),
  ('head_department','view_audit_logs'),
  ('head_department','manage_settings'),
  ('head_department','internal_messages')
on conflict do nothing;

-- Return only redacted citizen data to the public tracking endpoint. The phone
-- is already used as a hash for authentication and is never returned.
drop function if exists public.track_complaint(text, text, text);
create function public.track_complaint(p_tracking_id text, p_phone text, p_secret_pin text)
returns table (
  tracking_id text, citizen_name text, category text, municipality text, daira text,
  neighborhood text, subject text, description text, status text, priority text,
  assigned_department text, deadline timestamptz, official_response jsonb,
  timeline jsonb, created_at timestamptz, updated_at timestamptz
)
language sql security definer set search_path = public, extensions
as $$
  select c.tracking_id,
    'المواطن صاحب الطلب'::text,
    c.category, c.municipality, c.daira, c.neighborhood, c.subject, c.description,
    c.status, c.priority, c.assigned_department, c.deadline, c.official_response,
    c.timeline, c.created_at, c.updated_at
  from public.complaints c
  where upper(c.tracking_id) = upper(trim(p_tracking_id))
    and c.phone_encrypted = encode(extensions.digest(trim(p_phone), 'sha256'), 'hex')
    and (extensions.crypt(trim(p_secret_pin), c.pin_hash) = c.pin_hash
      or extensions.crypt(encode(extensions.digest(trim(p_secret_pin), 'sha256'), 'hex'), c.pin_hash) = c.pin_hash)
  limit 1;
$$;
revoke all on function public.track_complaint(text, text, text) from public;
grant execute on function public.track_complaint(text, text, text) to anon, authenticated;

-- Include rank and position in the administrative directory without exposing
-- citizen information through this RPC.
drop function if exists public.list_staff_users();
create function public.list_staff_users()
returns table(
  id uuid, username text, name text, email text, role text, department text,
  is_active boolean, permissions jsonb, created_at timestamptz, rank text, position text
)
language plpgsql security definer set search_path = public, extensions
as $$
declare v_role text := public.current_staff_role();
begin
  if v_role is null or v_role not in ('super_admin','head_department') then
    raise exception 'administrative_permission_required';
  end if;
  return query
  select u.id, u.username::text, u.name::text, u.email::text, u.role::text,
    u.department::text, u.is_active, coalesce(u.permissions, '[]'::jsonb),
    u.created_at, u.rank::text, u.position::text
  from public.users u
  where u.is_active = true
    and (v_role = 'super_admin' or u.role::text in ('employee','supervisor') or u.id = auth.uid())
  order by u.created_at asc nulls last, u.name asc;
end;
$$;
revoke all on function public.list_staff_users() from public, anon;
grant execute on function public.list_staff_users() to authenticated;

commit;
