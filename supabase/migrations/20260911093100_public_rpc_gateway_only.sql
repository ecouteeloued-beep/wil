begin;
revoke all on function public.resolve_login_identifier(text) from public, anon, authenticated;
revoke all on function public.submit_complaint(jsonb) from public, anon, authenticated;
revoke all on function public.track_complaint(text, text, text) from public, anon, authenticated;
grant execute on function public.resolve_login_identifier(text) to service_role;
grant execute on function public.submit_complaint(jsonb) to service_role;
grant execute on function public.track_complaint(text, text, text) to service_role;
commit;
