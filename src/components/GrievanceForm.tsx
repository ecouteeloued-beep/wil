import React, { useState } from 'react';
import { CATEGORIES, DAIRAS, DAIRAS_MUNICIPALITIES } from '../data';
import { Municipality, GrievanceCategory, GrievanceSubmission, EnhancedGrievance } from '../types';
import { GrievanceService } from '../services/grievanceService';
import { complaintRepository } from '../services/complaintRepository';
import { ComplaintService } from '../services/complaintService';
import { AdminService } from '../services/adminService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Search, CheckCircle, Copy, Check, FileText, 
  ArrowRight, Clock, Building2, Tag, Phone, AlertCircle, UploadCloud, X, MapPin,
  Sparkles, Eye, Printer, ShieldCheck, CheckCircle2, User, HelpCircle,
  FileBadge2, Leaf, Building, Bus, HeartPulse, MessageCircle, AlertTriangle
} from 'lucide-react';
import { CitizenTrackingDossier } from './CitizenTrackingDossier';

interface GrievanceFormProps {
  activeTab: 'new' | 'track';
  onTabChange: (tab: 'new' | 'track') => void;
  initialCategory?: GrievanceCategory;
}

interface ActiveTrackingDossier {
  id: string;
  fullName: string;
  phone?: string;
  applicantNeighborhood?: string;
  applicantDaira?: string;
  applicantMunicipality?: string;
  subject: string;
  details: string;
  municipality: string;
  daira: string;
  category: GrievanceCategory;
  status: string;
  priority?: string;
  submissionDate: string;
  assignedDepartment?: string;
  assignedToName?: string;
  officialResponse?: {
    text: string;
    letterNumber?: string;
    approved?: boolean;
    preparedBy?: string;
    reviewedBy?: string;
    preparedAt?: string;
    reviewedAt?: string;
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

const CATEGORY_ICONS: Record<GrievanceCategory, React.ReactNode> = {
  'الحالة المدنية': <FileBadge2 className="w-4 h-4 text-red-600" />,
  'البيئة': <Leaf className="w-4 h-4 text-emerald-600" />,
  'العمران': <Building className="w-4 h-4 text-amber-600" />,
  'النقل': <Bus className="w-4 h-4 text-blue-600" />,
  'الصحة': <HeartPulse className="w-4 h-4 text-rose-600" />,
  'أخرى': <MessageCircle className="w-4 h-4 text-purple-600" />,
};

export const GrievanceForm: React.FC<GrievanceFormProps> = ({ 
  activeTab, 
  onTabChange, 
  initialCategory,
}) => {
  // Submission Form State
  const [nin, setNin] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [applicantDaira, setApplicantDaira] = useState('');
  const [applicantMunicipality, setApplicantMunicipality] = useState('');
  const [applicantNeighborhood, setApplicantNeighborhood] = useState('');
  
  const [subject, setSubject] = useState('');
  const [grievanceDaira, setGrievanceDaira] = useState('');
  const [grievanceMunicipality, setGrievanceMunicipality] = useState('');
  const [category, setCategory] = useState<GrievanceCategory>(initialCategory || 'الحالة المدنية');
  
  const [details, setDetails] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);

  // Success State after submission
  const [submittedTicket, setSubmittedTicket] = useState<GrievanceSubmission | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tracking Search State
  const [trackQuery, setTrackQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTrackingResult, setActiveTrackingResult] = useState<EnhancedGrievance | null>(null);

  // Sync initialCategory
  React.useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Strict Validations
    if (!nin.trim() || !/^\d{18}$/.test(nin.trim())) {
      return setFormError('رقم التعريف الوطني غير صالح (يجب أن يتكون من 18 رقماً)');
    }
    if (!fullName.trim()) {
      return setFormError('يرجى إدخال الاسم واللقب بالكامل');
    }
    if (!phone.trim() || !/^(05|06|07)\d{8}$/.test(phone.trim())) {
      return setFormError('رقم الهاتف غير صالح (يجب أن يبدأ بـ 05، 06، أو 07 ويتكون من 10 أرقام)');
    }
    if (!applicantDaira) {
      return setFormError('يرجى اختيار دائرة الإقامة');
    }
    if (!applicantMunicipality) {
      return setFormError('يرجى اختيار بلدية الإقامة');
    }
    if (!applicantNeighborhood.trim()) {
      return setFormError('يرجى إدخال الحي أو العنوان');
    }
    if (!subject.trim()) {
      return setFormError('يرجى كتابة موضوع العريضة');
    }
    if (!grievanceDaira) {
      return setFormError('يرجى اختيار الدائرة المعنية بالعريضة');
    }
    if (!grievanceMunicipality) {
      return setFormError('يرجى اختيار البلدية المعنية بالعريضة');
    }
    if (!details.trim()) {
      return setFormError('يرجى كتابة تفاصيل العريضة المراد تبليغها');
    }
    
    // Rate Limiting Check
    if (!GrievanceService.canSubmit()) {
      return setFormError('يرجى الانتظار بضع دقائق قبل إرسال عريضة أخرى');
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const newSubmission = GrievanceService.save({
          nin: nin.trim(),
          fullName: fullName.trim(),
          phone: phone.trim(),
          applicantDaira,
          applicantMunicipality,
          applicantNeighborhood: applicantNeighborhood.trim(),
          subject: subject.trim(),
          grievanceDaira,
          grievanceMunicipality,
          category,
          details: details.trim(),
        });
        
        setSubmittedTicket(newSubmission);
      } catch (err) {
        setFormError('حدث خطأ أثناء حفظ العريضة، يرجى المحاولة لاحقاً');
      } finally {
        setIsSubmitting(false);
      }
    }, 700);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetForm = () => {
    setNin('');
    setFullName('');
    setPhone('');
    setApplicantDaira('');
    setApplicantMunicipality('');
    setApplicantNeighborhood('');
    setSubject('');
    setGrievanceDaira('');
    setGrievanceMunicipality('');
    setCategory('الحالة المدنية');
    setDetails('');
    setFiles([]);
    setFormError(null);
    setSubmittedTicket(null);
    setFormStep(1);
  };

  const executeTrackSearch = async (codeToSearch: string) => {
    const cleaned = codeToSearch.trim().toUpperCase();
    if (!cleaned) return;
    setTrackQuery(cleaned);
    setIsSearching(true);
    setHasSearched(false);
    setActiveTrackingResult(null);

    try {
      // 1. Check direct complaintRepository
      let match = await complaintRepository.getById(cleaned);
      
      // 2. Check AdminService all grievances if not found in first pass
      if (!match) {
        const allAdmin = AdminService.getAllGrievances();
        match = allAdmin.find(g => 
          g.id.trim().toUpperCase() === cleaned || 
          (g.trackingNumber && g.trackingNumber.trim().toUpperCase() === cleaned)
        ) || null;
      }

      // 3. Fallback to GrievanceService
      if (!match) {
        const legacyMatch = GrievanceService.findByTrackingId(cleaned);
        if (legacyMatch) {
          match = {
            id: legacyMatch.id,
            trackingNumber: legacyMatch.id,
            statusCode: 'IN_PROGRESS',
            status: legacyMatch.status || 'قيد المعالجة',
            priority: legacyMatch.priority || 'عادي',
            fullName: legacyMatch.fullName,
            phone: legacyMatch.phone || '',
            applicantDaira: legacyMatch.applicantDaira || 'الوادي',
            applicantMunicipality: legacyMatch.applicantMunicipality || 'الوادي',
            applicantNeighborhood: legacyMatch.applicantNeighborhood || '',
            subject: legacyMatch.subject,
            grievanceDaira: legacyMatch.grievanceDaira || legacyMatch.applicantDaira || 'الوادي',
            grievanceMunicipality: legacyMatch.grievanceMunicipality || legacyMatch.applicantMunicipality || 'الوادي',
            category: legacyMatch.category,
            sector: legacyMatch.category || 'عام',
            details: legacyMatch.details,
            createdAt: legacyMatch.createdAt,
            updatedAt: legacyMatch.createdAt,
            dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
            isOverdue: false,
            specialFlags: [],
            officialResponse: legacyMatch.officialResponse,
            citizenActionRequired: legacyMatch.citizenActionRequired,
            citizenRating: legacyMatch.citizenRating,
            publicMessages: legacyMatch.publicMessages,
            timeline: legacyMatch.timeline || [],
            internalNotes: []
          };
        }
      }

      setActiveTrackingResult(match);
    } catch (err) {
      console.error('Error executing track search:', err);
      setActiveTrackingResult(null);
    } finally {
      setHasSearched(true);
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeTrackSearch(trackQuery);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const inputBaseClass = "w-full px-4 py-3 text-sm bg-white border border-[#111827]/20 rounded-md text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#006233] focus:border-[#006233] transition-colors placeholder:text-gray-400";
  const labelClass = "block text-[13px] font-bold text-[#111827] mb-1.5 font-tajawal";

  return (
    <>
      <section id="interactive-form-section" className="py-12 sm:py-16 max-w-xl md:max-w-4xl mx-auto px-4">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#006233] text-xs font-tajawal font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#006233]" />
            <span>فضاء المواطن المباشر — ديوان والي ولاية الوادي</span>
          </div>

          <h3 className="font-changa font-bold text-2xl sm:text-3xl text-[#111827] mt-1 relative inline-block">
            الخدمات الإلكترونية المباشرة
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#006233] rounded-full"></div>
          </h3>
          <p className="font-tajawal text-sm text-[#111827]/70 mt-6 max-w-md mx-auto leading-relaxed">
            البوابة الرقمية الرسمية لاستقبال ومعالجة ومتابعة عرائض وانشغالات المواطنين بولاية الوادي
          </p>
        </motion.div>

        {/* Main Container Card - Official Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white border-t-4 border-t-[#006233] border-x border-b border-[#E5E7EB] shadow-md rounded-b-xl overflow-hidden"
        >
          {/* Tab Headers */}
          <div className="flex border-b border-[#E5E7EB] bg-gray-50">
            <button
              type="button"
              onClick={() => { onTabChange('new'); setFormError(null); }}
              className={`flex-1 py-4 px-4 font-changa font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors border-l border-[#E5E7EB] cursor-pointer ${
                activeTab === 'new' ? 'text-[#006233] bg-white border-b-2 border-b-[#006233] -mb-[1px]' : 'text-[#111827]/60 hover:text-[#111827] hover:bg-gray-100'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>تسجيل عريضة جديدة</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('track')}
              className={`flex-1 py-4 px-4 font-changa font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'track' ? 'text-[#D21034] bg-white border-b-2 border-b-[#D21034] -mb-[1px]' : 'text-[#111827]/60 hover:text-[#111827] hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>تتبع ملف العريضة</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-5 sm:p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* ========================================================================= */}
              {/* TAB 1: NEW OFFICIAL GRIEVANCE REGISTRATION FORM */}
              {/* ========================================================================= */}
              {activeTab === 'new' && (
                <motion.div
                  key="new-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {submittedTicket ? (
                    /* Official Success State (Receipt style) */
                    <div className="max-w-2xl mx-auto py-4">
                      <div className="border border-[#006233]/30 rounded-xl p-6 sm:p-8 bg-green-50/30 text-center relative overflow-hidden">
                        <CheckCircle className="absolute -right-8 -bottom-8 w-40 h-40 text-[#006233]/5 pointer-events-none" />
                        
                        <div className="w-16 h-16 rounded-full bg-[#006233] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                          <CheckCircle className="w-8 h-8" />
                        </div>

                        <h4 className="font-changa font-bold text-xl sm:text-2xl text-[#111827] mb-2">
                          وصل استلام طلب إلكتروني
                        </h4>
                        <p className="font-tajawal text-sm text-[#111827]/70 mb-6">
                          تم تسجيل عريضةكم بنجاح بالبوابة الرقمية لولاية الوادي وحُوّلت للمصلحة المختصة.
                        </p>

                        <div className="bg-white border-2 border-dashed border-[#D21034] rounded-xl p-4 mb-6 relative z-10 mx-auto max-w-sm shadow-xs">
                          <span className="block text-[11px] font-tajawal text-gray-500 mb-1">
                            الرقم المرجعي للملف (رقم التتبع)
                          </span>
                          <div className="flex items-center justify-center gap-3">
                            <span className="font-mono text-2xl sm:text-3xl font-black text-[#111827] tracking-widest">
                              {submittedTicket.id}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleCopy(submittedTicket.id)}
                            className={`mt-3 w-full py-2 rounded-lg border text-xs font-tajawal font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              copiedCode ? 'bg-[#006233] border-[#006233] text-white' : 'bg-gray-50 border-gray-200 text-[#111827] hover:bg-gray-100'
                            }`}
                          >
                            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedCode ? 'تم نسخ الرقم' : 'نسخ الرقم المرجعي'}</span>
                          </button>
                        </div>

                        {/* Official details summary */}
                        <div className="text-right bg-white p-4 border border-gray-200 rounded-xl text-sm font-tajawal grid grid-cols-2 gap-y-3 relative z-10 mx-auto max-w-md">
                          <div><span className="text-gray-500 block text-[11px]">صاحب الطلب:</span><span className="font-bold">{submittedTicket.fullName}</span></div>
                          <div><span className="text-gray-500 block text-[11px]">موضوع العريضة:</span><span className="font-bold">{submittedTicket.subject}</span></div>
                          <div><span className="text-gray-500 block text-[11px]">البلدية المعنية:</span><span className="font-bold">{submittedTicket.grievanceMunicipality}</span></div>
                          <div><span className="text-gray-500 block text-[11px]">تاريخ التسجيل:</span><span className="font-bold font-mono">{new Date(submittedTicket.createdAt).toLocaleDateString('ar-DZ')}</span></div>
                          <div className="col-span-2"><span className="text-gray-500 block text-[11px]">نوع العريضة:</span><span className="font-bold text-[#D21034]">{submittedTicket.category}</span></div>
                        </div>

                      </div>

                      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => { 
                            onTabChange('track'); 
                            executeTrackSearch(submittedTicket.id); 
                          }}
                          className="py-2.5 px-6 bg-[#006233] hover:bg-[#004d28] text-white font-tajawal font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                          <span>متابعة وتتبع الملف الآن</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleResetForm}
                          className="py-2.5 px-6 bg-white border border-[#E5E7EB] text-[#111827] hover:bg-gray-50 font-tajawal font-bold text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          العودة وتسجيل ملف جديد
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* The Active Form */
                    <div className="space-y-6 max-w-2xl mx-auto">
                      {/* Main Submission Form */}
                      <form id="form-fields-container" onSubmit={handleSubmit} className="space-y-6">
                        {formError && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 border-r-4 border-[#D21034] text-[#D21034] text-sm font-tajawal font-bold flex items-center gap-2 rounded-r">
                            <AlertCircle className="w-4 h-4" />
                            <span>{formError}</span>
                          </motion.div>
                        )}

                        {/* Section 1: Personal Info */}
                        <fieldset className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                          <legend className="text-xs sm:text-sm font-bold text-[#006233] px-3 font-changa bg-white border border-gray-200 rounded-md py-1 shadow-2xs">
                            1. هوية ومقر إقامة مقدم الطلب
                          </legend>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <label className={labelClass}>رقم التعريف الوطني (NIN) <span className="text-[#D21034]">*</span></label>
                              <input
                                type="text"
                                required
                                value={nin}
                                onChange={e => setNin(e.target.value.replace(/[^0-9]/g, '').slice(0, 18))}
                                placeholder="18 رقماً"
                                dir="ltr"
                                className={`${inputBaseClass} font-mono text-right placeholder:text-right placeholder:font-tajawal`}
                              />
                            </div>

                            <div>
                              <label className={labelClass}>الاسم واللقب <span className="text-[#D21034]">*</span></label>
                              <input
                                type="text"
                                required
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="كما في الوثائق الرسمية"
                                className={inputBaseClass}
                              />
                            </div>

                            <div>
                              <label className={labelClass}>رقم الهاتف المحمول <span className="text-[#D21034]">*</span></label>
                              <div className="relative">
                                <input
                                  type="tel"
                                  required
                                  value={phone}
                                  onChange={e => setPhone(e.target.value)}
                                  placeholder="06 XX XX XX XX"
                                  dir="ltr"
                                  className={`${inputBaseClass} pl-4 pr-10 text-right placeholder:text-right font-mono`}
                                />
                                <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                              </div>
                            </div>

                            <div>
                              <label className={labelClass}>دائرة الإقامة <span className="text-[#D21034]">*</span></label>
                              <div className="relative">
                                <select
                                  required
                                  value={applicantDaira}
                                  onChange={e => { setApplicantDaira(e.target.value); setApplicantMunicipality(''); }}
                                  className={`${inputBaseClass} appearance-none pr-10`}
                                >
                                  <option value="">اختر الدائرة</option>
                                  {DAIRAS.map(d => <option key={d} value={d}>دائرة {d}</option>)}
                                </select>
                                <MapPin className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                              </div>
                            </div>

                            <div>
                              <label className={labelClass}>بلدية الإقامة <span className="text-[#D21034]">*</span></label>
                              <div className="relative">
                                <select
                                  required
                                  value={applicantMunicipality}
                                  onChange={e => setApplicantMunicipality(e.target.value)}
                                  disabled={!applicantDaira}
                                  className={`${inputBaseClass} appearance-none pr-10 disabled:bg-gray-100 disabled:opacity-70`}
                                >
                                  <option value="">اختر البلدية</option>
                                  {applicantDaira && DAIRAS_MUNICIPALITIES[applicantDaira]?.map(m => <option key={m} value={m}>بلدية {m}</option>)}
                                </select>
                                <Building2 className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                              </div>
                            </div>

                            <div>
                              <label className={labelClass}>الحي / التجمع السكني <span className="text-[#D21034]">*</span></label>
                              <input
                                type="text"
                                required
                                value={applicantNeighborhood}
                                onChange={e => setApplicantNeighborhood(e.target.value)}
                                placeholder="مثال: حي الرمال، الشارع الرئيسي..."
                                className={inputBaseClass}
                              />
                            </div>
                          </div>
                        </fieldset>

                        {/* Section 2: Subject & Grievance Details */}
                        <fieldset className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                          <legend className="text-xs sm:text-sm font-bold text-[#006233] px-3 font-changa bg-white border border-gray-200 rounded-md py-1 shadow-2xs">
                            2. موضوع وتفاصيل العريضة
                          </legend>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="md:col-span-2">
                              <label className={labelClass}>موضوع العريضة <span className="text-[#D21034]">*</span></label>
                              <input
                                type="text"
                                required
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="عنوان واضح ومختصر للموضوع..."
                                className={inputBaseClass}
                              />
                            </div>
                            
                            <div>
                              <label className={labelClass}>الدائرة المعنية <span className="text-[#D21034]">*</span></label>
                              <div className="relative">
                                <select
                                  required
                                  value={grievanceDaira}
                                  onChange={e => { setGrievanceDaira(e.target.value); setGrievanceMunicipality(''); }}
                                  className={`${inputBaseClass} appearance-none pr-10`}
                                >
                                  <option value="">اختر الدائرة</option>
                                  {DAIRAS.map(d => <option key={d} value={d}>دائرة {d}</option>)}
                                </select>
                                <MapPin className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                              </div>
                            </div>

                            <div>
                              <label className={labelClass}>البلدية المعنية <span className="text-[#D21034]">*</span></label>
                              <div className="relative">
                                <select
                                  required
                                  value={grievanceMunicipality}
                                  onChange={e => setGrievanceMunicipality(e.target.value)}
                                  disabled={!grievanceDaira}
                                  className={`${inputBaseClass} appearance-none pr-10 disabled:bg-gray-100 disabled:opacity-70`}
                                >
                                  <option value="">اختر البلدية</option>
                                  {grievanceDaira && DAIRAS_MUNICIPALITIES[grievanceDaira]?.map(m => <option key={m} value={m}>بلدية {m}</option>)}
                                </select>
                                <Building2 className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <label className={labelClass}>تصنيف ومجال العريضة <span className="text-[#D21034]">*</span></label>
                              <div className="relative">
                                <select
                                  value={category}
                                  onChange={e => setCategory(e.target.value as GrievanceCategory)}
                                  className={`${inputBaseClass} appearance-none pr-10`}
                                >
                                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <Tag className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <label className={labelClass}>نص العريضة والانشغال بالتفصيل <span className="text-[#D21034]">*</span></label>
                              <textarea
                                rows={5}
                                required
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                placeholder="اكتب تفاصيل الانشغال بوضوح مع ذكر الوقائع والمطالب..."
                                className={`${inputBaseClass} resize-y`}
                              />
                            </div>
                          </div>
                        </fieldset>

                        {/* Section 3: Attachments */}
                        <fieldset className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                          <legend className="text-xs sm:text-sm font-bold text-[#006233] px-3 font-changa bg-white border border-gray-200 rounded-md py-1 shadow-2xs">
                            3. المرفقات والوثائق الداعمة (اختياري)
                          </legend>

                          <div className="mt-3">
                            <label className={labelClass}>الصور والملفات الداعمة (PDF, JPG, PNG)</label>
                            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-white hover:bg-gray-50 transition-colors">
                              <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                <div className="flex text-sm text-gray-600 justify-center">
                                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#006233] hover:text-[#004d28] focus-within:outline-none">
                                    <span className="font-bold underline">اختر ملفاً</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                                  </label>
                                  <p className="pr-1">أو اسحب وأفلت هنا</p>
                                </div>
                                <p className="text-xs text-gray-500 font-tajawal">
                                  الحد الأقصى لحجم الملف 5MB
                                </p>
                              </div>
                            </div>
                            {files.length > 0 && (
                              <ul className="mt-4 space-y-2">
                                {files.map((file, index) => (
                                  <li key={index} className="flex items-center justify-between text-sm text-gray-700 bg-white p-2.5 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-gray-400" />
                                      <span className="truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFile(index)} className="text-[#D21034] hover:text-[#a00020] cursor-pointer">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </fieldset>

                        <div className="pt-4 border-t border-gray-200 flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="py-3 px-8 bg-[#006233] hover:bg-[#004d28] text-white font-tajawal font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px] cursor-pointer"
                          >
                            {isSubmitting ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                <span>تأكيد وإيداع العريضة</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: TRACK REQUEST */}
              {/* ========================================================================= */}
              {activeTab === 'track' && (
                <motion.div
                  key="track-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl mx-auto space-y-6"
                >
                  {/* Official Search Form */}
                  <form onSubmit={handleSearchSubmit} className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs">
                    <div className="text-center max-w-md mx-auto mb-5">
                      <div className="w-12 h-12 rounded-full bg-[#006233]/10 text-[#006233] flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-gray-900 font-changa">
                        الاستعلام ومتابعة العريضة
                      </h4>
                      <p className="font-tajawal text-xs text-gray-500 mt-1">
                        أدخل رقم التسجيل أو رمز التتبع المطبوع على وصل الإيداع لمتابعة مآل المعالجة
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 max-w-lg mx-auto">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          required
                          value={trackQuery}
                          onChange={e => setTrackQuery(e.target.value)}
                          placeholder="مثال: WD-2026-00125 أو WIL-2026-00130"
                          dir="ltr"
                          className={`${inputBaseClass} font-mono uppercase text-center sm:text-left`}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSearching}
                        className="py-3 px-6 bg-[#006233] hover:bg-[#005228] text-white font-tajawal font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-70 cursor-pointer shadow-xs"
                      >
                        {isSearching ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>تتبع الانشغال</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Tracking Results Display */}
                  {hasSearched && activeTrackingResult && (
                    <CitizenTrackingDossier
                      complaint={activeTrackingResult}
                      onRefresh={updated => setActiveTrackingResult(updated)}
                      onNewSearch={() => {
                        setTrackQuery('');
                        setActiveTrackingResult(null);
                        setHasSearched(false);
                      }}
                    />
                  )}

                  {/* Empty state when searched but not found */}
                  {hasSearched && !activeTrackingResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-amber-50/70 border border-amber-200 rounded-xl text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h5 className="font-changa font-bold text-base text-gray-900 leading-snug">
                        لم يتم العثور على أي ملف مسجل بهذا الرمز
                      </h5>
                      <p className="font-tajawal text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                        الرقم المدخل: <span className="font-mono text-[#D21034] font-bold">{trackQuery}</span>
                        <br />
                        يرجى التحقق من كتابة رقم التتبع كما هو مدوّن على وصل الاستلام الرسمي، ثم إعادة المحاولة.
                      </p>
                    </motion.div>
                  )}

                  {/* Default hint state */}
                  {!hasSearched && !isSearching && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 text-gray-400 font-tajawal text-xs sm:text-sm flex flex-col items-center">
                      <Search className="w-8 h-8 text-gray-300 mb-2" />
                      <span>يرجى إدخال رمز المتابعة المسلم لكم عند إيداع العريضة للاطلاع على مسار المعالجة.</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>
    </>
  );
};
