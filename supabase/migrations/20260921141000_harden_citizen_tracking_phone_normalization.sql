begin;

-- Match every supported storage format without exposing phone plaintext:
-- legacy SHA-256, HMAC, and the encrypted Vault value.
create or replace function public.track_complaint(p_tracking_id text, p_phone text, p_secret_pin text)
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
  v_phone text := regexp_replace(trim(p_phone), '[^0-9]', '', 'g');
  v_phone_hash bytea;
  v_legacy_phone_hash text;
  v_pin_ok boolean;
begin
  if v_phone like '213%' and length(v_phone) = 12 then v_phone := '0' || substr(v_phone, 4); end if;
  if v_phone like '00213%' and length(v_phone) = 14 then v_phone := '0' || substr(v_phone, 6); end if;
  v_phone_hash := extensions.hmac(v_phone, public._wilaya_citizen_contact_key(), 'sha256');
  v_legacy_phone_hash := encode(extensions.digest(v_phone, 'sha256'), 'hex');

  select * into v_row
  from public.complaints c
  where upper(c.tracking_id) = upper(trim(p_tracking_id))
    and (
      c.citizen_phone_hash = v_phone_hash
      or lower(c.phone_encrypted) in (lower(encode(v_phone_hash, 'hex')), lower(v_legacy_phone_hash))
      or case
        when c.citizen_phone_encrypted_vault is null then false
        when left(c.citizen_phone_encrypted_vault, 2) = E'\\x'
          then extensions.pgp_sym_decrypt(c.citizen_phone_encrypted_vault::bytea, public._wilaya_citizen_contact_key()) = v_phone
        else extensions.pgp_sym_decrypt(decode(c.citizen_phone_encrypted_vault, 'hex'), public._wilaya_citizen_contact_key()) = v_phone
      end
    )
  limit 1;

  if not found then return; end if;
  if v_row.pin_locked_until is not null and v_row.pin_locked_until > now() then raise exception 'tracking_locked'; end if;
  v_pin_ok := extensions.crypt(trim(p_secret_pin), v_row.pin_hash) = v_row.pin_hash
    or extensions.crypt(encode(extensions.digest(trim(p_secret_pin), 'sha256'), 'hex'), v_row.pin_hash) = v_row.pin_hash;
  if not v_pin_ok then
    update public.complaints set pin_fail_count = pin_fail_count + 1, pin_locked_until = case when pin_fail_count + 1 >= 20 then now() + interval '1 hour' else pin_locked_until end where id = v_row.id;
    return;
  end if;
  update public.complaints set pin_fail_count = 0, pin_locked_until = null where id = v_row.id;
  return query select v_row.tracking_id, v_row.citizen_name, v_row.first_name, v_row.last_name, v_row.birth_date, v_row.gender, v_row.residence_daira, v_row.residence_municipality, v_row.full_address, v_row.category, v_row.municipality, v_row.daira, v_row.neighborhood, v_row.subject, v_row.description, v_row.meeting_request, v_row.status, v_row.priority, v_row.assigned_department, v_row.deadline, v_row.official_response, v_row.timeline, case when jsonb_typeof(v_row.attachments) = 'array' then v_row.attachments else '[]'::jsonb end, v_row.created_at, v_row.updated_at;
end;
$$;
revoke all on function public.track_complaint(text, text, text) from public, anon, authenticated;
grant execute on function public.track_complaint(text, text, text) to service_role;
commit;
