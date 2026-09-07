import React, { useState } from 'react';
import { MUNICIPALITIES, CATEGORIES } from '../data';
import { Municipality, GrievanceCategory, GrievanceSubmission } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Search, CheckCircle, Copy, Check, FileText, 
  ArrowRight, Clock, Building2, Tag, Phone, AlertCircle, UploadCloud, X
} from 'lucide-react';

interface GrievanceFormProps {
  activeTab: 'new' | 'track';
  onTabChange: (tab: 'new' | 'track') => void;
  initialCategory?: GrievanceCategory;
}

export const GrievanceForm: React.FC<GrievanceFormProps> = ({ activeTab, onTabChange, initialCategory }) => {
  // Submission Form State
  const [nin, setNin] = useState('');
  const [fullName, setFullName] = useState('');
  const [municipality, setMunicipality] = useState<Municipality>('الوادي');
  const [category, setCategory] = useState<GrievanceCategory>(initialCategory || 'الفلاحة والري');

  React.useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);
  const [details, setDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success State after submission
  const [submittedTicket, setSubmittedTicket] = useState<GrievanceSubmission | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [submissionsHistory, setSubmissionsHistory] = useState<Record<string, GrievanceSubmission>>({});

  // Tracking Search State
  const [trackQuery, setTrackQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTrackingResult, setActiveTrackingResult] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const generateTrackingId = (): string => {
    const randomNum = Math.floor(10000 + Math.random() * 90000); 
    return `WD-2026-${randomNum}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return setFormError('يرجى إدخال الاسم واللقب بالكامل');
    if (!phone.trim()) return setFormError('يرجى إدخال رقم الهاتف للتواصل');
    if (!details.trim()) return setFormError('يرجى كتابة تفاصيل العريضة المراد تبليغه');
    
    setFormError(null);
    setIsSubmitting(true);

    // Simulate network delay for premium feel
    setTimeout(() => {
      const newId = generateTrackingId();
      const newSubmission: GrievanceSubmission = {
        id: newId,
        fullName: fullName.trim(),
        municipality,
        category,
        details: details.trim(),
        phone: phone.trim(),
        createdAt: new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'قيد المعالجة',
      };
      setSubmissionsHistory(prev => ({ ...prev, [newId]: newSubmission }));
      setSubmittedTicket(newSubmission);
      setIsSubmitting(false);
    }, 800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetForm = () => {
    setFullName('');
    setMunicipality('الوادي');
    setCategory('الفلاحة والري');
    setDetails('');
    setPhone('');
    setFormError(null);
    setSubmittedTicket(null);
  };

  const performSearch = (codeToSearch: string) => {
    const cleaned = codeToSearch.trim();
    if (!cleaned) return;
    setIsSearching(true);
    setHasSearched(false);

    setTimeout(() => {
      const match = submissionsHistory[cleaned];
      if (match) {
        setActiveTrackingResult({
          id: match.id,
          fullName: match.fullName,
          municipality: match.municipality,
          category: match.category,
          status: match.status,
          submissionDate: match.createdAt,
        });
      } else {
        setActiveTrackingResult({
          id: cleaned.toUpperCase().startsWith('WD-') ? cleaned.toUpperCase() : `WD-2026-${cleaned}`,
          fullName: 'مواطن مسجل',
          municipality: 'الوادي',
          category: 'الفلاحة والري',
          status: 'قيد المعالجة',
          submissionDate: 'اليوم، 09:30 ص',
        });
      }
      setHasSearched(true);
      setIsSearching(false);
    }, 600);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(trackQuery);
  };

  // Common premium input classes - modified for official/Wassit look
  const inputBaseClass = "w-full px-4 py-3 text-sm bg-white border border-[#111827]/20 rounded-md text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#006233] focus:border-[#006233] transition-colors placeholder:text-gray-400";
  const labelClass = "block text-[13px] font-bold text-[#111827] mb-1.5 font-tajawal";

  return (
    <section id="interactive-form-section" className="py-12 sm:py-16 max-w-xl md:max-w-4xl mx-auto px-4">
      {/* Section Title */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h3 className="font-changa font-bold text-2xl sm:text-3xl text-[#111827] mt-1 relative inline-block">
          الخدمات الإلكترونية المباشرة
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#006233] rounded-full"></div>
        </h3>
        <p className="font-tajawal text-sm text-[#111827]/70 mt-6 max-w-md mx-auto leading-relaxed">
          البوابة الرسمية المعتمدة لاستقبال وتتبع كافة العرائض الإدارية
        </p>
      </motion.div>

      {/* Main Container Card - Official Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bg-white border-t-4 border-t-[#006233] border-x border-b border-[#E5E7EB] shadow-md rounded-b-lg"
      >
        {/* Tab Headers - Sharp tabs */}
        <div className="flex border-b border-[#E5E7EB] bg-gray-50">
          <button
            type="button"
            onClick={() => { onTabChange('new'); setFormError(null); }}
            className={`flex-1 py-4 px-4 font-changa font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors border-l border-[#E5E7EB] ${
              activeTab === 'new' ? 'text-[#006233] bg-white border-b-2 border-b-[#006233] -mb-[1px]' : 'text-[#111827]/60 hover:text-[#111827] hover:bg-gray-100'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>تسجيل عريضة جديد</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('track')}
            className={`flex-1 py-4 px-4 font-changa font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'track' ? 'text-[#D21034] bg-white border-b-2 border-b-[#D21034] -mb-[1px]' : 'text-[#111827]/60 hover:text-[#111827] hover:bg-gray-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>تتبع ملف العريضة</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-10 min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* Tab 1: New Grievance Form */}
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
                    <div className="border border-[#006233]/30 rounded-md p-6 sm:p-8 bg-green-50/30 text-center relative overflow-hidden">
                      {/* Watermark-like background icon */}
                      <CheckCircle className="absolute -right-8 -bottom-8 w-40 h-40 text-[#006233]/5" />
                      
                      <div className="w-16 h-16 rounded-full bg-[#006233] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                        <CheckCircle className="w-8 h-8" />
                      </div>

                      <h4 className="font-changa font-bold text-xl sm:text-2xl text-[#111827] mb-2">
                        وصل استلام طلب إلكتروني
                      </h4>
                      <p className="font-tajawal text-sm text-[#111827]/70 mb-6">
                        تم تسجيل عريضةكم بنجاح بالبوابة الرقمية لولاية الوادي.
                      </p>

                      <div className="bg-white border-2 border-dashed border-[#D21034] rounded p-4 mb-6 relative z-10 mx-auto max-w-sm">
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
                          className={`mt-3 w-full py-2 rounded border text-xs font-tajawal font-bold flex items-center justify-center gap-2 transition-all ${
                            copiedCode ? 'bg-[#006233] border-[#006233] text-white' : 'bg-gray-50 border-gray-200 text-[#111827] hover:bg-gray-100'
                          }`}
                        >
                          {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedCode ? 'تم نسخ الرقم' : 'نسخ الرقم المرجعي'}</span>
                        </button>
                      </div>

                      {/* Official details summary */}
                      <div className="text-right bg-white p-4 border border-gray-200 rounded text-sm font-tajawal grid grid-cols-2 gap-y-3 relative z-10 mx-auto max-w-md">
                         <div><span className="text-gray-500 block text-[11px]">صاحب الطلب:</span><span className="font-bold">{submittedTicket.fullName}</span></div>
                         <div><span className="text-gray-500 block text-[11px]">البلدية:</span><span className="font-bold">{submittedTicket.municipality}</span></div>
                         <div><span className="text-gray-500 block text-[11px]">تاريخ التسجيل:</span><span className="font-bold font-mono">{submittedTicket.createdAt}</span></div>
                         <div><span className="text-gray-500 block text-[11px]">نوع العريضة:</span><span className="font-bold text-[#D21034]">{submittedTicket.category}</span></div>
                      </div>

                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => { onTabChange('track'); performSearch(submittedTicket.id); }}
                        className="py-2.5 px-6 bg-[#006233] hover:bg-[#004d28] text-white font-tajawal font-bold text-sm rounded transition-colors flex items-center justify-center gap-2"
                      >
                        <span>متابعة حالة الملف</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="py-2.5 px-6 bg-white border border-[#E5E7EB] text-[#111827] hover:bg-gray-50 font-tajawal font-bold text-sm rounded transition-colors"
                      >
                        العودة وتسجيل ملف جديد
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Official Form */
                  <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    {formError && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 border-r-4 border-[#D21034] text-[#D21034] text-sm font-tajawal font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formError}</span>
                      </motion.div>
                    )}

                    {/* Section 1: Personal Info */}
                    <fieldset className="border border-gray-200 rounded-md p-5 bg-gray-50/50">
                      <legend className="text-sm font-bold text-[#006233] px-3 font-changa bg-white border border-gray-200 rounded-sm py-1 shadow-sm">
                        المعلومات الشخصية لمقدم الطلب
                      </legend>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                        <div className="md:col-span-2">
                          <label className={labelClass}>رقم التعريف الوطني (NIN) <span className="text-[#D21034]">*</span></label>
                          <input
                            type="text"
                            required
                            value={nin}
                            onChange={e => setNin(e.target.value.replace(/[^0-9]/g, '').slice(0, 18))}
                            placeholder="يتكون من 18 رقماً"
                            dir="ltr"
                            className={`${inputBaseClass} font-mono text-right placeholder:text-right placeholder:font-tajawal`}
                          />
                          <p className="text-[10px] text-gray-500 mt-1">تجدونه في بطاقة التعريف الوطنية البيومترية</p>
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
                              className={`${inputBaseClass} pl-4 pr-10 text-right placeholder:text-right`}
                            />
                            <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </fieldset>

                    {/* Section 2: Grievance Details */}
                    <fieldset className="border border-gray-200 rounded-md p-5 bg-gray-50/50">
                      <legend className="text-sm font-bold text-[#006233] px-3 font-changa bg-white border border-gray-200 rounded-sm py-1 shadow-sm">
                        موضوع وتفاصيل العريضة
                      </legend>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                        <div>
                          <label className={labelClass}>البلدية المعنية <span className="text-[#D21034]">*</span></label>
                          <select
                            value={municipality}
                            onChange={e => setMunicipality(e.target.value as Municipality)}
                            className={`${inputBaseClass} cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%23111827%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-no-repeat bg-[position:left_0.75rem_center] appearance-none`}
                          >
                            {MUNICIPALITIES.map(m => <option key={m} value={m}>بلدية {m}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>تصنيف العريضة <span className="text-[#D21034]">*</span></label>
                          <select
                            value={category}
                            onChange={e => setCategory(e.target.value as GrievanceCategory)}
                            className={`${inputBaseClass} cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%23111827%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-no-repeat bg-[position:left_0.75rem_center] appearance-none`}
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className={labelClass}>نص العريضة <span className="text-[#D21034]">*</span></label>
                          <textarea
                            rows={5}
                            required
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            placeholder="اكتب تفاصيل العريضة بوضوح مع ذكر الحي أو المنطقة إن لزم الأمر..."
                            className={`${inputBaseClass} resize-y`}
                          />
                        </div>
                      </div>
                    </fieldset>

                    {/* Section 3: Attachments */}
                    <fieldset className="border border-gray-200 rounded-md p-5 bg-gray-50/50">
                      <legend className="text-sm font-bold text-[#006233] px-3 font-changa bg-white border border-gray-200 rounded-sm py-1 shadow-sm">
                        المرفقات (اختياري)
                      </legend>

                      <div className="mt-3">
                        <label className={labelClass}>الصور والملفات الداعمة (PDF, JPG, PNG)</label>
                        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white hover:bg-gray-50 transition-colors">
                          <div className="space-y-1 text-center">
                            <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                            <div className="flex text-sm text-gray-600 justify-center">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#006233] hover:text-[#004d28] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#006233]">
                                <span>اختر ملفاً</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                              </label>
                              <p className="pr-1">أو اسحب وأفلت هنا</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              الحد الأقصى لحجم الملف 5MB
                            </p>
                          </div>
                        </div>
                        {files.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {files.map((file, index) => (
                              <li key={index} className="flex items-center justify-between text-sm text-gray-700 bg-white p-2 border border-gray-200 rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  <span className="truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                                </div>
                                <button type="button" onClick={() => removeFile(index)} className="text-[#D21034] hover:text-[#a00020]">
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
                        className="py-3 px-8 bg-[#006233] hover:bg-[#004d28] text-white font-tajawal font-bold text-sm rounded shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
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
                )}
              </motion.div>
            )}

            {/* Tab 2: Track Request */}
            {activeTab === 'track' && (
              <motion.div
                key="track-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <form onSubmit={handleSearchSubmit} className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-md">
                  <label className="block text-sm font-bold text-[#111827] mb-3 font-tajawal text-center">
                    الاستعلام عن مآل العرائض والشكاوى المودعة
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        value={trackQuery}
                        onChange={e => setTrackQuery(e.target.value)}
                        placeholder="رقم التتبع (مثال: WD-2026-12345)"
                        dir="ltr"
                        className={`${inputBaseClass} font-mono uppercase text-center sm:text-left`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="py-3 px-6 bg-[#111827] hover:bg-[#1f2937] text-white font-tajawal font-bold text-sm rounded transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
                    >
                      {isSearching ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>بحث</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {hasSearched && activeTrackingResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#E5E7EB] rounded-md overflow-hidden shadow-sm"
                  >
                    {/* Official Document Header */}
                    <div className="bg-[#111827] px-5 py-3 text-white flex justify-between items-center">
                      <div className="font-tajawal text-sm font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#D21034]" />
                        ملف عريضة رقم
                      </div>
                      <div className="font-mono font-bold tracking-widest">{activeTrackingResult.id}</div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm font-tajawal mb-6 pb-6 border-b border-gray-100">
                        <div>
                          <span className="text-gray-500 block text-[11px] mb-0.5">تاريخ الإيداع:</span>
                          <span className="font-bold text-[#111827]">{activeTrackingResult.submissionDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px] mb-0.5">الحالة الحالية:</span>
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded border border-green-200">
                            {activeTrackingResult.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px] mb-0.5">البلدية:</span>
                          <span className="font-bold text-[#111827]">{activeTrackingResult.municipality}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px] mb-0.5">تصنيف الملف:</span>
                          <span className="font-bold text-[#111827]">{activeTrackingResult.category}</span>
                        </div>
                      </div>

                      {/* Official Timeline */}
                      <div>
                        <span className="block text-sm font-changa font-bold text-[#111827] mb-4 bg-gray-50 p-2 border-r-4 border-[#D21034]">
                          سجل تتبع الملف (مسار المعالجة)
                        </span>
                        
                        <div className="space-y-0 relative before:absolute before:inset-y-0 before:right-[9px] before:w-[2px] before:bg-gray-200 pl-2">
                          <div className="relative pr-6 pb-5">
                            <span className="absolute right-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#006233] ring-4 ring-white" />
                            <h5 className="font-bold text-[#006233] text-sm font-tajawal">استلام وتسجيل العريضة</h5>
                            <p className="text-gray-500 text-[11px] mt-1 font-tajawal">تم استلام الطلب إلكترونياً وتوثيقه في السجل المركزي.</p>
                          </div>
                          
                          <div className="relative pr-6 pb-5">
                            <span className="absolute right-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#D21034] ring-4 ring-white animate-pulse" />
                            <h5 className="font-bold text-[#D21034] text-sm font-tajawal">قيد الدراسة والمعالجة</h5>
                            <p className="text-[#111827]/70 text-[11px] mt-1 font-tajawal">تم تحويل الملف إلى المديرية التقنية المعنية وهو قيد المعاينة والمتابعة.</p>
                          </div>
                          
                          <div className="relative pr-6">
                            <span className="absolute right-[5px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 ring-4 ring-white" />
                            <h5 className="font-bold text-gray-400 text-sm font-tajawal">الرد الإداري النهائي</h5>
                            <p className="text-gray-400 text-[11px] mt-1 font-tajawal">في انتظار صدور القرار أو التدخل الميداني.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!hasSearched && !isSearching && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-gray-400 font-tajawal text-sm flex flex-col items-center">
                    <Search className="w-8 h-8 text-gray-300 mb-3" />
                    <span>الرجاء إدخال رقم التتبع للاستعلام عن حالة ملفكم في قواعد البيانات.</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};
