import { 
  EnhancedGrievance, 
  ComplaintStatusCode, 
  GrievanceStatus, 
  TimelineEvent,
  CitizenActionRequired,
  CitizenRating,
  PublicMessage
} from '../types';

export const STATUS_CODE_TO_ARABIC: Record<ComplaintStatusCode, GrievanceStatus> = {
  NEW: 'جديد',
  VIEWED: 'تم الاطلاع',
  ASSIGNED: 'تم الإسناد',
  IN_PROGRESS: 'قيد المعالجة',
  WAITING_CITIZEN: 'بانتظار معلومات',
  WAITING_REVIEW: 'بانتظار المراجعة',
  PENDING_REPLY: 'بانتظار الرد',
  RESOLVED: 'تمت المعالجة',
  CLOSED: 'مغلق',
  URGENT: 'عاجل',
  DUPLICATE: 'مكرر',
  OUT_OF_SCOPE: 'خارج الاختصاص',
  REJECTED: 'مرفوض'
};

export const ARABIC_TO_STATUS_CODE: Record<string, ComplaintStatusCode> = {
  'جديد': 'NEW',
  'مسجل حديثاً': 'NEW',
  'تم الإسناد': 'ASSIGNED',
  'تم التوجيه': 'ASSIGNED',
  'قيد المعالجة': 'IN_PROGRESS',
  'بانتظار معلومات': 'WAITING_CITIZEN',
  'في انتظار معلومات من المواطن': 'WAITING_CITIZEN',
  'بانتظار المراجعة': 'WAITING_REVIEW',
  'في انتظار المراجعة': 'WAITING_REVIEW',
  'تمت المعالجة': 'RESOLVED',
  'تم الرد': 'RESOLVED',
  'مغلق': 'CLOSED',
  'عاجل': 'URGENT',
  'مكرر': 'DUPLICATE',
  'خارج الاختصاص': 'OUT_OF_SCOPE',
  'مرفوض': 'REJECTED'
};

export const MOCK_COMPLAINTS_SEED: EnhancedGrievance[] = [];

const STORAGE_KEY = 'wilaya_eloued_complaints_clean_2026';

export interface IComplaintRepository {
  getAll(): Promise<EnhancedGrievance[]>;
  getById(id: string): Promise<EnhancedGrievance | null>;
  create(item: EnhancedGrievance): Promise<EnhancedGrievance>;
  update(id: string, updates: Partial<EnhancedGrievance>): Promise<EnhancedGrievance>;
  delete(id: string): Promise<boolean>;
  resetToDefaults(): Promise<EnhancedGrievance[]>;
}

// Client-Side Clean Repository backed by LocalStorage starting empty for live demo
export class MockComplaintRepository implements IComplaintRepository {
  private load(): EnhancedGrievance[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse complaints from storage:', e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  private save(data: EnhancedGrievance[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Dispatch custom window event so open views react immediately
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('complaints_updated'));
      }
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }

  async getAll(): Promise<EnhancedGrievance[]> {
    return this.load();
  }

  async getById(id: string): Promise<EnhancedGrievance | null> {
    const cleanId = id.trim().toUpperCase();
    const all = this.load();
    const found = all.find(item => 
      item.id.toUpperCase() === cleanId || 
      item.trackingNumber?.toUpperCase() === cleanId
    );
    return found || null;
  }

  async create(item: EnhancedGrievance): Promise<EnhancedGrievance> {
    const all = this.load();
    const updated = [item, ...all];
    this.save(updated);
    return item;
  }

  async update(id: string, updates: Partial<EnhancedGrievance>): Promise<EnhancedGrievance> {
    const cleanId = id.trim().toUpperCase();
    const all = this.load();
    const index = all.findIndex(item => 
      item.id.toUpperCase() === cleanId || 
      item.trackingNumber?.toUpperCase() === cleanId
    );
    if (index === -1) {
      throw new Error(`Complaint with ID ${id} not found in mock repository.`);
    }

    const current = all[index];
    const updatedItem: EnhancedGrievance = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    all[index] = updatedItem;
    this.save(all);
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const cleanId = id.trim().toUpperCase();
    const all = this.load();
    const filtered = all.filter(item => 
      item.id.toUpperCase() !== cleanId && 
      item.trackingNumber?.toUpperCase() !== cleanId
    );
    this.save(filtered);
    return true;
  }

  async resetToDefaults(): Promise<EnhancedGrievance[]> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('complaints_updated'));
    }
    return [];
  }
}

// Single instance for app lifetime
export const complaintRepository: IComplaintRepository = new MockComplaintRepository();
