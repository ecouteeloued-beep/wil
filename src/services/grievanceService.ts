import { GrievanceSubmission, EnhancedGrievance, AttachmentFile } from '../types';
import { AdminService, SEED_GRIEVANCES } from './adminService';
import { ComplaintService } from './complaintService';
import { complaintRepository } from './complaintRepository';
import { SupabaseService } from './supabaseService';

const STORAGE_KEY = 'wilaya_eloued_grievances';

export const GrievanceService = {
  save: (data: {
    nin?: string;
    fullName: string;
    phone: string;
    email?: string;
    applicantDaira: string;
    applicantMunicipality: string;
    applicantNeighborhood: string;
    subject: string;
    grievanceDaira: string;
    grievanceMunicipality: string;
    category: any;
    details: string;
    attachments?: AttachmentFile[];
  }): GrievanceSubmission => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Generate unified official tracking code and confidential PIN
    const trackingId = ComplaintService.generateTrackingNumber();
    const secretPin = ComplaintService.generateSecretPin();
    const now = new Date();
    const nowIso = now.toISOString();
    const dateFormatted = now.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    const newGrievance: GrievanceSubmission = {
      ...data,
      id: trackingId,
      secretPin,
      status: 'قيد المعالجة', // default status for citizen view
      createdAt: nowIso
    };
    
    existing.unshift(newGrievance);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    
    // SLA Deadline (+15 days)
    const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Build complete EnhancedGrievance for Admin Dashboard
    const enhancedGrievance: EnhancedGrievance = {
      id: trackingId,
      trackingNumber: trackingId,
      secretPin,
      statusCode: 'NEW',
      status: 'جديد',
      priority: 'عادي',
      fullName: data.fullName,
      nin: data.nin || '',
      phone: data.phone,
      email: data.email || '',
      applicantDaira: data.applicantDaira,
      applicantMunicipality: data.applicantMunicipality,
      applicantNeighborhood: data.applicantNeighborhood,
      subject: data.subject,
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
      attachments: data.attachments || [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: dateFormatted,
          time: timeFormatted,
          author: data.fullName || 'مواطن',
          authorRole: 'منصة المواطن',
          action: 'تم تسجيل العريضة بنجاح عبر البوابة الإلكترونية',
          note: `تم إيداع الانشغال وإعطاء رقم التتبع الرسمي: ${trackingId}`
        }
      ],
      internalNotes: []
    };

    // 2. Direct instant save into Admin Service (wilaya_eloued_admin_grievances)
    try {
      AdminService.addGrievanceDirectly(enhancedGrievance);
    } catch (err) {
      console.warn('Could not add to AdminService directly:', err);
    }

    // 3. Direct save into Mock Complaint Repository
    complaintRepository.create(enhancedGrievance).catch(err => {
      console.warn('Failed to sync to local repository:', err);
    });

    // 4. Asynchronous Cloud Sync to Supabase (if configured)
    if (SupabaseService.isConfigured()) {
      SupabaseService.insertComplaint(enhancedGrievance).catch(err => {
        console.warn('Supabase background sync failed:', err);
      });
    }

    // Track the last submission time for rate limiting (anti-spam)
    localStorage.setItem('last_submit_time', Date.now().toString());
    
    return newGrievance;
  },

  findByTrackingId: async (id: string, phone?: string): Promise<any> => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) return null;

    // 1. First check admin repository (supports all active & seed grievances)
    try {
      const allAdmin = AdminService.getAllGrievances();
      const adminFound = allAdmin.find(g => 
        g.id.trim().toUpperCase() === cleanId || 
        (g.trackingNumber && g.trackingNumber.trim().toUpperCase() === cleanId)
      );
      if (adminFound) {
        return adminFound;
      }
    } catch (e) {
      console.warn('Error querying admin service for tracking', e);
    }

    // 2. Check Supabase Remote Database (for cross-device citizen tracking)
    if (SupabaseService.isConfigured()) {
      try {
        const cloudFound = await SupabaseService.trackComplaint(cleanId, phone);
        if (cloudFound) {
          return cloudFound;
        }
      } catch (e) {
        console.warn('Error checking Supabase for complaint tracking:', e);
      }
    }

    // 3. Direct fallback to SEED_GRIEVANCES if not initialized yet
    const seedFound = SEED_GRIEVANCES.find(g => 
      g.id.trim().toUpperCase() === cleanId || 
      (g.trackingNumber && g.trackingNumber.trim().toUpperCase() === cleanId)
    );
    if (seedFound) {
      return seedFound;
    }

    // 4. Check client submissions in local storage
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const match = existing.find((g: GrievanceSubmission) => g.id.trim().toUpperCase() === cleanId);
    return match || null;
  },

  getStats: () => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return {
      total: existing.length,
      resolved: existing.filter((g: GrievanceSubmission) => g.status === 'تم الرد' || g.status === 'تمت المعالجة').length,
    };
  },

  canSubmit: (): boolean => {
    const lastSubmit = localStorage.getItem('last_submit_time');
    if (!lastSubmit) return true;
    // Prevent submitting more than once every 30 seconds during demo
    const timeDiff = Date.now() - Number(lastSubmit);
    return timeDiff > 30 * 1000;
  }
};
