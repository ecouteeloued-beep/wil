import { GrievanceSubmission } from '../types';
import { AdminService, SEED_GRIEVANCES } from './adminService';

const STORAGE_KEY = 'wilaya_eloued_grievances';

export const GrievanceService = {
  save: (data: Omit<GrievanceSubmission, 'id' | 'status' | 'createdAt'>): GrievanceSubmission => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newGrievance: GrievanceSubmission = {
      ...data,
      id: `WD-2026-${randomNum}`,
      status: 'قيد المعالجة', // default status
      createdAt: new Date().toISOString()
    };
    
    existing.push(newGrievance);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    
    // Also track the last submission time for rate limiting (simple anti-spam)
    localStorage.setItem('last_submit_time', Date.now().toString());
    
    return newGrievance;
  },

  findByTrackingId: (id: string): GrievanceSubmission | null => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) return null;

    // 1. First check admin repository (supports all active & seed grievances)
    try {
      const allAdmin = AdminService.getAllGrievances();
      const adminFound = allAdmin.find(g => g.id.trim().toUpperCase() === cleanId);
      if (adminFound) {
        let mappedStatus = 'قيد المعالجة';
        if (adminFound.status === 'مغلق' || adminFound.status === 'تمت المعالجة') {
          mappedStatus = 'تم الرد';
        } else if (adminFound.status === 'بانتظار المراجعة') {
          mappedStatus = 'بانتظار المراجعة والاعتماد';
        } else if (adminFound.status === 'تم الإسناد') {
          mappedStatus = 'تم التوجيه';
        } else if (adminFound.status === 'جديد') {
          mappedStatus = 'مسجل حديثاً';
        }

        return {
          id: adminFound.id,
          nin: adminFound.nin,
          fullName: adminFound.fullName,
          phone: adminFound.phone,
          applicantDaira: adminFound.applicantDaira,
          applicantMunicipality: adminFound.applicantMunicipality,
          applicantNeighborhood: adminFound.applicantNeighborhood,
          subject: adminFound.subject,
          grievanceDaira: adminFound.grievanceDaira,
          grievanceMunicipality: adminFound.grievanceMunicipality,
          category: adminFound.category,
          details: adminFound.details,
          createdAt: adminFound.createdAt,
          status: mappedStatus,
          priority: adminFound.priority,
          assignedDepartment: adminFound.assignedDepartment,
          assignedToName: adminFound.assignedToName,
          officialResponse: adminFound.officialResponse,
          timeline: adminFound.timeline
        };
      }
    } catch (e) {
      console.warn('Error querying admin service for tracking', e);
    }

    // 2. Direct fallback to SEED_GRIEVANCES if not initialized yet
    const seedFound = SEED_GRIEVANCES.find(g => g.id.trim().toUpperCase() === cleanId);
    if (seedFound) {
      let mappedStatus = 'قيد المعالجة';
      if (seedFound.status === 'مغلق' || seedFound.status === 'تمت المعالجة') {
        mappedStatus = 'تم الرد';
      } else if (seedFound.status === 'بانتظار المراجعة') {
        mappedStatus = 'بانتظار المراجعة والاعتماد';
      } else if (seedFound.status === 'تم الإسناد') {
        mappedStatus = 'تم التوجيه';
      } else if (seedFound.status === 'جديد') {
        mappedStatus = 'مسجل حديثاً';
      }

      return {
        id: seedFound.id,
        nin: seedFound.nin,
        fullName: seedFound.fullName,
        phone: seedFound.phone,
        applicantDaira: seedFound.applicantDaira,
        applicantMunicipality: seedFound.applicantMunicipality,
        applicantNeighborhood: seedFound.applicantNeighborhood,
        subject: seedFound.subject,
        grievanceDaira: seedFound.grievanceDaira,
        grievanceMunicipality: seedFound.grievanceMunicipality,
        category: seedFound.category,
        details: seedFound.details,
        createdAt: seedFound.createdAt,
        status: mappedStatus,
        priority: seedFound.priority,
        assignedDepartment: seedFound.assignedDepartment,
        assignedToName: seedFound.assignedToName,
        officialResponse: seedFound.officialResponse,
        timeline: seedFound.timeline
      };
    }

    // 3. Check client submissions in local storage
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return existing.find((g: GrievanceSubmission) => g.id.trim().toUpperCase() === cleanId) || null;
  },

  getStats: () => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return {
      total: existing.length,
      resolved: existing.filter((g: GrievanceSubmission) => g.status === 'تم الرد').length,
    };
  },

  canSubmit: (): boolean => {
    const lastSubmit = localStorage.getItem('last_submit_time');
    if (!lastSubmit) return true;
    // Prevent submitting more than once every 2 minutes
    const timeDiff = Date.now() - Number(lastSubmit);
    return timeDiff > 2 * 60 * 1000;
  }
};
