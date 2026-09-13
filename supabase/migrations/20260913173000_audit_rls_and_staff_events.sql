begin;

drop policy if exists staff_audit_read on public.audit_logs;
create policy staff_audit_read on public.audit_logs for select to authenticated
  using (public.has_staff_permission('view_audit_logs'));
revoke insert, update, delete on public.audit_logs from anon, authenticated;

create or replace function public.admin_update_staff_account(p_user_id uuid, p_username text, p_name text, p_email text, p_phone text, p_department text, p_role text, p_is_active boolean)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.has_staff_permission('manage_users') then raise exception 'permission_required_manage_users'; end if;
  if p_role not in ('super_admin','head_department','supervisor','employee') then raise exception 'invalid_role'; end if;
  update public.users set username=nullif(trim(p_username),''), name=trim(p_name), email=lower(trim(p_email)), phone=nullif(trim(p_phone),''), department=nullif(trim(p_department),''), role=p_role, is_active=p_is_active where id=p_user_id;
  if not found then raise exception 'staff_profile_not_found'; end if;
  update auth.users set email=lower(trim(p_email)), raw_user_meta_data=coalesce(raw_user_meta_data,'{}'::jsonb)||jsonb_build_object('name',trim(p_name)) where id=p_user_id;
  insert into public.audit_logs(user_id,user_name,action,details) select auth.uid()::text,u.name,'staff_account_updated',jsonb_build_object('target_id',p_user_id,'username',p_username,'role',p_role,'department',p_department,'is_active',p_is_active) from public.users u where u.id=auth.uid();
end;
$$;
revoke all on function public.admin_update_staff_account(uuid,text,text,text,text,text,text,boolean) from public, anon;
grant execute on function public.admin_update_staff_account(uuid,text,text,text,text,text,text,boolean) to authenticated;

create or replace function public.admin_update_staff_permissions(p_user_id uuid, p_permissions jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare v_permission text;
begin
  if not public.has_staff_permission('manage_users') then raise exception 'permission_required_manage_users'; end if;
  if jsonb_typeof(p_permissions) <> 'array' then raise exception 'permissions_must_be_array'; end if;
  for v_permission in select jsonb_array_elements_text(p_permissions) loop
    if v_permission not in ('view_all','view_department','view_assigned','assign_grievance','executive_directive','approve_reply','draft_reply','export_reports','manage_users','view_audit_logs','manage_settings','internal_messages') then raise exception 'invalid_permission'; end if;
  end loop;
  update public.users set permissions=p_permissions where id=p_user_id;
  if not found then raise exception 'staff_profile_not_found'; end if;
  insert into public.audit_logs(user_id,user_name,action,details) select auth.uid()::text,u.name,'staff_permissions_updated',jsonb_build_object('target_id',p_user_id,'permissions',p_permissions) from public.users u where u.id=auth.uid();
end;
$$;
revoke all on function public.admin_update_staff_permissions(uuid,jsonb) from public, anon;
grant execute on function public.admin_update_staff_permissions(uuid,jsonb) to authenticated;

commit;
