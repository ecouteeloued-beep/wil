begin;

alter table public.complaints
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists birth_date date,
  add column if not exists gender text,
  add column if not exists residence_daira text,
  add column if not exists residence_municipality text,
  add column if not exists full_address text;

update public.complaints
set first_name = coalesce(nullif(split_part(trim(citizen_name), ' ', 1), ''), 'مواطن'),
    last_name = nullif(trim(regexp_replace(trim(citizen_name), '^\S+\s*', '')), '')
where first_name is null;

alter table public.complaints
  drop column if exists citizen_nin,
  drop column if exists national_id_encrypted;

create or replace function public.hash_complaint_sensitive_fields()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if new.phone_encrypted is not null and new.phone_encrypted !~ '^[0-9a-f]{64}$' then
    new.phone_encrypted := encode(digest(trim(new.phone_encrypted), 'sha256'), 'hex');
  end if;
  if new.pin_hash is not null and new.pin_hash !~ '^\$2[aby]\$' then
    new.pin_hash := crypt(trim(new.pin_hash), gen_salt('bf'));
  end if;
  return new;
end;
$$;

create or replace function public.submit_complaint(p_payload jsonb)
returns table(tracking_id text, status text, created_at timestamptz, secret_pin text)
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_id text;
  v_pin text := lpad((floor(random() * 1000000))::int::text, 6, '0');
  v_now timestamptz := timezone('utc', now());
  v_first text := nullif(trim(p_payload->>'first_name'), '');
  v_last text := nullif(trim(p_payload->>'last_name'), '');
  v_full text := nullif(trim(concat_ws(' ', v_first, v_last)), '');
  v_phone text := nullif(trim(p_payload->>'phone'), '');
  v_birth date;
begin
  if v_first is null or length(v_first) > 80 then raise exception 'invalid first name' using errcode = '22023'; end if;
  if v_last is null or length(v_last) > 80 then raise exception 'invalid last name' using errcode = '22023'; end if;
  if v_phone is null or v_phone !~ '^0[567][0-9]{8}$' then raise exception 'invalid phone' using errcode = '22023'; end if;
  if nullif(trim(p_payload->>'birth_date'), '') is null or (p_payload->>'birth_date') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'invalid birth date' using errcode = '22023'; end if;
  begin v_birth := (p_payload->>'birth_date')::date; exception when others then raise exception 'invalid birth date' using errcode = '22023'; end;
  if nullif(trim(p_payload->>'gender'), '') not in ('ذكر', 'أنثى') then raise exception 'invalid gender' using errcode = '22023'; end if;
  if nullif(trim(p_payload->>'residence_daira'), '') is null then raise exception 'invalid residence daira' using errcode = '22023'; end if;
  if nullif(trim(p_payload->>'residence_municipality'), '') is null then raise exception 'invalid residence municipality' using errcode = '22023'; end if;
  if nullif(trim(p_payload->>'full_address'), '') is null then raise exception 'invalid full address' using errcode = '22023'; end if;
  v_id := 'WLY-' || to_char(v_now, 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  insert into public.complaints(
    tracking_id, citizen_name, first_name, last_name, birth_date, gender,
    residence_daira, residence_municipality, full_address,
    phone_encrypted, citizen_phone, category, municipality, daira, neighborhood,
    subject, description, meeting_request, status, priority, deadline, pin_hash,
    attachments, created_at, updated_at
  ) values (
    v_id, v_full, v_first, v_last, v_birth, trim(p_payload->>'gender'),
    trim(p_payload->>'residence_daira'), trim(p_payload->>'residence_municipality'), trim(p_payload->>'full_address'),
    encode(digest(v_phone, 'sha256'), 'hex'), v_phone, nullif(trim(p_payload->>'category'), ''),
    trim(p_payload->>'residence_municipality'), trim(p_payload->>'residence_daira'), trim(p_payload->>'full_address'),
    nullif(trim(p_payload->>'subject'), ''), nullif(trim(p_payload->>'description'), ''),
    nullif(trim(p_payload->>'meeting_request'), ''), 'جديد', 'عادي', v_now + interval '15 days', crypt(v_pin, gen_salt('bf')),
    coalesce(p_payload->'attachments', '[]'::jsonb), v_now, v_now
  );
  return query select v_id, 'جديد', v_now, v_pin;
end;
$$;
revoke all on function public.submit_complaint(jsonb) from public, anon, authenticated;
grant execute on function public.submit_complaint(jsonb) to service_role;

drop function if exists public.list_staff_complaints();
create function public.list_staff_complaints()
returns table(
  id uuid, tracking_id text, citizen_name text, first_name text, last_name text,
  birth_date date, gender text, phone text, residence_daira text, residence_municipality text,
  full_address text, category text, municipality text, daira text, neighborhood text,
  subject text, description text, meeting_request text, status text, priority text,
  assigned_department text, assigned_user_id uuid, deadline timestamptz, official_response jsonb,
  timeline jsonb, created_at timestamptz, updated_at timestamptz, attachments jsonb
)
language sql stable security definer set search_path = public, extensions
as $$
  select c.id, c.tracking_id, c.citizen_name, c.first_name, c.last_name, c.birth_date, c.gender,
    c.citizen_phone, c.residence_daira, c.residence_municipality, c.full_address,
    c.category, c.municipality, c.daira, c.neighborhood, c.subject, c.description,
    c.meeting_request, c.status, c.priority, c.assigned_department, c.assigned_user_id,
    c.deadline, c.official_response, c.timeline, c.created_at, c.updated_at,
    case when jsonb_typeof(c.attachments) = 'array' then c.attachments else '[]'::jsonb end
  from public.complaints c
  where public.is_active_staff() and (
    public.current_staff_role() in ('wali','chef_cabinet')
    or (public.current_staff_role() = 'head_department' and c.assigned_department = (select department from public.users where id = auth.uid()))
    or (public.current_staff_role() = 'supervisor' and (c.assigned_user_id = auth.uid() or c.assigned_department = (select department from public.users where id = auth.uid()) or c.assigned_user_id is null))
    or (public.current_staff_role() in ('employee','head_department') and c.assigned_user_id = auth.uid())
  )
  order by c.created_at desc limit 1000;
$$;
revoke all on function public.list_staff_complaints() from public;
grant execute on function public.list_staff_complaints() to authenticated;

commit;
