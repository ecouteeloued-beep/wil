import { GrievanceCategory } from './types';

export interface TopicDemo {
  id: string;
  category: GrievanceCategory;
  tag: string;
  title: string;
  subtitle: string;
  summary: string;
  nin: string;
  fullName: string;
  phone: string;
  applicantDaira: string;
  applicantMunicipality: string;
  applicantNeighborhood: string;
  subject: string;
  grievanceDaira: string;
  grievanceMunicipality: string;
  details: string;
  competentDepartment: string;
  requiredDocuments: string[];
  expectedSla: string;
  accentColor: string;
  badgeColor: string;
}

export interface TrackingDemoCase {
  code: string;
  category: GrievanceCategory;
  municipality: string;
  daira: string;
  citizenName: string;
  subject: string;
  stageTitle: string;
  stageBadge: string;
  stageDescription: string;
  highlightText: string;
  statusType: 'resolved' | 'review' | 'in_progress' | 'overdue' | 'new' | 'waiting_citizen' | 'closed';
  hasOfficialResponse?: boolean;
  letterNumber?: string;
}

export const TOPIC_DEMOS: TopicDemo[] = [
  {
    id: 'demo-civil-status',
    category: 'الحالة المدنية',
    tag: 'الحالة المدنية والبيومترية',
    title: 'تصحيح خطأ مادي في رسم اللقب بعقد الميلاد',
    subtitle: 'تسوية الأخطاء المادية في سجلات الحالة المدنية ببلدية الوادي',
    summary: 'معالجة وتصحيح التباين الحرفي في كتابة الاسم واللقب بين الدفتر العائلي وعقود الميلاد بالولاية.',
    nin: '198539010044556677',
    fullName: 'سليمان عبد الحي',
    phone: '0661998877',
    applicantDaira: 'الوادي',
    applicantMunicipality: 'الوادي',
    applicantNeighborhood: 'حي الرمال - الشطر الثاني',
    subject: 'طلب تصحيح خطأ مادي في رسم اللقب بشهادة الميلاد رقم 145/2004',
    grievanceDaira: 'الوادي',
    grievanceMunicipality: 'الوادي',
    details: 'أتقدم إلى سيادتكم المحترمة بهذا الانشغال بخصوص وجود خطأ مادي في رسم اللقب العائلي بشهادة الميلاد رقم 145 لسنة 2004 ببلدية الوادي، حيث كُتب اللقب بحرف ناقص مقارنة بعقد زواج الوالدين والدفتر العائلي الصادر عن نفس البلدية. أرجو من مصالحكم توجيه الملف لمصلحة الحالة المدنية لاتخاذ الإجراءات الإدارية والقانونية بالتنسيق مع وكيل الجمهورية لتصحيح الخطأ وتمكيني من تجديد بطاقة التعريف الوطنية البيومترية.',
    competentDepartment: 'مصلحة الحالة المدنية والوثائق البيومترية - بلدية الوادي',
    requiredDocuments: [
      'نسخة أصلية من الدفتر العائلي للوالدين',
      'عقد زواج الوالدين الصادر من البلدية',
      'شهادة الميلاد رقم 12 الأصلية المراد تصحيحها',
      'نسخة من بطاقة التعريف الوطنية للطالب'
    ],
    expectedSla: '3 إلى 5 أيام عمل',
    accentColor: 'border-red-500 text-red-700 bg-red-50',
    badgeColor: 'bg-red-100 text-red-800 border-red-200'
  },
  {
    id: 'demo-water-env',
    category: 'البيئة',
    tag: 'الموارد المائية والبيئة',
    title: 'تذبذب شديد في تزويد الحي بالماء الشروب وانخفاض الضغط',
    subtitle: 'تدخل عاجل لإصلاح شبكة التوزيع ومعايرة ضغط الضخ ببلدية البياضة',
    summary: 'معالجة انقطاع مياه الحنفية وإعادة تنظيم جدول التوزيع بالتنسيق مع وحدة الجزائرية للمياه (ADE).',
    nin: '197839020088990011',
    fullName: 'صالح بالشاوش',
    phone: '0550123456',
    applicantDaira: 'البياضة',
    applicantMunicipality: 'البياضة',
    applicantNeighborhood: 'حي أولاد أحمد - بالقرب من المستوصف',
    subject: 'شكوى من انقطاع الماء الصالح للشرب وتدني ضغط الضخ بحي أولاد أحمد',
    grievanceDaira: 'البياضة',
    grievanceMunicipality: 'البياضة',
    details: 'نحيط سيادتكم علماً بأن سكان حي أولاد أحمد ببلدية البياضة يعانون من انقطاع تام لشبكة المياه الصالحة للشرب لأكثر من 5 أيام متتالية، والمياه لا تصل إلا في ساعات متأخرة من الفجر وبضغط ضعيف جداً لا يكفي لملء الخزانات الأرضية. نلتمس تدخلكم العاجل لدى مصالح الجزائرية للمياه لمعاينة المحابس وإصلاح أي كسر بالقناة الرئيسية وضمان توزيع عادل للمياه الشروب.',
    competentDepartment: 'مديرية الموارد المائية - وحدة الجزائرية للمياه (ADE)',
    requiredDocuments: [
      'نسخة من آخر فاتورة استهلاك لإثبات رقم الاشتراك',
      'عريضة موقعة من ممثلي سكان الحي المعني',
      'إحداثيات الشارع وموقع التدخل بدقة'
    ],
    expectedSla: '48 إلى 72 ساعة للتدخل الميداني',
    accentColor: 'border-emerald-500 text-emerald-700 bg-emerald-50',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'demo-urban-planning',
    category: 'العمران',
    tag: 'التعمير والسكن والكهرباء الفلاحية',
    title: 'ربط المحيط الفلاحي بشبكة الكهرباء وتسهيل رخص البناء الريفي',
    subtitle: 'تسريع وتيرة إنجاز المحولات الريفية للمستثمرات الفلاحية بحاسي خليفة',
    summary: 'إيصال الكهرباء الفلاحية لدعم إنتاج التمور والبطاطا المبكرة وتشغيل مضخات السقي الارتوازية.',
    nin: '198239080033221100',
    fullName: 'عمر السعيد مبروكي',
    phone: '0771445566',
    applicantDaira: 'حاسي خليفة',
    applicantMunicipality: 'حاسي خليفة',
    applicantNeighborhood: 'محيط الغربية الفلاحي',
    subject: 'طلب استكمال مشروع ربط المحيط الفلاحي بالكهرباء الريفية',
    grievanceDaira: 'حاسي خليفة',
    grievanceMunicipality: 'حاسي خليفة',
    details: 'نحن فلاحو ومستثمرو محيط الغربية ببلدية حاسي خليفة، نرفع لانشغالكم تأخر إطلاق الشطر الثاني من أشغال ربط المحيط بالكهرباء الفلاحية رغم إتمام الدراسة التقنية وتحديد مواقع الأعمدة منذ عدة أشهر. هذا التأخر يكبّد الفلاحين خسائر كبيرة لتكاليف المازوت لتشغيل المولدات. نلتمس تدخل والي الولاية لإلزام مقاولة الإنجاز بمباشرة وضع المحولات واستكمال الشبكة.',
    competentDepartment: 'مديرية المصالح الفلاحية ومؤسسة سونلغاز - توزيع الوادي',
    requiredDocuments: [
      'نسخة من عقد الامتياز الفلاحي أو شهادة الاستغلال',
      'بطاقة فلاح معتمدة وسارية المفعول',
      'مخطط الموقع والمحيط المنجز من مكتب معتمد'
    ],
    expectedSla: '7 أيام عمل للدراسة وتوجيه الإعذار',
    accentColor: 'border-amber-500 text-amber-800 bg-amber-50',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200'
  },
  {
    id: 'demo-transport',
    category: 'النقل',
    tag: 'النقل والمرافق العمومية',
    title: 'توفير حافلة نقل مدرسي لتلاميذ القرى والمناطق النائية',
    subtitle: 'تخصيص خط نقل مدرسي يومي لتلاميذ بلدية قمار وتغزوت',
    summary: 'تأمين تنقل مئات التلاميذ بين القرى والمدارس المتوسطة والثانوية لتفادي الانقطاع المدرسي.',
    nin: '199039040033445566',
    fullName: 'سامية تجاني',
    phone: '0770112233',
    applicantDaira: 'قمار',
    applicantMunicipality: 'قمار',
    applicantNeighborhood: 'قرية الدبيديبي - طريق تغزوت',
    subject: 'طلب توفير خط نقل مدرسي لتلاميذ قرية الدبيديبي نحو المتوسطة',
    grievanceDaira: 'قمار',
    grievanceMunicipality: 'قمار',
    details: 'أولياء تلاميذ الطورين المتوسط والثانوي بقرية الدبيديبي ببلدية قمار يرفعون لسيادتكم انشغالهم الملح إثر انعدام حافلة نقل مدرسي مخصصة لأبنائهم، حيث يضطر أكثر من 45 تلميذاً لقطع مسافة تفوق 4 كلم يومياً بمحاذاة الطريق الوطني السريع في ظروف جوية قاسية وخطر حوادث المرور. نرجو التفضل بتوجيه تعليمات لتسخير حافلة من حضيرة البلدية أو التعاقد مع ناقل خاص لضمان تمدرس آمن.',
    competentDepartment: 'مديرية التربية لولاية الوادي والمجلس الشعبي البلدي لقمار',
    requiredDocuments: [
      'قائمة اسمية للتلاميذ المتمدرسين ومستوياتهم',
      'عريضة موقعة من جمعية أولياء التلاميذ',
      'مخطط المسار والمسافة الفاصلة عن المؤسسة التعليمية'
    ],
    expectedSla: '5 إلى 7 أيام عمل للتكفل بالخط',
    accentColor: 'border-blue-500 text-blue-700 bg-blue-50',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'demo-health',
    category: 'الصحة',
    tag: 'الصحة والخدمات الوقائية',
    title: 'تعزيز المناوبة الطبية الليلية وتوفير مصل العقارب',
    subtitle: 'دعم العيادات متعددة الخدمات بالحمراية والرقيبة بالطواقم والأمصال',
    summary: 'ضمان التكفل الاستعجالي بالحالات الطارئة والتسمم العقربي في المناطق البعيدة عن المستشفى المركزي.',
    nin: '198039090011335577',
    fullName: 'عبد القادر بكاري',
    phone: '0561223344',
    applicantDaira: 'الرقيبة',
    applicantMunicipality: 'الحمراية',
    applicantNeighborhood: 'وسط بلدية الحمراية',
    subject: 'طلب تعزيز المناوبة الطبية الليلية وتوفير أمصال التسمم العقربي بعيادة الحمراية',
    grievanceDaira: 'الرقيبة',
    grievanceMunicipality: 'الحمراية',
    details: 'تعاني قاعة العلاج والعيادة متعددة الخدمات ببلدية الحمراية من انعدام طبيب مناوب خلال الفترة الليلية، بالإضافة إلى النقص المسجل في حصص أمصال مكافحة التسمم العقربي خلال فصل الصيف، مما يلزم عائلات المرضى بنقل المصابين لمسافة تفوق 65 كلم نحو مستشفى عاصمة الولاية. نلتمس تدعيم العيادة بسيارة إسعاف مجهزة وطبيب مناوب لضمان الإسعافات الأولية.',
    competentDepartment: 'مديرية الصحة والسكان وإصلاح المستشفيات (DSP) لولاية الوادي',
    requiredDocuments: [
      'عريضة ممثلي المجتمع المدني وأعيان البلدية',
      'إحصائيات التدخلات السابقة لبعد المسافة الاستشفائية'
    ],
    expectedSla: 'معالجة استعجالية ذات أولوية قصوى',
    accentColor: 'border-rose-500 text-rose-700 bg-rose-50',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'demo-lighting-other',
    category: 'أخرى',
    tag: 'المرافق الحضرية والسلامة العامة',
    title: 'صيانة أعمدة الإنارة العمومية وإصلاح الكوابل المكشوفة',
    subtitle: 'تدخل عاجل لفرق الصيانة الحضرية لبلدية الدبيلة لحماية المشاة ليلاً',
    summary: 'صيانة الإنارة الليلية بالأحياء السكنية وإصلاح التمديدات الكهربائية لتأمين سلامة المواطنين.',
    nin: '199539060012121212',
    fullName: 'نوال غربي',
    phone: '0555443322',
    applicantDaira: 'الدبيلة',
    applicantMunicipality: 'الدبيلة',
    applicantNeighborhood: 'حي الزهور - بالقرب من المدرسة الابتدائية',
    subject: 'طلب صيانة الإنارة العمومية وإصلاح الأسلاك المكشوفة بحي الزهور',
    grievanceDaira: 'الدبيلة',
    grievanceMunicipality: 'الدبيلة',
    details: 'أعمدة الإنارة العمومية معطلة في الشارع الرئيسي الرابط بين حي الزهور والمستوصف لبلدية الدبيلة منذ أكثر من 4 أسابيع، بالإضافة إلى وجود كوابل كهربائية أرضية متدلية ومكشوفة تشكل خطراً محدقاً على سلامة التلاميذ والمصلين ليلاً. نطلب إيفاد فرقة الصيانة البلدية العاجلة لتغيير المصابيح التالفة وعزل الكوابل الخطرة.',
    competentDepartment: 'المصالح التقنية لبلدية الدبيلة ومديرية التعمير',
    requiredDocuments: [
      'صور توثيقية للأعمدة والكوابل المتدلية',
      'تحديد اسم الشارع والمعالم المجاورة بدقة'
    ],
    expectedSla: '48 ساعة لدرء الخطر العام',
    accentColor: 'border-purple-500 text-purple-700 bg-purple-50',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  }
];

