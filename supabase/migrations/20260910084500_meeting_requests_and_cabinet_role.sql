-- Meeting requests and executive-cabinet role naming
-- Additive migration. Apply in staging first; do not run directly in Production without backup.

begin;

alter table public.complaints
  add column if not exists meeting_request text
  check (meeting_request is null or meeting_request in ('والي الولاية', 'رئيس الديوان', 'الأمين العام للولاية'));

create or replace function public.submit_complaint(p_payload jsonb)
returns table (tracking_id text, status text, created_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_tracking_id text;
  v_created_at timestamptz := timezone('utc', now());
  v_phone text := nullif(trim(p_payload ->> 'phone'), '');
  v_meeting_request text := nullif(trim(p_payload ->> 'meeting_request'), '');
  v_attempt integer := 0;
begin
  if nullif(trim(p_payload ->> 'full_name'), '') is null or length(trim(p_payload ->> 'full_name')) > 160 then
    raise exception using errcode = '22023', message = 'invalid citizen name';
  end if;
  if v_meeting_request is not null and v_meeting_request not in ('والي الولاية', 'رئيس الديوان', 'الأمين العام للولاية') then
    raise exception using errcode = '22023', message = 'invalid meeting request';
  end if;
  if v_phone is null or v_phone !~ '^0[567][0-9]{8}$' then
    raise exception using errcode = '22023', message = 'invalid phone';
  end if;
  if nullif(trim(p_payload ->> 'subject'), '') is null or length(trim(p_payload ->> 'subject')) > 240 then
    raise exception using errcode = '22023', message = 'invalid subject';
  end if;
  if nullif(trim(p_payload ->> 'description'), '') is null or length(trim(p_payload ->> 'description')) > 10000 then
    raise exception using errcode = '22023', message = 'invalid description';
  end if;
  if nullif(trim(p_payload ->> 'category'), '') is null or length(trim(p_payload ->> 'category')) > 120 then
    raise exception using errcode = '22023', message = 'invalid category';
  end if;
  if nullif(trim(p_payload ->> 'municipality'), '') is null or length(trim(p_payload ->> 'municipality')) > 120 then
    raise exception using errcode = '22023', message = 'invalid municipality';
  end if;

  loop
    v_attempt := v_attempt + 1;
    if v_attempt > 5 then raise exception using errcode = '40001', message = 'could not allocate tracking identifier'; end if;
    v_tracking_id := 'WLY-' || to_char(v_created_at, 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    begin
      insert into public.complaints (
        tracking_id, citizen_name, phone_encrypted, category, municipality, daira,
        neighborhood, subject, description, meeting_request, status, priority,
        deadline, created_at, updated_at
      ) values (
        v_tracking_id,
        nullif(trim(p_payload ->> 'full_name'), ''),
        encode(digest(v_phone, 'sha256'), 'hex'),
        nullif(trim(p_payload ->> 'category'), ''),
        nullif(trim(p_payload ->> 'municipality'), ''),
        coalesce(nullif(trim(p_payload ->> 'daira'), ''), 'الوادي'),
        nullif(trim(p_payload ->> 'neighborhood'), ''),
        nullif(trim(p_payload ->> 'subject'), ''),
        nullif(trim(p_payload ->> 'description'), ''),
        v_meeting_request,
        'جديد', 'عادي', v_created_at + interval '15 days', v_created_at, v_created_at
      );
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  return query select c.tracking_id, c.status, c.created_at from public.complaints c where c.tracking_id = v_tracking_id;
end;
$$;

-- PostgreSQL does not allow CREATE OR REPLACE to change OUT parameters.
-- The old function returns the previous row shape, so replace it explicitly.
drop function if exists public.track_complaint(text, text);

create or replace function public.track_complaint(p_tracking_id text, p_phone text)
returns table (
  tracking_id text, citizen_name text, category text, municipality text, daira text,
  neighborhood text, subject text, description text, meeting_request text, status text,
  priority text, assigned_department text, deadline timestamptz, official_response jsonb,
  timeline jsonb, created_at timestamptz, updated_at timestamptz
)
language sql
security definer
set search_path = public, extensions
as $$
  select c.tracking_id, c.citizen_name, c.category, c.municipality, c.daira,
    c.neighborhood, c.subject, c.description, c.meeting_request, c.status, c.priority,
    c.assigned_department, c.deadline, c.official_response, c.timeline, c.created_at, c.updated_at
  from public.complaints c
  where upper(c.tracking_id) = upper(trim(p_tracking_id))
    and c.phone_encrypted = encode(extensions.digest(trim(p_phone), 'sha256'), 'hex')
  limit 1;
$$;

revoke all on function public.submit_complaint(jsonb) from public;
grant execute on function public.submit_complaint(jsonb) to anon, authenticated;
revoke all on function public.track_complaint(text, text) from public;
grant execute on function public.track_complaint(text, text) to anon, authenticated;

commit;

-- Rollback: drop the meeting_request column only after client rollback and data review.
-- alter table public.complaints drop column if exists meeting_request;
