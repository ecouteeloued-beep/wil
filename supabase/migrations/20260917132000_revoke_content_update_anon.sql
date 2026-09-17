begin;
revoke all on function public.update_complaint_content(text,text,text,text,text,text,text,jsonb) from anon, public;
grant execute on function public.update_complaint_content(text,text,text,text,text,text,text,jsonb) to authenticated;
commit;

