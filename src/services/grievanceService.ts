import { GrievanceSubmission } from '../types';
import { AdminService, SEED_GRIEVANCES } from './adminService';
import { ComplaintService } from './complaintService';
import { complaintRepository } from './complaintRepository';

const STORAGE_KEY = 'wilaya_eloued_grievances';

export const GrievanceService = {
  save: (data: Omit<GrievanceSubmission, 'id' | 'status' | 'createdAt'>): GrievanceSubmission => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Generate official tracking code and confidential PIN
    const trackingId = ComplaintService.generateTrackingNumber();
    const secretPin = ComplaintService.generateSecretPin();
    
    const newGrievance: GrievanceSubmission = {
      ...data,
      id: trackingId,
      secretPin,
      status: 'قيد المعالجة', // default status
      createdAt: new Date().toISOString()
    };
    
    existing.push(newGrievance);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    
    // Also add directly to the repository
    ComplaintService.create({
      fullName: data.fullName,
      nin: data.nin,
      phone: data.phone,
      applicantDaira: data.applicantDaira,
      applicantMunicipality: data.applicantMunicipality,
      applicantNeighborhood: data.applicantNeighborhood,
      subject: data.subject,
      grievanceDaira: data.grievanceDaira,
      grievanceMunicipality: data.grievanceMunicipality,
      category: data.category,
      details: data.details,
      secretPin,
    }).catch(err => console.warn('Failed to sync new complaint to repository:', err));

    // Also track the last submission time for rate limiting (simple anti-spam)
    localStorage.setItem('last_submit_time', Date.now().toString());
    
    return newGrievance;
  },

  findByTrackingId: (id: string): any => {
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
        return {
          id: adminFound.id,
          trackingNumber: adminFound.trackingNumber || adminFound.id,
          secretPin: adminFound.secretPin || '2026',
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
          updatedAt: adminFound.updatedAt,
          statusCode: adminFound.statusCode,
          status: adminFound.status,
          priority: adminFound.priority,
          assignedDepartment: adminFound.assignedDepartment,
          assignedToName: adminFound.assignedToName,
          officialResponse: adminFound.officialResponse,
          citizenActionRequired: adminFound.citizenActionRequired,
          citizenRating: adminFound.citizenRating,
          publicMessages: adminFound.publicMessages,
          timeline: adminFound.timeline
        };
      }
    } catch (e) {
      console.warn('Error querying admin service for tracking', e);
    }

    // 2. Direct fallback to SEED_GRIEVANCES if not initialized yet
    const seedFound = SEED_GRIEVANCES.find(g => 
      g.id.trim().toUpperCase() === cleanId || 
      (g.trackingNumber && g.trackingNumber.trim().toUpperCase() === cleanId)
    );
    if (seedFound) {
      return {
        id: seedFound.id,
        trackingNumber: seedFound.trackingNumber || seedFound.id,
        secretPin: (seedFound as any).secretPin || '2026',
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
        updatedAt: seedFound.updatedAt,
        statusCode: seedFound.statusCode,
        status: seedFound.status,
        priority: seedFound.priority,
        assignedDepartment: seedFound.assignedDepartment,
        assignedToName: seedFound.assignedToName,
        officialResponse: seedFound.officialResponse,
        citizenActionRequired: seedFound.citizenActionRequired,
        citizenRating: seedFound.citizenRating,
        publicMessages: seedFound.publicMessages,
        timeline: seedFound.timeline
      };
    }

    // 3. Check client submissions in local storage
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
