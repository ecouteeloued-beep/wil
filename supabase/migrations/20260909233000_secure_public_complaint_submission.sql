-- Secure public complaint submission foundation
-- Purpose: replace client-controlled tracking_id upsert with an insert-only RPC.
-- Affected object: public.submit_complaint(jsonb)
-- Prerequisites: pgcrypto extension and public.complaints from schema.sql.
-- Safety: additive. This file is not executed automatically by this repository.
-- Data-loss risk: none expected; the function inserts one row and never updates an existing row.
-- Downtime risk: low when deployed before switching the client.
-- Verification: execute the role and duplicate-insert tests documented in DATABASE_CHANGE_PLAN.md.
-- Rollback: revoke execute from anon/authenticated and drop this function only after the client no longer calls it.

begin;

create or replace function public.submit_complaint(p_payload jsonb)
returns table (
  tracking_id text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_tracking_id text;
  v_created_at timestamptz := timezone('utc', now());
  v_phone text := nullif(trim(p_payload ->> 'phone'), '');
  v_name text := nullif(trim(p_payload ->> 'full_name'), '');
  v_subject text := nullif(trim(p_payload ->> 'subject'), '');
  v_description text := nullif(trim(p_payload ->> 'description'), '');
  v_category text := nullif(trim(p_payload ->> 'category'), '');
  v_municipality text := nullif(trim(p_payload ->> 'municipality'), '');
  v_daira text := nullif(trim(p_payload ->> 'daira'), '');
  v_neighborhood text := nullif(trim(p_payload ->> 'neighborhood'), '');
  v_email text := nullif(trim(p_payload ->> 'email'), '');
  v_attempt integer := 0;
begin
  if v_name is null or length(v_name) > 160 then
    raise exception using errcode = '22023', message = 'invalid citizen name';
  end if;
  if v_phone is null or v_phone !~ '^0[567][0-9]{8}$' then
    raise exception using errcode = '22023', message = 'invalid phone';
  end if;
  if v_subject is null or length(v_subject) > 240 then
    raise exception using errcode = '22023', message = 'invalid subject';
  end if;
  if v_description is null or length(v_description) > 10000 then
    raise exception using errcode = '22023', message = 'invalid description';
  end if;
  if v_category is null or length(v_category) > 120 then
    raise exception using errcode = '22023', message = 'invalid category';
  end if;
  if v_municipality is null or length(v_municipality) > 120 then
    raise exception using errcode = '22023', message = 'invalid municipality';
  end if;
  if v_daira is not null and length(v_daira) > 120 then
    raise exception using errcode = '22023', message = 'invalid daira';
  end if;
  if v_neighborhood is not null and length(v_neighborhood) > 240 then
    raise exception using errcode = '22023', message = 'invalid neighborhood';
  end if;
  if v_email is not null and length(v_email) > 254 then
    raise exception using errcode = '22023', message = 'invalid email';
  end if;

  loop
    v_attempt := v_attempt + 1;
    if v_attempt > 5 then
      raise exception using errcode = '40001', message = 'could not allocate tracking identifier';
    end if;

    v_tracking_id := 'WLY-' || to_char(v_created_at, 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    begin
      insert into public.complaints (
        tracking_id,
        citizen_name,
        phone_encrypted,
        category,
        municipality,
        daira,
        neighborhood,
        subject,
        description,
        status,
        priority,
        deadline,
        created_at,
        updated_at
      ) values (
        v_tracking_id,
        v_name,
        encode(digest(v_phone, 'sha256'), 'hex'),
        v_category,
        v_municipality,
        coalesce(v_daira, 'الوادي'),
        v_neighborhood,
        v_subject,
        v_description,
        'جديد',
        'عادي',
        v_created_at + interval '15 days',
        v_created_at,
        v_created_at
      );
      exit;
    exception when unique_violation then
      -- Retry only the generated identifier collision; never update an existing row.
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  return query select c.tracking_id, c.status, c.created_at
  from public.complaints c
  where c.tracking_id = v_tracking_id;
end;
$$;

revoke all on function public.submit_complaint(jsonb) from public;
grant execute on function public.submit_complaint(jsonb) to anon, authenticated;

create or replace function public.transition_complaint(
  p_tracking_id text,
  p_target_status text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (tracking_id text, status text, updated_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_actor public.users%rowtype;
  v_complaint public.complaints%rowtype;
  v_now timestamptz := timezone('utc', now());
begin
  select * into v_actor
  from public.users
  where id = auth.uid() and is_active = true;
  if not found then
    raise exception using errcode = '42501', message = 'active staff profile required';
  end if;

  if p_target_status <> 'تم الاطلاع' then
    raise exception using errcode = '22023', message = 'unsupported complaint transition';
  end if;

  select * into v_complaint
  from public.complaints
  where upper(tracking_id) = upper(trim(p_tracking_id))
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'complaint not found';
  end if;

  if not (
    v_actor.role in ('wali', 'chef_cabinet')
    or (v_actor.role = 'head_department' and v_complaint.assigned_department = v_actor.department)
    or (v_actor.role = 'supervisor' and (
      v_complaint.assigned_user_id = v_actor.id
      or v_complaint.assigned_department = v_actor.department
      or v_complaint.assigned_user_id is null
    ))
    or (v_actor.role = 'employee' and v_complaint.assigned_user_id = v_actor.id)
  ) then
    raise exception using errcode = '42501', message = 'complaint is outside staff scope';
  end if;

  if v_complaint.status not in ('جديد', 'تم الاستقبال') then
    return query select v_complaint.tracking_id, v_complaint.status, v_complaint.updated_at;
    return;
  end if;

  update public.complaints
  set status = p_target_status, updated_at = v_now
  where id = v_complaint.id;

  insert into public.audit_logs (user_id, user_name, action, details, created_at)
  values (
    auth.uid()::text,
    v_actor.name,
    'complaint_status_transition',
    jsonb_build_object(
      'tracking_id', v_complaint.tracking_id,
      'from', v_complaint.status,
      'to', p_target_status,
      'metadata', coalesce(p_metadata, '{}'::jsonb)
    ),
    v_now
  );

  return query select v_complaint.tracking_id, p_target_status, v_now;
end;
$$;

revoke all on function public.transition_complaint(text, text, jsonb) from public;
grant execute on function public.transition_complaint(text, text, jsonb) to authenticated;

commit;

-- Rollback (execute only after client cutover is reverted):
-- revoke execute on function public.submit_complaint(jsonb) from anon, authenticated;
-- drop function if exists public.submit_complaint(jsonb);
-- revoke execute on function public.transition_complaint(text, text, jsonb) from authenticated;
-- drop function if exists public.transition_complaint(text, text, jsonb);
