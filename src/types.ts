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
  | 'السكن'
  | 'البيئة'
  | 'الطرقات'
  | 'الصحة'
  | 'الخدمات الإدارية'
  | 'التنمية المحلية'
  | 'الفلاحة'
  | 'الاستثمار'
  | 'العمران'
  | 'النقل'
  | 'الحالة المدنية'
  | 'أخرى';

export interface GrievanceSubmission {
  id: string;
  secretPin?: string; // الرمز السري الخاص بالملف لحماية خصوصية المواطن
  fullName: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: 'ذكر' | 'أنثى' | string;
  phone: string;
  email?: string;
  applicantDaira: string;
  applicantMunicipality: string;
  applicantNeighborhood: string;
  subject: string;
  meetingRequest?: 'والي الولاية' | 'رئيس الديوان' | 'الأمين العام للولاية';
  grievanceDaira: string;
  grievanceMunicipality: string;
  category: GrievanceCategory;
  details: string;
  createdAt: string;
  status: 'قيد المعالجة' | 'تم التوجيه' | 'تم الرد' | 'مسجل حديثاً' | string;
  priority?: string;
  assignedDepartment?: string;
  assignedToName?: string;
  officialResponse?: {
    text: string;
    preparedBy?: string;
    preparedAt?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    approved?: boolean;
    letterNumber?: string;
  };
  timeline?: Array<{
    id: string;
    date: string;
    time: string;
    author: string;
    authorRole: string;
    action: string;
    note?: string;
    statusFrom?: string;
    statusTo?: string;
  }>;
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

// =========================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) & DASHBOARD TYPES
// =========================================================================

export type UserRole = 
  | 'super_admin'
  | 'wali'
  | 'chef_cabinet'
  | 'head_department'
  | 'supervisor'
  | 'employee';

export interface SystemUser {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  username?: string;
  email: string;
  phone: string;
  department: string;
  avatar?: string;
  status: 'نشط' | 'معطل';
  assignedCount: number;
  resolvedCount: number;
  overdueCount: number;
  lastActive: string;
  permissions: string[];
  pinCode?: string; // 0000 لمسؤول الخلية، 1111 للموظف المعالج، 1234 للـ Super Admin
}

export type ComplaintStatusCode = 
  | 'NEW'
  | 'VIEWED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_CITIZEN'
  | 'WAITING_REVIEW'
  | 'PENDING_REPLY'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'URGENT'
  | 'DUPLICATE'
  | 'OUT_OF_SCOPE';

export type GrievanceStatus = 
  | 'جديد'
  | 'تم الاستقبال'
  | 'تم الاطلاع'
  | 'تم الإسناد'
  | 'محول للمصلحة'
  | 'تم التوجيه للمصلحة المختصة'
  | 'قيد المعالجة'
  | 'جاري المعالجة'
  | 'بانتظار معلومات'
  | 'بانتظار المراجعة'
  | 'بانتظار الرد'
  | 'تمت المعالجة'
  | 'تم الحل'
  | 'مغلق'
  | 'عاجل'
  | 'مكرر'
  | 'خارج الاختصاص'
  | 'مرفوض';

export type GrievancePriority = 'عادي' | 'متوسط' | 'عاجل' | 'قصوى';

export type SpecialFlag = 'عاجل' | 'متأخر' | 'مكرر' | 'خارج الاختصاص';

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  author: string;
  authorRole: string;
  action: string;
  note?: string;
  statusFrom?: string;
  statusTo?: string;
}

export interface InternalNote {
  id: string;
  author: string;
  authorRole: string;
  createdAt: string;
  text: string;
  isConfidential?: boolean;
}

export interface OfficialResponse {
  text: string;
  preparedBy: string;
  preparedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approved: boolean;
  letterNumber?: string;
  attachments?: AttachmentFile[];
}

export interface AttachmentFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  url?: string;
  previewUrl?: string;
  documentType?: 'id_card' | 'petition_letter' | 'field_photo' | 'receipt' | 'technical_report' | 'other';
  extractedText?: string;
  pageCount?: number;
}

export interface CitizenActionRequired {
  reason: string;
  documentType?: string;
  requestedAt: string;
  requestedBy?: string;
  submittedDocument?: {
    name: string;
    uploadedAt: string;
    fileSize?: string;
  };
}

