import { GrievanceSubmission, EnhancedGrievance, AttachmentFile } from '../types';
import { ComplaintService } from './complaintService';
import { SupabaseService } from './supabaseService';

export const GrievanceService = {
  save: async (data: {
    fullName: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    gender?: string;
    phone: string;
    email?: string;
    applicantDaira: string;
    applicantMunicipality: string;
    applicantNeighborhood: string;
    subject: string;
    meetingRequest?: 'والي الولاية' | 'رئيس الديوان' | 'الأمين العام للولاية';
    grievanceDaira: string;
    grievanceMunicipality: string;
    category: any;
    details: string;
    attachments?: AttachmentFile[];
  }): Promise<GrievanceSubmission> => {
    if (!SupabaseService.isConfigured()) {
      throw new Error('بوابة الإيداع غير متاحة حالياً. يرجى المحاولة لاحقاً.');
    }

    const clientDisplayId = ComplaintService.generateTrackingNumber();
    const now = new Date();
    const nowIso = now.toISOString();
    const dateFormatted = now.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
    const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();

    const enhancedGrievance: EnhancedGrievance = {
      id: clientDisplayId,
      trackingNumber: clientDisplayId,
      statusCode: 'NEW',
      status: 'جديد',
      priority: 'عادي',
      fullName: data.fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate,
      gender: data.gender,
      phone: data.phone,
      email: data.email || '',
      applicantDaira: data.applicantDaira,
      applicantMunicipality: data.applicantMunicipality,
      applicantNeighborhood: data.applicantNeighborhood,
      subject: data.subject,
      meetingRequest: data.meetingRequest,
      grievanceDaira: data.grievanceDaira,
      grievanceMunicipality: data.grievanceMunicipality,
      category: data.category,
      sector: 'المعاملات الإدارية والميدانية',
      details: data.details,
      createdAt: nowIso,
      updatedAt: nowIso,
      dueDate,
      isOverdue: false,
      specialFlags: [],
      // Attachments remain in memory for the confirmation view only. Persistent
      // document storage is intentionally blocked until private Storage policies exist.
      attachments: data.attachments || [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: dateFormatted,
          time: timeFormatted,
          author: data.fullName || 'مواطن',
          authorRole: 'منصة المواطن',
          action: 'تم تسجيل العريضة بنجاح عبر البوابة الإلكترونية',
          note: 'تم إيداع الانشغال وإنشاء رقم التتبع من قاعدة البيانات المركزية.'
        }
      ],
      internalNotes: []
    };

    const cloudResult = await SupabaseService.insertComplaint(enhancedGrievance);
    if (!cloudResult.success) {
      throw new Error(cloudResult.error || 'تعذر حفظ الانشغال في قاعدة البيانات المركزية.');
    }

    const serverTrackingId = cloudResult.data?.tracking_id || clientDisplayId;
    window.localStorage.setItem('wilaya_eloued_last_submit_time', Date.now().toString());
    return {
      ...data,
      id: serverTrackingId,
      secretPin: cloudResult.data?.secret_pin || '',
      status: 'قيد المعالجة',
      createdAt: cloudResult.data?.created_at || nowIso,
    };
  },

  findByTrackingId: async (id: string, phone?: string, secretPin?: string): Promise<any> => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId || !phone || !secretPin || !SupabaseService.isConfigured()) return null;
    return SupabaseService.trackComplaint(cleanId, phone, secretPin);
  },

  // Dashboard statistics must come from scoped server queries. Returning zero here
  // avoids presenting browser-local counts as institutional facts until that query exists.
  getStats: () => ({ total: 0, resolved: 0 }),

  // Client throttling is only a UX measure; server-side rate limiting remains mandatory.
  canSubmit: (): boolean => {
    const key = 'wilaya_eloued_last_submit_time';
    const lastSubmit = window.localStorage.getItem(key);
    if (!lastSubmit) return true;
    return Date.now() - Number(lastSubmit) > 30 * 1000;
  }
};
