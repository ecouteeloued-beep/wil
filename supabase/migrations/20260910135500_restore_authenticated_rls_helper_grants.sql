-- RLS policies call these helper functions internally; authenticated staff
-- needs EXECUTE while anonymous visitors must remain blocked.
begin;
revoke execute on function public.current_staff_role() from anon, public;
grant execute on function public.current_staff_role() to authenticated;
revoke execute on function public.is_active_staff() from anon, public;
grant execute on function public.is_active_staff() to authenticated;
revoke execute on function public.can_access_complaint(uuid) from anon, public;
grant execute on function public.can_access_complaint(uuid) to authenticated;
commit;
