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
  ASSIGNED: 'تم الإسناد',
  IN_PROGRESS: 'قيد المعالجة',
  WAITING_CITIZEN: 'بانتظار معلومات',
  WAITING_REVIEW: 'بانتظار المراجعة',
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

export const MOCK_COMPLAINTS_SEED: EnhancedGrievance[] = [
  // 1. IN_PROGRESS
  {
    id: 'WIL-2026-X7K4P92',
    trackingNumber: 'WIL-2026-X7K4P92',
    statusCode: 'IN_PROGRESS',
    status: 'قيد المعالجة',
    priority: 'متوسط',
    fullName: 'مواطن تجريبي (نموذج 1)',
    phone: '0660000001',
    nin: '198839000000000001',
    applicantDaira: 'الوادي',
    applicantMunicipality: 'الوادي',
    applicantNeighborhood: 'حي 19 مارس تكسبت (نموذج)',
    grievanceDaira: 'الوادي',
    grievanceMunicipality: 'الوادي',
    category: 'العمران',
    sector: 'الإنارة والطاقة الحضرية',
    subject: 'انشغال تجريبي: انقطاع متكرر لشبكة الإنارة العمومية بحي 19 مارس تكسبت',
    details: 'نعلم مصالحكم الموقرة بوجود خلل كهربائي أدى إلى انقطاع جزئي في الإنارة العمومية بالشارع الرئيسي للحي منذ 4 أيام، نرجو تدخل الفرقة التقنية لصيانة الخط.',
    createdAt: '2026-09-08T09:32:00.000Z',
    updatedAt: '2026-09-09T10:05:00.000Z',
    dueDate: '2026-09-20T17:00:00.000Z',
    isOverdue: false,
    assignedToId: 'usr-emp-1',
    assignedToName: 'أحمد بن عمار (موظف معالج)',
    assignedDepartment: 'مصلحة الشؤون التقنية والتنمية الحضرية',
    assignedAt: '2026-09-08T14:20:00.000Z',
    specialFlags: [],
    timeline: [
      {
        id: 'tl-101',
        date: '08 سبتمبر 2026',
        time: '09:32',
        author: 'النظام الرقمي الولائي',
        authorRole: 'منصة المواطن',
        action: 'تم تسجيل الانشغال',
        note: 'تسجيل الانشغال عبر البوابة وتوليد كود التتبع WIL-2026-X7K4P92'
      },
      {
        id: 'tl-102',
        date: '08 سبتمبر 2026',
        time: '11:15',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'تمت المراجعة الأولية',
        note: 'مطابقة الموضوع لاختصاصات الخلية وتأكيد معايير القبول الشكلي'
      },
      {
        id: 'tl-103',
        date: '08 سبتمبر 2026',
        time: '14:20',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'تم توجيه الانشغال',
        note: 'إسناد الملف للموظف المعالج أحمد بن عمار للتنسيق مع المصالح التقنية لبلدية الوادي'
      },
      {
        id: 'tl-104',
        date: '09 سبتمبر 2026',
        time: '10:05',
        author: 'أحمد بن عمار',
        authorRole: 'موظف معالج',
        action: 'قيد المعالجة',
        note: 'إرسال إرسالية استعجالية رقم 142 لمصلحة الصيانة البلدية لبرمجة الخرجة الميدانية'
      }
    ],
    internalNotes: [
      {
        id: 'in-1',
        author: 'أحمد بن عمار',
        authorRole: 'موظف معالج',
        createdAt: '2026-09-09T10:10:00.000Z',
        text: 'تم الاتصال هاتفياً بمسؤول حظيرة بلدية الوادي ووعد ببرمجة شاحنة الرافعة غداً صباحاً.'
      }
    ]
  },

  // 2. NEW
  {
    id: 'WIL-2026-A8M2K41',
    trackingNumber: 'WIL-2026-A8M2K41',
    statusCode: 'NEW',
    status: 'جديد',
    priority: 'عادي',
    fullName: 'مواطن تجريبي (نموذج 2)',
    phone: '0660000002',
    nin: '199039000000000002',
    applicantDaira: 'قمار',
    applicantMunicipality: 'تغزوت',
    applicantNeighborhood: 'قرية غمرة الفلاحية (نموذج)',
    grievanceDaira: 'قمار',
    grievanceMunicipality: 'تغزوت',
    category: 'العمران',
    sector: 'الأشغال العمومية والمسالك',
    subject: 'طلب فتح مسلك فلاحي وربط مساكن ريفية بغمرة',
    details: 'نلتمس من السلطات الولائية التدخل لتهيئة مسلك فلاحي بطول 1.2 كلم يربط 18 مستثمرة فلاحية بالطريق الولائي لتسهيل نقل المحاصيل وتسهيل تنقل السكان.',
    createdAt: '2026-09-08T10:00:00.000Z',
    updatedAt: '2026-09-08T10:00:00.000Z',
    dueDate: '2026-09-22T17:00:00.000Z',
    isOverdue: false,
    specialFlags: [],
    timeline: [
      {
        id: 'tl-201',
        date: '08 سبتمبر 2026',
        time: '10:00',
        author: 'النظام الرقمي الولائي',
        authorRole: 'منصة المواطن',
        action: 'تم تسجيل الانشغال',
        note: 'تسجيل الطلب بالمنصة في انتظار الفرز والإسناد من طرف مسؤول الخلية'
      }
    ],
    internalNotes: []
  },

  // 3. WAITING_CITIZEN
  {
    id: 'WIL-2026-P5R8T36',
    trackingNumber: 'WIL-2026-P5R8T36',
    statusCode: 'WAITING_CITIZEN',
    status: 'بانتظار معلومات',
    priority: 'متوسط',
    fullName: 'مواطن تجريبي (نموذج 3)',
    phone: '0660000003',
    nin: '197539000000000003',
    applicantDaira: 'الدبيلة',
    applicantMunicipality: 'الدبيلة',
    applicantNeighborhood: 'حي النصر (نموذج)',
    grievanceDaira: 'الدبيلة',
    grievanceMunicipality: 'الدبيلة',
    category: 'العمران',
    sector: 'تسوية البنايات والتعمير',
    subject: 'طلب تسوية وضعية بناية في إطار القانون 15-08 بالدبيلة',
    details: 'أودعت ملف تسوية البناية المنجزة بحي النصر لدى مصالح البلدية منذ 6 أشهر دون تلقي الرد النهائي.',
    createdAt: '2026-09-07T08:15:00.000Z',
    updatedAt: '2026-09-08T11:45:00.000Z',
    dueDate: '2026-09-25T17:00:00.000Z',
    isOverdue: false,
    assignedToId: 'usr-emp-2',
    assignedToName: 'فاطمة الزهراء عثماني (موظفة معالجة)',
    assignedDepartment: 'مصلحة العمران والبيئة والتهيئة',
    assignedAt: '2026-09-07T11:00:00.000Z',
    specialFlags: [],
    citizenActionRequired: {
      reason: 'لاستكمال دراسة انشغالكم والتنسيق مع مديرية التعمير، يرجى تقديم: نسخة من الوثيقة المطلوبة (المخطط المسحي أو وصل إيداع الملف الأصلي لدى البلدية).',
      documentType: 'نسخة من الوثيقة المطلوبة (document-example.pdf)',
      requestedAt: '2026-09-08T11:45:00.000Z',
      requestedBy: 'فاطمة الزهراء عثماني'
    },
    timeline: [
      {
        id: 'tl-301',
        date: '07 سبتمبر 2026',
        time: '08:15',
        author: 'النظام الرقمي الولائي',
        authorRole: 'منصة المواطن',
        action: 'تم تسجيل الانشغال',
        note: 'تسجيل العريضة بالمنصة'
      },
      {
        id: 'tl-302',
        date: '07 سبتمبر 2026',
        time: '11:00',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'تم توجيه الانشغال',
        note: 'إسناد الملف لمصلحة العمران'
      },
      {
        id: 'tl-303',
        date: '08 سبتمبر 2026',
        time: '11:45',
        author: 'فاطمة الزهراء عثماني',
        authorRole: 'موظفة معالجة',
        action: 'في انتظار معلومات من المواطن',
        note: 'طلب إرفاق وصل الإيداع البلدي والمخطط الهندسي لاستكمال الإجراء الإداري'
      }
    ],
    internalNotes: []
  },

  // 4. WAITING_REVIEW
  {
    id: 'WIL-2026-Q2N7L84',
    trackingNumber: 'WIL-2026-Q2N7L84',
    statusCode: 'WAITING_REVIEW',
    status: 'بانتظار المراجعة',
    priority: 'عاجل',
    fullName: 'مواطن تجريبي (نموذج 4)',
    phone: '0660000004',
    nin: '198239000000000004',
    applicantDaira: 'الوادي',
    applicantMunicipality: 'كوينين',
    applicantNeighborhood: 'حي البساتين كوينين (نموذج)',
    grievanceDaira: 'الوادي',
    grievanceMunicipality: 'كوينين',
    category: 'النقل',
    sector: 'التربية والتجهيزات العمومية',
    subject: 'انشغال بخصوص تهيئة مدرسة ابتدائية وتجهيز التدفئة المدرسية',
    details: 'نرفع لسيادتكم انشغال أولياء تلاميذ مدرسة كوينين الشرقية لبرمجة صيانة التدفئة المركزية وعزل الأسطح قبل حلول فصل الشتاء.',
    createdAt: '2026-09-06T14:20:00.000Z',
    updatedAt: '2026-09-08T16:00:00.000Z',
    dueDate: '2026-09-15T17:00:00.000Z',
    isOverdue: false,
    assignedToId: 'usr-emp-1',
    assignedToName: 'أحمد بن عمار (موظف معالج)',
    assignedDepartment: 'مصلحة متابعة برامج التنمية',
    assignedAt: '2026-09-06T15:00:00.000Z',
    specialFlags: ['عاجل'],
    officialResponse: {
      text: 'بناءً على التنسيق مع مديرية التربية ومصالح بلدية كوينين، تم تسجيل عملية صيانة التدفئة المدرسية ضمن برنامج صندوق التضامن والضمان للجماعات المحلية لسنة 2026 بمبلغ 4.2 مليون دج وستنطلق الأشغال خلال الأسبوع القادم.',
      preparedBy: 'أحمد بن عمار (موظف معالج)',
      preparedAt: '2026-09-08T16:00:00.000Z',
      approved: false,
      letterNumber: '2026/خ.إ/مسودة-112'
    },
    timeline: [
      {
        id: 'tl-401',
        date: '06 سبتمبر 2026',
        time: '14:20',
        author: 'النظام الرقمي الولائي',
        authorRole: 'منصة المواطن',
        action: 'تم تسجيل الانشغال',
        note: 'تسجيل الانشغال'
      },
      {
        id: 'tl-402',
        date: '06 سبتمبر 2026',
        time: '15:00',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'تم توجيه الانشغال',
        note: 'توجيه الملف بصفة مستعجلة للمتابعة'
      },
      {
        id: 'tl-403',
        date: '08 سبتمبر 2026',
        time: '16:00',
        author: 'أحمد بن عمار',
        authorRole: 'موظف معالج',
        action: 'في انتظار المراجعة',
        note: 'إعداد مسودة الرد الرسمي وإحالتها لمسؤول الخلية للاعتماد'
      }
    ],
    internalNotes: [
      {
        id: 'in-41',
        author: 'أحمد بن عمار',
        authorRole: 'موظف معالج',
        createdAt: '2026-09-08T15:50:00.000Z',
        text: 'تم استلام تأكيد كتابي من مصلحة البرمجة لبلدية كوينين بالموافقة على رصد الغلاف المالي.'
      }
    ]
  },

  // 5. RESOLVED
  {
    id: 'WIL-2026-B6K3M19',
    trackingNumber: 'WIL-2026-B6K3M19',
    statusCode: 'RESOLVED',
    status: 'تمت المعالجة',
    priority: 'متوسط',
    fullName: 'مواطن تجريبي (نموذج 5)',
    phone: '0660000005',
    nin: '197939000000000005',
    applicantDaira: 'قمار',
    applicantMunicipality: 'قمار',
    applicantNeighborhood: 'قرية سيدي عبد الرحمان (نموذج)',
    grievanceDaira: 'قمار',
    grievanceMunicipality: 'قمار',
    category: 'النقل',
    sector: 'النقل المدرسي والتضامن',
    subject: 'طلب توفير حافلة نقل مدرسي لتلاميذ سيدي عبد الرحمان نحو متوسطة قمار',
    details: 'يطالب أولياء التلاميذ بتوفير وسيلة نقل مدرسي لتجنيب أطفالهم قطع مسافة 4 كم يومياً سيراً على الأقدام في ظروف مناخية صعبة.',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-08T12:00:00.000Z',
    dueDate: '2026-09-14T17:00:00.000Z',
    isOverdue: false,
    assignedToId: 'usr-emp-1',
    assignedToName: 'أحمد بن عمار',
    assignedDepartment: 'مصلحة النقل والتنمية المحلية',
    assignedAt: '2026-09-01T10:00:00.000Z',
    specialFlags: [],
    officialResponse: {
      text: 'تمت دراسة انشغالكم واتخاذ الإجراءات المناسبة من طرف المصالح المختصة، حيث تقرر تخصيص حافلة نقل مدرسي بسعة 30 مقعداً لخدمة تلاميذ خط سيدي عبد الرحمان - متوسطة قمار بصفة يومية ابتداءً من يوم الأحد بالتنسيق مع حظيرة بلدية قمار.',
      preparedBy: 'أحمد بن عمار (موظف معالج)',
      preparedAt: '2026-09-07T15:30:00.000Z',
      reviewedBy: 'عمر بن سالم (مسؤول خلية الإصغاء والتكفل)',
      reviewedAt: '2026-09-08T12:00:00.000Z',
      approved: true,
      letterNumber: '2026/خ.إ/849'
    },
    citizenRating: {
      score: 5,
      comment: 'شكراً جزيلاً لخلية الإصغاء على سرعة الاستجابة وحل المشكل لأبنائنا التلاميذ.',
      ratedAt: '2026-09-08T14:10:00.000Z'
    },
    timeline: [
      {
        id: 'tl-501',
        date: '01 سبتمبر 2026',
        time: '08:00',
        author: 'النظام الرقمي الولائي',
        authorRole: 'منصة المواطن',
        action: 'تم تسجيل الانشغال',
        note: 'تسجيل العريضة بالمنصة'
      },
      {
        id: 'tl-502',
        date: '01 سبتمبر 2026',
        time: '10:00',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'تم توجيه الانشغال',
        note: 'إسناد الملف للأستاذ أحمد بن عمار'
      },
      {
        id: 'tl-503',
        date: '03 سبتمبر 2026',
        time: '11:20',
        author: 'أحمد بن عمار',
        authorRole: 'موظف معالج',
        action: 'قيد المعالجة',
        note: 'إجراء المعاينة مع رئيس القسم الفرعي للنقل بدائرة قمار'
      },
      {
        id: 'tl-504',
        date: '07 سبتمبر 2026',
        time: '15:30',
        author: 'أحمد بن عمار',
        authorRole: 'موظف معالج',
        action: 'في انتظار المراجعة',
        note: 'صياغة تقرير التكفل والحل العملي المتفق عليه'
      },
      {
        id: 'tl-505',
        date: '08 سبتمبر 2026',
        time: '12:00',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'الرد الرسمي',
        note: 'اعتماد الرد الرسمي الصادر بالمراسلة رقم 2026/خ.إ/849 وتبليغ المواطن'
      }
    ],
    internalNotes: []
  },

  // 6. CLOSED
  {
    id: 'WIL-2026-C9F4X27',
    trackingNumber: 'WIL-2026-C9F4X27',
    statusCode: 'CLOSED',
    status: 'مغلق',
    priority: 'عاجل',
    fullName: 'مواطن تجريبي (نموذج 6)',
    phone: '0660000006',
    nin: '197039000000000006',
    applicantDaira: 'الوادي',
    applicantMunicipality: 'الوادي',
    applicantNeighborhood: 'حي الأعشاش وسط المدينة (نموذج)',
    grievanceDaira: 'الوادي',
    grievanceMunicipality: 'الوادي',
    category: 'البيئة',
    sector: 'المياه والصرف الصحي',
    subject: 'طلب صيانة تسرب مائي بشارع العقيد لطفي بحي تكسبت',
    details: 'تسرب مياه نقي من قناة رئيسية يتسبب في هدر المياه وصعوبة حركة المرور.',
    createdAt: '2026-08-25T09:00:00.000Z',
    updatedAt: '2026-09-02T16:30:00.000Z',
    dueDate: '2026-09-05T17:00:00.000Z',
    isOverdue: false,
    assignedToId: 'usr-emp-2',
    assignedToName: 'فاطمة الزهراء عثماني',
    assignedDepartment: 'الجزائرية للمياه — وحدة الوادي',
    assignedAt: '2026-08-25T10:30:00.000Z',
    specialFlags: ['عاجل'],
    officialResponse: {
      text: 'تمت دراسة انشغالكم واتخاذ الإجراءات المناسبة من طرف المصالح المختصة، حيث قامت الفرق التقنية للجزائرية للمياه بإصلاح الكسر بالقناة قطر 150 ملم واستئناف التزويد بصورة طبيعية وإعادة تعبيد الحفرة.',
      preparedBy: 'فاطمة الزهراء عثماني (موظفة معالجة)',
      preparedAt: '2026-09-01T11:00:00.000Z',
      reviewedBy: 'عمر بن سالم (مسؤول خلية الإصغاء)',
      reviewedAt: '2026-09-02T16:30:00.000Z',
      approved: true,
      letterNumber: '2026/خ.إ/791'
    },
    citizenRating: {
      score: 4,
      comment: 'تم الإصلاح في نفس اليوم، بارك الله فيكم.',
      ratedAt: '2026-09-03T10:00:00.000Z'
    },
    timeline: [
      {
        id: 'tl-601',
        date: '25 أوت 2026',
        time: '09:00',
        author: 'النظام الرقمي الولائي',
        authorRole: 'منصة المواطن',
        action: 'تم تسجيل الانشغال',
        note: 'تسجيل الانشغال الاستعجالي'
      },
      {
        id: 'tl-602',
        date: '25 أوت 2026',
        time: '10:30',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'تم توجيه الانشغال',
        note: 'توجيه فوري لمؤسسة الجزائرية للمياه'
      },
      {
        id: 'tl-603',
        date: '27 أوت 2026',
        time: '14:00',
        author: 'فاطمة الزهراء عثماني',
        authorRole: 'موظفة معالجة',
        action: 'قيد المعالجة',
        note: 'إتمام التدخل التقني وإصلاح العطب'
      },
      {
        id: 'tl-604',
        date: '02 سبتمبر 2026',
        time: '16:30',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'الرد الرسمي',
        note: 'تبليغ الرد الرسمي للمواطن'
      },
      {
        id: 'tl-605',
        date: '02 سبتمبر 2026',
        time: '17:00',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'الإغلاق',
        note: 'إغلاق الملف نهائياً وأرشفته بعد استلام محضر استكمال الأشغال'
      }
    ],
    internalNotes: []
  },

  // 7. URGENT (Secondary case)
  {
    id: 'WIL-2026-U9T1V53',
    trackingNumber: 'WIL-2026-U9T1V53',
    statusCode: 'URGENT',
    status: 'عاجل',
    priority: 'قصوى',
    fullName: 'مواطن تجريبي (نموذج 7)',
    phone: '0660000007',
    nin: '198539000000000007',
    applicantDaira: 'البياضة',
    applicantMunicipality: 'البياضة',
    applicantNeighborhood: 'حي أول نوفمبر (نموذج)',
    grievanceDaira: 'البياضة',
    grievanceMunicipality: 'البياضة',
    category: 'البيئة',
    sector: 'الحماية المدنية والأمن الحضري',
    subject: 'تسرب مياه وفيضان رئيسي يهدد حركة المرور بمحيط ابتدائية أول نوفمبر',
    details: 'انكسار مفاجئ في أنبوب ناقل للمياه بقطر كبير يهدد بغمر مدخل المؤسسة التعليمية.',
    createdAt: '2026-09-08T07:30:00.000Z',
    updatedAt: '2026-09-08T08:00:00.000Z',
    dueDate: '2026-09-09T12:00:00.000Z',
    isOverdue: false,
    specialFlags: ['عاجل'],
    timeline: [
      {
        id: 'tl-701',
        date: '08 سبتمبر 2026',
        time: '07:30',
        author: 'النظام الرقمي الولائي',
        authorRole: 'منصة المواطن',
        action: 'تم تسجيل الانشغال',
        note: 'تسجيل انشغال مصنف ذو أولوية قصوى'
      },
      {
        id: 'tl-702',
        date: '08 سبتمبر 2026',
        time: '08:00',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'تم توجيه الانشغال',
        note: 'توجيه استعجالي مباشر لفرقة التدخل السريع'
      }
    ],
    internalNotes: []
  },

  // 8. DUPLICATE (Secondary case)
  {
    id: 'WIL-2026-D4S8W12',
    trackingNumber: 'WIL-2026-D4S8W12',
    statusCode: 'DUPLICATE',
    status: 'مكرر',
    priority: 'عادي',
    fullName: 'مواطن تجريبي (نموذج 8)',
    phone: '0660000008',
    nin: '199239000000000008',
    applicantDaira: 'الوادي',
    applicantMunicipality: 'الوادي',
    applicantNeighborhood: 'حي 19 مارس تكسبت (نموذج)',
    grievanceDaira: 'الوادي',
    grievanceMunicipality: 'الوادي',
    category: 'العمران',
    sector: 'الإنارة العمومية',
    subject: 'شكوى مكررة حول الإنارة العمومية بحي 19 مارس',
    details: 'مطابقة لعريضة سابقة مسجلة تحت رقم WIL-2026-X7K4P92.',
    createdAt: '2026-09-08T11:00:00.000Z',
    updatedAt: '2026-09-08T12:30:00.000Z',
    dueDate: '2026-09-20T17:00:00.000Z',
    isOverdue: false,
    specialFlags: ['مكرر'],
    timeline: [
      {
        id: 'tl-801',
        date: '08 سبتمبر 2026',
        time: '11:00',
        author: 'النظام الرقمي الولائي',
        authorRole: 'منصة المواطن',
        action: 'تم تسجيل الانشغال',
        note: 'تسجيل الانشغال'
      },
      {
        id: 'tl-802',
        date: '08 سبتمبر 2026',
        time: '12:30',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'تصنيف كمكرر',
        note: 'ضم الملف للعريضة الأصلية رقم WIL-2026-X7K4P92 لتفادي تكرار الإجراءات'
      }
    ],
    internalNotes: []
  },

  // 9. OUT_OF_SCOPE (Secondary case)
  {
    id: 'WIL-2026-O7L3Y90',
    trackingNumber: 'WIL-2026-O7L3Y90',
    statusCode: 'OUT_OF_SCOPE',
    status: 'خارج الاختصاص',
    priority: 'عادي',
    fullName: 'مواطن تجريبي (نموذج 9)',
    phone: '0660000009',
    nin: '198139000000000009',
    applicantDaira: 'الرقيبة',
    applicantMunicipality: 'الرقيبة',
    applicantNeighborhood: 'حي المحطة (نموذج)',
    grievanceDaira: 'الرقيبة',
    grievanceMunicipality: 'الرقيبة',
    category: 'أخرى',
    sector: 'نزاعات قضائية خاصة',
    subject: 'نزاع عقاري خاص بين أطراف عائلية حول قسمة تركة',
    details: 'طلب تدخل الوالي لإلزام الطرف الآخر بقسمة تركة عقارية معروضة أمام المحكمة.',
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-06T09:30:00.000Z',
    dueDate: '2026-09-12T17:00:00.000Z',
    isOverdue: false,
    specialFlags: ['خارج الاختصاص'],
    officialResponse: {
      text: 'نعلمكم أن موضوع عريضتكم يتعلق بنزاع مدني خاص معروض أمام الجهات القضائية المختصة، ووفقاً للتشريع الساري لا تملك السلطات الإدارية الولائية أي صلاحية للتدخل في القضايا المرفوعة أمام العدالة.',
      preparedBy: 'عمر بن سالم (مسؤول الخلية)',
      preparedAt: '2026-09-06T09:30:00.000Z',
      approved: true,
      letterNumber: '2026/خ.إ/توجيه-31'
    },
    timeline: [
      {
        id: 'tl-901',
        date: '05 سبتمبر 2026',
        time: '10:00',
        author: 'النظام الرقمي الولائي',
        authorRole: 'منصة المواطن',
        action: 'تم تسجيل الانشغال',
        note: 'تسجيل الطلب'
      },
      {
        id: 'tl-902',
        date: '06 سبتمبر 2026',
        time: '09:30',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'توجيه وإخطار خارج الاختصاص',
        note: 'إصدار إشعار بعدم الاختصاص وتوجيه المعني للمسار القضائي المناسب'
      }
    ],
    internalNotes: []
  },

  // 10. REJECTED (Secondary case)
  {
    id: 'WIL-2026-R2M6N45',
    trackingNumber: 'WIL-2026-R2M6N45',
    statusCode: 'REJECTED',
    status: 'مرفوض',
    priority: 'عادي',
    fullName: 'مواطن تجريبي (نموذج 10)',
    phone: '0660000010',
    nin: '199539000000000010',
    applicantDaira: 'الوادي',
    applicantMunicipality: 'الوادي',
    applicantNeighborhood: 'حي الصحن (نموذج)',
    grievanceDaira: 'الوادي',
    grievanceMunicipality: 'الوادي',
    category: 'الحالة المدنية',
    sector: 'الشؤون القانونية',
    subject: 'عريضة مجهولة المصدر وتفتقر للبيانات الإدارية التأسيسية',
    details: 'طلب يفتقر للوثائق والبيانات الثبوتية الإلزامية ولا يحدد هوية الشاكي القانونية.',
    createdAt: '2026-09-04T08:00:00.000Z',
    updatedAt: '2026-09-04T11:00:00.000Z',
    dueDate: '2026-09-10T17:00:00.000Z',
    isOverdue: false,
    specialFlags: [],
    timeline: [
      {
        id: 'tl-1001',
        date: '04 سبتمبر 2026',
        time: '08:00',
        author: 'النظام الرقمي الولائي',
        authorRole: 'منصة المواطن',
        action: 'تم تسجيل الانشغال',
        note: 'تسجيل الطلب'
      },
      {
        id: 'tl-1002',
        date: '04 سبتمبر 2026',
        time: '11:00',
        author: 'عمر بن سالم',
        authorRole: 'مسؤول خلية الإصغاء',
        action: 'رفض شكلي',
        note: 'رفض شكلي لعدم استيفاء الشروط المنصوص عليها في المرسوم المنظم للعرائض'
      }
    ],
    internalNotes: []
  }
];

