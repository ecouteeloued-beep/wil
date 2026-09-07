export type Municipality = 
  | 'الوادي'
  | 'البياضة'
  | 'الرباح'
  | 'الرقيبة'
  | 'حاسي خليفة'
  | 'المغير'
  | 'أخرى';

export type GrievanceCategory = 
  | 'الحالة المدنية'
  | 'البيئة'
  | 'العمران'
  | 'النقل'
  | 'الصحة'
  | 'أخرى';

export interface GrievanceSubmission {
  id: string; // WD-2026-XXXXX
  nin?: string; // National Identification Number
  fullName: string;
  municipality: Municipality;
  category: GrievanceCategory;
  details: string;
  phone: string;
  createdAt: string;
  status: 'قيد المعالجة' | 'تم التوجيه' | 'تم الرد' | 'مسجل حديثاً';
}

export interface TrackingResult {
  id: string;
  municipality: string;
  category: string;
  status: string;
  statusColor?: string;
  submittedAt: string;
  lastUpdate: string;
  targetDepartment: string;
  steps: {
    title: string;
    description: string;
    completed: boolean;
    current?: boolean;
    date?: string;
  }[];
}

export interface StatItem {
  value: string;
  label: string;
  sublabel: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChannelItem {
  title: string;
  value: string;
  description: string;
  iconName: 'whatsapp' | 'phone' | 'qr' | 'web';
  badge?: string;
  actionText?: string;
  actionType?: 'call' | 'whatsapp' | 'scroll' | 'info';
}
