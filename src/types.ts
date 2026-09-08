export type Municipality = 
  | 'الوادي'
  | 'البياضة'
  | 'الرباح'
  | 'قمار'
  | 'الرقيبة'
  | 'المقرن'
  | 'الدبيلة'
  | 'حاسي خليفة'
  | 'الطالب العربي'
  | 'أمية ونسه'
  | 'كوينين'
  | 'العقلة'
  | 'النخلة'
  | 'تغزوت'
  | 'ورماس'
  | 'الحمراية'
  | 'سيدي عون'
  | 'حساني عبد الكريم'
  | 'الطريفاوي'
  | 'بن قشة'
  | 'دوار الماء'
  | 'وادي العلندة'
  | 'أخرى';

export type GrievanceCategory = 
  | 'الحالة المدنية'
  | 'البيئة'
  | 'العمران'
  | 'النقل'
  | 'الصحة'
  | 'أخرى';

export interface GrievanceSubmission {
  id: string;
  nin?: string;
  fullName: string;
  phone: string;
  applicantDaira: string;
  applicantMunicipality: string;
  applicantNeighborhood: string;
  subject: string;
  grievanceDaira: string;
  grievanceMunicipality: string;
  category: GrievanceCategory;
  details: string;
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
