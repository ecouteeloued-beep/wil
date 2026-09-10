-- Private staff-to-staff messaging. Messages are visible only to sender and recipient.
create table if not exists public.internal_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.users(id) on delete cascade not null,
  recipient_id uuid references public.users(id) on delete cascade not null,
  subject text not null default '',
  body text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  read_at timestamptz,
  constraint internal_messages_distinct_participants check (sender_id <> recipient_id),
  constraint internal_messages_subject_length check (char_length(subject) <= 180),
  constraint internal_messages_body_length check (char_length(body) between 1 and 5000)
);

create index if not exists internal_messages_recipient_created_idx on public.internal_messages(recipient_id, created_at desc);
create index if not exists internal_messages_sender_created_idx on public.internal_messages(sender_id, created_at desc);
alter table public.internal_messages enable row level security;

drop policy if exists "Staff read only their private messages" on public.internal_messages;
create policy "Staff read only their private messages" on public.internal_messages
  for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists "Staff send private messages as themselves" on public.internal_messages;
create policy "Staff send private messages as themselves" on public.internal_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (select 1 from public.users u where u.id = auth.uid() and u.is_active = true)
    and exists (select 1 from public.users u where u.id = recipient_id and u.is_active = true)
  );

create or replace function public.list_message_recipients()
returns table (id uuid, name text, role text, department text)
language sql security definer set search_path = public
as $$
  select u.id, u.name, u.role, u.department
  from public.users u
  where u.is_active = true
    and u.id <> auth.uid()
    and exists (select 1 from public.users me where me.id = auth.uid() and me.is_active = true)
  order by u.name;
$$;
revoke all on function public.list_message_recipients() from public;
grant execute on function public.list_message_recipients() to authenticated;

create or replace function public.mark_internal_message_read(p_message_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  update public.internal_messages
  set read_at = coalesce(read_at, timezone('utc'::text, now()))
  where id = p_message_id and recipient_id = auth.uid();
  return found;
end;
$$;
revoke all on function public.mark_internal_message_read(uuid) from public;
grant execute on function public.mark_internal_message_read(uuid) to authenticated;
