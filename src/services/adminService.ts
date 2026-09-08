import { 
  SystemUser, 
  EnhancedGrievance, 
  AuditLogEntry, 
  NotificationItem, 
  ExecutiveStats, 
  EmployeeStats, 
  UserRole,
  GrievanceStatus,
  GrievancePriority,
  TimelineEvent,
  InternalNote,
  OfficialResponse
} from '../types';
import { MOCK_COMPLAINTS_SEED } from './complaintRepository';

const USERS_STORAGE_KEY = 'wilaya_eloued_admin_users';
const GRIEVANCES_STORAGE_KEY = 'wilaya_eloued_admin_grievances';
const AUDIT_LOGS_STORAGE_KEY = 'wilaya_eloued_admin_audit_logs';
const NOTIFICATIONS_STORAGE_KEY = 'wilaya_eloued_admin_notifications';
const CURRENT_USER_KEY = 'wilaya_eloued_current_session_user';
const ADMIN_AUTH_KEY = 'wilaya_eloued_admin_authenticated';

// =========================================================================
// INITIAL SEED USERS (STRICTLY 3 ROLES: supervisor, employee, super_admin)
// =========================================================================
export const ROLE_PINS: Record<UserRole, string> = {
  supervisor: '0000',
  employee: '1111',
  super_admin: '1234'
};

export const SEED_USERS: SystemUser[] = [
  {
    id: 'usr-supervisor',
    name: 'عمر بن سالم',
    role: 'supervisor',
    roleTitle: 'مسؤول خلية الإصغاء والتكفل',
    email: 'o.bensalem@eloued.gov.dz',
    phone: '032 21 45 10',
    department: 'ديوان والي ولاية الوادي',
    status: 'نشط',
    assignedCount: 0,
    resolvedCount: 42,
    overdueCount: 0,
    lastActive: 'منذ 5 دقائق',
    pinCode: '0000',
    permissions: ['view_all', 'assign', 'approve', 'manage_staff', 'reports', 'audit_log', 'settings']
  },
  {
    id: 'usr-emp-1',
    name: 'أحمد بن عمار',
    role: 'employee',
    roleTitle: 'موظف معالج رئيسي',
    email: 'a.benammar@eloued.gov.dz',
    phone: '032 21 45 14',
    department: 'مصلحة الشؤون الاجتماعية والتنمية المحلية',
    status: 'نشط',
    assignedCount: 6,
    resolvedCount: 19,
    overdueCount: 1,
    lastActive: 'نشط الآن',
    pinCode: '1111',
    permissions: ['view_assigned', 'process', 'draft_response', 'add_notes', 'request_info']
  },
  {
    id: 'usr-emp-2',
    name: 'فاطمة الزهراء عثماني',
    role: 'employee',
    roleTitle: 'موظفة معالجة (العمران والبيئة)',
    email: 'fz.othmani@eloued.gov.dz',
    phone: '032 21 45 18',
    department: 'مصلحة العمران والبيئة والتهيئة',
    status: 'نشط',
    assignedCount: 4,
    resolvedCount: 15,
    overdueCount: 0,
    lastActive: 'منذ 20 دقيقة',
    pinCode: '1111',
    permissions: ['view_assigned', 'process', 'draft_response', 'add_notes', 'request_info']
  },
  {
    id: 'usr-admin',
    name: 'عبد الحفيظ التجاني',
    role: 'super_admin',
    roleTitle: 'المشرف العام والرقمنة الولائية (Super Admin)',
    email: 'admin.cellule@eloued.gov.dz',
    phone: '032 21 45 00',
    department: 'ديوان الوالي — الرقابة والرقمنة',
    status: 'نشط',
    assignedCount: 0,
    resolvedCount: 0,
    overdueCount: 0,
    lastActive: 'نشط الآن',
    pinCode: '1234',
    permissions: ['all', 'super_admin_map', 'view_all', 'reports', 'audit_log', 'manage_staff', 'settings']
  }
];

