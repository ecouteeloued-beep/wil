import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SystemUser, UserRole } from '../types';

const ROLE_TITLES: Record<UserRole, string> = {
  super_admin: 'المشرف التقني العام',
  wali: 'والي الولاية',
  chef_cabinet: 'الأمين العام للولاية',
  head_department: 'رئيس الديوان',
  supervisor: 'رئيس خلية الإصغاء والتكفل',
  employee: 'الموظف المكلف',
};

// These permissions are UX metadata only. Authorization is enforced by Supabase RLS/RPC.
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  wali: ['view_all', 'assign_grievance', 'draft_reply', 'approve_reply', 'manage_users', 'view_audit_logs', 'manage_settings'],
  chef_cabinet: ['view_all', 'assign_grievance', 'draft_reply', 'approve_reply', 'view_audit_logs'],
  super_admin: ['manage_users', 'view_audit_logs', 'manage_settings'],
  supervisor: ['view_department', 'assign_grievance', 'draft_reply', 'approve_reply', 'view_audit_logs'],
  head_department: ['view_department', 'assign_grievance', 'draft_reply', 'view_audit_logs'],
  employee: ['view_assigned', 'draft_reply'],
};

export async function getAuthenticatedStaff(): Promise<SystemUser | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.user) return null;

  const authUser = sessionData.session.user;
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id,username,name,email,role,department,phone,is_active')
    .eq('id', authUser.id)
    .eq('is_active', true)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    await supabase.auth.signOut();
    return null;
  }

  const role = profile.role as UserRole;
  if (!ROLE_TITLES[role]) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    id: profile.id,
    username: profile.username,
    name: profile.name,
    role,
    roleTitle: ROLE_TITLES[role],
    email: profile.email || authUser.email || '',
    phone: profile.phone || '',
    department: profile.department || '',
    status: 'نشط',
    assignedCount: 0,
    resolvedCount: 0,
    overdueCount: 0,
    lastActive: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS[role] || [],
  };
}

export { ROLE_TITLES, ROLE_PERMISSIONS };
