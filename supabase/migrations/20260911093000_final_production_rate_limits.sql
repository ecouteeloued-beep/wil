begin;

create table if not exists public.api_rate_limits (
  bucket text primary key check (length(bucket) between 8 and 160),
  window_started timestamptz not null default timezone('utc', now()),
  request_count integer not null default 0 check (request_count >= 0 and request_count <= 100000),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from anon, authenticated, public;
grant select, insert, update, delete on table public.api_rate_limits to service_role;

drop function if exists public.consume_api_rate_limit(text, integer, integer);
create function public.consume_api_rate_limit(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_row public.api_rate_limits%rowtype;
begin
  if p_bucket is null or p_bucket !~ '^[a-z0-9:_-]{8,160}$'
     or p_limit < 1 or p_limit > 10000
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit parameters' using errcode = '22023';
  end if;

  insert into public.api_rate_limits(bucket, window_started, request_count, updated_at)
  values (p_bucket, v_now, 1, v_now)
  on conflict (bucket) do update
    set window_started = case
          when public.api_rate_limits.window_started + make_interval(secs => p_window_seconds) <= v_now then v_now
          else public.api_rate_limits.window_started
        end,
        request_count = case
          when public.api_rate_limits.window_started + make_interval(secs => p_window_seconds) <= v_now then 1
          when public.api_rate_limits.request_count < p_limit then public.api_rate_limits.request_count + 1
          else public.api_rate_limits.request_count
        end,
        updated_at = v_now
  returning * into v_row;

  return v_row.window_started = v_now or v_row.request_count <= p_limit;
end;
$$;

revoke all on function public.consume_api_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, integer, integer) to service_role;

-- Pin a deterministic search_path on all exposed SECURITY DEFINER functions.
alter function public.resolve_login_identifier(text) set search_path = public, extensions;
alter function public.submit_complaint(jsonb) set search_path = public, extensions;
alter function public.track_complaint(text, text, text) set search_path = public, extensions;
alter function public.list_staff_complaints() set search_path = public, extensions;
alter function public.update_complaint_workflow(text, text, text, text, uuid, jsonb) set search_path = public, extensions;
alter function public.get_my_staff_profile() set search_path = public, extensions;
alter function public.list_message_recipients() set search_path = public, extensions;
alter function public.mark_internal_message_read(uuid) set search_path = public, extensions;
alter function public.admin_reset_staff_password(uuid, text) set search_path = public, extensions;
alter function public.admin_update_staff_account(uuid, text, text, text, text, text, text, boolean) set search_path = public, extensions;
alter function public.admin_update_staff_permissions(uuid, jsonb) set search_path = public, extensions;

commit;
