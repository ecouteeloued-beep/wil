begin;

create table if not exists public.legacy_attachment_cleanup_candidates (
  complaint_id uuid primary key,
  tracking_id text not null,
  detected_at timestamptz not null default timezone('utc', now()),
  legacy_attachment_count integer not null check (legacy_attachment_count > 0),
  reviewed_at timestamptz,
  cleaned_at timestamptz
);

revoke all on table public.legacy_attachment_cleanup_candidates from public, anon, authenticated;
grant select, insert, update on table public.legacy_attachment_cleanup_candidates to service_role;
alter table public.legacy_attachment_cleanup_candidates enable row level security;

insert into public.legacy_attachment_cleanup_candidates(complaint_id, tracking_id, legacy_attachment_count)
select c.id, c.tracking_id,
       count(*) filter (where coalesce(a.value->>'dataUrl','') like 'data:%' or coalesce(a.value->>'data_url','') like 'data:%')::integer
from public.complaints c
cross join lateral jsonb_array_elements(case when jsonb_typeof(c.attachments)='array' then c.attachments else '[]'::jsonb end) a(value)
where coalesce(a.value->>'dataUrl','') like 'data:%' or coalesce(a.value->>'data_url','') like 'data:%'
group by c.id, c.tracking_id
on conflict (complaint_id) do update set legacy_attachment_count=excluded.legacy_attachment_count;

create or replace function public.prepare_legacy_attachment_cleanup(p_backup_confirmed boolean default false)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  if p_backup_confirmed is not true then
    raise exception 'backup_confirmation_required' using errcode='42501';
  end if;
  update public.complaints c
  set attachments = (
    select coalesce(jsonb_agg(a.value - 'dataUrl' - 'data_url'), '[]'::jsonb)
    from jsonb_array_elements(case when jsonb_typeof(c.attachments)='array' then c.attachments else '[]'::jsonb end) a(value)
  ), updated_at = timezone('utc', now())
  where c.id in (select complaint_id from public.legacy_attachment_cleanup_candidates where cleaned_at is null);
  get diagnostics v_count = row_count;
  update public.legacy_attachment_cleanup_candidates
  set cleaned_at=timezone('utc',now()), reviewed_at=coalesce(reviewed_at,timezone('utc',now()))
  where cleaned_at is null;
  return v_count;
end;
$$;

revoke all on function public.prepare_legacy_attachment_cleanup(boolean) from public, anon, authenticated;
grant execute on function public.prepare_legacy_attachment_cleanup(boolean) to service_role;

commit;
