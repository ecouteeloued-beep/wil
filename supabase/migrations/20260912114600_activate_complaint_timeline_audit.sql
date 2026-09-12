begin;

create or replace function public.record_complaint_timeline()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
  event jsonb;
begin
  select coalesce(u.name, 'النظام الرقمي') into actor_name
  from public.users u where u.id = auth.uid();

  if tg_op = 'INSERT' then
    if new.timeline is null or jsonb_typeof(new.timeline) <> 'array' or jsonb_array_length(new.timeline) = 0 then
      new.timeline := jsonb_build_array(jsonb_build_object(
        'id', 'tl-' || gen_random_uuid()::text,
        'date', to_char(coalesce(new.created_at, now()), 'YYYY-MM-DD'),
        'time', to_char(coalesce(new.created_at, now()), 'HH24:MI'),
        'author', 'النظام الرقمي الولائي',
        'authorRole', 'منصة المواطن',
        'action', 'تم تسجيل الانشغال',
        'note', 'تم إنشاء الملف في قاعدة البيانات المركزية.'
      ));
    end if;
    return new;
  end if;

  if new.timeline is not distinct from old.timeline and (
    new.status is distinct from old.status or
    new.priority is distinct from old.priority or
    new.assigned_department is distinct from old.assigned_department or
    new.assigned_user_id is distinct from old.assigned_user_id or
    new.official_response is distinct from old.official_response
  ) then
    event := jsonb_build_object(
      'id', 'tl-' || gen_random_uuid()::text,
      'date', to_char(now(), 'YYYY-MM-DD'),
      'time', to_char(now(), 'HH24:MI'),
      'author', coalesce(actor_name, 'النظام الرقمي'),
      'authorRole', coalesce(public.current_staff_role(), 'النظام'),
      'action', case
        when new.status is distinct from old.status then 'تغيير حالة الملف'
        when new.assigned_department is distinct from old.assigned_department or new.assigned_user_id is distinct from old.assigned_user_id then 'إسناد الملف للتكفل'
        when new.official_response is distinct from old.official_response then 'تحديث الرد الرسمي'
        else 'تحديث بيانات الملف'
      end,
      'note', jsonb_build_object(
        'old_status', old.status, 'new_status', new.status,
        'old_priority', old.priority, 'new_priority', new.priority,
        'assigned_department', new.assigned_department
      )::text
    );
    new.timeline := case when jsonb_typeof(old.timeline) = 'array' then old.timeline else '[]'::jsonb end || jsonb_build_array(event);
  end if;
  return new;
end;
$$;

drop trigger if exists complaints_timeline_audit on public.complaints;
create trigger complaints_timeline_audit
before insert or update on public.complaints
for each row execute function public.record_complaint_timeline();

commit;
