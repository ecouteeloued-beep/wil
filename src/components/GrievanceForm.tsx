import React, { useState } from 'react';
import { CATEGORIES, DAIRAS, DAIRAS_MUNICIPALITIES } from '../data';
import { Municipality, GrievanceCategory, GrievanceSubmission } from '../types';
import { GrievanceService } from '../services/grievanceService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Search, CheckCircle, Copy, Check, FileText, 
  ArrowRight, Clock, Building2, Tag, Phone, AlertCircle, UploadCloud, X, MapPin,
  Sparkles, Eye, Printer, ShieldCheck, CheckCircle2, User, HelpCircle,
  FileBadge2, Leaf, Building, Bus, HeartPulse, MessageCircle, AlertTriangle
} from 'lucide-react';
import { TOPIC_DEMOS, TRACKING_DEMO_CASES, TopicDemo, TrackingDemoCase } from '../demoData';
import { TopicDemoModal } from './TopicDemoModal';

interface GrievanceFormProps {
  activeTab: 'new' | 'track';
  onTabChange: (tab: 'new' | 'track') => void;
  initialCategory?: GrievanceCategory;
  demoToLoad?: TopicDemo | null;
  onClearDemoToLoad?: () => void;
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
  demoToLoad,
  onClearDemoToLoad
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

  // Modal for topic preview
  const [isTopicDemoModalOpen, setIsTopicDemoModalOpen] = useState(false);
  const [demoModalCategory, setDemoModalCategory] = useState<GrievanceCategory>('الحالة المدنية');
  const [loadedDemoNotification, setLoadedDemoNotification] = useState<string | null>(null);

  // Success State after submission
  const [submittedTicket, setSubmittedTicket] = useState<GrievanceSubmission | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tracking Search State
  const [trackQuery, setTrackQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTrackingResult, setActiveTrackingResult] = useState<ActiveTrackingDossier | null>(null);
  const [selectedDemoCode, setSelectedDemoCode] = useState<string | null>(null);

  // Sync initialCategory
  React.useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  // Handle demo to load passed from external components (e.g. Domains.tsx)
  React.useEffect(() => {
    if (demoToLoad) {
      applyDemoPreset(demoToLoad);
      if (onClearDemoToLoad) onClearDemoToLoad();
    }
  }, [demoToLoad]);

