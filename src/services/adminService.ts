import { 
  SystemUser, 
  EnhancedGrievance, 
  AuditLogEntry, 
  NotificationItem, 
  ExecutiveStats, 
  EmployeeStats, 
  UserRole,
  GrievanceStatus,
  GrievancePriority,
  TimelineEvent,
  InternalNote,
  OfficialResponse,
  SystemSettings
} from '../types';
import { MOCK_COMPLAINTS_SEED } from './complaintRepository';
import { SecurityRateLimiter, sanitizeInput } from '../utils/security';
import { SupabaseService } from './supabaseService';
import { supabase } from '../lib/supabase';

const USERS_STORAGE_KEY = 'wilaya_eloued_admin_users';
const GRIEVANCES_STORAGE_KEY = 'wilaya_eloued_admin_grievances_clean_2026';
const AUDIT_LOGS_STORAGE_KEY = 'wilaya_eloued_admin_audit_logs';
const NOTIFICATIONS_STORAGE_KEY = 'wilaya_eloued_admin_notifications';
export const SYSTEM_SETTINGS_KEY = 'wilaya_eloued_system_settings';


export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  platformName: 'منظومة وساطة المواطن والإصغاء — ولاية الوادي',
  officialEmail: 'contact@eloued.gov.dz',
  hotlinePhone: '032 21 00 00',
  legalDeadlineDays: '15',
  maintenanceMode: false,
  maintenanceNotice: 'المنظومة في وضع الصيانة التقنية المبرمجة لتحديث قواعد البيانات. يرجى معاودة المحاولة لاحقاً.',
  defaultSortOrder: 'newest',
  autoRefreshInterval: '60',
  allowCitizenAttachments: true,
  maxAttachmentSizeMB: '10',
  enableDirectDocumentReader: true,
  sessionTimeoutMins: '30',
  pinLockoutAttempts: '3',
  requirePinForSensitiveActions: true,
  auditLogRetentionMonths: '24',
  senderIdSms: 'WILAYA-ELOUED',
  autoSmsEnabled: true,
  smsOnRegister: true,
  smsOnTransfer: true,
  smsOnReply: true,
  dashboardSoundAlerts: true,
  urgentAlertEmail: true,
  templateRegister: '« ولاية الوادي: تم بنجاح تسجيل انشغالكم تحت رقم [ID]. يمكنكم متابعة مراحل المعالجة وقراءة الوثائق عبر المنصة. »',
  templateTransfer: '« ولاية الوادي: تمت إحالة ملفكم رقم [ID] إلى [المصلحة المعنية] للدراسة والمعاينة الميدانية. »',
  templateReply: '« ولاية الوادي: صدر الرد الرسمي بخصوص انشغالكم رقم [ID]. تفضلوا بزيارة المنصة للاطلاع المباشر عليه. »',
  templateDirective: '« نظراً للطابع الاستعجالي لهذا الانشغال، يُطلب من المصلحة المعنية التدخل الفوري خلال 48 ساعة وموافاتنا بتقرير كتابي مفصل. »',
  updatedAt: new Date().toISOString(),
  updatedBy: 'ديوان والي ولاية الوادي'
};

// =========================================================================
// =========================================================================
// INITIAL SEED USERS WITH DISTINCT SOVEREIGN ROLES & PERMISSIONS
// =========================================================================
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  wali: ['view_all', 'executive_directive', 'export_reports', 'view_audit_logs'],
  chef_cabinet: ['view_all', 'assign_grievance', 'export_reports', 'view_audit_logs'],
  head_department: ['view_department', 'assign_grievance', 'draft_reply', 'export_reports'],
  supervisor: ['view_all', 'assign_grievance', 'approve_reply', 'draft_reply', 'export_reports', 'manage_users'],
  employee: ['view_department', 'draft_reply'],
  super_admin: ['view_all', 'view_department', 'assign_grievance', 'executive_directive', 'approve_reply', 'draft_reply', 'export_reports', 'manage_users', 'view_audit_logs', 'manage_settings']
};

export const WILAYA_MUNICIPALITIES_22 = [
  { code: '3901', name: 'الوادي', daira: 'الوادي' },
  { code: '3902', name: 'الرباح', daira: 'الرباح' },
  { code: '3903', name: 'الرقيبة', daira: 'الرقيبة' },
  { code: '3904', name: 'الدبيلة', daira: 'الدبيلة' },
  { code: '3905', name: 'قمار', daira: 'قمار' },
  { code: '3906', name: 'حاسي خليفة', daira: 'حاسي خليفة' },
  { code: '3907', name: 'البياضة', daira: 'البياضة' },
  { code: '3908', name: 'المقرن', daira: 'المقرن' },
  { code: '3909', name: 'بن قشة', daira: 'طالب العربي' },
  { code: '3910', name: 'الطريفاوي', daira: 'حاسي خليفة' },
  { code: '3911', name: 'طالب العربي', daira: 'طالب العربي' },
  { code: '3912', name: 'سيدي عون', daira: 'المقرن' },
  { code: '3913', name: 'تغزوت', daira: 'قمار' },
  { code: '3914', name: 'ورماس', daira: 'قمار' },
  { code: '3915', name: 'كوينين', daira: 'الوادي' },
  { code: '3916', name: 'النخلة', daira: 'الرباح' },
  { code: '3917', name: 'العقلة', daira: 'الرباح' },
  { code: '3918', name: 'حمار الجبيل', daira: 'الرقيبة' },
  { code: '3919', name: 'أميه ونسة', daira: 'أميه ونسة' },
  { code: '3920', name: 'وادي العلندة', daira: 'أميه ونسة' },
  { code: '3921', name: 'حاسي بن عبد الله', daira: 'الدبيلة' },
  { code: '3922', name: 'دويلعة', daira: 'طالب العربي' }
];

