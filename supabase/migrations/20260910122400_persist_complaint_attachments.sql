-- Persist citizen-uploaded image and PDF metadata/content in complaints.attachments.
-- The public submit RPC remains the only write path.
create or replace function public.submit_complaint(p_payload jsonb)
returns table (tracking_id text, status text, created_at timestamptz, secret_pin text)
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_tracking_id text;
  v_secret_pin text := lpad((floor(random() * 1000000))::int::text, 6, '0');
  v_created_at timestamptz := timezone('utc', now());
  v_phone text := nullif(trim(p_payload ->> 'phone'), '');
  v_name text := nullif(trim(p_payload ->> 'full_name'), '');
  v_subject text := nullif(trim(p_payload ->> 'subject'), '');
  v_description text := nullif(trim(p_payload ->> 'description'), '');
  v_category text := nullif(trim(p_payload ->> 'category'), '');
  v_municipality text := nullif(trim(p_payload ->> 'municipality'), '');
  v_daira text := nullif(trim(p_payload ->> 'daira'), '');
  v_neighborhood text := nullif(trim(p_payload ->> 'neighborhood'), '');
  v_attachments jsonb := case when jsonb_typeof(p_payload -> 'attachments') = 'array' then p_payload -> 'attachments' else '[]'::jsonb end;
  v_attempt integer := 0;
begin
  if v_name is null or length(v_name) > 160 then raise exception using errcode = '22023', message = 'invalid citizen name'; end if;
  if v_phone is null or v_phone !~ '^0[567][0-9]{8}$' then raise exception using errcode = '22023', message = 'invalid phone'; end if;
  if v_subject is null or length(v_subject) > 240 then raise exception using errcode = '22023', message = 'invalid subject'; end if;
  if v_description is null or length(v_description) > 10000 then raise exception using errcode = '22023', message = 'invalid description'; end if;
  if v_category is null or length(v_category) > 120 then raise exception using errcode = '22023', message = 'invalid category'; end if;
  if v_municipality is null or length(v_municipality) > 120 then raise exception using errcode = '22023', message = 'invalid municipality'; end if;
  loop
    v_attempt := v_attempt + 1;
    if v_attempt > 5 then raise exception using errcode = '40001', message = 'could not allocate tracking identifier'; end if;
    v_tracking_id := 'WLY-' || to_char(v_created_at, 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    begin
      insert into public.complaints (tracking_id, citizen_name, phone_encrypted, category, municipality, daira, neighborhood, subject, description, status, priority, deadline, pin_hash, attachments, created_at, updated_at)
      values (v_tracking_id, v_name, encode(extensions.digest(v_phone, 'sha256'), 'hex'), v_category, v_municipality, coalesce(v_daira, 'الوادي'), v_neighborhood, v_subject, v_description, 'جديد', 'عادي', v_created_at + interval '15 days', v_secret_pin, v_attachments, v_created_at, v_created_at);
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;
  return query select c.tracking_id, c.status, c.created_at, v_secret_pin from public.complaints c where c.tracking_id = v_tracking_id;
end;
$$;
