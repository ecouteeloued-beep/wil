begin;

create or replace function public.broadcast_staff_complaint_change()
returns trigger
language plpgsql
security definer
set search_path = public, realtime
as $$
declare
  v_tracking_id text;
  v_status text;
begin
  if TG_OP = 'DELETE' then
    v_tracking_id := old.tracking_id;
    v_status := old.status;
  else
    v_tracking_id := new.tracking_id;
    v_status := new.status;
  end if;

  -- This project exposes realtime.send(payload, event, topic, private),
  -- not realtime.broadcast(...). Keep the staff channel private.
  perform realtime.send(
    jsonb_build_object(
      'operation', TG_OP,
      'tracking_id', v_tracking_id,
      'status', v_status
    ),
    'complaint_change',
    'staff-complaints',
    true
  );
  return coalesce(new, old);
end;
$$;

commit;

