import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { EnhancedGrievance, ComplaintStatusCode, GrievanceStatus, SystemUser, UserRole, AttachmentFile } from '../types';

export interface SupabaseComplaintRow {
  id?: string;
  tracking_id: string;
  citizen_name: string;
  phone_encrypted?: string;
  citizen_phone?: string;
  category: string;
  municipality: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  deadline?: string;
  pin_hash?: string;
  created_at?: string;
  updated_at?: string;
  attachments?: AttachmentFile[];
  meta_data?: any;
}

export const SupabaseService = {
  isConfigured: (): boolean => {
    return isSupabaseConfigured && Boolean(supabase);
  },

  invokePublicGateway: async (action: string, payload: Record<string, unknown>) => {
    if (!supabase) return { data: null, error: new Error('Supabase غير مهيأ.') };
    return supabase.functions.invoke('public-gateway', { body: { action, payload } });
  },

  markComplaintViewed: async (trackingId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase غير مهيأ.' };
    const { error } = await supabase.rpc('transition_complaint', {
      p_tracking_id: trackingId.trim().toUpperCase(),
      p_target_status: 'تم الاطلاع',
      p_metadata: { source: 'staff_view' },
    });
    return error ? { success: false, error: error.message } : { success: true };
  },

  resolveLoginIdentifier: async (identifier: string): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    if (identifier.includes('@')) return identifier.trim().toLowerCase();
    const { data, error } = await SupabaseService.invokePublicGateway('resolve_login_identifier', { identifier: identifier.trim() });
    if (error || !Array.isArray(data) || !data[0]?.email) return null;
    return data[0].email.toLowerCase();
  },

  /** Load active staff profiles for the administrative users directory. */
  fetchStaffUsers: async (): Promise<SystemUser[]> => {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase.rpc('list_staff_users');
    if (error || !Array.isArray(data)) {
      console.warn('تعذر جلب قائمة الموظفين من الخادم:', error?.message || 'استجابة غير صالحة');
      return [];
    }
    const roleTitles: Record<string, string> = {
      wali: 'والي الولاية',
      chef_cabinet: 'الأمين العام للولاية',
      head_department: 'رئيس الديوان — تابع لديوان الوالي',
      supervisor: 'رئيس خلية الإصغاء والتكفل',
      employee: 'الموظف المكلف',
      super_admin: 'المشرف التقني العام',
    };
    return data.map(row => ({
      id: row.id,
      username: row.username,
      name: row.name,
      role: row.role as UserRole,
      roleTitle: roleTitles[row.role] || row.role,
      email: row.email,
      phone: '',
      department: row.department || '',
      status: row.is_active ? 'نشط' : 'معطل',
      assignedCount: 0,
      resolvedCount: 0,
      overdueCount: 0,
      lastActive: row.created_at || '',
      permissions: Array.isArray(row.permissions) ? row.permissions : [],
    }));
  },

  updateStaffAccount: async (payload: {
    id: string; username: string; name: string; email: string; phone: string;
    department: string; role: UserRole; isActive: boolean; permissions?: string[];
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase غير مهيأ.' };
    const { error } = await supabase.rpc('admin_update_staff_account', {
      p_user_id: payload.id, p_username: payload.username, p_name: payload.name, p_email: payload.email,
      p_phone: payload.phone, p_department: payload.department,
      p_role: payload.role, p_is_active: payload.isActive,
    });
    if (error) return { success: false, error: error.message };
    const { error: permissionsError } = await supabase.rpc('admin_update_staff_permissions', {
      p_user_id: payload.id,
      p_permissions: payload.permissions || [],
    });
    return permissionsError ? { success: false, error: permissionsError.message } : { success: true };
  },

  resetStaffPassword: async (userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase غير مهيأ.' };
    const { error } = await supabase.rpc('admin_reset_staff_password', {
      p_user_id: userId, p_new_password: newPassword,
    });
    return error ? { success: false, error: error.message } : { success: true };
  },

  /**
   * Insert or Upsert a complaint to Supabase remote database
   */
  insertComplaint: async (complaint: EnhancedGrievance): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase is not configured. Operates in local storage mode.' };
    }

    try {
      const trackingId = (complaint.trackingNumber || complaint.id).trim().toUpperCase();
      
      const { data, error } = await SupabaseService.invokePublicGateway('submit_complaint', {
          first_name: complaint.firstName || complaint.fullName.split(/\s+/)[0] || 'مواطن',
          last_name: complaint.lastName || complaint.fullName.split(/\s+/).slice(1).join(' '),
          birth_date: complaint.birthDate || null,
          gender: complaint.gender || null,
          phone: complaint.phone,
          email: complaint.email || null,
          category: complaint.category || 'أخرى',
          residence_daira: complaint.applicantDaira || 'الوادي',
          residence_municipality: complaint.applicantMunicipality || 'الوادي',
          full_address: complaint.applicantNeighborhood || '',
          subject: complaint.subject || 'انشغال إداري',
          description: complaint.details || '',
          meeting_request: complaint.meetingRequest || null,
          attachments: Array.isArray(complaint.attachments) ? complaint.attachments : [],
      });

      if (error) {
        console.warn('⚠️ Supabase complaint insert notice:', error.message);
        return { success: false, error: error.message };
      }

      const created = Array.isArray(data) ? data[0] : data;
      console.info('✅ Complaint successfully synchronized to Supabase Cloud:', created?.tracking_id || trackingId);
      return { success: true, data: created };
    } catch (err: any) {
      console.warn('⚠️ Error communicating with Supabase:', err?.message || err);
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  updateComplaint: async (complaint: EnhancedGrievance): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase غير مهيأ.' };
    const trackingId = (complaint.trackingNumber || complaint.id).trim().toUpperCase();
    const { error } = await supabase.rpc('update_complaint_workflow', {
      p_tracking_id: trackingId,
      p_status: complaint.status || null,
      p_priority: complaint.priority || null,
      p_assigned_department: complaint.assignedDepartment || null,
      p_assigned_user_id: complaint.assignedToId || null,
      p_official_response: complaint.officialResponse || null,
    });
    if (error) {
      console.warn('⚠️ Complaint cloud update failed:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  /**
   * Fetch all complaints from Supabase and map them to EnhancedGrievance
   */
  fetchComplaints: async (): Promise<EnhancedGrievance[]> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase غير مهيأ.');
    }

    try {
      const { data, error } = await supabase.rpc('list_staff_complaints');

      if (error) {
        console.warn('⚠️ Supabase fetch complaints error:', error.message);
        throw new Error(error.message);
      }

      if (!data || !Array.isArray(data)) {
        throw new Error('استجابة قاعدة البيانات غير صالحة.');
      }

      return data.map((row: any): EnhancedGrievance => {
        const trackingId = row.tracking_id || row.id;
        const statusArabic: GrievanceStatus = (row.status as GrievanceStatus) || 'جديد';
        
        let statusCode: ComplaintStatusCode = 'NEW';
        if (statusArabic === 'قيد المعالجة' || statusArabic === 'جاري المعالجة') statusCode = 'IN_PROGRESS';
        else if (statusArabic === 'تم الإسناد') statusCode = 'ASSIGNED';
        else if (statusArabic === 'تم الحل' || statusArabic === 'تمت المعالجة') statusCode = 'RESOLVED';
        else if (statusArabic === 'بانتظار الرد' || statusArabic === 'بانتظار المراجعة') statusCode = 'PENDING_REPLY';

        return {
          id: trackingId,
          trackingNumber: trackingId,
          secretPin: undefined,
          statusCode,
            fullName: row.citizen_name || 'مواطن',
          phone: '',
          email: '',
          applicantDaira: row.municipality || 'الوادي',
          applicantMunicipality: row.municipality || 'الوادي',
          applicantNeighborhood: row.neighborhood || '',
          subject: row.subject || 'انشغال بدون عنوان',
          meetingRequest: row.meeting_request || undefined,
          grievanceDaira: row.municipality || 'الوادي',
          grievanceMunicipality: row.municipality || 'الوادي',
          category: (row.category as any) || 'أخرى',
          sector: 'المعاملات الإدارية والميدانية',
          details: row.description || '',
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
          status: statusArabic,
          priority: (row.priority as any) || 'عادي',
          specialFlags: row.priority === 'عاجل' ? ['عاجل'] : [],
          dueDate: row.deadline || new Date(Date.now() + 15 * 86400000).toISOString(),
          isOverdue: false,
          timeline: Array.isArray(row.timeline) ? row.timeline : [],
          internalNotes: [],
          attachments: Array.isArray(row.attachments) ? row.attachments : []
        };
      });
    } catch (err: any) {
      console.warn('⚠️ Supabase fetch failed:', err?.message || err);
      throw err instanceof Error ? err : new Error(err?.message || 'تعذر جلب البيانات من Supabase.');
    }
  },

  /**
   * Search for a complaint in Supabase by tracking number and phone
   */
  trackComplaint: async (trackingId: string, phone?: string, secretPin?: string): Promise<EnhancedGrievance | null> => {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const cleanId = trackingId.trim().toUpperCase();
      if (!phone || !secretPin) return null;
      const { data, error } = await SupabaseService.invokePublicGateway('track_complaint', {
        tracking_id: cleanId,
        phone: phone.trim(),
        secret_pin: secretPin.trim(),
      });
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row) {
        return null;
      }

      const statusArabic: GrievanceStatus = (row.status as GrievanceStatus) || 'جديد';
      return {
        id: row.tracking_id || row.id,
        trackingNumber: row.tracking_id || row.id,
        secretPin: undefined,
        fullName: row.citizen_name || 'مواطن',
        phone: '',
        applicantDaira: row.municipality || 'الوادي',
        applicantMunicipality: row.municipality || 'الوادي',
        applicantNeighborhood: row.neighborhood || '',
        subject: row.subject || 'انشغال',
        meetingRequest: row.meeting_request || undefined,
        grievanceDaira: row.municipality || 'الوادي',
        grievanceMunicipality: row.municipality || 'الوادي',
        category: row.category || 'أخرى',
        sector: 'الشؤون الإدارية العامة',
        details: row.description || '',
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
        status: statusArabic,
        priority: (row.priority as any) || 'عادي',
        specialFlags: [],
        dueDate: row.deadline || new Date().toISOString(),
        isOverdue: false,
        officialResponse: row.official_response || undefined,
        timeline: Array.isArray(row.timeline) ? row.timeline : [],
        internalNotes: [],
        attachments: Array.isArray(row.attachments) ? row.attachments : []
      };
    } catch {
      return null;
    }
  },

  /**
   * Listen to real-time complaint submissions
   */
  subscribeToComplaints: (_onNewComplaint: (complaint: EnhancedGrievance) => void) => {
    // Realtime is disabled because replica payloads cannot mask sensitive columns.
    return () => {};
  }
};
