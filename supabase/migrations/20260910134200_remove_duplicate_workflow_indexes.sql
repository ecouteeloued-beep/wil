-- Keep one covering index per internal message workflow query.
begin;
drop index if exists public.internal_messages_recipient_created_at_idx;
drop index if exists public.internal_messages_sender_created_at_idx;
commit;
