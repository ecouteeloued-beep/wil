begin;

create table if not exists public.staff_complaint_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null,
  tracking_id text not null,
  event_type text not null default 'created',
  municipality text,
  category text,
  status text,
  created_at timestamptz not null default now()
);

alter table public.staff_complaint_events enable row level security;
revoke all on public.staff_complaint_events from public, anon;
grant select on public.staff_complaint_events to authenticated;

drop policy if exists staff_read_complaint_events on public.staff_complaint_events;
create policy staff_read_complaint_events on public.staff_complaint_events
for select to authenticated
using (public.is_active_staff());

create or replace function public.publish_staff_complaint_event()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.staff_complaint_events (complaint_id, tracking_id, event_type, municipality, category, status)
  values (new.id, new.tracking_id, 'created', new.municipality, new.category, new.status);
  return new;
end;
$$;

 drop trigger if exists complaints_staff_event on public.complaints;
 create trigger complaints_staff_event
 after insert on public.complaints
 for each row execute function public.publish_staff_complaint_event();

create or replace function public.count_staff_complaints()
returns bigint
language sql
stable
security definer
set search_path = public, extensions
as $$
  select count(*)::bigint
  from public.complaints c
  where public.is_active_staff() and (
    public.current_staff_role() in ('wali','chef_cabinet','super_admin')
    or (public.current_staff_role() = 'head_department' and c.assigned_department = (select department from public.users where id=auth.uid()))
    or (public.current_staff_role() = 'supervisor' and (c.assigned_user_id=auth.uid() or c.assigned_department=(select department from public.users where id=auth.uid()) or c.assigned_user_id is null))
    or (public.current_staff_role() = 'employee' and c.assigned_user_id=auth.uid())
  );
$$;

revoke all on function public.count_staff_complaints() from public, anon;
grant execute on function public.count_staff_complaints() to authenticated;

alter table public.staff_complaint_events replica identity full;
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.staff_complaint_events;
  end if;
exception when duplicate_object then null;
end $$;

commit;
