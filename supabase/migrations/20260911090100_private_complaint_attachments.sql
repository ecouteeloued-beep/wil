begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('complaint-attachments','complaint-attachments',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
revoke all on table storage.objects from anon, authenticated;
grant insert on table storage.objects to anon, authenticated;
grant select on table storage.objects to authenticated;
drop policy if exists complaint_attachment_insert on storage.objects;
create policy complaint_attachment_insert on storage.objects for insert to anon, authenticated
with check (bucket_id='complaint-attachments' and name !~ '[^a-zA-Z0-9._/-]' and storage.extension(name) in ('pdf','jpg','jpeg','png','webp'));
drop policy if exists complaint_attachment_staff_read on storage.objects;
create policy complaint_attachment_staff_read on storage.objects for select to authenticated
using (bucket_id='complaint-attachments' and public.is_active_staff());
commit;