export const SEED_USERS: SystemUser[] = [];

// =========================================================================
// INITIAL SEED GRIEVANCES (Authentic for Wilaya d'El Oued)
// =========================================================================
export const SEED_GRIEVANCES: EnhancedGrievance[] = [];

// =========================================================================
// INITIAL SEED AUDIT LOGS
// =========================================================================
export const SEED_AUDIT_LOGS: AuditLogEntry[] = [];

// =========================================================================
// INITIAL SEED NOTIFICATIONS
// =========================================================================
export const SEED_NOTIFICATIONS: NotificationItem[] = [];

// =========================================================================
// ADMIN SERVICE IMPLEMENTATION
// =========================================================================

export const AdminService = {
  // --- USERS & SESSION ---
  getUsers: (): SystemUser[] => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed: SystemUser[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if seed users (like wali or sg) need to be merged if missing
          const existingIds = new Set(parsed.map(u => u.id));
          const missingSeed = SEED_USERS.filter(su => !existingIds.has(su.id));
          if (missingSeed.length > 0) {
            const merged = [...parsed, ...missingSeed];
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  },

  getCurrentUser: (): SystemUser | null => {
    // Privileged identity comes from Supabase Auth and the active users profile.
    return null;
  },

  setCurrentUser: (_user: SystemUser): void => {},

  switchUserById: (userId: string): SystemUser | null => {
    const users = AdminService.getUsers();
    const user = users.find(u => u.id === userId) || null;
    if (!user) return null;
    AdminService.setCurrentUser(user);
    return user;
  },

  // Official PIN Authentication for /admin
  verifyPin: (_role: UserRole, _pin: string): boolean => false,

  loginWithPinAndRole: (_role: UserRole, _pin: string) => ({ success: false, error: 'استخدم مصادقة Supabase Auth.' }),

  isAdminLoggedIn: (): boolean => {
    return false;
  },

  setAdminLoggedIn: (_status: boolean): void => {},

  logoutAdmin: (): void => {
    void supabase?.auth.signOut();
  },

  loginWithPinUniversal: (_pin: string) => ({ success: false, error: 'استخدم مصادقة Supabase Auth.' }),

  addUser: (userData: Omit<SystemUser, 'id' | 'assignedCount' | 'resolvedCount' | 'overdueCount' | 'lastActive'>, actor: SystemUser): SystemUser => {
    const users = AdminService.getUsers();
    const newUser: SystemUser = {
      ...userData,
      id: `usr-emp-${Date.now()}`,
      assignedCount: 0,
      resolvedCount: 0,
      overdueCount: 0,
      lastActive: 'نشط حديثاً',
      permissions: userData.role === 'employee' 
        ? ['view_assigned', 'process', 'draft_response', 'add_notes', 'request_info']
        : userData.role === 'supervisor'
        ? ['view_all', 'assign', 'approve', 'manage_staff', 'reports', 'audit_log', 'settings']
        : ['all', 'super_admin_map', 'view_all', 'reports', 'audit_log', 'manage_staff', 'settings'],
    };
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إضافة موظف جديد',
      targetId: newUser.id,
      targetType: 'موظف',
      newValue: `${newUser.name} (${newUser.roleTitle})`,
      details: `قام ${actor.name} بإضافة المستخدم ${newUser.name} وتعيينه في ${newUser.department}.`
    });

    return newUser;
  },

  updateUser: (id: string, updates: Partial<SystemUser>, actor?: SystemUser): SystemUser | null => {
    const users = AdminService.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    const old = users[idx];
    const updated = { ...old, ...updates };
    users[idx] = updated;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    if (actor) {
      AdminService.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.roleTitle,
        action: 'تعديل بيانات موظف',
        targetId: id,
        targetType: 'موظف',
        previousValue: `${old.name} - ${old.status}`,
        newValue: `${updated.name} - ${updated.status}`,
        details: `قام ${actor.name} بتعديل بيانات المستخدم ${old.name}.`
      });
    }

    return updated;
  },

  setUserPin: (userId: string, newPin: string, actor?: SystemUser): boolean => {
    const users = AdminService.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    users[idx].pinCode = newPin.trim();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    if (actor) {
      AdminService.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.roleTitle,
        action: 'تغيير الرمز السري PIN لموظف',
        targetId: userId,
        targetType: 'موظف',
        details: `تم تحديث رمز PIN للمستخدم ${users[idx].name} بنجاح.`
      });
    }
    return true;
  },

  deleteUser: (id: string, actor?: SystemUser): boolean => {
    const users = AdminService.getUsers();
    const target = users.find(u => u.id === id);
    const updated = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));

    if (actor && target) {
      AdminService.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.roleTitle,
        action: 'حذف حساب موظف',
        targetId: id,
        targetType: 'موظف',
        previousValue: `${target.name} (${target.roleTitle})`,
        details: `قام ${actor.name} بحذف حساب المستخدم ${target.name} نهائياً من المنظومة.`
      });
    }

    return true;
  },

  toggleUserStatus: (id: string, actor: SystemUser): SystemUser | null => {
    const users = AdminService.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const user = users[idx];
    const newStatus: 'نشط' | 'معطل' = user.status === 'نشط' ? 'معطل' : 'نشط';
    user.status = newStatus;
    users[idx] = user;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: newStatus === 'نشط' ? 'إعادة تفعيل حساب' : 'تعطيل حساب موظف',
      targetId: id,
      targetType: 'موظف',
      previousValue: newStatus === 'نشط' ? 'معطل' : 'نشط',
      newValue: newStatus,
      details: `تم ${newStatus === 'نشط' ? 'إعادة تفعيل' : 'تعطيل'} حساب المستخدم ${user.name} بواسطة ${actor.name}.`
    });

    return user;
  },

  // --- GRIEVANCES & RBAC FILTERING ---
  getAllGrievances: (): EnhancedGrievance[] => {
    try {
      // 1. Get admin grievances
      let grievances: EnhancedGrievance[] = [];
      const stored = localStorage.getItem(GRIEVANCES_STORAGE_KEY);
      if (stored) {
        grievances = JSON.parse(stored);
      } else {
        grievances = [];
        localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));
      }

      // 2. Synchronize with citizen submissions from `wilaya_eloued_grievances`
      const citizenRaw = localStorage.getItem('wilaya_eloued_grievances');
      if (citizenRaw) {
        const citizenSubmissions = JSON.parse(citizenRaw);
        let hasNew = false;
        for (const sub of citizenSubmissions) {
          const exists = grievances.some(g => g.id === sub.id);
          if (!exists) {
            const newEnhanced: EnhancedGrievance = {
              id: sub.id,
              nin: sub.nin || '',
              fullName: sub.fullName || 'مواطن',
              phone: sub.phone || '',
              applicantDaira: sub.applicantDaira || 'الوادي',
              applicantMunicipality: sub.applicantMunicipality || 'الوادي',
              applicantNeighborhood: sub.applicantNeighborhood || 'حي سكني',
              subject: sub.subject || 'انشغال إداري',
              grievanceDaira: sub.grievanceDaira || sub.applicantDaira || 'الوادي',
              grievanceMunicipality: sub.grievanceMunicipality || sub.applicantMunicipality || 'الوادي',
              category: sub.category || 'أخرى',
              sector: 'الشؤون الإدارية العامة',
              details: sub.details || '',
              createdAt: sub.createdAt || new Date().toISOString(),
              updatedAt: sub.createdAt || new Date().toISOString(),
              status: 'جديد',
              priority: 'متوسط',
              specialFlags: [],
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              isOverdue: false,
              timeline: [
                {
                  id: `t-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
                  author: sub.fullName || 'مواطن',
                  authorRole: 'مواطن',
                  action: 'تم تسجيل الانشغال عبر البوابة الإلكترونية'
                }
              ],
              internalNotes: [],
              attachments: []
            };
            grievances.unshift(newEnhanced);
            hasNew = true;
          }
        }
        if (hasNew) {
          localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));
        }
      }

      return grievances;
    } catch {
      return [];
    }
  },

  addGrievanceDirectly: (newGrievance: EnhancedGrievance): EnhancedGrievance => {
    try {
      const grievances = AdminService.getAllGrievances();
      const cleanId = newGrievance.id.trim().toUpperCase();
      const existingIdx = grievances.findIndex(g => 
        g.id.toUpperCase() === cleanId || 
        (g.trackingNumber && g.trackingNumber.toUpperCase() === cleanId)
      );

      if (existingIdx !== -1) {
        grievances[existingIdx] = { ...grievances[existingIdx], ...newGrievance };
      } else {
        grievances.unshift(newGrievance);
      }

      localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));

      // Create instant notification for dashboard users
      try {
        const storedNotifs = localStorage.getItem('wilaya_eloued_notifications');
        const notifs = storedNotifs ? JSON.parse(storedNotifs) : [];
        const newNotif = {
          id: `notif-${Date.now()}`,
          title: 'عريضة جديدة واردة عبر البوابة الرقمية',
          message: `تم إيداع عريضة جديدة للمواطن (${newGrievance.fullName}) برقم ${newGrievance.id} في قطاع (${newGrievance.category}).`,
          targetRole: 'supervisor',
          grievanceId: newGrievance.id,
          read: false,
          createdAt: new Date().toISOString(),
          type: newGrievance.priority === 'عاجل' ? 'urgent' : 'assignment'
        };
        localStorage.setItem('wilaya_eloued_notifications', JSON.stringify([newNotif, ...notifs]));
      } catch (err) {
        console.warn('Error saving notification:', err);
      }

      // Log system audit
      try {
        AdminService.logAudit({
          userId: 'portal_system',
          userName: newGrievance.fullName || 'مواطن',
          userRole: 'مواطن',
          action: 'تسجيل عريضة عبر البوابة',
          targetId: newGrievance.id,
          targetType: 'انشغال',
          newValue: `${newGrievance.subject} (${newGrievance.category})`,
          details: `تم إيداع عريضة جديدة بنجاح وتوليد رقم التتبع ${newGrievance.id}.`
        });
      } catch (err) {
        console.warn('Error logging audit:', err);
      }

      // Notify open dashboard tabs/components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('complaints_updated', { detail: { complaint: newGrievance } }));
      }

      return newGrievance;
    } catch (e) {
      console.error('Failed to add grievance directly:', e);
      return newGrievance;
    }
  },

  syncWithSupabase: async (): Promise<{ total: number; newAdded: number }> => {
    try {
      if (!SupabaseService.isConfigured()) {
        return { total: 0, newAdded: 0 };
      }

      const remoteComplaints = await SupabaseService.fetchComplaints();
      if (!remoteComplaints || remoteComplaints.length === 0) {
        return { total: 0, newAdded: 0 };
      }

      const grievances = AdminService.getAllGrievances();
      const existingIds = new Set(grievances.map(g => (g.trackingNumber || g.id).toUpperCase()));
      let added = 0;

      for (const remote of remoteComplaints) {
        const remoteId = (remote.trackingNumber || remote.id).toUpperCase();
        if (!existingIds.has(remoteId)) {
          grievances.unshift(remote);
          existingIds.add(remoteId);
          added++;
        }
      }

      if (added > 0) {
        localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('complaints_updated', { detail: { count: added } }));
        }
      }

      return { total: remoteComplaints.length, newAdded: added };
    } catch (e) {
      console.warn('Sync with Supabase encountered an error:', e);
      return { total: 0, newAdded: 0 };
    }
  },

  getGrievances: (): EnhancedGrievance[] => {
    return AdminService.getAllGrievances();
  },

  toggleSaveGrievance: (id: string, actor?: SystemUser): boolean => {
    const grievances = AdminService.getAllGrievances();
    const idx = grievances.findIndex(g => g.id === id);
    if (idx === -1) return false;

    const currentSaved = !!grievances[idx].isSaved;
    const newSaved = !currentSaved;
    grievances[idx].isSaved = newSaved;
    grievances[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));

    if (actor) {
      AdminService.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.roleTitle,
        action: newSaved ? 'حفظ انشغال في قائمة المتابعة' : 'إلغاء حفظ الانشغال',
        targetId: id,
        targetType: 'انشغال',
        details: `${newSaved ? 'قام بحفظ' : 'قام بإلغاء حفظ'} الانشغال رقم ${id} في قائمة المتابعة الخاصة.`
      });
    }

    return newSaved;
  },

  searchGrievancesDetailed: (
    query: string,
    mode: 'all' | 'id' | 'name' | 'keyword' = 'all',
    user?: SystemUser
  ): { item: EnhancedGrievance; matchReason: 'id' | 'name' | 'keyword'; matchText: string }[] => {
    const list = user ? AdminService.getGrievancesForUser(user) : AdminService.getAllGrievances();
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: { item: EnhancedGrievance; matchReason: 'id' | 'name' | 'keyword'; matchText: string }[] = [];

    for (const item of list) {
      const idMatch = item.id.toLowerCase().includes(q) || (item.trackingNumber && item.trackingNumber.toLowerCase().includes(q));
      const nameMatch = item.fullName?.toLowerCase().includes(q);
      
      const keywordFields = [
        item.subject,
        item.details,
        item.category,
        item.sector,
        item.grievanceMunicipality,
        item.applicantMunicipality,
        item.assignedDepartment,
        ...(item.internalNotes?.map(n => n.text) || []),
        item.officialResponse?.text || ''
      ].filter(Boolean);

      const keywordMatch = keywordFields.some(txt => txt.toLowerCase().includes(q));

      if (mode === 'id' && idMatch) {
        results.push({ item, matchReason: 'id', matchText: item.id });
      } else if (mode === 'name' && nameMatch) {
        results.push({ item, matchReason: 'name', matchText: item.fullName });
      } else if (mode === 'keyword' && keywordMatch) {
        results.push({ item, matchReason: 'keyword', matchText: item.subject });
      } else if (mode === 'all') {
        if (idMatch) {
          results.push({ item, matchReason: 'id', matchText: item.id });
        } else if (nameMatch) {
          results.push({ item, matchReason: 'name', matchText: item.fullName });
        } else if (keywordMatch) {
          results.push({ item, matchReason: 'keyword', matchText: item.subject });
        }
      }
    }

    return results;
  },

  getSavedSearches: (): { id: string; name: string; query: string; mode: string; date: string }[] => {
    try {
      const data = localStorage.getItem('wilaya_saved_searches');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSearchQuery: (name: string, query: string, mode: string = 'all'): boolean => {
    try {
      const current = AdminService.getSavedSearches();
      const newEntry = {
        id: `srch-${Date.now()}`,
        name: name.trim() || query.trim(),
        query: query.trim(),
        mode,
        date: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('wilaya_saved_searches', JSON.stringify([newEntry, ...current]));
      return true;
    } catch {
      return false;
    }
  },

  deleteSavedSearch: (id: string): boolean => {
    try {
      const current = AdminService.getSavedSearches();
      const updated = current.filter(s => s.id !== id);
      localStorage.setItem('wilaya_saved_searches', JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  updateGrievance: (id: string, updates: Partial<EnhancedGrievance>, actor?: SystemUser): EnhancedGrievance | null => {
    const grievances = AdminService.getAllGrievances();
    const idx = grievances.findIndex(g => g.id === id);
    if (idx === -1) return null;

    const old = grievances[idx];
    const updated: EnhancedGrievance = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    grievances[idx] = updated;
    localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));

    if (actor) {
      AdminService.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.roleTitle,
        action: 'تحديث بيانات الانشغال',
        targetId: id,
        targetType: 'انشغال',
        details: `قام ${actor.name} بتحديث حالة أو تفاصيل الملف ${id}.`
      });
    }

    return updated;
  },

  getGrievancesForUser: (user: SystemUser): EnhancedGrievance[] => {
    const all = AdminService.getAllGrievances();
    // RBAC Rule 1: Employee sees only their assigned files
    if (user.role === 'employee') {
      return all.filter(g => g.assignedToId === user.id);
    }
    // Supervisor, Super Admin, Viewer see all files
    return all;
  },

  getGrievanceById: (id: string, user: SystemUser): EnhancedGrievance | null => {
    const all = AdminService.getAllGrievances();
    const g = all.find(item => item.id === id);
    if (!g) return null;

    // RBAC check: Employee cannot access files not assigned to them
    if (user.role === 'employee' && g.assignedToId !== user.id) {
      return null;
    }
    return g;
  },

  // Save changes to grievances store and recalculate employee counters
  saveGrievances: (grievances: EnhancedGrievance[]): void => {
    localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));
    
    // Update user stats
    const users = AdminService.getUsers();
    let usersUpdated = false;
    for (const u of users) {
      if (u.role === 'employee') {
        const assigned = grievances.filter(g => g.assignedToId === u.id);
        const resolved = assigned.filter(g => g.status === 'تمت المعالجة' || g.status === 'مغلق').length;
        const overdue = assigned.filter(g => g.isOverdue).length;
        if (u.assignedCount !== assigned.length || u.resolvedCount !== resolved || u.overdueCount !== overdue) {
          u.assignedCount = assigned.length;
          u.resolvedCount = resolved;
          u.overdueCount = overdue;
          usersUpdated = true;
        }
      }
    }
    if (usersUpdated) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  },

  // --- ACTIONS WITH STRICT RBAC ---

  // 1. Assign / Reassign (Supervisor / Super Admin only)
  assignGrievance: (
    grievanceId: string, 
    employeeId: string, 
    instructions: string, 
    actor: SystemUser
  ): boolean => {
    if (actor.role !== 'supervisor' && actor.role !== 'super_admin') {
      throw new Error('غير مصرح: عملية إسناد الانشغال محصورة بالمسؤول الإداري فقط.');
    }

    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    const users = AdminService.getUsers();
    const emp = users.find(u => u.id === employeeId);

    if (!g || !emp) return false;

    const previousAssignee = g.assignedToName || 'غير مسند';
    g.assignedToId = emp.id;
    g.assignedToName = emp.name;
    g.assignedDepartment = emp.department;
    g.assignedAt = new Date().toISOString();
    g.status = 'تم الإسناد';
    g.updatedAt = new Date().toISOString();

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    g.timeline.push({
      id: `t-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      author: actor.name,
      authorRole: actor.roleTitle,
      action: previousAssignee === 'غير مسند' ? 'تم توجيهه وإسناده للموظف المختص' : 'تمت إعادة الإسناد لموظف آخر',
      note: instructions ? `الملاحظات والتوجيهات: ${instructions}` : `تم الإسناد للموظف ${emp.name}`,
      statusFrom: g.status,
      statusTo: 'تم الإسناد'
    });

    AdminService.saveGrievances(grievances);

    // Audit Log
    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إسناد انشغال',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: previousAssignee,
      newValue: emp.name,
      details: `قام ${actor.name} بإسناد الانشغال ${g.id} إلى الموظف ${emp.name} (${emp.department}).`
    });

    // Notify the employee
    AdminService.addNotification({
      title: 'انشغال جديد مسند إليك',
      message: `قام مسؤول الخلية بإسناد الانشغال ${g.id} إليك بشأن "${g.subject}".`,
      targetUserId: emp.id,
      grievanceId: g.id,
      type: 'assignment'
    });

    return true;
  },

  // 2. Start Processing (Employee assigned to it or Supervisor)
  startProcessing: (grievanceId: string, actor: SystemUser): boolean => {
    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    if (actor.role === 'employee' && g.assignedToId !== actor.id) {
      throw new Error('غير مصرح: لا يمكنك معالجة انشغال غير مسند إليك.');
    }

    g.status = 'قيد المعالجة';
    g.updatedAt = new Date().toISOString();

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'بدأت المعالجة والتحري الإداري',
      note: 'تم فتح الملف والمباشرة في دراسة المعطيات والاتصال بالمصالح المعنية.',
      statusFrom: 'تم الإسناد',
      statusTo: 'قيد المعالجة'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'بدء معالجة انشغال',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: 'تم الإسناد',
      newValue: 'قيد المعالجة',
      details: `باشر ${actor.name} معالجة الانشغال ${g.id}.`
    });

    return true;
  },

  // 3. Add Internal Note
  addInternalNote: (grievanceId: string, text: string, actor: SystemUser): boolean => {
    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    if (actor.role === 'employee' && g.assignedToId !== actor.id) {
      throw new Error('غير مصرح: لا تملك صلاحية إضافة ملاحظات على هذا الملف.');
    }

    const note: InternalNote = {
      id: `note-${Date.now()}`,
      author: actor.name,
      authorRole: actor.roleTitle,
      createdAt: new Date().toISOString(),
      text
    };

    g.internalNotes.push(note);
    g.updatedAt = new Date().toISOString();

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إضافة ملاحظة داخلية',
      targetId: g.id,
      targetType: 'انشغال',
      details: `سجل ${actor.name} ملاحظة داخلية على الملف ${g.id}.`
    });

    return true;
  },

  // 4. Request Additional Info from Citizen
  requestAdditionalInfo: (grievanceId: string, requestText: string, actor: SystemUser): boolean => {
    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    if (actor.role === 'employee' && g.assignedToId !== actor.id) {
      throw new Error('غير مصرح.');
    }

    const prevStatus = g.status;
    g.status = 'بانتظار معلومات';
    g.specialFlags = Array.from(new Set([...g.specialFlags]));
    g.updatedAt = new Date().toISOString();

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'تم طلب معلومات أو وثائق تكميلية من المواطن',
      note: requestText,
      statusFrom: prevStatus,
      statusTo: 'بانتظار معلومات'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'طلب معلومات إضافية',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevStatus,
      newValue: 'بانتظار معلومات',
      details: `طلب ${actor.name} معلومات تكميلية من المواطن في الملف ${g.id}: ${requestText}`
    });

    return true;
  },

  // 5. Submit Draft Response for Review (Employee)
  submitDraftResponse: (grievanceId: string, responseText: string, actor: SystemUser): boolean => {
    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    if (actor.role === 'employee' && g.assignedToId !== actor.id) {
      throw new Error('غير مصرح.');
    }

    const prevStatus = g.status;
    g.status = 'بانتظار المراجعة';
    g.updatedAt = new Date().toISOString();

    g.officialResponse = {
      text: responseText,
      preparedBy: actor.name,
      preparedAt: new Date().toISOString(),
      approved: false
    };

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'تم إعداد مسودة الرد وإحالتها للمراجعة',
      note: 'تم إعداد الرد النهائي بناءً على إفادات القطاع المعني وإحالته لاعتماد مسؤول الخلية.',
      statusFrom: prevStatus,
      statusTo: 'بانتظار المراجعة'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إعداد رد وإحالته للمراجعة',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevStatus,
      newValue: 'بانتظار المراجعة',
      details: `قام ${actor.name} بإعداد مسودة رد على الانشغال ${g.id} وإحالته للمراجعة والاعتماد.`
    });

    // Notify Supervisor
    AdminService.addNotification({
      title: 'رد جديد بانتظار الاعتماد',
      message: `أتم الموظف ${actor.name} الرد على الملف ${g.id} وينتظر مراجعتكم.`,
      targetRole: 'supervisor',
      grievanceId: g.id,
      type: 'review'
    });

    return true;
  },

  // 6. Approve Response and Close (Supervisor / Super Admin)
  approveResponseAndClose: (
    grievanceId: string, 
    letterNumber: string, 
    revisedText: string | undefined, 
    actor: SystemUser
  ): boolean => {
    if (actor.role !== 'supervisor' && actor.role !== 'super_admin') {
      throw new Error('غير مصرح: اعتماد الردود وغلق الملفات محصور بمسؤول الخلية.');
    }

    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g || !g.officialResponse) return false;

    const prevStatus = g.status;
    g.status = 'مغلق';
    g.updatedAt = new Date().toISOString();

    if (revisedText) {
      g.officialResponse.text = revisedText;
    }
    g.officialResponse.reviewedBy = actor.name;
    g.officialResponse.reviewedAt = new Date().toISOString();
    g.officialResponse.approved = true;
    g.officialResponse.letterNumber = letterNumber || `2026/خ.إ/${Math.floor(100 + Math.random() * 900)}`;

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'تم اعتماد الرد وغلق الانشغال',
      note: `تم اعتماد الرد رسمياً تحت رقم المراسلة: ${g.officialResponse.letterNumber}. الملف مغلق ومحفوظ.`,
      statusFrom: prevStatus,
      statusTo: 'مغلق'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'اعتماد رد وغلق انشغال',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevStatus,
      newValue: 'مغلق ومسوى',
      details: `اعتمد ${actor.name} الرد على الانشغال ${g.id} تحت رقم ${g.officialResponse.letterNumber} وقام بغلق الملف.`
    });

    // Notify assigned employee if exists
    if (g.assignedToId) {
      AdminService.addNotification({
        title: 'تم اعتماد الرد وغلق الملف',
        message: `اعتمد مسؤول الخلية الرد على الملف ${g.id} وتم غلقه رسمياً.`,
        targetUserId: g.assignedToId,
        grievanceId: g.id,
        type: 'info'
      });
    }

    return true;
  },

  // 7. Return Response to Employee for Revision (Supervisor)
  returnResponseToEmployee: (grievanceId: string, revisionNotes: string, actor: SystemUser): boolean => {
    if (actor.role !== 'supervisor' && actor.role !== 'super_admin') {
      throw new Error('غير مصرح.');
    }

    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    const prevStatus = g.status;
    g.status = 'قيد المعالجة';
    g.updatedAt = new Date().toISOString();

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'تمت إعادة الملف للموظف لتعديل الرد أو استكمال المعطيات',
      note: `ملاحظات المسؤول: ${revisionNotes}`,
      statusFrom: prevStatus,
      statusTo: 'قيد المعالجة'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إعادة ملف للموظف للمراجعة',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevStatus,
      newValue: 'قيد المعالجة',
      details: `أعاد ${actor.name} الملف ${g.id} للموظف مع ملاحظات: ${revisionNotes}`
    });

    if (g.assignedToId) {
      AdminService.addNotification({
        title: 'إعادة ملف لمراجعة الرد',
        message: `قام مسؤول الخلية بإعادة الملف ${g.id} إليك لإعادة صياغة الرد: ${revisionNotes}`,
        targetUserId: g.assignedToId,
        grievanceId: g.id,
        type: 'review'
      });
    }

    return true;
  },

  // 8. Change Priority (Supervisor / Super Admin)
  updatePriority: (grievanceId: string, priority: GrievancePriority, actor: SystemUser): boolean => {
    if (actor.role !== 'supervisor' && actor.role !== 'super_admin') {
      throw new Error('غير مصرح: تغيير الأولوية محصور بالمسؤول.');
    }

    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    const prevPriority = g.priority;
    g.priority = priority;
    g.updatedAt = new Date().toISOString();

    if (priority === 'عاجل' || priority === 'قصوى') {
      if (!g.specialFlags.includes('عاجل')) g.specialFlags.push('عاجل');
    }

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'تغيير أولوية الانشغال',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevPriority,
      newValue: priority,
      details: `غير ${actor.name} أولوية الملف ${g.id} من ${prevPriority} إلى ${priority}.`
    });

    return true;
  },

  // 9. Reopen Grievance (Supervisor / Super Admin)
  reopenGrievance: (grievanceId: string, reason: string, actor: SystemUser): boolean => {
    if (actor.role !== 'supervisor' && actor.role !== 'super_admin') {
      throw new Error('غير مصرح.');
    }

    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    const prevStatus = g.status;
    g.status = 'قيد المعالجة';
    g.updatedAt = new Date().toISOString();

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'تمت إعادة فتح الملف بناءً على معطيات جديدة',
      note: `سبب إعادة الفتح: ${reason}`,
      statusFrom: prevStatus,
      statusTo: 'قيد المعالجة'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إعادة فتح انشغال مغلق',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevStatus,
      newValue: 'قيد المعالجة',
      details: `قام ${actor.name} بإعادة فتح الملف ${g.id} للسبب: ${reason}`
    });

    return true;
  },

  // --- STATS & ANALYTICS ---

  // Executive Stats for Supervisor Dashboard
  getExecutiveStats: (): ExecutiveStats => {
    const grievances = AdminService.getAllGrievances();
    const total = grievances.length;
    const newUnassigned = grievances.filter(g => g.status === 'جديد').length;
    const inProgress = grievances.filter(g => g.status === 'قيد المعالجة' || g.status === 'تم الإسناد').length;
    const pendingReview = grievances.filter(g => g.status === 'بانتظار المراجعة').length;
    const pendingInfo = grievances.filter(g => g.status === 'بانتظار معلومات').length;
    const resolved = grievances.filter(g => g.status === 'تمت المعالجة').length;
    const closed = grievances.filter(g => g.status === 'مغلق').length;
    const overdue = grievances.filter(g => g.isOverdue).length;
    const urgent = grievances.filter(g => g.priority === 'عاجل' || g.priority === 'قصوى').length;

    const resolvedOrClosed = resolved + closed;
    const resolutionRate = total > 0 ? Math.round((resolvedOrClosed / total) * 100) : 0;

    // By municipality distribution
    const munMap: Record<string, number> = {};
    for (const g of grievances) {
      const m = g.grievanceMunicipality || 'أخرى';
      munMap[m] = (munMap[m] || 0) + 1;
    }
    const byMunicipality = Object.entries(munMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // By category
    const catMap: Record<string, number> = {};
    for (const g of grievances) {
      const c = g.category || 'أخرى';
      catMap[c] = (catMap[c] || 0) + 1;
    }
    const byCategory = Object.entries(catMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // By sector
    const secMap: Record<string, number> = {};
    for (const g of grievances) {
      const s = g.sector || 'قطاعات أخرى';
      secMap[s] = (secMap[s] || 0) + 1;
    }
    const bySector = Object.entries(secMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const weeklyTrend: Array<{ day: string; received: number; resolved: number }> = [];

    return {
      total,
      newUnassigned,
      inProgress,
      pendingReview,
      pendingInfo,
      resolved,
      closed,
      overdue,
      urgent,
      resolutionRate,
      averageResolutionDays: 0,
      byMunicipality,
      byCategory,
      bySector,
      weeklyTrend
    };
  },

  // Employee Stats for Employee Dashboard ("ماذا يجب أن أعالج الآن؟")
  getEmployeeStats: (employeeId: string): EmployeeStats => {
    const all = AdminService.getAllGrievances();
    const assigned = all.filter(g => g.assignedToId === employeeId);
    const assignedTotal = assigned.length;
    const newAssigned = assigned.filter(g => g.status === 'تم الإسناد').length;
    const inProgress = assigned.filter(g => g.status === 'قيد المعالجة').length;
    const pendingInfo = assigned.filter(g => g.status === 'بانتظار معلومات').length;
    const pendingReview = assigned.filter(g => g.status === 'بانتظار المراجعة').length;
    const resolvedOrClosed = assigned.filter(g => g.status === 'تمت المعالجة' || g.status === 'مغلق').length;
    const overdue = assigned.filter(g => g.isOverdue).length;
    const completionRate = assignedTotal > 0 ? Math.round((resolvedOrClosed / assignedTotal) * 100) : 100;

    return {
      assignedTotal,
      newAssigned,
      inProgress,
      pendingInfo,
      pendingReview,
      resolvedOrClosed,
      overdue,
      completionRate,
      avgResponseDays: 0
    };
  },

  // --- AUDIT LOGS ---
  getAuditLogs: (limit = 100): AuditLogEntry[] => {
    try {
      const stored = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored).slice(0, limit);
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS.slice(0, limit);
    } catch {
      return [];
    }
  },

  logAudit: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void => {
    try {
      const logs = AdminService.getAuditLogs(200);
      const newEntry: AuditLogEntry = {
        ...entry,
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      logs.unshift(newEntry);
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // ignore
    }
  },

  // --- NOTIFICATIONS ---
  getNotificationsForUser: (user: SystemUser): NotificationItem[] => {
    try {
      let notifs: NotificationItem[] = [];
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        notifs = JSON.parse(stored);
      } else {
        notifs = SEED_NOTIFICATIONS;
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
      }

      return notifs.filter(n => {
        if (n.targetUserId === user.id) return true;
        if (n.targetRole === 'all') return true;
        if (n.targetRole === user.role) return true;
        if (user.role === 'super_admin') return true;
        return false;
      });
    } catch {
      return SEED_NOTIFICATIONS;
    }
  },

  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): void => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const notifs: NotificationItem[] = stored ? JSON.parse(stored) : SEED_NOTIFICATIONS;
      const newNotif: NotificationItem = {
        ...item,
        id: `notif-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false
      };
      notifs.unshift(newNotif);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
    } catch {
      // ignore
    }
  },

  markNotificationAsRead: (id: string): void => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!stored) return;
      const notifs: NotificationItem[] = JSON.parse(stored);
      const n = notifs.find(item => item.id === id);
      if (n) {
        n.read = true;
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
      }
    } catch {
      // ignore
    }
  },

  markAllNotificationsAsRead: (user: SystemUser): void => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!stored) return;
      const notifs: NotificationItem[] = JSON.parse(stored);
      for (const n of notifs) {
        if (n.targetUserId === user.id || n.targetRole === user.role || n.targetRole === 'all') {
          n.read = true;
        }
      }
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
    } catch {
      // ignore
    }
  },

  // --- EXPORT TO CSV ---
  exportGrievancesCSV: (grievances: EnhancedGrievance[]): void => {
    const headers = [
      'رقم الانشغال',
      'اسم المواطن',
      'رقم الهاتف',
      'البلدية المعنية',
      'الدائرة المعنية',
      'نوع الانشغال',
      'القطاع المختص',
      'الموضوع',
      'الحالة',
      'الأولوية',
      'الموظف المسند إليه',
      'تاريخ الإرسال',
      'آخر تحديث',
      'متأخر؟'
    ];

    const rows = grievances.map(g => [
      `"${g.id}"`,
      `"${g.fullName}"`,
      `"${g.phone}"`,
      `"${g.grievanceMunicipality}"`,
      `"${g.grievanceDaira}"`,
      `"${g.category}"`,
      `"${g.sector}"`,
      `"${g.subject.replace(/"/g, '""')}"`,
      `"${g.status}"`,
      `"${g.priority}"`,
      `"${g.assignedToName || 'غير مسند'}"`,
      `"${g.createdAt.split('T')[0]}"`,
      `"${g.updatedAt.split('T')[0]}"`,
      `"${g.isOverdue ? 'نعم' : 'لا'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `انشغالات_ولاية_الوادي_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // --- SYSTEM & DASHBOARD SETTINGS ---
  getSystemSettings: (): SystemSettings => {
    try {
      const stored = localStorage.getItem(SYSTEM_SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(stored) };
      }
      localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
      return DEFAULT_SYSTEM_SETTINGS;
    } catch {
      return DEFAULT_SYSTEM_SETTINGS;
    }
  },

  saveSystemSettings: (newSettings: Partial<SystemSettings>, user?: SystemUser): SystemSettings => {
    try {
      const current = AdminService.getSystemSettings();
      const updated: SystemSettings = {
        ...current,
        ...newSettings,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.name || 'مسؤول المنظومة'
      };

      localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(updated));

      AdminService.logAudit({
        userId: user?.id || 'admin',
        userName: user?.name || 'المسؤول',
        userRole: user?.roleTitle || 'مسؤول النظام',
        action: 'تحديث وحفظ إعدادات المنظومة',
        targetId: 'system_settings',
        targetType: 'إعدادات',
        details: 'تم حفظ وتثبيت معلمات النظام الولائي ولوحة التحكم بنجاح.'
      });

      return updated;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return DEFAULT_SYSTEM_SETTINGS;
    }
  }
};