// =========================================================================
// INITIAL SEED GRIEVANCES (Authentic for Wilaya d'El Oued)
// =========================================================================
export const SEED_GRIEVANCES: EnhancedGrievance[] = [
  ...MOCK_COMPLAINTS_SEED,
  {
    id: 'WD-2026-00125',
    nin: '198439010023456789',
    fullName: 'بلقاسم مرزوقي',
    phone: '0661234567',
    email: 'b.marzouki@gmail.com',
    applicantDaira: 'الوادي',
    applicantMunicipality: 'الوادي',
    applicantNeighborhood: 'حي 19 مارس / تكسبت',
    subject: 'طلب ربط المحيط الفلاحي بشبكة الكهرباء الفلاحية',
    grievanceDaira: 'حاسي خليفة',
    grievanceMunicipality: 'حاسي خليفة',
    category: 'العمران',
    sector: 'الفلاحة والطاقة',
    details: 'نحن فلاحو محيط الغربية بحاسي خليفة نطالب بتسريع وتيرة إنجاز المحول الكهربائي الريفي المسجل لتمكيننا من تشغيل مضخات السقي الفلاحي وتفادي تضرر محاصيل البطاطا والنخيل.',
    createdAt: '2026-09-02T08:30:00.000Z',
    updatedAt: '2026-09-07T14:15:00.000Z',
    status: 'قيد المعالجة',
    priority: 'عاجل',
    specialFlags: ['عاجل'],
    assignedToId: 'usr-emp-1',
    assignedToName: 'أحمد بن عمار',
    assignedDepartment: 'مصلحة الشؤون الاجتماعية والتنمية المحلية',
    assignedAt: '2026-09-02T10:00:00.000Z',
    dueDate: '2026-09-09T18:00:00.000Z',
    isOverdue: false,
    timeline: [
      {
        id: 't-1',
        date: '2026-09-02',
        time: '08:30',
        author: 'المواطن بلقاسم مرزوقي',
        authorRole: 'مواطن',
        action: 'تم تسجيل الانشغال إلكترونياً عبر البوابة',
        note: 'تسجيل رسمي للملف مع إرفاق بطاقة الفلاح ومخطط الموقع'
      },
      {
        id: 't-2',
        date: '2026-09-02',
        time: '10:00',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول الخلية',
        action: 'تم توجيهه وإسناده للموظف المختص',
        note: 'إسناد للمفتش أحمد بن عمار للمتابعة الميدانية مع مديرية المصالح الفلاحية ومؤسسة سونلغاز',
        statusFrom: 'جديد',
        statusTo: 'تم الإسناد'
      },
      {
        id: 't-3',
        date: '2026-09-03',
        time: '11:20',
        author: 'أحمد بن عمار',
        authorRole: 'موظف معالجة',
        action: 'بدأت المعالجة والاتصال بالقطاع المعني',
        note: 'تمت مراسلة مديرية توزيع الكهرباء والغاز لولاية الوادي للاستفسار عن الحصة رقم 04 الخاصة بمحيط حاسي خليفة.',
        statusFrom: 'تم الإسناد',
        statusTo: 'قيد المعالجة'
      }
    ],
    internalNotes: [
      {
        id: 'n-1',
        author: 'أحمد بن عمار',
        authorRole: 'موظف معالجة',
        createdAt: '2026-09-04T09:15:00.000Z',
        text: 'سونلغاز أفادت بأن المقاولة المكلفة بالربط باشرت غرس الأعمدة وسيتم الانتهاء بنهاية الأسبوع القادم.'
      }
    ],
    attachments: [
      { id: 'att-1', name: 'بطاقة_فلاح_معتمدة.pdf', size: '1.2 MB', type: 'application/pdf', uploadedAt: '2026-09-02' },
      { id: 'att-2', name: 'مخطط_الموقع_الفلاحي.jpg', size: '850 KB', type: 'image/jpeg', uploadedAt: '2026-09-02' }
    ]
  },
  {
    id: 'WD-2026-00128',
    nin: '197939020011223344',
    fullName: 'عبد الرزاق عيفة',
    phone: '0550987654',
    email: 'a.aifa@yahoo.fr',
    applicantDaira: 'البياضة',
    applicantMunicipality: 'البياضة',
    applicantNeighborhood: 'حي الرمال / طريق قمار القديم',
    subject: 'تذبذب تزويد الحي بالماء الشروب وانخفاض الضغط',
    grievanceDaira: 'البياضة',
    grievanceMunicipality: 'البياضة',
    category: 'البيئة',
    sector: 'الموارد المائية',
    details: 'يشهد الشطر الغربي من حي الرمال ببلدية البياضة انقطاعاً مستمراً لشبكة الماء الشروب منذ أربعة أيام متتالية، نلتمس تدخل مصالحكم لدى الجزائرية للمياه لتعديل برنامج التوزيع.',
    createdAt: '2026-09-01T11:00:00.000Z',
    updatedAt: '2026-09-06T16:00:00.000Z',
    status: 'بانتظار المراجعة',
    priority: 'عاجل',
    specialFlags: ['عاجل'],
    assignedToId: 'usr-emp-1',
    assignedToName: 'أحمد بن عمار',
    assignedDepartment: 'مصلحة الشؤون الاجتماعية والتنمية المحلية',
    assignedAt: '2026-09-01T14:00:00.000Z',
    dueDate: '2026-09-08T18:00:00.000Z',
    isOverdue: false,
    timeline: [
      {
        id: 't-4',
        date: '2026-09-01',
        time: '11:00',
        author: 'المواطن عبد الرزاق عيفة',
        authorRole: 'مواطن',
        action: 'تم تسجيل الانشغال'
      },
      {
        id: 't-5',
        date: '2026-09-01',
        time: '14:00',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول الخلية',
        action: 'تم توجيهه للموظف أحمد بن عمار'
      },
      {
        id: 't-6',
        date: '2026-09-02',
        time: '09:00',
        author: 'أحمد بن عمار',
        authorRole: 'موظف معالجة',
        action: 'بدأت المعالجة مع وحدة الجزائرية للمياه (ADE)'
      },
      {
        id: 't-7',
        date: '2026-09-06',
        time: '15:45',
        author: 'أحمد بن عمار',
        authorRole: 'موظف معالجة',
        action: 'تم إعداد الرد وإحالته لمراجعة واعتماد المسؤول',
        note: 'تم إصلاح العطب بالقناة الرئيسية بقطر 300 ملم وإعادة الضخ تدريجياً، مع إعداد رد رسمي للمواطن.',
        statusFrom: 'قيد المعالجة',
        statusTo: 'بانتظار المراجعة'
      }
    ],
    officialResponse: {
      text: 'بناءً على الشكوى المقدمة بخصوص تذبذب التزويد بالمياه بحي الرمال ببلدية البياضة، نعلمكم أن المصالح التقنية لوحدة الجزائرية للمياه تدخلت بتاريخ 04 سبتمبر لإصلاح كسر في القناة الرئيسية المغذية للحوض المرتفع، وقد تم استئناف التزويد بصورة منتظمة وفق برنامج التوزيع المعمول به.',
      preparedBy: 'أحمد بن عمار',
      preparedAt: '2026-09-06T15:45:00.000Z',
      approved: false
    },
    internalNotes: [],
    attachments: []
  },
  {
    id: 'WD-2026-00130',
    nin: '199039040033445566',
    fullName: 'سامية تجاني',
    phone: '0770112233',
    email: 's.tijani@gmail.com',
    applicantDaira: 'قمار',
    applicantMunicipality: 'قمار',
    applicantNeighborhood: 'حي النور / طريق تغزوت',
    subject: 'طلب توفير النقل المدرسي لتلاميذ قرية الدبيديبي',
    grievanceDaira: 'قمار',
    grievanceMunicipality: 'قمار',
    category: 'النقل',
    sector: 'التربية والنقل المدرسي',
    details: 'أولياء تلاميذ الطور المتوسط بقرية الدبيديبي يعانون من غياب النقل المدرسي مما يضطر أبناءهم لقطع مسافة 4 كلم سيراً على الأقدام للوصول إلى متوسطة الشهيد علي بلقاسم.',
    createdAt: '2026-08-28T09:00:00.000Z',
    updatedAt: '2026-09-05T11:00:00.000Z',
    status: 'مغلق',
    priority: 'متوسط',
    specialFlags: [],
    assignedToId: 'usr-emp-3',
    assignedToName: 'ياسين قدور',
    assignedDepartment: 'مصلحة النقل والمرافق العمومية',
    assignedAt: '2026-08-28T10:30:00.000Z',
    dueDate: '2026-09-04T18:00:00.000Z',
    isOverdue: false,
    timeline: [
      { id: 't-8', date: '2026-08-28', time: '09:00', author: 'سامية تجاني', authorRole: 'مواطن', action: 'تم تسجيل الانشغال' },
      { id: 't-9', date: '2026-08-28', time: '10:30', author: 'عمر بن سالم', authorRole: 'مسؤول الخلية', action: 'تم التوجيه لياسين قدور' },
      { id: 't-10', date: '2026-08-29', time: '11:00', author: 'ياسين قدور', authorRole: 'موظف معالجة', action: 'مراسلة مصالح بلدية قمار ومديرية التربية' },
      { id: 't-11', date: '2026-09-04', time: '14:00', author: 'ياسين قدور', authorRole: 'موظف معالجة', action: 'تم إعداد الرد' },
      { id: 't-12', date: '2026-09-05', time: '11:00', author: 'عمر بن سالم', authorRole: 'مسؤول الخلية', action: 'تم اعتماد الرد وغلق الانشغال', note: 'تم تخصيص حافلة إضافية تابعة لحضيرة البلدية ابتداء من الدخول المدرسي الجديد.' }
    ],
    officialResponse: {
      text: 'استجابة لانشغالكم المسجل، يشرفنا إعلامكم أن السيد والي ولاية الوادي أسدى تعليمات لبلدية قمار بالتنسيق مع مديرية التربية لتسخير حافلة نقل مدرسي بسعة 30 مقعداً مخصصة لخط قرية الدبيديبي انطلاقاً من الأحد القادم.',
      preparedBy: 'ياسين قدور',
      preparedAt: '2026-09-04T14:00:00.000Z',
      reviewedBy: 'عمر بن سالم',
      reviewedAt: '2026-09-05T11:00:00.000Z',
      approved: true,
      letterNumber: '2026/خ.إ/849'
    },
    internalNotes: [],
    attachments: []
  },
  {
    id: 'WD-2026-00135',
    nin: '198839050099887766',
    fullName: 'حمزة مسعودي',
    phone: '0662334455',
    email: 'h.messaoudi@hotmail.com',
    applicantDaira: 'الرقيبة',
    applicantMunicipality: 'الرقيبة',
    applicantNeighborhood: 'القرية الفلاحية / سيدي عمران',
    subject: 'تأخر تسليم شهادة مطابقة البناء ورخصة السكن',
    grievanceDaira: 'الرقيبة',
    grievanceMunicipality: 'الرقيبة',
    category: 'العمران',
    sector: 'التعمير والبناء',
    details: 'أودعت ملف طلب شهادة المطابقة للبناء بمكتب التعمير لبلدية الرقيبة بتاريخ 15 جوان 2026 تحت رقم إيداع 412/2026 وحتى تاريخ اليوم لم أتحصل على الرد رغم انقضاء الآجال القانونية المحددة بالمرسوم التنفيذي.',
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-09-07T09:00:00.000Z',
    status: 'قيد المعالجة',
    priority: 'قصوى',
    specialFlags: ['متأخر'],
    assignedToId: 'usr-emp-2',
    assignedToName: 'فاطمة الزهراء عثماني',
    assignedDepartment: 'مصلحة العمران والبيئة والتهيئة',
    assignedAt: '2026-08-25T11:00:00.000Z',
    dueDate: '2026-09-01T18:00:00.000Z',
    isOverdue: true,
    timeline: [
      { id: 't-13', date: '2026-08-25', time: '10:00', author: 'حمزة مسعودي', authorRole: 'مواطن', action: 'تسجيل الانشغال' },
      { id: 't-14', date: '2026-08-25', time: '11:00', author: 'عمر بن سالم', authorRole: 'مسؤول الخلية', action: 'توجيه للمتصرفة فاطمة الزهراء' },
      { id: 't-15', date: '2026-08-26', time: '09:30', author: 'فاطمة الزهراء عثماني', authorRole: 'موظف معالجة', action: 'مراسلة رئيس المجلس الشعبي البلدي لبلدية الرقيبة' }
    ],
    internalNotes: [
      {
        id: 'n-2',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول الخلية',
        createdAt: '2026-09-03T08:30:00.000Z',
        text: 'تنبيه: الملف تجاوز الأجل القانوني، يرجى استعجال مديرية التعمير والبناء لإيفاد معاينة تفتيشية فورية.'
      }
    ],
    attachments: [
      { id: 'att-3', name: 'وصل_إيداع_بلدية_الرقيبة.pdf', size: '640 KB', type: 'application/pdf', uploadedAt: '2026-08-25' }
    ]
  },
  {
    id: 'WD-2026-00140',
    nin: '199539060012121212',
    fullName: 'نوال غربي',
    phone: '0555443322',
    applicantDaira: 'الدبيلة',
    applicantMunicipality: 'الدبيلة',
    applicantNeighborhood: 'حي الزهور',
    subject: 'طلب صيانة الإنارة العمومية وإصلاح الأسلاك المكشوفة',
    grievanceDaira: 'الدبيلة',
    grievanceMunicipality: 'الدبيلة',
    category: 'البيئة',
    sector: 'الصيانة والمرافق الحضرية',
    details: 'أعمدة الإنارة العمومية معطلة في الشارع المؤدي للمستوصف منذ أكثر من شهر، وتوجد أسلاك كهربائية مكشوفة تشكل خطراً داهماً على سلامة الأطفال والمشاة ليلاً.',
    createdAt: '2026-09-08T07:15:00.000Z',
    updatedAt: '2026-09-08T07:15:00.000Z',
    status: 'جديد',
    priority: 'عاجل',
    specialFlags: ['عاجل'],
    dueDate: '2026-09-15T18:00:00.000Z',
    isOverdue: false,
    timeline: [
      { id: 't-16', date: '2026-09-08', time: '07:15', author: 'المواطنة نوال غربي', authorRole: 'مواطن', action: 'تم تسجيل الانشغال إلكترونياً (بانتظار التوزيع والإسناد)' }
    ],
    internalNotes: [],
    attachments: [
      { id: 'att-4', name: 'صورة_الأسلاك_المكشوفة.jpg', size: '1.4 MB', type: 'image/jpeg', uploadedAt: '2026-09-08' }
    ]
  },
  {
    id: 'WD-2026-00142',
    nin: '197539070055667788',
    fullName: 'الطاهر لعموري',
    phone: '0663778899',
    applicantDaira: 'المقرن',
    applicantMunicipality: 'سيدي عون',
    applicantNeighborhood: 'القرية الفلاحية سيدي عون',
    subject: 'تصحيح خطأ مادي في عقد الميلاد الإداري بسجل الحالة المدنية',
    grievanceDaira: 'المقرن',
    grievanceMunicipality: 'سيدي عون',
    category: 'الحالة المدنية',
    sector: 'الحالة المدنية والشؤون القانونية',
    details: 'يوجد خطأ مادي في لقب الجد بسجل الحالة المدنية لبلدية سيدي عون لسنة 1948، أطلب تسهيل إجراءات تصحيحه إدارياً عملاً بالمنشور الوزاري المشترك دون تكبد عناء رفع دعوى قضائية.',
    createdAt: '2026-09-05T12:00:00.000Z',
    updatedAt: '2026-09-07T10:00:00.000Z',
    status: 'بانتظار معلومات',
    priority: 'عادي',
    specialFlags: [],
    assignedToId: 'usr-emp-1',
    assignedToName: 'أحمد بن عمار',
    assignedDepartment: 'مصلحة الشؤون الاجتماعية والتنمية المحلية',
    assignedAt: '2026-09-05T13:30:00.000Z',
    dueDate: '2026-09-12T18:00:00.000Z',
    isOverdue: false,
    timeline: [
      { id: 't-17', date: '2026-09-05', time: '12:00', author: 'الطاهر لعموري', authorRole: 'مواطن', action: 'تسجيل الانشغال' },
      { id: 't-18', date: '2026-09-05', time: '13:30', author: 'عمر بن سالم', authorRole: 'مسؤول الخلية', action: 'تم الإسناد لأحمد بن عمار' },
      { id: 't-19', date: '2026-09-07', time: '10:00', author: 'أحمد بن عمار', authorRole: 'موظف معالجة', action: 'طلب وثائق تكميلية من المواطن', note: 'يرجى إرسال نسخة من الدفتر العائلي الأصلي للأب أو عقد الزواج الأصلي لتأكيد كتابة اللقب.' }
    ],
    internalNotes: [],
    attachments: []
  },
  {
    id: 'WD-2026-00145',
    nin: '198239080066778899',
    fullName: 'يوسف شوشان',
    phone: '0551223344',
    applicantDaira: 'الطالب العربي',
    applicantMunicipality: 'بن قشة',
    applicantNeighborhood: 'الحدود الشرقية / بن قشة المركز',
    subject: 'تهيئة المسلك الرابط بين القرية والمركز الصحي الحدودي',
    grievanceDaira: 'الطالب العربي',
    grievanceMunicipality: 'بن قشة',
    category: 'العمران',
    sector: 'الأشغال العمومية والمنشآت',
    details: 'المسلك الترابي المؤدي للمستوصف الريفي ببن قشة يتعرض لزحف الرمال خلال مواسم الرياح مما يمنع سيارات الإسعاف وسيارات المواطنين من العبور، نطالب بتعبيده وتثبيت حواف الطريق.',
    createdAt: '2026-09-07T08:00:00.000Z',
    updatedAt: '2026-09-07T11:00:00.000Z',
    status: 'تم الإسناد',
    priority: 'متوسط',
    specialFlags: [],
    assignedToId: 'usr-emp-2',
    assignedToName: 'فاطمة الزهراء عثماني',
    assignedDepartment: 'مصلحة العمران والبيئة والتهيئة',
    assignedAt: '2026-09-07T11:00:00.000Z',
    dueDate: '2026-09-14T18:00:00.000Z',
    isOverdue: false,
    timeline: [
      { id: 't-20', date: '2026-09-07', time: '08:00', author: 'يوسف شوشان', authorRole: 'مواطن', action: 'تسجيل الانشغال' },
      { id: 't-21', date: '2026-09-07', time: '11:00', author: 'عمر بن سالم', authorRole: 'مسؤول الخلية', action: 'تم الإسناد لفاطمة الزهراء عثماني' }
    ],
    internalNotes: [],
    attachments: []
  },
  {
    id: 'WD-2026-00148',
    fullName: 'رابح دبابش',
    phone: '0664998877',
    applicantDaira: 'الرباح',
    applicantMunicipality: 'النخلة',
    applicantNeighborhood: 'الطرفاية',
    subject: 'تراكم النفايات المنزلية وغياب حاويات الجمع',
    grievanceDaira: 'الرباح',
    grievanceMunicipality: 'النخلة',
    category: 'البيئة',
    sector: 'النظافة والبيئة',
    details: 'نلفت عناية مصالحكم إلى تراكم أكوام القمامة عند مدخل حي الطرفاية بسبب نقص شاحنات الرفع التابعة لبلدية النخلة، نرجو تدعيم الحي بحاويات حديدية تفادياً لانتشار الحشرات والروائح.',
    createdAt: '2026-09-08T09:00:00.000Z',
    updatedAt: '2026-09-08T09:00:00.000Z',
    status: 'جديد',
    priority: 'عادي',
    specialFlags: [],
    dueDate: '2026-09-15T18:00:00.000Z',
    isOverdue: false,
    timeline: [
      { id: 't-22', date: '2026-09-08', time: '09:00', author: 'رابح دبابش', authorRole: 'مواطن', action: 'تسجيل الانشغال' }
    ],
    internalNotes: [],
    attachments: []
  }
];

