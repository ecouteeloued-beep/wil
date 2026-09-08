import { 
  EnhancedGrievance, 
  ComplaintStatusCode, 
  TimelineEvent, 
  InternalNote, 
  OfficialResponse,
  CitizenActionRequired,
  CitizenRating,
  PublicMessage
} from '../types';
import { 
  complaintRepository, 
  STATUS_CODE_TO_ARABIC, 
  ARABIC_TO_STATUS_CODE 
} from './complaintRepository';
import { DEMO_CONFIG } from '../config/demoConfig';

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  trackingNumber: string;
  type: 'status' | 'response' | 'document' | 'info';
  timestamp: string;
  read: boolean;
}

export interface DemoStatistics {
  isSimulated: boolean;
  total: number;
  newCount: number;
  inProgress: number;
  waitingCitizen: number;
  waitingReview: number;
  resolved: number;
  closed: number;
  urgent: number;
  overdue: number;
}

export class ComplaintService {
  /**
   * Generates a realistic tracking code formatted as WIL-2026-XXXXXXX
   */
  static generateTrackingNumber(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(100000 + Math.random() * 900000).toString();
    return `WL-${year}-${sequence}`;
  }

  /**
   * Generates a secure 4-digit confidential PIN for citizen grievance tracking
   */
  static generateSecretPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Search for a complaint by tracking number (case-insensitive, trims spaces)
   */
  static async search(trackingNumber: string): Promise<EnhancedGrievance | null> {
    if (!trackingNumber) return null;
    const clean = trackingNumber.trim().toUpperCase();
    return complaintRepository.getById(clean);
  }

  /**
   * Retrieve all complaints from the repository
   */
  static async getAll(): Promise<EnhancedGrievance[]> {
    return complaintRepository.getAll();
  }

