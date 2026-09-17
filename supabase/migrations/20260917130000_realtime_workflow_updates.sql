begin;

create or replace function public.publish_staff_complaint_event()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.staff_complaint_events
    (complaint_id, tracking_id, event_type, municipality, category, status)
  values
    (new.id, new.tracking_id,
     case when tg_op = 'INSERT' then 'created' else 'workflow_updated' end,
     new.municipality, new.category, new.status);
  return new;
end;
$$;

drop trigger if exists complaints_staff_event on public.complaints;
create trigger complaints_staff_event
  after insert or update of status, assigned_department, assigned_user_id, official_response, timeline
  on public.complaints
  for each row execute function public.publish_staff_complaint_event();

alter table public.staff_complaint_events replica identity full;
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.staff_complaint_events;
  end if;
exception when duplicate_object then null;
end $$;

commit;