// =========================================================================
// INITIAL SEED AUDIT LOGS
// =========================================================================
export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-08T09:10:00.000Z',
    userId: 'usr-supervisor',
    userName: 'عمر بن سالم',
    userRole: 'مسؤول الخلية',
    action: 'توجيه وإسناد انشغال',
    targetId: 'WD-2026-00145',
    targetType: 'انشغال',
    previousValue: 'غير مسند (جديد)',
    newValue: 'مسند للموظفة: فاطمة الزهراء عثماني',
    details: 'قام مسؤول الخلية بإسناد الانشغال WD-2026-00145 إلى الموظفة فاطمة الزهراء عثماني للمتابعة مع مديرية الأشغال العمومية.'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-07T14:15:00.000Z',
    userId: 'usr-emp-1',
    userName: 'أحمد بن عمار',
    userRole: 'موظف معالجة',
    action: 'إضافة ملاحظة داخلية',
    targetId: 'WD-2026-00125',
    targetType: 'انشغال',
    details: 'أضاف الموظف أحمد بن عمار ملاحظة داخلية تفيد بتأكيد سونلغاز تقدم أشغال الربط بمحيط حاسي خليفة.'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-06T15:45:00.000Z',
    userId: 'usr-emp-1',
    userName: 'أحمد بن عمار',
    userRole: 'موظف معالجة',
    action: 'إعداد رد رسمي وإحالته للمراجعة',
    targetId: 'WD-2026-00128',
    targetType: 'انشغال',
    previousValue: 'قيد المعالجة',
    newValue: 'بانتظار المراجعة',
    details: 'أتم الموظف أحمد بن عمار صياغة الرد على شكوى حي الرمال بالبياضة بعد استلام تقرير الجزائرية للمياه وأحاله لاعتماد المسؤول.'
  },
  {
    id: 'log-4',
    timestamp: '2026-09-05T11:00:00.000Z',
    userId: 'usr-supervisor',
    userName: 'عمر بن سالم',
    userRole: 'مسؤول الخلية',
    action: 'اعتماد الرد وغلق الانشغال',
    targetId: 'WD-2026-00130',
    targetType: 'انشغال',
    previousValue: 'بانتظار المراجعة',
    newValue: 'مغلق ومسوى',
    details: 'اعتمد مسؤول الخلية الرد الرسمي تحت رقم 2026/خ.إ/849 وأغلق ملف النقل المدرسي ببلدية قمار بعد التكفل التام.'
  }
];