  const applyDemoPreset = (demo: TopicDemo) => {
    setNin(demo.nin);
    setFullName(demo.fullName);
    setPhone(demo.phone);
    setApplicantDaira(demo.applicantDaira);
    setApplicantMunicipality(demo.applicantMunicipality);
    setApplicantNeighborhood(demo.applicantNeighborhood);
    setSubject(demo.subject);
    setGrievanceDaira(demo.grievanceDaira);
    setGrievanceMunicipality(demo.grievanceMunicipality);
    setCategory(demo.category);
    setDetails(demo.details);
    setFormStep(1);
    setFormError(null);
    setLoadedDemoNotification(`تم تحميل النموذج التجريبي: "${demo.title}" بنجاح.`);
    
    // Auto-scroll to form fields
    setTimeout(() => {
      const el = document.getElementById('form-fields-container');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    setTimeout(() => {
      setLoadedDemoNotification(null);
    }, 6000);
  };

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

  const executeTrackSearch = (codeToSearch: string) => {
    const cleaned = codeToSearch.trim().toUpperCase();
    if (!cleaned) return;
    setTrackQuery(cleaned);
    setSelectedDemoCode(cleaned);
    setIsSearching(true);
    setHasSearched(false);
    setActiveTrackingResult(null);

    setTimeout(() => {
      const match = GrievanceService.findByTrackingId(cleaned);
      if (match) {
        setActiveTrackingResult({
          id: match.id,
          fullName: match.fullName,
          phone: match.phone,
          applicantNeighborhood: match.applicantNeighborhood,
          applicantDaira: match.applicantDaira,
          applicantMunicipality: match.applicantMunicipality,
          subject: match.subject,
          details: match.details,
          municipality: match.grievanceMunicipality || match.applicantMunicipality || 'ولاية الوادي',
          daira: match.grievanceDaira || match.applicantDaira || 'الوادي',
          category: match.category,
          status: match.status,
          priority: match.priority || 'عادي',
          submissionDate: new Date(match.createdAt).toLocaleDateString('ar-DZ', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          assignedDepartment: match.assignedDepartment,
          assignedToName: match.assignedToName,
          officialResponse: match.officialResponse,
          timeline: match.timeline
        });
      }
      setHasSearched(true);
      setIsSearching(false);
    }, 450);
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
      {/* Modal for topic demo inspection */}
      <TopicDemoModal
        isOpen={isTopicDemoModalOpen}
        onClose={() => setIsTopicDemoModalOpen(false)}
        initialCategory={demoModalCategory}
        onSelectAndApplyDemo={(demo) => {
          applyDemoPreset(demo);
          onTabChange('new');
        }}
      />

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
            البوابة الرقمية المعتمدة لاستقبال وتتبع كافة العرائض الإدارية مع إمكانية المعاينة التجريبية الفورية
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
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded font-tajawal">
                أكواد تجريبية جاهزة
              </span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-5 sm:p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* ========================================================================= */}
              {/* TAB 1: NEW GRIEVANCE FORM WITH TOPIC DEMO PRESETS */}
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
                    /* The Active Form with Topic Demo Presets */
                    <div className="space-y-6 max-w-2xl mx-auto">
                      {/* =================================================================== */}
                      {/* 🌟 TOPIC DEMO PRESETS BAR (رؤية تجريبية للمواضيع) */}
                      {/* =================================================================== */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200 rounded-xl shadow-2xs">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-[#006233] text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Sparkles className="w-4 h-4 text-amber-300" />
                            </span>
                            <div>
                              <h4 className="font-changa font-bold text-sm sm:text-base text-[#006233] flex items-center gap-2">
                                رؤية تجريبية لنماذج المواضيع
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full font-tajawal">
                                  تعبئة تلقائية فورية
                                </span>
                              </h4>
                              <p className="font-tajawal text-xs text-gray-600 mt-0.5">
                                انقر على أي نموذج موضوع أدناه لملء كافة حقول الاستمارة ببيانات نموذجية وتجربة الإيداع:
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setDemoModalCategory(category);
                              setIsTopicDemoModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-[#006233] rounded-lg text-xs font-bold font-tajawal shadow-2xs transition-colors shrink-0 cursor-pointer"
                            title="الاطلاع على الوثائق المطلوبة والآجال القانونية"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-700" />
                            <span>دليل الوثائق والآجال</span>
                          </button>
                        </div>

                        {/* 6 Topic Demo Pills Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                          {TOPIC_DEMOS.map(demo => (
                            <button
                              key={demo.id}
                              type="button"
                              onClick={() => applyDemoPreset(demo)}
                              className="p-2.5 bg-white hover:bg-emerald-100/50 border border-emerald-200/90 hover:border-[#006233] rounded-lg text-right transition-all flex flex-col justify-between shadow-2xs cursor-pointer group"
                              title={`انقر لتعبئة نموذج: ${demo.title}`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[11px] font-bold text-emerald-900 font-tajawal truncate">
                                  {demo.category}
                                </span>
                                <span>{CATEGORY_ICONS[demo.category]}</span>
                              </div>
                              <span className="text-[11px] font-tajawal font-medium text-gray-700 line-clamp-2 leading-snug group-hover:text-[#006233]">
                                {demo.title}
                              </span>
                              <span className="mt-2 text-[9px] text-gray-400 font-tajawal self-start group-hover:text-emerald-800 flex items-center gap-1 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                تجربة وتعبئة
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Toast Notification when Demo Applied */}
                        {loadedDemoNotification && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-2.5 bg-[#006233] text-white rounded-lg text-xs font-tajawal font-bold flex items-center justify-between gap-2 shadow-xs"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                              <span>{loadedDemoNotification}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setLoadedDemoNotification(null)}
                              className="text-white/80 hover:text-white p-1 rounded cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        )}
                      </div>

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
              {/* TAB 2: TRACK REQUEST WITH INTERACTIVE DEMO TRACKING CODES */}
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
                  {/* =================================================================== */}
                  {/* 🔍 INTERACTIVE DEMO TRACKING CODES (تجربة تتبع فورية) */}
                  {/* =================================================================== */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border border-gray-200 rounded-xl shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#111827] text-white flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                        </span>
                        <div>
                          <h4 className="font-changa font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                            تجربة تتبع فورية (أكواد تجريبية جاهزة)
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full font-tajawal">
                              استعلام مباشر بنقرة واحدة
                            </span>
                          </h4>
                          <p className="font-tajawal text-xs text-gray-600 mt-0.5">
                            اختر أحد الملفات النموذجية أدناه للاطلاع الفوري على مخرجات المعالجة والرد الرسمي المعتمد:
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 4 Demo Tracking Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {TRACKING_DEMO_CASES.map(demoCase => {
                        const isSelected = selectedDemoCode === demoCase.code;
                        return (
                          <button
                            key={demoCase.code}
                            type="button"
                            onClick={() => executeTrackSearch(demoCase.code)}
                            className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer group ${
                              isSelected
                                ? 'bg-emerald-50/80 border-[#006233] ring-1 ring-[#006233]'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-mono font-bold text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                                {demoCase.code}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-tajawal ${
                                demoCase.statusType === 'resolved'
                                  ? 'bg-green-100 text-green-800'
                                  : demoCase.statusType === 'review'
                                  ? 'bg-amber-100 text-amber-800'
                                  : demoCase.statusType === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {demoCase.stageBadge}
                              </span>
                            </div>

                            <p className="font-tajawal font-bold text-xs text-gray-800 line-clamp-1 mb-1 group-hover:text-[#006233]">
                              {demoCase.subject}
                            </p>

                            <p className="font-tajawal text-[11px] text-gray-500 leading-snug line-clamp-2">
                              {demoCase.stageDescription}
                            </p>

                            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-tajawal text-gray-500">
                              <span>بلدية {demoCase.municipality}</span>
                              <span className="text-[#006233] font-bold group-hover:underline flex items-center gap-1">
                                معاينة الملف
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual Search Form */}
                  <form onSubmit={handleSearchSubmit} className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs">
                    <label className="block text-sm font-bold text-[#111827] mb-2 font-tajawal text-center">
                      أو أدخل رقم التتبع الخاص بعريضتكم:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          required
                          value={trackQuery}
                          onChange={e => setTrackQuery(e.target.value)}
                          placeholder="مثال: WD-2026-00130"
                          dir="ltr"
                          className={`${inputBaseClass} font-mono uppercase text-center sm:text-left`}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSearching}
                        className="py-3 px-6 bg-[#111827] hover:bg-[#1f2937] text-white font-tajawal font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-70 cursor-pointer"
                      >
                        {isSearching ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>بحث واستعلام</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Tracking Results Display */}
                  {hasSearched && activeTrackingResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm space-y-0"
                    >
                      {/* Official Document Header */}
                      <div className="bg-[#111827] px-5 py-3.5 text-white flex justify-between items-center">
                        <div className="font-tajawal text-sm font-bold flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#D21034]" />
                          <span>ملف عريضة إلكتروني رقم</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold tracking-widest text-base sm:text-lg text-amber-300">
                            {activeTrackingResult.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(activeTrackingResult.id)}
                            className="text-white/70 hover:text-white p-1 rounded transition-colors cursor-pointer"
                            title="نسخ رقم الملف"
                          >
                            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-5 sm:p-7 space-y-6">
                        {/* File Metadata Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs font-tajawal">
                          <div>
                            <span className="text-gray-400 block text-[10px] mb-0.5">تاريخ الإيداع:</span>
                            <span className="font-bold text-gray-900">{activeTrackingResult.submissionDate}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] mb-0.5">الحالة الحالية:</span>
                            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                              activeTrackingResult.status === 'تم الرد'
                                ? 'bg-green-100 text-green-800'
                                : activeTrackingResult.status === 'بانتظار المراجعة والاعتماد'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {activeTrackingResult.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] mb-0.5">الدائرة والبلدية:</span>
                            <span className="font-bold text-gray-900">{activeTrackingResult.daira} / {activeTrackingResult.municipality}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] mb-0.5">تصنيف المجال:</span>
                            <span className="font-bold text-emerald-800">{activeTrackingResult.category}</span>
                          </div>
                        </div>

                        {/* Citizen & Location Info */}
                        <div className="border border-gray-100 rounded-xl p-4 bg-white space-y-2">
                          <div className="flex items-center justify-between text-xs font-tajawal text-gray-500">
                            <span className="flex items-center gap-1.5 font-bold text-gray-700">
                              <User className="w-3.5 h-3.5 text-[#006233]" />
                              صاحب العريضة: <strong className="text-gray-900">{activeTrackingResult.fullName}</strong>
                            </span>
                            {activeTrackingResult.applicantNeighborhood && (
                              <span>الحي: {activeTrackingResult.applicantNeighborhood}</span>
                            )}
                          </div>
                        </div>

                        {/* Subject & Details */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2 text-xs font-tajawal">
                          <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            <Tag className="w-4 h-4 text-[#006233]" />
                            <span>الموضوع: {activeTrackingResult.subject}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-xs sm:text-[13px] whitespace-pre-line pt-1">
                            {activeTrackingResult.details}
                          </p>
                        </div>

                        {/* Official Administrative Response Card (if available) */}
                        {activeTrackingResult.officialResponse && (
                          <div className="border-2 border-[#006233] bg-emerald-50/40 rounded-xl p-5 relative overflow-hidden">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-[#006233] text-white flex items-center justify-center shadow-xs">
                                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                                </span>
                                <div>
                                  <h5 className="font-changa font-bold text-sm sm:text-base text-[#006233]">
                                    الرد الإداري الرسمي المعتمد
                                  </h5>
                                  <span className="text-[11px] font-tajawal text-gray-500">
                                    صادر عن خلية الإصغاء والتكفل بانشغالات المواطنين لديوان الوالي
                                  </span>
                                </div>
                              </div>

                              {activeTrackingResult.officialResponse.letterNumber && (
                                <div className="text-left font-tajawal text-xs">
                                  <span className="text-gray-400 block text-[10px]">رقم المراسلة الرسمية:</span>
                                  <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                                    {activeTrackingResult.officialResponse.letterNumber}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="text-xs sm:text-sm font-tajawal text-gray-800 leading-relaxed bg-white p-4 rounded-lg border border-emerald-100 shadow-2xs whitespace-pre-line">
                              {activeTrackingResult.officialResponse.text}
                            </div>

                            <div className="mt-3 flex items-center justify-between text-[11px] font-tajawal text-gray-500 pt-2 border-t border-emerald-100">
                              <span>صفة التوقيع: مسؤول خلية التكفل بالانشغالات</span>
                              <span className="text-emerald-800 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                معتمد وقابل للتنفيذ الميداني
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Official Timeline / Stages */}
                        <div>
                          <span className="block text-sm font-changa font-bold text-[#111827] mb-4 bg-gray-50 p-2.5 rounded-lg border-r-4 border-[#006233]">
                            سجل ومحطات مسار المعالجة الميدانية
                          </span>
                          
                          {activeTrackingResult.timeline && activeTrackingResult.timeline.length > 0 ? (
                            <div className="space-y-0 relative before:absolute before:inset-y-0 before:right-[9px] before:w-[2px] before:bg-gray-200 pl-2">
                              {activeTrackingResult.timeline.map((item, idx) => (
                                <div key={item.id || idx} className="relative pr-6 pb-5">
                                  <span className={`absolute right-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                                    idx === 0 ? 'bg-[#006233]' : 'bg-[#D21034]'
                                  }`} />
                                  <div className="flex items-center justify-between gap-2">
                                    <h5 className="font-bold text-gray-900 text-xs sm:text-sm font-tajawal">
                                      {item.action}
                                    </h5>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {item.date} {item.time ? `(${item.time})` : ''}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-emerald-800 font-tajawal block mt-0.5">
                                    الجهة: {item.author} — {item.authorRole}
                                  </span>
                                  {item.note && (
                                    <p className="text-gray-600 text-xs mt-1 font-tajawal bg-gray-50 p-2 rounded border border-gray-100 leading-relaxed">
                                      {item.note}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-0 relative before:absolute before:inset-y-0 before:right-[9px] before:w-[2px] before:bg-gray-200 pl-2">
                              <div className="relative pr-6 pb-5">
                                <span className="absolute right-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#006233] ring-4 ring-white" />
                                <h5 className="font-bold text-[#006233] text-sm font-tajawal">استلام وتسجيل العريضة بالمنظومة</h5>
                                <p className="text-gray-500 text-[11px] mt-1 font-tajawal">تم إيداع الانشغال وتوثيقه في السجل الولائي المركزي.</p>
                              </div>
                              
                              <div className="relative pr-6 pb-5">
                                <span className="absolute right-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#D21034] ring-4 ring-white animate-pulse" />
                                <h5 className="font-bold text-[#D21034] text-sm font-tajawal">قيد الدراسة والتوجيه القطاعي</h5>
                                <p className="text-[#111827]/70 text-[11px] mt-1 font-tajawal">تم تحويل الملف إلى المصالح التقنية والبلدية للمعاينة واتخاذ التدابير.</p>
                              </div>
                              
                              <div className="relative pr-6">
                                <span className="absolute right-[5px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 ring-4 ring-white" />
                                <h5 className="font-bold text-gray-400 text-sm font-tajawal">الرد الإداري النهائي</h5>
                                <p className="text-gray-400 text-[11px] mt-1 font-tajawal">في انتظار استكمال الإجراءات وصدور القرار الميداني.</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={handlePrintReceipt}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold font-tajawal flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                            <span>طباعة وصل المعاينة</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setTrackQuery('');
                                setActiveTrackingResult(null);
                                setHasSearched(false);
                              }}
                              className="px-4 py-2 bg-[#111827] hover:bg-[#1f2937] text-white rounded-lg text-xs font-bold font-tajawal transition-colors cursor-pointer"
                            >
                              استعلام عن ملف آخر
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Empty state when searched but not found */}
                  {hasSearched && !activeTrackingResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h5 className="font-changa font-bold text-base text-gray-900">
                        لم يتم العثور على ملف برقم التتبع: <span className="font-mono text-[#D21034]">{trackQuery}</span>
                      </h5>
                      <p className="font-tajawal text-xs text-gray-600 max-w-md mx-auto">
                        يرجى التحقق من صحة الرقم المرجعي أو تجربة أحد الأكواد النموذجية المعتمدة أدناه لمعاينة النظام:
                      </p>
                      
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {TRACKING_DEMO_CASES.map(c => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => executeTrackSearch(c.code)}
                            className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100/60 rounded-lg text-xs font-tajawal font-bold text-amber-900 transition-colors cursor-pointer"
                          >
                            تجربة: {c.code} ({c.stageBadge})
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Default hint state */}
                  {!hasSearched && !isSearching && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 text-gray-400 font-tajawal text-xs sm:text-sm flex flex-col items-center">
                      <Search className="w-8 h-8 text-gray-300 mb-2" />
                      <span>يمكنك إدخال كود التتبع الخاص بكم أو النقر على أحد الأكواد التجريبية أعلاه للاستعلام الفوري.</span>
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
