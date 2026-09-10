-- Expose only approved official responses and their attachments to the citizen.
begin;
drop function if exists public.track_complaint(text, text, text);
create function public.track_complaint(p_tracking_id text, p_phone text, p_secret_pin text)
returns table (
  tracking_id text, citizen_name text, category text, municipality text, daira text,
  neighborhood text, subject text, description text, status text, priority text,
  assigned_department text, deadline timestamptz, official_response jsonb,
  attachments jsonb, timeline jsonb, created_at timestamptz, updated_at timestamptz
)
language sql security definer set search_path = public, extensions
as $$
  select c.tracking_id, c.citizen_name, c.category, c.municipality, c.daira,
    c.neighborhood, c.subject, c.description, c.status, c.priority,
    c.assigned_department, c.deadline,
    case when c.status in ('تم الحل','تمت المعالجة','مغلق')
      and coalesce((c.official_response ->> 'approved')::boolean, false)
      then c.official_response else null end,
    case when c.status in ('تم الحل','تمت المعالجة','مغلق')
      and coalesce((c.official_response ->> 'approved')::boolean, false)
      then coalesce(c.official_response -> 'attachments', '[]'::jsonb)
      else '[]'::jsonb end,
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
commit;