// =========================================================================
// INITIAL SEED NOTIFICATIONS
// =========================================================================
export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'انشغال جديد بانتظار التوزيع والإسناد',
    message: 'تم تسجيل الانشغال WD-2026-00140 بشأن أسلاك الإنارة المكشوفة ببلدية الدبيلة بحاجة لإسناد فوري.',
    targetRole: 'supervisor',
    grievanceId: 'WD-2026-00140',
    read: false,
    createdAt: '2026-09-08T07:20:00.000Z',
    type: 'urgent'
  },
  {
    id: 'notif-2',
    title: 'رد رسمي جاهز للاعتماد والمراجعة',
    message: 'أعد الموظف أحمد بن عمار مسودة رد على ملف التزويد بالماء WD-2026-00128 وينتظر مراجعتكم.',
    targetRole: 'supervisor',
    grievanceId: 'WD-2026-00128',
    read: false,
    createdAt: '2026-09-06T15:50:00.000Z',
    type: 'review'
  },
  {
    id: 'notif-3',
    title: 'ملف مسند إليكم حديثاً',
    message: 'قام مسؤول الخلية بإسناد الانشغال WD-2026-00145 (تهيئة مسلك بن قشة) لمتابعتكم.',
    targetUserId: 'usr-emp-2',
    grievanceId: 'WD-2026-00145',
    read: false,
    createdAt: '2026-09-07T11:05:00.000Z',
    type: 'assignment'
  },
  {
    id: 'notif-4',
    title: 'تنبيه تأخر: تجاوز المهلة المحددة',
    message: 'الملف WD-2026-00135 (شهادة مطابقة البناء - الرقيبة) تجاوز مهلة 7 أيام المحددة في ميثاق الخدمة.',
    targetRole: 'supervisor',
    grievanceId: 'WD-2026-00135',
    read: false,
    createdAt: '2026-09-03T08:00:00.000Z',
    type: 'overdue'
  }
];

// =========================================================================
// ADMIN SERVICE IMPLEMENTATION
// =========================================================================