export const TRACKING_DEMO_CASES: TrackingDemoCase[] = [
  {
    code: 'WIL-2026-X7K4P92',
    category: 'البيئة',
    municipality: 'البياضة',
    daira: 'البياضة',
    citizenName: 'محمد السعيد غربي',
    subject: 'انقطاع متكرر لشبكة مياه الشرب بحي 1 نوفمبر',
    stageTitle: 'قيد المعالجة والمتابعة الميدانية',
    stageBadge: 'قيد المعالجة (IN_PROGRESS)',
    stageDescription: 'فرق الصيانة التقنية لمصالح المياه متواجدة بالميدان لمعاينة العطب وإصلاح المضخة.',
    highlightText: 'نموذج لملف قيد المعالجة الميدانية والتنسيق مع وحدة الجزائرية للمياه.',
    statusType: 'in_progress'
  },
  {
    code: 'WIL-2026-A8M2K41',
    category: 'العمران',
    municipality: 'الوادي',
    daira: 'الوادي',
    citizenName: 'عبد القادر حوامدي',
    subject: 'طلب تهيئة طريق فرعي وتعبيد المدخل الرئيسي للحي',
    stageTitle: 'تسجيل جديد قيد الفرز الأولي',
    stageBadge: 'جديد (NEW)',
    stageDescription: 'تم تسجيل الانشغال بالمنظومة الولائية وهو في مرحلة التدقيق وتوجيهه للمصلحة المختصة.',
    highlightText: 'نموذج لملف مسجل حديثاً في انتظار المراجعة الأولية وتعيين الموظف المعالج.',
    statusType: 'new'
  },
  {
    code: 'WIL-2026-P5R8T36',
    category: 'العمران',
    municipality: 'حاسي خليفة',
    daira: 'حاسي خليفة',
    citizenName: 'فاطمة الزهراء عثماني',
    subject: 'طلب رخصة ترميم مسكن ريفي وتجديد السقف المتضرر',
    stageTitle: 'مطلوب إجراء من المواطن',
    stageBadge: 'بانتظار معلومات (WAITING_CITIZEN)',
    stageDescription: 'مطلوب تقديم نسخة من الوثيقة المطلوبة (المخطط المسحي أو وصل الإيداع البلدي).',
    highlightText: 'نموذج لتجربة تفاعل المواطن ورفع وثيقة تجريبية فورية لتحديث الحالة.',
    statusType: 'waiting_citizen'
  },
  {
    code: 'WIL-2026-Q2N7L84',
    category: 'الحالة المدنية',
    municipality: 'الدبيلة',
    daira: 'الدبيلة',
    citizenName: 'سليمان بوزيد',
    subject: 'تصحيح خطأ مادي في لقب الجد برسم الولادة',
    stageTitle: 'صياغة الرد وبانتظار اعتماد المسؤول',
    stageBadge: 'بانتظار المراجعة (WAITING_REVIEW)',
    stageDescription: 'تمت دراسة الملف ومراجعة السجل، وجارٍ توقيع الرد الرسمي من طرف مسؤول الخلية.',
    highlightText: 'نموذج لملف مكتمل المعالجة الميدانية بانتظار الاعتماد الإداري النهائي.',
    statusType: 'review'
  },
  {
    code: 'WIL-2026-B6K3M19',
    category: 'النقل',
    municipality: 'قمار',
    daira: 'قمار',
    citizenName: 'سامية تجاني',
    subject: 'طلب توفير خط نقل مدرسي لتلاميذ قرية الدبيديبي',
    stageTitle: 'تم الرد الإداري الرسمي والاعتماد',
    stageBadge: 'تمت المعالجة (RESOLVED)',
    stageDescription: 'صدر رد رسمي برقم مراسلة إدارية معتمدة: 2026/خ.إ/849، مع تسخير حافلة بلدية.',
    highlightText: 'نموذج لملف تمت تسويته بنجاح ويتضمن الرد الرسمي المعتمد وإمكانية تحميل PDF والتقييم.',
    statusType: 'resolved',
    hasOfficialResponse: true,
    letterNumber: '2026/خ.إ/849'
  },
  {
    code: 'WIL-2026-C9F4X27',
    category: 'العمران',
    municipality: 'الرقيبة',
    daira: 'الرقيبة',
    citizenName: 'ياسين بن علي',
    subject: 'صيانة أعمدة الإنارة العمومية بالطريق الولائي',
    stageTitle: 'الملف مغلق ومؤرشف بعد الإنجاز',
    stageBadge: 'مغلق ومؤرشف (CLOSED)',
    stageDescription: 'تم إتمام أشغال استبدال المصابيح وتأكيد المعاينة الميدانية وإغلاق الملف نهائياً.',
    highlightText: 'نموذج لملف مكتمل ومغلق في السجل الرقمي الولائي.',
    statusType: 'closed'
  }
];

export const getTopicDemoByCategory = (category: GrievanceCategory): TopicDemo => {
  const found = TOPIC_DEMOS.find(d => d.category === category);
  return found || TOPIC_DEMOS[0];
};
