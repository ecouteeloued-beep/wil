import { GrievanceSubmission } from '../types';

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
    // First check admin synchronized store for most up-to-date status
    try {
      const adminGrievances = JSON.parse(localStorage.getItem('wilaya_eloued_admin_grievances') || '[]');
      const adminFound = adminGrievances.find((g: any) => g.id === id);
      if (adminFound) {
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
          status: adminFound.status === 'مغلق' || adminFound.status === 'تمت المعالجة' 
            ? 'تم الرد' 
            : adminFound.status === 'تم الإسناد' 
            ? 'تم التوجيه' 
            : 'قيد المعالجة'
        };
      }
    } catch {
      // fallback
    }

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return existing.find((g: GrievanceSubmission) => g.id === id) || null;
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