export interface CitizenRating {
  score: number; // 1 to 5 stars
  comment?: string;
  ratedAt: string;
}

export interface PublicMessage {
  id: string;
  author: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

export interface EnhancedGrievance {
  id: string; // e.g. WIL-2026-X7K4P92 or WD-2026-00125
  trackingNumber?: string; // alias for id
  secretPin?: string; // الرمز السري الخاص بالملف لحماية خصوصية المواطن
  statusCode?: ComplaintStatusCode;
  fullName: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: 'ذكر' | 'أنثى' | string;
  phone: string;
  email?: string;
  applicantDaira: string;
  applicantMunicipality: string;
  applicantNeighborhood: string;
  subject: string;
  meetingRequest?: 'والي الولاية' | 'رئيس الديوان' | 'الأمين العام للولاية';
  grievanceDaira: string;
  grievanceMunicipality: string;
  category: GrievanceCategory;
  sector: string;
  details: string;
  createdAt: string;
  updatedAt: string;
  status: GrievanceStatus;
  priority: GrievancePriority;
  specialFlags: SpecialFlag[];
  assignedToId?: string;
  assignedToName?: string;
  assignedDepartment?: string;
  assignedAt?: string;
  dueDate: string; // SLA deadline ISO string
  isOverdue: boolean;
  timeline: TimelineEvent[];
  internalNotes: InternalNote[];
  officialResponse?: OfficialResponse;
  attachments?: AttachmentFile[];
  citizenActionRequired?: CitizenActionRequired;
  citizenRating?: CitizenRating;
  publicMessages?: PublicMessage[];
  isSaved?: boolean;
}

export type AuditTargetType = 'انشغال' | 'موظف' | 'إعدادات' | 'نظام' | 'هيكل إداري' | 'صلاحيات' | 'أمن' | 'مستخدم';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  targetId: string;
  targetType: AuditTargetType;
  previousValue?: string;
  newValue?: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  targetRole?: UserRole | 'all';
  targetUserId?: string;
  grievanceId?: string;
  read: boolean;
  createdAt: string;
  type: 'assignment' | 'overdue' | 'review' | 'urgent' | 'note' | 'info';
}

export interface ExecutiveStats {
  total: number;
  newUnassigned: number;
  inProgress: number;
  pendingReview: number;
  pendingInfo: number;
  resolved: number;
  closed: number;
  overdue: number;
  urgent: number;
  resolutionRate: number; // percentage
  averageResolutionDays: number;
  byMunicipality: { name: string; count: number; percentage: number }[];
  byCategory: { name: string; count: number; percentage: number }[];
  bySector: { name: string; count: number; percentage: number }[];
  weeklyTrend: { day: string; received: number; resolved: number }[];
}

export interface EmployeeStats {
  assignedTotal: number;
  newAssigned: number;
  inProgress: number;
  pendingInfo: number;
  pendingReview: number;
  resolvedOrClosed: number;
  overdue: number;
  completionRate: number;
  avgResponseDays: number;
}

export interface SystemSettings {
  // General & Dashboard
  platformName: string;
  officialEmail: string;
  hotlinePhone: string;
  legalDeadlineDays: string;
  maintenanceMode: boolean;
  maintenanceNotice?: string;
  defaultSortOrder?: 'newest' | 'priority' | 'oldest';
  autoRefreshInterval?: 'off' | '30' | '60' | '300';
  allowCitizenAttachments?: boolean;
  maxAttachmentSizeMB?: string;
  enableDirectDocumentReader?: boolean;

  // Security
  sessionTimeoutMins: string;
  pinLockoutAttempts: string;
  requirePinForSensitiveActions?: boolean;
  auditLogRetentionMonths?: string;

  // Notifications & SMS
  senderIdSms: string;
  autoSmsEnabled: boolean;
  smsOnRegister?: boolean;
  smsOnTransfer?: boolean;
  smsOnReply?: boolean;
  dashboardSoundAlerts?: boolean;
  urgentAlertEmail?: boolean;

  // Templates
  templateRegister?: string;
  templateTransfer?: string;
  templateReply?: string;
  templateDirective?: string;

  // Metadata
  updatedAt?: string;
  updatedBy?: string;
}