  /**
   * Create a new complaint submission from citizen
   */
  static async create(data: {
    fullName: string;
    nin?: string;
    phone: string;
    applicantDaira: string;
    applicantMunicipality: string;
    applicantNeighborhood: string;
    subject: string;
    grievanceDaira: string;
    grievanceMunicipality: string;
    category: any;
    details: string;
    secretPin?: string;
  }): Promise<EnhancedGrievance> {
    const trackingNumber = this.generateTrackingNumber();
    const secretPin = data.secretPin || this.generateSecretPin();
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    // SLA: +15 days
    const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();

    const newComplaint: EnhancedGrievance = {
      id: trackingNumber,
      trackingNumber,
      secretPin,
      statusCode: 'NEW',
      status: 'جديد',
      priority: 'عادي',
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
      sector: 'المعاملات الإدارية والميدانية',
      details: data.details,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueDate,
      isOverdue: false,
      specialFlags: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: dateFormatted,
          time: timeFormatted,
          author: 'النظام الرقمي الولائي',
          authorRole: 'منصة المواطن',
          action: 'تم تسجيل الانشغال',
          note: `تم تسجيل العريضة بنجاح وتوليد رقم التتبع ${trackingNumber}`
        }
      ],
      internalNotes: []
    };

    return complaintRepository.create(newComplaint);
  }

  /**
   * Update complaint status and append to timeline
   */
  static async updateStatus(
    trackingNumber: string,
    statusCode: ComplaintStatusCode,
    author: string,
    authorRole: string,
    note?: string
  ): Promise<EnhancedGrievance> {
    const complaint = await this.search(trackingNumber);
    if (!complaint) throw new Error(`Complaint ${trackingNumber} not found.`);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    const arabicStatus = STATUS_CODE_TO_ARABIC[statusCode] || 'قيد المعالجة';

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      date: dateFormatted,
      time: timeFormatted,
      author,
      authorRole,
      action: arabicStatus,
      note: note || `تغيير الحالة إلى "${arabicStatus}" بواسطة ${author}`,
      statusFrom: complaint.status,
      statusTo: arabicStatus
    };

    return complaintRepository.update(complaint.id, {
      statusCode,
      status: arabicStatus,
      timeline: [...complaint.timeline, timelineEvent]
    });
  }

  /**
   * Request citizen additional information/document
   */
  static async requestCitizenInfo(
    trackingNumber: string,
    reason: string,
    author: string,
    authorRole: string,
    documentType: string = 'نسخة من الوثيقة المطلوبة'
  ): Promise<EnhancedGrievance> {
    const complaint = await this.search(trackingNumber);
    if (!complaint) throw new Error(`Complaint ${trackingNumber} not found.`);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    const actionReq: CitizenActionRequired = {
      reason,
      documentType,
      requestedAt: now.toISOString(),
      requestedBy: author
    };

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      date: dateFormatted,
      time: timeFormatted,
      author,
      authorRole,
      action: 'في انتظار معلومات من المواطن',
      note: reason
    };

    return complaintRepository.update(complaint.id, {
      statusCode: 'WAITING_CITIZEN',
      status: 'بانتظار معلومات',
      citizenActionRequired: actionReq,
      timeline: [...complaint.timeline, timelineEvent]
    });
  }

  /**
   * Citizen fulfills document request (Simulation)
   */
  static async submitCitizenDocument(
    trackingNumber: string,
    fileName: string = 'document-example.pdf',
    note?: string
  ): Promise<EnhancedGrievance> {
    const complaint = await this.search(trackingNumber);
    if (!complaint) throw new Error(`Complaint ${trackingNumber} not found.`);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      date: dateFormatted,
      time: timeFormatted,
      author: complaint.fullName,
      authorRole: 'المواطن صاحب الانشغال',
      action: 'تقديم وثيقة من المواطن',
      note: `تم إرفاق الوثيقة التكميلية المطلوبة: ${fileName} ${note ? `(${note})` : ''}`
    };

    const updatedActionReq: CitizenActionRequired = {
      ...(complaint.citizenActionRequired || {
        reason: 'استكمال الملف بالوثيقة المطلوبة',
        requestedAt: now.toISOString()
      }),
      submittedDocument: {
        name: fileName,
        uploadedAt: now.toISOString(),
        fileSize: '1.4 MB'
      }
    };

    return complaintRepository.update(complaint.id, {
      statusCode: 'IN_PROGRESS',
      status: 'قيد المعالجة',
      citizenActionRequired: updatedActionReq,
      timeline: [...complaint.timeline, timelineEvent]
    });
  }

  /**
   * Add official response (Draft or Approved)
   */
  static async addOfficialResponse(
    trackingNumber: string,
    responseText: string,
    letterNumber: string,
    author: string,
    isApproved: boolean = true
  ): Promise<EnhancedGrievance> {
    const complaint = await this.search(trackingNumber);
    if (!complaint) throw new Error(`Complaint ${trackingNumber} not found.`);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    const officialResponse: OfficialResponse = {
      text: responseText,
      letterNumber,
      preparedBy: author,
      preparedAt: now.toISOString(),
      approved: isApproved,
      reviewedBy: isApproved ? author : undefined,
      reviewedAt: isApproved ? now.toISOString() : undefined
    };

    const nextStatusCode: ComplaintStatusCode = isApproved ? 'RESOLVED' : 'WAITING_REVIEW';
    const nextStatus = STATUS_CODE_TO_ARABIC[nextStatusCode];

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      date: dateFormatted,
      time: timeFormatted,
      author,
      authorRole: isApproved ? 'مسؤول الخلية' : 'موظف معالج',
      action: isApproved ? 'الرد الرسمي' : 'في انتظار المراجعة',
      note: isApproved 
        ? `اعتماد الرد الرسمي بالمراسلة رقم ${letterNumber}` 
        : `صياغة مسودة الرد وإحالتها للاعتماد`
    };

    return complaintRepository.update(complaint.id, {
      statusCode: nextStatusCode,
      status: nextStatus,
      officialResponse,
      timeline: [...complaint.timeline, timelineEvent]
    });
  }

  /**
   * Close a complaint permanently
   */
  static async closeComplaint(
    trackingNumber: string,
    closingNote: string,
    author: string
  ): Promise<EnhancedGrievance> {
    const complaint = await this.search(trackingNumber);
    if (!complaint) throw new Error(`Complaint ${trackingNumber} not found.`);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      date: dateFormatted,
      time: timeFormatted,
      author,
      authorRole: 'مسؤول خلية الإصغاء والتكفل',
      action: 'الإغلاق',
      note: closingNote || 'إغلاق الملف وأرشفته في السجل الرقمي'
    };

    return complaintRepository.update(complaint.id, {
      statusCode: 'CLOSED',
      status: 'مغلق',
      timeline: [...complaint.timeline, timelineEvent]
    });
  }

  /**
   * Submit citizen satisfaction rating (1-5 stars)
   */
  static async submitCitizenRating(
    trackingNumber: string,
    score: number,
    comment?: string
  ): Promise<EnhancedGrievance> {
    const complaint = await this.search(trackingNumber);
    if (!complaint) throw new Error(`Complaint ${trackingNumber} not found.`);

    const rating: CitizenRating = {
      score,
      comment,
      ratedAt: new Date().toISOString()
    };

    return complaintRepository.update(complaint.id, {
      citizenRating: rating
    });
  }

  /**
   * Add internal confidential note
   */
  static async addInternalNote(
    trackingNumber: string,
    text: string,
    author: string,
    authorRole: string
  ): Promise<EnhancedGrievance> {
    const complaint = await this.search(trackingNumber);
    if (!complaint) throw new Error(`Complaint ${trackingNumber} not found.`);

    const note: InternalNote = {
      id: `in-${Date.now()}`,
      author,
      authorRole,
      createdAt: new Date().toISOString(),
      text
    };

    return complaintRepository.update(complaint.id, {
      internalNotes: [...(complaint.internalNotes || []), note]
    });
  }

  /**
   * Add public message visible to citizen
   */
  static async addPublicMessage(
    trackingNumber: string,
    message: string,
    author: string,
    authorRole: string
  ): Promise<EnhancedGrievance> {
    const complaint = await this.search(trackingNumber);
    if (!complaint) throw new Error(`Complaint ${trackingNumber} not found.`);

    const pubMsg: PublicMessage = {
      id: `pm-${Date.now()}`,
      author,
      authorRole,
      message,
      createdAt: new Date().toISOString()
    };

    return complaintRepository.update(complaint.id, {
      publicMessages: [...(complaint.publicMessages || []), pubMsg]
    });
  }

  /**
   * Assign complaint to staff member
   */
  static async assignComplaint(
    trackingNumber: string,
    employeeId: string,
    employeeName: string,
    department: string,
    author: string
  ): Promise<EnhancedGrievance> {
    const complaint = await this.search(trackingNumber);
    if (!complaint) throw new Error(`Complaint ${trackingNumber} not found.`);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      date: dateFormatted,
      time: timeFormatted,
      author,
      authorRole: 'مسؤول خلية الإصغاء والتكفل',
      action: 'تم توجيه الانشغال',
      note: `إسناد العريضة للموظف المعالج: ${employeeName} (${department})`
    };

    return complaintRepository.update(complaint.id, {
      assignedToId: employeeId,
      assignedToName: employeeName,
      assignedDepartment: department,
      assignedAt: now.toISOString(),
      statusCode: 'ASSIGNED',
      status: 'تم الإسناد',
      timeline: [...complaint.timeline, timelineEvent]
    });
  }

  /**
   * Return simulated executive statistics as specifically outlined by user:
   * Total: 128 | New: 24 | In Progress: 41 | Waiting Citizen: 8 | Resolved: 32 | Closed: 23
   */
  static getStatistics(): DemoStatistics {
    return {
      isSimulated: true,
      total: 128,
      newCount: 24,
      inProgress: 41,
      waitingCitizen: 8,
      waitingReview: 14,
      resolved: 32,
      closed: 23,
      urgent: 9,
      overdue: 4
    };
  }

  /**
   * Return mock notifications for citizen and staff
   */
  static getMockNotifications(): MockNotification[] {
    return [
      {
        id: 'notif-1',
        title: 'تم تحديث حالة انشغالك',
        message: 'تم تحديث حالة العريضة رقم WIL-2026-X7K4P92 إلى: قيد المعالجة والمتابعة الميدانية.',
        trackingNumber: 'WIL-2026-X7K4P92',
        type: 'status',
        timestamp: 'منذ 15 دقيقة',
        read: false
      },
      {
        id: 'notif-2',
        title: 'تمت إضافة رد رسمي جديد',
        message: 'صدر الرد الإداري الرسمي المعتمد برقم 2026/خ.إ/849 بخصوص عريضتكم WIL-2026-B6K3M19.',
        trackingNumber: 'WIL-2026-B6K3M19',
        type: 'response',
        timestamp: 'منذ ساعتين',
        read: false
      },
      {
        id: 'notif-3',
        title: 'مطلوب تقديم وثيقة لاستكمال الملف',
        message: 'يرجى تقديم نسخة من الوثيقة المطلوبة لاستكمال دراسة الانشغال WIL-2026-P5R8T36.',
        trackingNumber: 'WIL-2026-P5R8T36',
        type: 'document',
        timestamp: 'أمس',
        read: true
      }
    ];
  }
}
