begin;

create table if not exists public.citizen_upload_authorizations (
  id uuid primary key default gen_random_uuid(),
  object_path text not null unique,
  original_name text not null,
  content_type text not null,
  byte_size bigint not null check (byte_size > 0 and byte_size <= 5242880),
  status text not null default 'pending' check (status in ('pending', 'consumed', 'expired', 'revoked')),
  complaint_id uuid references public.complaints(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default timezone('utc', now()) + interval '15 minutes',
  consumed_at timestamptz
);

revoke all on table public.citizen_upload_authorizations from public, anon, authenticated;
grant select, insert, update on table public.citizen_upload_authorizations to service_role;
alter table public.citizen_upload_authorizations enable row level security;

create or replace function public.authorize_upload(
  p_original_name text,
  p_content_type text,
  p_byte_size bigint
)
returns table(upload_path text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_extension text;
  v_path text;
  v_expiry timestamptz := timezone('utc', now()) + interval '15 minutes';
begin
  if p_original_name is null or length(trim(p_original_name)) < 1 or length(p_original_name) > 120
     or p_original_name ~ '[^a-zA-Z0-9._ -]' then
    raise exception 'invalid upload filename' using errcode = '22023';
  end if;
  if p_content_type not in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp') then
    raise exception 'unsupported upload type' using errcode = '22023';
  end if;
  if p_byte_size is null or p_byte_size <= 0 or p_byte_size > 5242880 then
    raise exception 'upload exceeds size limit' using errcode = '22023';
  end if;

  v_extension := case p_content_type
    when 'application/pdf' then 'pdf'
    when 'image/jpeg' then 'jpg'
    when 'image/png' then 'png'
    when 'image/webp' then 'webp'
  end;
  v_path := 'citizen/' || replace(gen_random_uuid()::text, '-', '') || '.' || v_extension;

  insert into public.citizen_upload_authorizations(object_path, original_name, content_type, byte_size, expires_at)
  values (v_path, trim(p_original_name), p_content_type, p_byte_size, v_expiry);

  return query select v_path, v_expiry;
end;
$$;
revoke all on function public.authorize_upload(text, text, bigint) from public, authenticated;
grant execute on function public.authorize_upload(text, text, bigint) to anon;

create or replace function public.is_authorized_citizen_upload(p_object_path text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.citizen_upload_authorizations a
    where a.object_path = p_object_path
      and a.status = 'pending'
      and a.expires_at > timezone('utc', now())
  );
$$;
revoke all on function public.is_authorized_citizen_upload(text) from public, authenticated;
grant execute on function public.is_authorized_citizen_upload(text) to anon;

create or replace function public.validate_complaint_attachments()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_attachment jsonb;
  v_path text;
  v_auth public.citizen_upload_authorizations;
  v_count integer := 0;
begin
  if jsonb_typeof(coalesce(new.attachments, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid attachments payload' using errcode = '22023';
  end if;

  for v_attachment in select value from jsonb_array_elements(coalesce(new.attachments, '[]'::jsonb)) loop
    v_count := v_count + 1;
    if v_count > 3 then raise exception 'too many attachments' using errcode = '22023'; end if;
    v_path := nullif(trim(v_attachment ->> 'url'), '');
    if v_path is null or v_path !~ '^citizen/[a-f0-9]{32}\.(pdf|jpg|png|webp)$' then
      raise exception 'attachment is not authorized' using errcode = '42501';
    end if;

    select * into v_auth
    from public.citizen_upload_authorizations
    where object_path = v_path
      and status = 'pending'
      and expires_at > timezone('utc', now())
    for update;
    if not found then raise exception 'attachment authorization expired or already used' using errcode = '42501'; end if;
    if coalesce(v_attachment ->> 'type', '') <> v_auth.content_type then
      raise exception 'attachment content type mismatch' using errcode = '22023';
    end if;
    if coalesce((v_attachment ->> 'size_bytes')::bigint, -1) <> v_auth.byte_size then
      raise exception 'attachment size mismatch' using errcode = '22023';
    end if;

    update public.citizen_upload_authorizations
    set status = 'consumed', complaint_id = new.id, consumed_at = timezone('utc', now())
    where id = v_auth.id;
  end loop;
  return new;
end;
$$;

drop trigger if exists validate_complaint_attachments_before_insert on public.complaints;
create trigger validate_complaint_attachments_before_insert
before insert on public.complaints
for each row execute function public.validate_complaint_attachments();

-- Replace the permissive anonymous insert path with an authorization-bound policy.
revoke insert on table storage.objects from anon, authenticated;
drop policy if exists complaint_attachment_insert on storage.objects;
create policy complaint_attachment_insert on storage.objects
for insert to anon, authenticated
with check (
  bucket_id = 'complaint-attachments'
  and name ~ '^citizen/[a-f0-9]{32}\.(pdf|jpg|png|webp)$'
  and public.is_authorized_citizen_upload(name)
);
grant insert on table storage.objects to anon, authenticated;

drop policy if exists complaint_attachment_staff_read on storage.objects;
create policy complaint_attachment_staff_read on storage.objects
for select to authenticated
using (bucket_id = 'complaint-attachments' and public.is_active_staff());

commit;
