begin;

-- Keep phone/NIN redacted. Return the verified citizen's own profile and
-- complaint attachments after tracking authentication, and return the same
-- non-sensitive profile fields to scoped staff.
drop function if exists public.track_complaint(text, text, text);
create function public.track_complaint(p_tracking_id text, p_phone text, p_secret_pin text)
returns table (
  tracking_id text, citizen_name text, first_name text, last_name text,
  birth_date date, gender text, residence_daira text, residence_municipality text,
  full_address text, category text, municipality text, daira text, neighborhood text,
  subject text, description text, meeting_request text, status text, priority text,
  assigned_department text, deadline timestamptz, official_response jsonb,
  timeline jsonb, attachments jsonb, created_at timestamptz, updated_at timestamptz
)
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_row public.complaints;
  v_phone_hash bytea := extensions.hmac(trim(p_phone), public._wilaya_citizen_contact_key(), 'sha256');
  v_pin_ok boolean;
begin
  select * into v_row from public.complaints c
  where upper(c.tracking_id)=upper(trim(p_tracking_id))
    and (c.citizen_phone_hash=v_phone_hash or c.phone_encrypted=encode(v_phone_hash,'hex'))
  limit 1;
  if not found then return; end if;
  if v_row.pin_locked_until is not null and v_row.pin_locked_until > now() then raise exception 'tracking_locked'; end if;
  v_pin_ok := extensions.crypt(trim(p_secret_pin),v_row.pin_hash)=v_row.pin_hash
    or extensions.crypt(encode(extensions.digest(trim(p_secret_pin),'sha256'),'hex'),v_row.pin_hash)=v_row.pin_hash;
  if not v_pin_ok then
    update public.complaints set pin_fail_count=pin_fail_count+1,
      pin_locked_until=case when pin_fail_count+1>=20 then now()+interval '1 hour' else pin_locked_until end
    where id=v_row.id;
    return;
  end if;
  update public.complaints set pin_fail_count=0,pin_locked_until=null where id=v_row.id;
  return query select v_row.tracking_id, v_row.citizen_name, v_row.first_name, v_row.last_name,
    v_row.birth_date, v_row.gender, v_row.residence_daira, v_row.residence_municipality,
    v_row.full_address, v_row.category, v_row.municipality, v_row.daira, v_row.neighborhood,
    v_row.subject, v_row.description, v_row.meeting_request, v_row.status, v_row.priority,
    v_row.assigned_department, v_row.deadline, v_row.official_response, v_row.timeline,
    case when jsonb_typeof(v_row.attachments)='array' then v_row.attachments else '[]'::jsonb end,
    v_row.created_at, v_row.updated_at;
end;
$$;
revoke all on function public.track_complaint(text,text,text) from public, anon, authenticated;
grant execute on function public.track_complaint(text,text,text) to service_role;

-- Full directory data for authorized staff, but never the plaintext phone.
drop function if exists public.list_staff_complaints();
create function public.list_staff_complaints()
returns table(
  id uuid, tracking_id text, citizen_name text, first_name text, last_name text,
  birth_date date, gender text, residence_daira text, residence_municipality text,
  full_address text, citizen_phone text, category text, municipality text, daira text,
  neighborhood text, subject text, description text, meeting_request text, status text,
  priority text, assigned_department text, assigned_user_id uuid, deadline timestamptz,
  official_response jsonb, timeline jsonb, created_at timestamptz, updated_at timestamptz,
  attachments jsonb
)
language sql stable security definer set search_path = public
as $$
  select c.id,c.tracking_id,c.citizen_name,c.first_name,c.last_name,c.birth_date,c.gender,
    c.residence_daira,c.residence_municipality,c.full_address,null::text,c.category,
    c.municipality,c.daira,c.neighborhood,c.subject,c.description,c.meeting_request,c.status,
    c.priority,c.assigned_department,c.assigned_user_id,c.deadline,c.official_response,c.timeline,
    c.created_at,c.updated_at,case when jsonb_typeof(c.attachments)='array' then c.attachments else '[]'::jsonb end
  from public.complaints c
  where public.is_active_staff() and (
    public.current_staff_role() in ('head_department','super_admin')
    or (public.current_staff_role()='supervisor' and (c.assigned_user_id=auth.uid() or c.assigned_department=(select department from public.users where id=auth.uid()) or c.assigned_user_id is null))
    or (public.current_staff_role()='employee' and c.assigned_user_id=auth.uid())
  )
  order by c.created_at desc limit 1000;
$$;
revoke all on function public.list_staff_complaints() from public, anon;
grant execute on function public.list_staff_complaints() to authenticated;

commit;
