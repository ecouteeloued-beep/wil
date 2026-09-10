-- Production hardening: least-privilege RPC execution, fixed trigger search_path,
-- and indexes for high-volume complaint workflows.

begin;

-- Public RPCs intentionally remain available for citizen submission and tracking.
revoke all on function public.submit_complaint(jsonb) from public;
grant execute on function public.submit_complaint(jsonb) to anon, authenticated;
revoke all on function public.track_complaint(text, text, text) from public;
grant execute on function public.track_complaint(text, text, text) to anon, authenticated;

-- Administrative and internal RPCs must never be callable anonymously.
revoke all on function public.admin_reset_staff_password(uuid, text) from public;
grant execute on function public.admin_reset_staff_password(uuid, text) to authenticated;
revoke all on function public.admin_update_staff_account(uuid, text, text, text, text, text, text, boolean) from public;
grant execute on function public.admin_update_staff_account(uuid, text, text, text, text, text, text, boolean) to authenticated;
revoke all on function public.admin_update_staff_permissions(uuid, jsonb) from public;
grant execute on function public.admin_update_staff_permissions(uuid, jsonb) to authenticated;
revoke all on function public.list_message_recipients() from public;
grant execute on function public.list_message_recipients() to authenticated;
revoke all on function public.mark_internal_message_read(uuid) from public;
grant execute on function public.mark_internal_message_read(uuid) to authenticated;
revoke all on function public.transition_complaint(text, text, jsonb) from public;
grant execute on function public.transition_complaint(text, text, jsonb) to authenticated;

-- Helper functions are used by RLS and must not be exposed through the REST RPC surface.
revoke all on function public.can_access_complaint(uuid) from public;
revoke all on function public.current_staff_role() from public;
revoke all on function public.is_active_staff() from public;
revoke all on function public.hash_complaint_sensitive_fields() from public;
revoke all on function public.rls_auto_enable() from public;

-- Make the trigger function deterministic and resistant to search_path hijacking.
alter function public.handle_updated_at() set search_path = public;

-- Cover the most common foreign-key and staff workflow filters.
create index if not exists complaints_assigned_user_id_idx
  on public.complaints (assigned_user_id);
create index if not exists complaints_status_created_at_idx
  on public.complaints (status, created_at desc);
create index if not exists complaints_municipality_created_at_idx
  on public.complaints (municipality, created_at desc);
create index if not exists complaints_department_status_idx
  on public.complaints (assigned_department, status);
create index if not exists internal_notes_complaint_id_idx
  on public.internal_notes (complaint_id);
create index if not exists internal_messages_recipient_created_at_idx
  on public.internal_messages (recipient_id, created_at desc);
create index if not exists internal_messages_sender_created_at_idx
  on public.internal_messages (sender_id, created_at desc);
create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

commit;