const STORAGE_KEY = 'wilaya_eloued_mock_complaints_v2';

export interface IComplaintRepository {
  getAll(): Promise<EnhancedGrievance[]>;
  getById(id: string): Promise<EnhancedGrievance | null>;
  create(item: EnhancedGrievance): Promise<EnhancedGrievance>;
  update(id: string, updates: Partial<EnhancedGrievance>): Promise<EnhancedGrievance>;
  delete(id: string): Promise<boolean>;
  resetToDefaults(): Promise<EnhancedGrievance[]>;
}

// Client-Side Mock Repository backed by LocalStorage with Seed Data fallback
export class MockComplaintRepository implements IComplaintRepository {
  private load(): EnhancedGrievance[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure all required cases exist in storage
          const idsInStorage = new Set(parsed.map((p: EnhancedGrievance) => p.id.toUpperCase()));
          let addedMissing = false;
          MOCK_COMPLAINTS_SEED.forEach(seed => {
            if (!idsInStorage.has(seed.id.toUpperCase())) {
              parsed.push(seed);
              addedMissing = true;
            }
          });
          if (addedMissing) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse mock complaints from storage:', e);
    }
    // Initialize default seed
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_COMPLAINTS_SEED));
    return [...MOCK_COMPLAINTS_SEED];
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_COMPLAINTS_SEED));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('complaints_updated'));
    }
    return [...MOCK_COMPLAINTS_SEED];
  }
}

// Single instance for app lifetime
export const complaintRepository: IComplaintRepository = new MockComplaintRepository();
