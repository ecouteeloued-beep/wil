begin;

-- Security ownership: the symmetric key is stored only in Supabase Vault under
-- wilaya_citizen_contact_key and is controlled by the Wilaya security owner.
-- Rotate it with vault.update_secret(); do not put the key in source, migrations,
-- client code, or VITE_* variables. Before production rollout, take a full
-- database backup; restore with the project's approved Supabase backup/PITR
-- procedure if rollback is required.

create extension if not exists pgcrypto with schema extensions;

alter table public.complaints add column if not exists citizen_phone_hash bytea;
alter table public.complaints add column if not exists citizen_phone_encrypted_vault text;
alter table public.complaints add column if not exists citizen_nin_encrypted_vault text;

-- The secret is created only when this environment has not been provisioned.
do $$
begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'wilaya_citizen_contact_key') then
    perform vault.create_secret(encode(gen_random_bytes(32), 'hex'), 'wilaya_citizen_contact_key', 'Symmetric key for citizen phone/NIN HMAC and pgcrypto encryption. Controlled by the Wilaya security owner.');
  end if;
end $$;

create or replace function public._wilaya_citizen_contact_key()
returns text language sql stable security definer set search_path = public, vault, extensions
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'wilaya_citizen_contact_key' limit 1;
$$;

-- Backfill only values that are available. Existing phone_encrypted hashes are
-- preserved as a compatibility fallback for tracking during rollout.
update public.complaints
set citizen_phone_hash = extensions.hmac(trim(citizen_phone), public._wilaya_citizen_contact_key(), 'sha256'),
    citizen_phone_encrypted_vault = encode(extensions.pgp_sym_encrypt(trim(citizen_phone), public._wilaya_citizen_contact_key()), 'hex')
where nullif(trim(citizen_phone), '') is not null
  and (citizen_phone_hash is null or citizen_phone_encrypted_vault is null);

update public.complaints
set citizen_nin_encrypted_vault = encode(extensions.pgp_sym_encrypt(trim(citizen_nin), public._wilaya_citizen_contact_key()), 'hex')
where nullif(trim(citizen_nin), '') is not null
  and citizen_nin_encrypted_vault is null;

create or replace function public.protect_citizen_contact_plaintext()
returns trigger language plpgsql security definer set search_path = public, extensions
as $$
begin
  if nullif(trim(new.citizen_phone), '') is not null then
    new.citizen_phone_hash := extensions.hmac(trim(new.citizen_phone), public._wilaya_citizen_contact_key(), 'sha256');
    new.citizen_phone_encrypted_vault := encode(extensions.pgp_sym_encrypt(trim(new.citizen_phone), public._wilaya_citizen_contact_key()), 'hex');
    new.citizen_phone := null;
  end if;
  if nullif(trim(new.citizen_nin), '') is not null then
    new.citizen_nin_encrypted_vault := encode(extensions.pgp_sym_encrypt(trim(new.citizen_nin), public._wilaya_citizen_contact_key()), 'hex');
    new.citizen_nin := null;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_citizen_contact_plaintext on public.complaints;
create trigger protect_citizen_contact_plaintext
before insert or update of citizen_phone, citizen_nin on public.complaints
for each row execute function public.protect_citizen_contact_plaintext();

create or replace function public.decrypt_citizen_contact(p_complaint_id uuid)
returns table(citizen_phone text, citizen_nin text)
language plpgsql security definer set search_path = public, extensions
as $$
declare v_actor public.users; v_row public.complaints; v_can_access boolean;
begin
  select * into v_actor from public.users where id=auth.uid() and is_active=true;
  if v_actor.id is null then raise exception 'authenticated_staff_required'; end if;
  select * into v_row from public.complaints where id=p_complaint_id;
  if v_row.id is null then raise exception 'complaint_not_found'; end if;
  v_can_access := v_actor.role in ('super_admin','head_department')
    or (v_actor.role='supervisor' and (v_row.assigned_user_id=v_actor.id or v_row.assigned_department=v_actor.department or v_row.assigned_user_id is null))
    or (v_actor.role='employee' and v_row.assigned_user_id=v_actor.id);
  if not v_can_access then raise exception 'complaint_access_denied'; end if;
  insert into public.contact_decryption_log(actor_id,complaint_id,decrypted_fields)
  values(v_actor.id,v_row.id,array['phone','nin']);
  return query select
    case when v_row.citizen_phone_encrypted_vault is null then null
      when left(v_row.citizen_phone_encrypted_vault,2)=E'\\x' then extensions.pgp_sym_decrypt(v_row.citizen_phone_encrypted_vault::bytea,public._wilaya_citizen_contact_key())
      else extensions.pgp_sym_decrypt(decode(v_row.citizen_phone_encrypted_vault,'hex'),public._wilaya_citizen_contact_key()) end,
    case when v_row.citizen_nin_encrypted_vault is null then null
      when left(v_row.citizen_nin_encrypted_vault,2)=E'\\x' then extensions.pgp_sym_decrypt(v_row.citizen_nin_encrypted_vault::bytea,public._wilaya_citizen_contact_key())
      else extensions.pgp_sym_decrypt(decode(v_row.citizen_nin_encrypted_vault,'hex'),public._wilaya_citizen_contact_key()) end;
end;
$$;

-- Do not expose contact plaintext through the list RPC. The output shape stays
-- compatible; the service asks for decrypt_citizen_contact only for an opened file.
create or replace function public.list_staff_complaints()
returns table(id uuid, tracking_id text, citizen_name text, first_name text, last_name text, birth_date date, gender text, residence_daira text, residence_municipality text, full_address text, citizen_phone text, category text, municipality text, daira text, neighborhood text, subject text, description text, meeting_request text, status text, priority text, assigned_department text, assigned_user_id uuid, deadline timestamptz, official_response jsonb, timeline jsonb, created_at timestamptz, updated_at timestamptz, attachments jsonb)
language sql stable security definer set search_path = public
as $$
  select c.id,c.tracking_id,c.citizen_name,c.first_name,c.last_name,c.birth_date,c.gender,c.residence_daira,c.residence_municipality,c.full_address,null::text,c.category,c.municipality,c.daira,c.neighborhood,c.subject,c.description,c.meeting_request,c.status,c.priority,c.assigned_department,c.assigned_user_id,c.deadline,c.official_response,c.timeline,c.created_at,c.updated_at,case when jsonb_typeof(c.attachments)='array' then c.attachments else '[]'::jsonb end
  from public.complaints c
  where public.is_active_staff() and (public.current_staff_role() in ('head_department','super_admin') or (public.current_staff_role()='supervisor' and (c.assigned_user_id=auth.uid() or c.assigned_department=(select department from public.users where id=auth.uid()) or c.assigned_user_id is null)) or (public.current_staff_role()='employee' and c.assigned_user_id=auth.uid()))
  order by c.created_at desc limit 1000;
$$;

revoke all on function public.decrypt_citizen_contact(uuid) from public, anon;
grant execute on function public.decrypt_citizen_contact(uuid) to authenticated;
revoke all on function public.list_staff_complaints() from public, anon;
grant execute on function public.list_staff_complaints() to authenticated;

commit;
