import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { EnhancedGrievance, ComplaintStatusCode, GrievanceStatus, SystemUser, UserRole, AttachmentFile } from '../types';

export interface SupabaseComplaintRow {
  id?: string;
  tracking_id: string;
  citizen_name: string;
  national_id_encrypted?: string;
  phone_encrypted?: string;
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

  resolveLoginIdentifier: async (identifier: string): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    if (identifier.includes('@')) return identifier.trim().toLowerCase();
    const { data, error } = await supabase.rpc('resolve_login_identifier', { p_identifier: identifier.trim() });
    if (error || !Array.isArray(data) || !data[0]?.email) return null;
    return data[0].email.toLowerCase();
  },

  /** Load active staff profiles for the administrative users directory. */
  fetchStaffUsers: async (): Promise<SystemUser[]> => {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
      .from('users')
      .select('id,username,name,email,role,department,phone,is_active,created_at')
      .order('created_at', { ascending: true });
    if (error || !Array.isArray(data)) return [];
    const roleTitles: Record<string, string> = {
      wali: 'والي الولاية',
      chef_cabinet: 'الأمين العام للولاية',
      head_department: 'رئيس الديوان',
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
      phone: row.phone || '',
      department: row.department || '',
      status: row.is_active ? 'نشط' : 'معطل',
      assignedCount: 0,
      resolvedCount: 0,
      overdueCount: 0,
      lastActive: row.created_at || '',
      permissions: [],
    }));
  },

  updateStaffAccount: async (payload: {
    id: string; username: string; name: string; email: string; phone: string;
    department: string; role: UserRole; isActive: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase غير مهيأ.' };
    const { error } = await supabase.rpc('admin_update_staff_account', {
      p_user_id: payload.id, p_username: payload.username, p_name: payload.name, p_email: payload.email,
      p_phone: payload.phone, p_department: payload.department,
      p_role: payload.role, p_is_active: payload.isActive,
    });
    return error ? { success: false, error: error.message } : { success: true };
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
      
      const payload: SupabaseComplaintRow = {
        tracking_id: trackingId,
        citizen_name: complaint.fullName || 'مواطن',
        national_id_encrypted: complaint.nin || '',
        phone_encrypted: complaint.phone || '',
        category: complaint.category || 'أخرى',
        municipality: complaint.grievanceMunicipality || complaint.applicantMunicipality || 'الوادي',
        subject: complaint.subject || 'انشغال إداري',
        description: complaint.details || '',
        status: complaint.status === 'قيد المعالجة' ? 'قيد المعالجة' : (complaint.status || 'جديد'),
        priority: complaint.priority === 'عاجل' ? 'عاجل' : (complaint.priority === 'متوسط' ? 'متوسط' : 'عادي'),
        deadline: complaint.dueDate || new Date(Date.now() + 15 * 86400000).toISOString(),
        pin_hash: complaint.secretPin || '',
        attachments: complaint.attachments || [],
        created_at: complaint.createdAt || new Date().toISOString(),
        updated_at: complaint.updatedAt || new Date().toISOString()
      };

      const { error } = await supabase
        .from('complaints')
        .upsert(payload, { onConflict: 'tracking_id' });

      if (error) {
        console.warn('⚠️ Supabase complaint insert notice:', error.message);
        return { success: false, error: error.message };
      }

      console.info('✅ Complaint successfully synchronized to Supabase Cloud:', trackingId);
      return { success: true };
    } catch (err: any) {
      console.warn('⚠️ Error communicating with Supabase:', err?.message || err);
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  /**
   * Fetch all complaints from Supabase and map them to EnhancedGrievance
   */
  fetchComplaints: async (): Promise<EnhancedGrievance[]> => {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Supabase fetch complaints error:', error.message);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        return [];
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
          nin: undefined,
          fullName: row.citizen_name || 'مواطن',
          phone: '',
          email: '',
          applicantDaira: row.municipality || 'الوادي',
          applicantMunicipality: row.municipality || 'الوادي',
          applicantNeighborhood: 'حي سكني',
          subject: row.subject || 'انشغال بدون عنوان',
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
          timeline: [
            {
              id: `t-remote-${Date.now()}`,
              date: (row.created_at || new Date().toISOString()).split('T')[0],
              time: '09:00',
              author: row.citizen_name || 'مواطن',
              authorRole: 'منصة المواطن',
              action: 'تم تسجيل الانشغال ومزامنته سحابياً عبر قاعدة بيانات ولاية الوادي'
            }
          ],
          internalNotes: [],
          attachments: Array.isArray(row.attachments) ? row.attachments : []
        };
      });
    } catch (err: any) {
      console.warn('⚠️ Supabase fetch failed:', err?.message || err);
      return [];
    }
  },

  /**
   * Search for a complaint in Supabase by tracking number and phone
   */
  trackComplaint: async (trackingId: string, phone?: string): Promise<EnhancedGrievance | null> => {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const cleanId = trackingId.trim().toUpperCase();
      if (!phone) return null;
      const { data, error } = await supabase.rpc('track_complaint', {
        p_tracking_id: cleanId,
        p_phone: phone.trim(),
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
        nin: undefined,
        phone: '',
        applicantDaira: row.municipality || 'الوادي',
        applicantMunicipality: row.municipality || 'الوادي',
        applicantNeighborhood: 'حي سكني',
        subject: row.subject || 'انشغال',
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
        timeline: [
          {
            id: `t-${Date.now()}`,
            date: (row.created_at || new Date().toISOString()).split('T')[0],
            time: '09:00',
            author: row.citizen_name || 'مواطن',
            authorRole: 'مواطن',
            action: 'تم تسجيل العريضة رسمياً بالمنظومة السحابية'
          }
        ],
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
  subscribeToComplaints: (onNewComplaint: (complaint: EnhancedGrievance) => void) => {
    if (!isSupabaseConfigured || !supabase) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel('realtime_complaints_channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'complaints' },
          (payload) => {
            const row: any = payload.new;
            if (row) {
              const trackingId = row.tracking_id || row.id;
              const mapped: EnhancedGrievance = {
                id: trackingId,
                trackingNumber: trackingId,
                secretPin: row.pin_hash || '',
                statusCode: 'NEW',
                nin: row.national_id_encrypted || '',
                fullName: row.citizen_name || 'مواطن',
                phone: row.phone_encrypted || '',
                applicantDaira: row.municipality || 'الوادي',
                applicantMunicipality: row.municipality || 'الوادي',
                applicantNeighborhood: 'حي سكني',
                subject: row.subject || 'انشغال جديد',
                grievanceDaira: row.municipality || 'الوادي',
                grievanceMunicipality: row.municipality || 'الوادي',
                category: (row.category as any) || 'أخرى',
                sector: 'المعاملات الإدارية والميدانية',
                details: row.description || '',
                createdAt: row.created_at || new Date().toISOString(),
                updatedAt: row.updated_at || new Date().toISOString(),
                status: 'جديد',
                priority: (row.priority as any) || 'عادي',
                specialFlags: [],
                dueDate: row.deadline || new Date(Date.now() + 15 * 86400000).toISOString(),
                isOverdue: false,
                timeline: [
                  {
                    id: `t-rt-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
                    author: row.citizen_name || 'مواطن',
                    authorRole: 'منصة المواطن',
                    action: 'تسجيل انشغال جديد عبر البوابة (تحديث مباشر)'
                  }
                ],
                internalNotes: [],
                attachments: Array.isArray(row.attachments) ? row.attachments : []
              };
              onNewComplaint(mapped);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Failed to subscribe to realtime complaints:', e);
      return () => {};
    }
  }
};