export const AdminService = {
  // --- USERS & SESSION ---
  getUsers: (): SystemUser[] => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed: SystemUser[] = JSON.parse(stored);
        // Only keep the 3 supported roles: supervisor, employee, super_admin
        const valid = parsed.filter(u => u.role === 'supervisor' || u.role === 'employee' || u.role === 'super_admin');
        if (valid.length !== parsed.length || valid.length === 0) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
          return SEED_USERS;
        }
        return valid;
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  },

  getCurrentUser: (): SystemUser => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const allUsers = AdminService.getUsers();
        const found = allUsers.find(u => u.id === parsed.id);
        if (found && (found.role === 'supervisor' || found.role === 'employee' || found.role === 'super_admin')) {
          return found;
        }
      }
      // Default to supervisor for first load
      const defaultUser = SEED_USERS[0];
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    } catch {
      return SEED_USERS[0];
    }
  },

  setCurrentUser: (user: SystemUser): void => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  switchUserById: (userId: string): SystemUser => {
    const users = AdminService.getUsers();
    const user = users.find(u => u.id === userId) || users[0];
    AdminService.setCurrentUser(user);
    return user;
  },

  // Official PIN Authentication for /admin
  // مسؤول خلية: 0000 | موظف معالج: 1111 | Super admin: 1234
  verifyPin: (role: UserRole, pin: string): boolean => {
    const expected = ROLE_PINS[role];
    return expected === pin.trim();
  },

  loginWithPinAndRole: (role: UserRole, pin: string): { success: boolean; user?: SystemUser; error?: string } => {
    const trimmed = pin.trim();
    const expected = ROLE_PINS[role];
    if (trimmed !== expected) {
      return { 
        success: false, 
        error: `الرمز السري غير صحيح. الرمز المعتمد لدور ${role === 'supervisor' ? 'مسؤول خلية (0000)' : role === 'employee' ? 'موظف معالج (1111)' : 'Super admin (1234)'} هو المطلوب.` 
      };
    }

    const users = AdminService.getUsers();
    // Prioritize primary user for that role
    let targetUser: SystemUser | undefined;
    if (role === 'supervisor') {
      targetUser = users.find(u => u.id === 'usr-supervisor') || users.find(u => u.role === 'supervisor');
    } else if (role === 'super_admin') {
      targetUser = users.find(u => u.id === 'usr-admin') || users.find(u => u.role === 'super_admin');
    } else {
      targetUser = users.find(u => u.id === 'usr-emp-1') || users.find(u => u.role === 'employee');
    }

    if (!targetUser) {
      targetUser = SEED_USERS.find(u => u.role === role) || SEED_USERS[0];
    }

    AdminService.setCurrentUser(targetUser);
    AdminService.setAdminLoggedIn(true);

    AdminService.logAudit({
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.roleTitle,
      action: 'تسجيل دخول إداري /admin',
      targetId: targetUser.id,
      targetType: 'موظف',
      newValue: 'متصل بالنظام الإداري',
      details: `تم التحقق بنجاح من الرمز السري الرسمي وتسجيل الدخول بحساب (${targetUser.name} - ${targetUser.roleTitle}).`
    });

    return { success: true, user: targetUser };
  },

  isAdminLoggedIn: (): boolean => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setAdminLoggedIn: (status: boolean): void => {
    try {
      if (status) {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } else {
        localStorage.removeItem(ADMIN_AUTH_KEY);
      }
    } catch {}
  },

  logoutAdmin: (): void => {
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {}
  },

  loginWithPinUniversal: (pin: string): { success: boolean; user?: SystemUser; error?: string } => {
    const trimmed = pin.trim();
    if (trimmed === '0000') {
      return AdminService.loginWithPinAndRole('supervisor', '0000');
    }
    if (trimmed === '1111') {
      return AdminService.loginWithPinAndRole('employee', '1111');
    }
    if (trimmed === '1234') {
      return AdminService.loginWithPinAndRole('super_admin', '1234');
    }
    return {
      success: false,
      error: 'رمز PIN غير صالح. الرموز المعتمدة: مسؤل خلية (0000)، موظف معالج (1111)، Super admin (1234)'
    };
  },

  addUser: (userData: Omit<SystemUser, 'id' | 'assignedCount' | 'resolvedCount' | 'overdueCount' | 'lastActive'>, actor: SystemUser): SystemUser => {
    const users = AdminService.getUsers();
    const newUser: SystemUser = {
      ...userData,
      id: `usr-emp-${Date.now()}`,
      assignedCount: 0,
      resolvedCount: 0,
      overdueCount: 0,
      lastActive: 'نشط حديثاً',
      permissions: userData.role === 'employee' 
        ? ['view_assigned', 'process', 'draft_response', 'add_notes', 'request_info']
        : userData.role === 'supervisor'
        ? ['view_all', 'assign', 'approve', 'manage_staff', 'reports', 'audit_log', 'settings']
        : ['all', 'super_admin_map', 'view_all', 'reports', 'audit_log', 'manage_staff', 'settings'],
      pinCode: userData.role === 'supervisor' ? '0000' : userData.role === 'employee' ? '1111' : '1234'
    };
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إضافة موظف جديد',
      targetId: newUser.id,
      targetType: 'موظف',
      newValue: `${newUser.name} (${newUser.roleTitle})`,
      details: `قام ${actor.name} بإضافة المستخدم ${newUser.name} وتعيينه في ${newUser.department}.`
    });

    return newUser;
  },

  updateUser: (id: string, updates: Partial<SystemUser>, actor: SystemUser): SystemUser | null => {
    const users = AdminService.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    const old = users[idx];
    const updated = { ...old, ...updates };
    users[idx] = updated;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'تعديل بيانات موظف',
      targetId: id,
      targetType: 'موظف',
      previousValue: `${old.name} - ${old.status}`,
      newValue: `${updated.name} - ${updated.status}`,
      details: `قام ${actor.name} بتعديل بيانات المستخدم ${old.name}.`
    });

    return updated;
  },

  toggleUserStatus: (id: string, actor: SystemUser): SystemUser | null => {
    const users = AdminService.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const user = users[idx];
    const newStatus: 'نشط' | 'معطل' = user.status === 'نشط' ? 'معطل' : 'نشط';
    user.status = newStatus;
    users[idx] = user;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: newStatus === 'نشط' ? 'إعادة تفعيل حساب' : 'تعطيل حساب موظف',
      targetId: id,
      targetType: 'موظف',
      previousValue: newStatus === 'نشط' ? 'معطل' : 'نشط',
      newValue: newStatus,
      details: `تم ${newStatus === 'نشط' ? 'إعادة تفعيل' : 'تعطيل'} حساب المستخدم ${user.name} بواسطة ${actor.name}.`
    });

    return user;
  },

  // --- GRIEVANCES & RBAC FILTERING ---
  getAllGrievances: (): EnhancedGrievance[] => {
    try {
      // 1. Get admin grievances
      let grievances: EnhancedGrievance[] = [];
      const stored = localStorage.getItem(GRIEVANCES_STORAGE_KEY);
      if (stored) {
        grievances = JSON.parse(stored);
        // Ensure new mock cases are injected if missing
        let addedSeed = false;
        MOCK_COMPLAINTS_SEED.forEach(seedItem => {
          if (!grievances.some(g => g.id.toUpperCase() === seedItem.id.toUpperCase())) {
            grievances.push(seedItem);
            addedSeed = true;
          }
        });
        if (addedSeed) {
          localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));
        }
      } else {
        grievances = SEED_GRIEVANCES;
        localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));
      }

      // 2. Synchronize with citizen submissions from `wilaya_eloued_grievances`
      const citizenRaw = localStorage.getItem('wilaya_eloued_grievances');
      if (citizenRaw) {
        const citizenSubmissions = JSON.parse(citizenRaw);
        let hasNew = false;
        for (const sub of citizenSubmissions) {
          const exists = grievances.some(g => g.id === sub.id);
          if (!exists) {
            const newEnhanced: EnhancedGrievance = {
              id: sub.id,
              nin: sub.nin || '',
              fullName: sub.fullName || 'مواطن',
              phone: sub.phone || '',
              applicantDaira: sub.applicantDaira || 'الوادي',
              applicantMunicipality: sub.applicantMunicipality || 'الوادي',
              applicantNeighborhood: sub.applicantNeighborhood || 'حي سكني',
              subject: sub.subject || 'انشغال إداري',
              grievanceDaira: sub.grievanceDaira || sub.applicantDaira || 'الوادي',
              grievanceMunicipality: sub.grievanceMunicipality || sub.applicantMunicipality || 'الوادي',
              category: sub.category || 'أخرى',
              sector: 'الشؤون الإدارية العامة',
              details: sub.details || '',
              createdAt: sub.createdAt || new Date().toISOString(),
              updatedAt: sub.createdAt || new Date().toISOString(),
              status: 'جديد',
              priority: 'متوسط',
              specialFlags: [],
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              isOverdue: false,
              timeline: [
                {
                  id: `t-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
                  author: sub.fullName || 'مواطن',
                  authorRole: 'مواطن',
                  action: 'تم تسجيل الانشغال عبر البوابة الإلكترونية'
                }
              ],
              internalNotes: [],
              attachments: []
            };
            grievances.unshift(newEnhanced);
            hasNew = true;
          }
        }
        if (hasNew) {
          localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));
        }
      }

      return grievances;
    } catch {
      return SEED_GRIEVANCES;
    }
  },

  getGrievancesForUser: (user: SystemUser): EnhancedGrievance[] => {
    const all = AdminService.getAllGrievances();
    // RBAC Rule 1: Employee sees only their assigned files
    if (user.role === 'employee') {
      return all.filter(g => g.assignedToId === user.id);
    }
    // Supervisor, Super Admin, Viewer see all files
    return all;
  },

  getGrievanceById: (id: string, user: SystemUser): EnhancedGrievance | null => {
    const all = AdminService.getAllGrievances();
    const g = all.find(item => item.id === id);
    if (!g) return null;

    // RBAC check: Employee cannot access files not assigned to them
    if (user.role === 'employee' && g.assignedToId !== user.id) {
      return null;
    }
    return g;
  },

  // Save changes to grievances store and recalculate employee counters
  saveGrievances: (grievances: EnhancedGrievance[]): void => {
    localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));
    
    // Update user stats
    const users = AdminService.getUsers();
    let usersUpdated = false;
    for (const u of users) {
      if (u.role === 'employee') {
        const assigned = grievances.filter(g => g.assignedToId === u.id);
        const resolved = assigned.filter(g => g.status === 'تمت المعالجة' || g.status === 'مغلق').length;
        const overdue = assigned.filter(g => g.isOverdue).length;
        if (u.assignedCount !== assigned.length || u.resolvedCount !== resolved || u.overdueCount !== overdue) {
          u.assignedCount = assigned.length;
          u.resolvedCount = resolved;
          u.overdueCount = overdue;
          usersUpdated = true;
        }
      }
    }
    if (usersUpdated) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  },

  // --- ACTIONS WITH STRICT RBAC ---

  // 1. Assign / Reassign (Supervisor / Super Admin only)
  assignGrievance: (
    grievanceId: string, 
    employeeId: string, 
    instructions: string, 
    actor: SystemUser
  ): boolean => {
    if (actor.role !== 'supervisor' && actor.role !== 'super_admin') {
      throw new Error('غير مصرح: عملية إسناد الانشغال محصورة بالمسؤول الإداري فقط.');
    }

    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    const users = AdminService.getUsers();
    const emp = users.find(u => u.id === employeeId);

    if (!g || !emp) return false;

    const previousAssignee = g.assignedToName || 'غير مسند';
    g.assignedToId = emp.id;
    g.assignedToName = emp.name;
    g.assignedDepartment = emp.department;
    g.assignedAt = new Date().toISOString();
    g.status = 'تم الإسناد';
    g.updatedAt = new Date().toISOString();

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

    g.timeline.push({
      id: `t-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      author: actor.name,
      authorRole: actor.roleTitle,
      action: previousAssignee === 'غير مسند' ? 'تم توجيهه وإسناده للموظف المختص' : 'تمت إعادة الإسناد لموظف آخر',
      note: instructions ? `الملاحظات والتوجيهات: ${instructions}` : `تم الإسناد للموظف ${emp.name}`,
      statusFrom: g.status,
      statusTo: 'تم الإسناد'
    });

    AdminService.saveGrievances(grievances);

    // Audit Log
    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إسناد انشغال',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: previousAssignee,
      newValue: emp.name,
      details: `قام ${actor.name} بإسناد الانشغال ${g.id} إلى الموظف ${emp.name} (${emp.department}).`
    });

    // Notify the employee
    AdminService.addNotification({
      title: 'انشغال جديد مسند إليك',
      message: `قام مسؤول الخلية بإسناد الانشغال ${g.id} إليك بشأن "${g.subject}".`,
      targetUserId: emp.id,
      grievanceId: g.id,
      type: 'assignment'
    });

    return true;
  },

  // 2. Start Processing (Employee assigned to it or Supervisor)
  startProcessing: (grievanceId: string, actor: SystemUser): boolean => {
    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    if (actor.role === 'employee' && g.assignedToId !== actor.id) {
      throw new Error('غير مصرح: لا يمكنك معالجة انشغال غير مسند إليك.');
    }

    g.status = 'قيد المعالجة';
    g.updatedAt = new Date().toISOString();

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'بدأت المعالجة والتحري الإداري',
      note: 'تم فتح الملف والمباشرة في دراسة المعطيات والاتصال بالمصالح المعنية.',
      statusFrom: 'تم الإسناد',
      statusTo: 'قيد المعالجة'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'بدء معالجة انشغال',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: 'تم الإسناد',
      newValue: 'قيد المعالجة',
      details: `باشر ${actor.name} معالجة الانشغال ${g.id}.`
    });

    return true;
  },

  // 3. Add Internal Note
  addInternalNote: (grievanceId: string, text: string, actor: SystemUser): boolean => {
    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    if (actor.role === 'employee' && g.assignedToId !== actor.id) {
      throw new Error('غير مصرح: لا تملك صلاحية إضافة ملاحظات على هذا الملف.');
    }

    const note: InternalNote = {
      id: `note-${Date.now()}`,
      author: actor.name,
      authorRole: actor.roleTitle,
      createdAt: new Date().toISOString(),
      text
    };

    g.internalNotes.push(note);
    g.updatedAt = new Date().toISOString();

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إضافة ملاحظة داخلية',
      targetId: g.id,
      targetType: 'انشغال',
      details: `سجل ${actor.name} ملاحظة داخلية على الملف ${g.id}.`
    });

    return true;
  },

  // 4. Request Additional Info from Citizen
  requestAdditionalInfo: (grievanceId: string, requestText: string, actor: SystemUser): boolean => {
    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    if (actor.role === 'employee' && g.assignedToId !== actor.id) {
      throw new Error('غير مصرح.');
    }

    const prevStatus = g.status;
    g.status = 'بانتظار معلومات';
    g.specialFlags = Array.from(new Set([...g.specialFlags]));
    g.updatedAt = new Date().toISOString();

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'تم طلب معلومات أو وثائق تكميلية من المواطن',
      note: requestText,
      statusFrom: prevStatus,
      statusTo: 'بانتظار معلومات'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'طلب معلومات إضافية',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevStatus,
      newValue: 'بانتظار معلومات',
      details: `طلب ${actor.name} معلومات تكميلية من المواطن في الملف ${g.id}: ${requestText}`
    });

    return true;
  },

  // 5. Submit Draft Response for Review (Employee)
  submitDraftResponse: (grievanceId: string, responseText: string, actor: SystemUser): boolean => {
    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    if (actor.role === 'employee' && g.assignedToId !== actor.id) {
      throw new Error('غير مصرح.');
    }

    const prevStatus = g.status;
    g.status = 'بانتظار المراجعة';
    g.updatedAt = new Date().toISOString();

    g.officialResponse = {
      text: responseText,
      preparedBy: actor.name,
      preparedAt: new Date().toISOString(),
      approved: false
    };

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'تم إعداد مسودة الرد وإحالتها للمراجعة',
      note: 'تم إعداد الرد النهائي بناءً على إفادات القطاع المعني وإحالته لاعتماد مسؤول الخلية.',
      statusFrom: prevStatus,
      statusTo: 'بانتظار المراجعة'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إعداد رد وإحالته للمراجعة',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevStatus,
      newValue: 'بانتظار المراجعة',
      details: `قام ${actor.name} بإعداد مسودة رد على الانشغال ${g.id} وإحالته للمراجعة والاعتماد.`
    });

    // Notify Supervisor
    AdminService.addNotification({
      title: 'رد جديد بانتظار الاعتماد',
      message: `أتم الموظف ${actor.name} الرد على الملف ${g.id} وينتظر مراجعتكم.`,
      targetRole: 'supervisor',
      grievanceId: g.id,
      type: 'review'
    });

    return true;
  },

  // 6. Approve Response and Close (Supervisor / Super Admin)
  approveResponseAndClose: (
    grievanceId: string, 
    letterNumber: string, 
    revisedText: string | undefined, 
    actor: SystemUser
  ): boolean => {
    if (actor.role !== 'supervisor' && actor.role !== 'super_admin') {
      throw new Error('غير مصرح: اعتماد الردود وغلق الملفات محصور بمسؤول الخلية.');
    }

    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g || !g.officialResponse) return false;

    const prevStatus = g.status;
    g.status = 'مغلق';
    g.updatedAt = new Date().toISOString();

    if (revisedText) {
      g.officialResponse.text = revisedText;
    }
    g.officialResponse.reviewedBy = actor.name;
    g.officialResponse.reviewedAt = new Date().toISOString();
    g.officialResponse.approved = true;
    g.officialResponse.letterNumber = letterNumber || `2026/خ.إ/${Math.floor(100 + Math.random() * 900)}`;

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'تم اعتماد الرد وغلق الانشغال',
      note: `تم اعتماد الرد رسمياً تحت رقم المراسلة: ${g.officialResponse.letterNumber}. الملف مغلق ومحفوظ.`,
      statusFrom: prevStatus,
      statusTo: 'مغلق'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'اعتماد رد وغلق انشغال',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevStatus,
      newValue: 'مغلق ومسوى',
      details: `اعتمد ${actor.name} الرد على الانشغال ${g.id} تحت رقم ${g.officialResponse.letterNumber} وقام بغلق الملف.`
    });

    // Notify assigned employee if exists
    if (g.assignedToId) {
      AdminService.addNotification({
        title: 'تم اعتماد الرد وغلق الملف',
        message: `اعتمد مسؤول الخلية الرد على الملف ${g.id} وتم غلقه رسمياً.`,
        targetUserId: g.assignedToId,
        grievanceId: g.id,
        type: 'info'
      });
    }

    return true;
  },

  // 7. Return Response to Employee for Revision (Supervisor)
  returnResponseToEmployee: (grievanceId: string, revisionNotes: string, actor: SystemUser): boolean => {
    if (actor.role !== 'supervisor' && actor.role !== 'super_admin') {
      throw new Error('غير مصرح.');
    }

    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    const prevStatus = g.status;
    g.status = 'قيد المعالجة';
    g.updatedAt = new Date().toISOString();

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'تمت إعادة الملف للموظف لتعديل الرد أو استكمال المعطيات',
      note: `ملاحظات المسؤول: ${revisionNotes}`,
      statusFrom: prevStatus,
      statusTo: 'قيد المعالجة'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إعادة ملف للموظف للمراجعة',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevStatus,
      newValue: 'قيد المعالجة',
      details: `أعاد ${actor.name} الملف ${g.id} للموظف مع ملاحظات: ${revisionNotes}`
    });

    if (g.assignedToId) {
      AdminService.addNotification({
        title: 'إعادة ملف لمراجعة الرد',
        message: `قام مسؤول الخلية بإعادة الملف ${g.id} إليك لإعادة صياغة الرد: ${revisionNotes}`,
        targetUserId: g.assignedToId,
        grievanceId: g.id,
        type: 'review'
      });
    }

    return true;
  },

  // 8. Change Priority (Supervisor / Super Admin)
  updatePriority: (grievanceId: string, priority: GrievancePriority, actor: SystemUser): boolean => {
    if (actor.role !== 'supervisor' && actor.role !== 'super_admin') {
      throw new Error('غير مصرح: تغيير الأولوية محصور بالمسؤول.');
    }

    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    const prevPriority = g.priority;
    g.priority = priority;
    g.updatedAt = new Date().toISOString();

    if (priority === 'عاجل' || priority === 'قصوى') {
      if (!g.specialFlags.includes('عاجل')) g.specialFlags.push('عاجل');
    }

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'تغيير أولوية الانشغال',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevPriority,
      newValue: priority,
      details: `غير ${actor.name} أولوية الملف ${g.id} من ${prevPriority} إلى ${priority}.`
    });

    return true;
  },

  // 9. Reopen Grievance (Supervisor / Super Admin)
  reopenGrievance: (grievanceId: string, reason: string, actor: SystemUser): boolean => {
    if (actor.role !== 'supervisor' && actor.role !== 'super_admin') {
      throw new Error('غير مصرح.');
    }

    const grievances = AdminService.getAllGrievances();
    const g = grievances.find(item => item.id === grievanceId);
    if (!g) return false;

    const prevStatus = g.status;
    g.status = 'قيد المعالجة';
    g.updatedAt = new Date().toISOString();

    const now = new Date();
    g.timeline.push({
      id: `t-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      author: actor.name,
      authorRole: actor.roleTitle,
      action: 'تمت إعادة فتح الملف بناءً على معطيات جديدة',
      note: `سبب إعادة الفتح: ${reason}`,
      statusFrom: prevStatus,
      statusTo: 'قيد المعالجة'
    });

    AdminService.saveGrievances(grievances);

    AdminService.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.roleTitle,
      action: 'إعادة فتح انشغال مغلق',
      targetId: g.id,
      targetType: 'انشغال',
      previousValue: prevStatus,
      newValue: 'قيد المعالجة',
      details: `قام ${actor.name} بإعادة فتح الملف ${g.id} للسبب: ${reason}`
    });

    return true;
  },

  // --- STATS & ANALYTICS ---

  // Executive Stats for Supervisor Dashboard
  getExecutiveStats: (): ExecutiveStats => {
    const grievances = AdminService.getAllGrievances();
    const total = grievances.length;
    const newUnassigned = grievances.filter(g => g.status === 'جديد').length;
    const inProgress = grievances.filter(g => g.status === 'قيد المعالجة' || g.status === 'تم الإسناد').length;
    const pendingReview = grievances.filter(g => g.status === 'بانتظار المراجعة').length;
    const pendingInfo = grievances.filter(g => g.status === 'بانتظار معلومات').length;
    const resolved = grievances.filter(g => g.status === 'تمت المعالجة').length;
    const closed = grievances.filter(g => g.status === 'مغلق').length;
    const overdue = grievances.filter(g => g.isOverdue).length;
    const urgent = grievances.filter(g => g.priority === 'عاجل' || g.priority === 'قصوى').length;

    const resolvedOrClosed = resolved + closed;
    const resolutionRate = total > 0 ? Math.round((resolvedOrClosed / total) * 100) : 0;

    // By municipality distribution
    const munMap: Record<string, number> = {};
    for (const g of grievances) {
      const m = g.grievanceMunicipality || 'أخرى';
      munMap[m] = (munMap[m] || 0) + 1;
    }
    const byMunicipality = Object.entries(munMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // By category
    const catMap: Record<string, number> = {};
    for (const g of grievances) {
      const c = g.category || 'أخرى';
      catMap[c] = (catMap[c] || 0) + 1;
    }
    const byCategory = Object.entries(catMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // By sector
    const secMap: Record<string, number> = {};
    for (const g of grievances) {
      const s = g.sector || 'قطاعات أخرى';
      secMap[s] = (secMap[s] || 0) + 1;
    }
    const bySector = Object.entries(secMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const weeklyTrend = [
      { day: 'السبت', received: 12, resolved: 9 },
      { day: 'الأحد', received: 19, resolved: 14 },
      { day: 'الإثنين', received: 15, resolved: 17 },
      { day: 'الثلاثاء', received: 22, resolved: 18 },
      { day: 'الأربعاء', received: 16, resolved: 13 },
      { day: 'الخميس', received: 8, resolved: 11 },
    ];

    return {
      total,
      newUnassigned,
      inProgress,
      pendingReview,
      pendingInfo,
      resolved,
      closed,
      overdue,
      urgent,
      resolutionRate,
      averageResolutionDays: 3.4,
      byMunicipality,
      byCategory,
      bySector,
      weeklyTrend
    };
  },

  // Employee Stats for Employee Dashboard ("ماذا يجب أن أعالج الآن؟")
  getEmployeeStats: (employeeId: string): EmployeeStats => {
    const all = AdminService.getAllGrievances();
    const assigned = all.filter(g => g.assignedToId === employeeId);
    const assignedTotal = assigned.length;
    const newAssigned = assigned.filter(g => g.status === 'تم الإسناد').length;
    const inProgress = assigned.filter(g => g.status === 'قيد المعالجة').length;
    const pendingInfo = assigned.filter(g => g.status === 'بانتظار معلومات').length;
    const pendingReview = assigned.filter(g => g.status === 'بانتظار المراجعة').length;
    const resolvedOrClosed = assigned.filter(g => g.status === 'تمت المعالجة' || g.status === 'مغلق').length;
    const overdue = assigned.filter(g => g.isOverdue).length;
    const completionRate = assignedTotal > 0 ? Math.round((resolvedOrClosed / assignedTotal) * 100) : 100;

    return {
      assignedTotal,
      newAssigned,
      inProgress,
      pendingInfo,
      pendingReview,
      resolvedOrClosed,
      overdue,
      completionRate,
      avgResponseDays: 2.8
    };
  },

  // --- AUDIT LOGS ---
  getAuditLogs: (limit = 100): AuditLogEntry[] => {
    try {
      const stored = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored).slice(0, limit);
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS.slice(0, limit);
    } catch {
      return SEED_AUDIT_LOGS;
    }
  },

  logAudit: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void => {
    try {
      const logs = AdminService.getAuditLogs(200);
      const newEntry: AuditLogEntry = {
        ...entry,
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      logs.unshift(newEntry);
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // ignore
    }
  },

  // --- NOTIFICATIONS ---
  getNotificationsForUser: (user: SystemUser): NotificationItem[] => {
    try {
      let notifs: NotificationItem[] = [];
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        notifs = JSON.parse(stored);
      } else {
        notifs = SEED_NOTIFICATIONS;
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
      }

      return notifs.filter(n => {
        if (n.targetUserId === user.id) return true;
        if (n.targetRole === 'all') return true;
        if (n.targetRole === user.role) return true;
        if (user.role === 'super_admin') return true;
        return false;
      });
    } catch {
      return SEED_NOTIFICATIONS;
    }
  },

  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): void => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const notifs: NotificationItem[] = stored ? JSON.parse(stored) : SEED_NOTIFICATIONS;
      const newNotif: NotificationItem = {
        ...item,
        id: `notif-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false
      };
      notifs.unshift(newNotif);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
    } catch {
      // ignore
    }
  },

  markNotificationAsRead: (id: string): void => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!stored) return;
      const notifs: NotificationItem[] = JSON.parse(stored);
      const n = notifs.find(item => item.id === id);
      if (n) {
        n.read = true;
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
      }
    } catch {
      // ignore
    }
  },

  markAllNotificationsAsRead: (user: SystemUser): void => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!stored) return;
      const notifs: NotificationItem[] = JSON.parse(stored);
      for (const n of notifs) {
        if (n.targetUserId === user.id || n.targetRole === user.role || n.targetRole === 'all') {
          n.read = true;
        }
      }
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
    } catch {
      // ignore
    }
  },

  // --- EXPORT TO CSV ---
  exportGrievancesCSV: (grievances: EnhancedGrievance[]): void => {
    const headers = [
      'رقم الانشغال',
      'اسم المواطن',
      'رقم الهاتف',
      'البلدية المعنية',
      'الدائرة المعنية',
      'نوع الانشغال',
      'القطاع المختص',
      'الموضوع',
      'الحالة',
      'الأولوية',
      'الموظف المسند إليه',
      'تاريخ الإرسال',
      'آخر تحديث',
      'متأخر؟'
    ];

    const rows = grievances.map(g => [
      `"${g.id}"`,
      `"${g.fullName}"`,
      `"${g.phone}"`,
      `"${g.grievanceMunicipality}"`,
      `"${g.grievanceDaira}"`,
      `"${g.category}"`,
      `"${g.sector}"`,
      `"${g.subject.replace(/"/g, '""')}"`,
      `"${g.status}"`,
      `"${g.priority}"`,
      `"${g.assignedToName || 'غير مسند'}"`,
      `"${g.createdAt.split('T')[0]}"`,
      `"${g.updatedAt.split('T')[0]}"`,
      `"${g.isOverdue ? 'نعم' : 'لا'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `انشغالات_ولاية_الوادي_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
