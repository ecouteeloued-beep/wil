begin;

create table if not exists public.role_permissions (
  role text not null check (role in ('super_admin','head_department','supervisor','employee')),
  permission text not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (role, permission)
);

alter table public.role_permissions enable row level security;
revoke all on public.role_permissions from public, anon, authenticated;
grant select on public.role_permissions to authenticated;
drop policy if exists role_permissions_read_active_staff on public.role_permissions;
create policy role_permissions_read_active_staff on public.role_permissions for select to authenticated using (public.is_active_staff());

insert into public.role_permissions(role, permission) values
  ('head_department','view_all'), ('head_department','view_department'), ('head_department','assign_grievance'), ('head_department','approve_reply'), ('head_department','draft_reply'), ('head_department','export_reports'), ('head_department','manage_users'), ('head_department','view_audit_logs'), ('head_department','manage_settings'),
  ('supervisor','view_department'), ('supervisor','assign_grievance'), ('supervisor','draft_reply'),
  ('employee','view_assigned'), ('employee','draft_reply'),
  ('super_admin','manage_users'), ('super_admin','manage_settings'), ('super_admin','view_audit_logs')
on conflict do nothing;

create or replace function public.has_staff_permission(p_permission text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users u where u.id=auth.uid() and u.is_active and (p_permission=any(select rp.permission from public.role_permissions rp where rp.role=u.role) or p_permission=any(select jsonb_array_elements_text(coalesce(u.permissions,'[]'::jsonb)))));
$$;
revoke all on function public.has_staff_permission(text) from public, anon;
grant execute on function public.has_staff_permission(text) to authenticated;
revoke insert, update, delete on public.users from anon, authenticated;
revoke insert, update, delete on public.role_permissions from anon, authenticated;

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
end;
$$;
revoke all on function public.admin_update_staff_permissions(uuid,jsonb) from public, anon;
grant execute on function public.admin_update_staff_permissions(uuid,jsonb) to authenticated;

commit;
