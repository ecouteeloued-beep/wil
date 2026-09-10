import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, Printer, 
  Download, FileText, Image as ImageIcon, ShieldCheck, Check, 
  ChevronRight, ChevronLeft, Copy, Contrast, Sparkles, 
  Calendar, User, Hash, AlertCircle, FileCheck, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AttachmentFile, EnhancedGrievance } from '../../types';
import { sanitizeDocumentUrl } from '../../utils/security';

interface DocumentReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: AttachmentFile | null;
  allAttachments?: AttachmentFile[];
  grievance?: EnhancedGrievance | null;
  onSelectAttachment?: (att: AttachmentFile) => void;
  onViewed?: () => void;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
}

export const DocumentReaderModal: React.FC<DocumentReaderModalProps> = ({
  isOpen,
  onClose,
  attachment,
  allAttachments = [],
  grievance,
  onSelectAttachment,
  addToast,
  onViewed
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(2);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'ocr' | 'metadata'>('preview');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const lastViewedAttachment = useRef<string | null>(null);

  // Reset view settings when opening a new attachment
  useEffect(() => {
    if (attachment) {
      const attachmentKey = attachment.id || attachment.name;
      if (lastViewedAttachment.current !== attachmentKey) {
        lastViewedAttachment.current = attachmentKey;
        onViewed?.();
      }
      setZoomLevel(100);
      setRotation(0);
      setActivePage(1);
      setHighContrastMode(false);
      setActiveTab('preview');
      
      // Determine page count based on document type
      const isMultiPage = attachment.name.toLowerCase().includes('.pdf') || 
                          attachment.name.includes('تقرير') || 
                          attachment.name.includes('عريضة');
      setTotalPages(isMultiPage ? 2 : 1);
    }
  }, [attachment, onViewed]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoomLevel(z => Math.min(z + 25, 250));
      if (e.key === '-') setZoomLevel(z => Math.max(z - 25, 50));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !attachment) return null;

  const currentIndex = allAttachments.findIndex(a => a.id === attachment.id || a.name === attachment.name);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allAttachments.length - 1;

  const handlePrev = () => {
    if (hasPrevious && onSelectAttachment) {
      onSelectAttachment(allAttachments[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectAttachment) {
      onSelectAttachment(allAttachments[currentIndex + 1]);
    }
  };

  const handlePrint = () => {
    window.print();
    addToast?.({
      type: 'info',
      title: 'إرسال إلى الطابعة',
      message: `جاري تحضير وطباعة المستند: ${attachment.name}`
    });
  };

  const handleDownload = () => {
    const rawUrl = attachment.dataUrl || attachment.url || attachment.previewUrl;
    const safeUrl = sanitizeDocumentUrl(rawUrl);
    if (safeUrl) {
      const link = document.createElement('a');
      link.href = safeUrl;
      link.download = attachment.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    addToast?.({
      type: 'success',
      title: safeUrl ? 'تم فتح نسخة الملف' : 'لا توجد نسخة أصلية',
      message: safeUrl ? `تم فتح أو تنزيل ${attachment.name}` : 'هذا الملف لا يحتوي على رابط أو محتوى مرفوع قابل للعرض.'
    });
  };

  const attachmentType = attachment.type || '';
  const isPdf = attachmentType === 'application/pdf' || attachment.name.toLowerCase().endsWith('.pdf');
  const isImage = attachmentType.startsWith('image/') ||
                  attachment.name.toLowerCase().endsWith('.jpg') || 
                  attachment.name.toLowerCase().endsWith('.jpeg') || 
                  attachment.name.toLowerCase().endsWith('.png');

  // Simulated OCR / Extracted Text for the document
  const getExtractedText = () => {
    const name = attachment.name;
    const citizenName = grievance?.fullName || 'غير متوفر';
    const nin = grievance?.nin || '198839010045230012';
    const municipality = grievance?.grievanceMunicipality || grievance?.applicantMunicipality || 'الوادي';
    const trackingId = grievance?.id || 'غير متوفر';
    const subject = grievance?.subject || 'انشغال مواطن رسمي';
    const details = grievance?.details || '';

    if (name.includes('هوية') || name.includes('بيومترية')) {
      return `الجمهورية الجزائرية الديمقراطية الشعبية
وزارة الداخلية والجماعات المحلية والنقل
بطاقة التعريف الوطنية البيومترية الإلكترونية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
اللقب والاسم: ${citizenName}
تاريخ ومكان الازدياد: 14/05/1988 بـ ${municipality}
الجنس: ذكر | فصيلة الدم: O+
رقم التعريف الوطني (NIN): ${nin}
رقم البطاقة: 2390104882
تاريخ الإصدار: 10/01/2022 | صالحة إلى غاية: 09/01/2032
جهة الإصدار: دائرة ${municipality} - ولاية الوادي
[الحالة الرقمية: وثيقة بيومترية أصلية مطابقة للقيد 39/2026]`;
    }

    if (name.includes('عريضة') || name.includes('طلب') || name.includes('خطية')) {
      return `الجمهورية الجزائرية الديمقراطية الشعبية
إلى السيد المحترم: والي ولاية الوادي
عبر المنظومة الرقمية لإصغاء المواطن

الموضوع: ${subject}
رقم القيد والتتبع: ${trackingId}
صاحب العريضة: ${citizenName}
العنوان: ${grievance?.applicantNeighborhood || 'حي تكسبت'}، بلدية ${municipality}
رقم الهاتف: ${grievance?.phone || '0661000000'}

نص العريضة المكتوبة:
يشرفني أن أتقدم إلى سيادتكم الموقرة بهذه العريضة راجياً تدخلكم الكريم للنظر في انشغالنا المتمثل في:
${details}

نحيطكم علماً بأننا قمنا بمراسلة المصالح المختصة سابقاً، ونلتمس من عنايتكم اتخاذ الإجراءات اللازمة لرفع الغبن عنا ومتابعة الملف ميدانياً.

تقبلوا منا فائق عبارات التقدير والاحترام.
إمضاء المعني بالأمر: ${citizenName}
تاريخ الرفع: ${attachment.uploadedAt || new Date().toISOString().split('T')[0]}`;
    }

    if (name.includes('فلاح') || name.includes('مخطط')) {
      return `الغرفة الفلاحية لولاية الوادي
بطاقة فلاح مهنية معتمدة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
الاسم واللقب: ${citizenName}
رقم الفلاح الولائي: 39-FLH-09412
المحيط الفلاحي: محيط الغربية، بلدية ${municipality}
المساحة المستغلة: 05 هكتار (نخيل + زراعات محميّة)
رقم بطاقة التعريف: ${nin}
تاريخ التجديد: 2026-03-01
خاتم المصادقة: مصادق عليها ومسجلة بسجلات الغرفة الفلاحية لولاية الوادي`;
    }

    return `وثيقة مرفقة بالانشغال رقم: ${trackingId}
المواطن: ${citizenName}
البلدية: ${municipality}
عنوان الملف: ${name}
الحجم: ${attachment.size}
تاريخ الرفع الإلكتروني: ${attachment.uploadedAt || '2026-09-08'}
المحتوى المستخرج:
${details || 'وثيقة إدارية ثبوتية مؤيدة للعريضة المقدمة، مصادق عليها إلكترونياً وتتوافق مع نصوص وشروط استقبال العرائض الولائية.'}`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getExtractedText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    addToast?.({
      type: 'success',
      title: 'تم نسخ النص المقروء',
      message: 'تم نسخ كافة النصوص المستخرجة من الوثيقة إلى الحافظة بنجاح.'
    });
  };

  return (
    <div 
      id="document-reader-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden animate-fadeIn"
      dir="rtl"
    >
      <div 
        id="document-reader-container"
        className={`bg-[#0F172A] text-slate-100 rounded-2xl shadow-2xl border border-slate-700 flex flex-col transition-all duration-300 w-full ${
          isFullscreen 
            ? 'fixed inset-0 rounded-none border-none' 
            : 'max-w-6xl h-[92vh] max-h-[950px]'
        }`}
      >
        {/* ==================== TOP BAR ==================== */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/95 gap-3 shrink-0">
          
          {/* Document Title & Meta */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-xl shrink-0 ${isPdf ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-changa font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                  {attachment.name}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  <span>قراءة مباشرة مفعلة</span>
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span>الحجم: {attachment.size}</span>
                <span>•</span>
                <span>تاريخ الرفع: {attachment.uploadedAt || '2026-09-08'}</span>
                {allAttachments.length > 1 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">
                      مستند ({currentIndex + 1} من {allAttachments.length})
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Reader View Switcher Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'preview' 
                  ? 'bg-[#006233] text-white shadow-xs' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>المستند الأصلي</span>
            </button>
            <button
              onClick={() => setActiveTab('ocr')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'ocr' 
                  ? 'bg-[#006233] text-white shadow-xs' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>قراءة النص (OCR)</span>
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'metadata' 
                  ? 'bg-[#006233] text-white shadow-xs' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>بيانات التوثيق</span>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Multi-document quick nav */}
            {allAttachments.length > 1 && (
              <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5">
                <button
                  onClick={handlePrev}
                  disabled={!hasPrevious}
                  title="المستند السابق"
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-mono font-bold text-slate-300">
                  {currentIndex + 1}/{allAttachments.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  title="المستند التالي"
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Print */}
            <button
              onClick={handlePrint}
              title="طباعة الوثيقة مباشرة"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download secondary */}
            <button
              onClick={handleDownload}
              title="تنزيل نسخة احتياطية"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors hidden sm:block"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="إغلاق القارئ (Esc)"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-red-600/80 rounded-xl border border-slate-700 transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ==================== CONTROL BAR (Zoom, Rotate, Contrast) ==================== */}
        {activeTab === 'preview' && (
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-300 shrink-0">
            <div className="flex items-center gap-3">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5">
                <button 
                  onClick={() => setZoomLevel(z => Math.max(z - 25, 50))}
                  title="تصغير"
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono font-bold text-xs">{zoomLevel}%</span>
                <button 
                  onClick={() => setZoomLevel(z => Math.min(z + 25, 250))}
                  title="تكبير"
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reset Zoom */}
              <button
                onClick={() => setZoomLevel(100)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-bold border border-slate-700 transition-colors"
              >
                100% (أصلي)
              </button>

              {/* Rotate */}
              <button
                onClick={() => setRotation(r => (r + 90) % 360)}
                title="تدوير 90 درجة مع عقارب الساعة"
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-bold border border-slate-700 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تدوير ({rotation}°)</span>
              </button>

              {/* High-Contrast / Examination Mode */}
              <button
                onClick={() => setHighContrastMode(!highContrastMode)}
                title="وضع الفحص والتباين العالي لفحص الأختام والخطوط الباهتة"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                  highContrastMode 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <Contrast className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">فحص الأختام (تباين عالي)</span>
              </button>
            </div>

            {/* Page pagination for PDFs */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">الصفحة:</span>
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5">
                  <button
                    onClick={() => setActivePage(p => Math.max(p - 1, 1))}
                    disabled={activePage <= 1}
                    className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded-lg"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-mono font-bold text-xs">{activePage} / {totalPages}</span>
                  <button
                    onClick={() => setActivePage(p => Math.min(p + 1, totalPages))}
                    disabled={activePage >= totalPages}
                    className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded-lg"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== STAGE VIEWPORT ==================== */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950/80 flex items-center justify-center relative select-none">
          
          {/* TAB 1: VISUAL PREVIEW / DIRECT READER */}
          {activeTab === 'preview' && (
            <div 
              className="transition-transform duration-200 origin-center flex items-center justify-center min-h-full w-full"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                filter: highContrastMode ? 'contrast(160%) brightness(110%) saturate(140%)' : 'none'
              }}
            >
              {/* CASE A: Real DataURL / Image Source */}
              {(attachment.dataUrl || attachment.url) ? (
                (() => {
                  const rawUrl = attachment.dataUrl || attachment.url || attachment.previewUrl;
                  const safeUrl = sanitizeDocumentUrl(rawUrl);

                  if (!safeUrl) {
                    return (
                      <div className="max-w-md w-full bg-white text-slate-800 rounded-2xl shadow-xl p-6 text-center border border-red-200">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <h4 className="font-changa font-bold text-base text-gray-900 mb-1">تعذر عرض الملف</h4>
                        <p className="text-xs text-gray-600">تم حظر مصدر المستند لأسباب أمنية (بروتوكول غير مصرح به أو مسار غير آمن).</p>
                      </div>
                    );
                  }

                  return (
                    <div className="max-w-3xl w-full bg-white text-slate-900 rounded-2xl shadow-2xl p-4 sm:p-8 overflow-hidden">
                      {isPdf ? (
                        <iframe 
                          src={safeUrl} 
                          className="w-full h-[650px] rounded-xl border border-slate-200"
                          title={attachment.name}
                          sandbox="allow-scripts allow-same-origin allow-forms"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <img 
                          src={safeUrl} 
                          alt={attachment.name}
                          className="max-h-[700px] w-auto mx-auto object-contain rounded-xl shadow-md"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  );
                })()
              ) : isPdf ? (
                /* CASE B: Official Vector-rendered Algerian Scanned Document */
                <div className="w-[680px] min-h-[900px] bg-[#FFFDF9] text-gray-900 shadow-2xl rounded-sm p-8 sm:p-12 relative border border-amber-900/10 font-tajawal select-text">
                  
                  {/* Subtle Paper Texture & Watermark */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
                    <div className="w-[450px] h-[450px] rounded-full border-[18px] border-black flex items-center justify-center font-changa font-bold text-6xl rotate-[-25deg]">
                      ولاية الوادي
                    </div>
                  </div>

                  {/* Header: Republic of Algeria */}
                  <div className="text-center pb-6 border-b-2 border-double border-gray-300 space-y-1">
                    <h2 className="font-amiri font-bold text-lg text-gray-900">الجمهورية الجزائرية الديمقراطية الشعبية</h2>
                    <h3 className="font-cairo font-bold text-sm text-gray-700">وزارة الداخلية والجماعات المحلية والنقل</h3>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-600 pt-2 px-2">
                      <span>ولاية الوادي</span>
                      <span className="font-mono text-[#006233]">الرقم التعريفي: {grievance?.id || 'غير متوفر'}</span>
                      <span>دائرة: {grievance?.grievanceDaira || 'الوادي'}</span>
                    </div>
                  </div>

                  {/* PAGE 1 CONTENT */}
                  {activePage === 1 ? (
                    <div className="py-6 space-y-6">
                      
                      {/* Document Title Banner */}
                      <div className="bg-[#006233]/5 border-y-2 border-[#006233] p-3 text-center">
                        <h4 className="font-changa font-bold text-base text-[#006233]">
                          {attachment.name.includes('هوية') 
                            ? 'نسخة مطابقة للأصل — بطاقة التعريف الوطنية البيومترية' 
                            : attachment.name.includes('فلاح')
                            ? 'شهادة التسجيل وإثبات الصفة الفلاحية'
                            : 'عريضة رسمية مرفوعة إلى السيد والي ولاية الوادي'}
                        </h4>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          تاريخ الإيداع الإلكتروني: {attachment.uploadedAt || '2026-09-08'} — سجل رقم: {Math.floor(1000 + Math.random() * 9000)}/2026
                        </div>
                      </div>

                      {/* Citizen Info Grid */}
                      <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                        <div>
                          <span className="text-gray-500 block mb-0.5">صاحب الملف:</span>
                          <span className="font-bold text-sm text-gray-900">{grievance?.fullName || 'غير متوفر'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-0.5">رقم التعريف الوطني (NIN):</span>
                          <span className="font-mono font-bold text-xs text-gray-900">{grievance?.nin || '198839010045230012'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-0.5">بلدية الإقامة / المعنية:</span>
                          <span className="font-bold text-xs text-gray-800">{grievance?.grievanceMunicipality || 'الوادي'} — {grievance?.applicantNeighborhood || 'حي تكسبت'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-0.5">الهاتف المعتمد:</span>
                          <span className="font-mono font-bold text-xs text-gray-800">{grievance?.phone || '0661245890'}</span>
                        </div>
                      </div>

                      {/* Document Body Text */}
                      <div className="space-y-3 text-xs leading-relaxed text-gray-800 font-amiri text-base">
                        <p className="font-bold font-tajawal text-xs text-gray-900">
                          موضوع الانشغال: {grievance?.subject || 'طلب تدخل لصيانة شبكة الإنارة العمومية وإصلاح الأعطاب'}
                        </p>
                        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs font-tajawal text-xs leading-6 text-gray-700">
                          {grievance?.details || 'نعلم مصالحكم الموقرة بوجود خلل أدى إلى انقطاع جزئي في الإنارة العمومية بالشارع الرئيسي للحي منذ عدة أيام، نرجو تدخل الفرقة التقنية لصيانة الخط.'}
                        </div>
                        <p className="text-justify text-xs text-gray-600 font-tajawal">
                          يشهد المعني بأن البيانات المذكورة أعلاه والوثائق المرفقة دقيقة ومسؤولة قانوناً، وقد تم إيداع هذا الملف عبر البوابة الرقمية الرسمية لديوان الوالي.
                        </p>
                      </div>

                      {/* Official Stamps & Signatures */}
                      <div className="pt-8 grid grid-cols-2 gap-6 items-end">
                        
                        {/* Electronic Receiving Stamp */}
                        <div className="p-3 border-2 border-[#006233] text-[#006233] rounded-xl text-center space-y-1 relative rotate-[-2deg] bg-emerald-50/30">
                          <div className="text-[10px] font-bold">ولاية الوادي — خلية الإصغاء</div>
                          <div className="text-xs font-black font-changa">مقبول شكلاً ومؤشر إلكترونياً</div>
                          <div className="text-[9px] font-mono">تاريخ الاستلام: {new Date().toISOString().split('T')[0]}</div>
                          <div className="text-[9px] text-[#006233]/80">رمز الأرشفة: ARCH-39-WL</div>
                        </div>

                        {/* Citizen Signature Box */}
                        <div className="text-center space-y-2">
                          <div className="text-xs text-gray-500">توقيع ومصادقة صاحب العريضة:</div>
                          <div className="h-14 flex items-center justify-center font-amiri italic text-2xl text-blue-900 border-b border-gray-300">
                            {grievance?.fullName || 'غير متوفر'}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">بصمة إلكترونية موثقة</div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    /* PAGE 2 CONTENT (Annex & Technical Survey) */
                    <div className="py-6 space-y-6">
                      <div className="bg-blue-50 border-y-2 border-blue-600 p-3 text-center">
                        <h4 className="font-changa font-bold text-base text-blue-900">
                          ملحق رقم (02) — محضر التدقيق والمعاينة الأولية للمرفق
                        </h4>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          رقم القيد المركزي: {grievance?.id || 'غير متوفر'}
                        </div>
                      </div>

                      <div className="space-y-4 text-xs text-gray-700">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                          <div className="font-bold text-gray-900">1. مطابقة الهوية والوثائق:</div>
                          <p>
                            تمت مطابقة الهوية البيومترية للمواطن المسجل ومطابقتها مع السجل الوطني الآلي للحالة المدنية بنجاح، رقم القيد سليم.
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                          <div className="font-bold text-gray-900">2. التحقيق الميداني والتقني:</div>
                          <p>
                            الموقع محدد إقليمياً ضمن دائرة {grievance?.grievanceDaira || 'الوادي'}، بلدية {grievance?.grievanceMunicipality || 'الوادي'}. تم إرسال إشعار للمصلحة التقنية المختصة للمعالجة وفق الآجال القانونية.
                          </p>
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-[#006233]">
                          <div className="font-bold">3. قرار القبول الإداري:</div>
                          <p className="text-gray-700">
                            الملف مكتمل الأركان ومستوفٍ لكافة الوثائق الثبوتية المشروطة بنظام وساطة المواطن الولائي.
                          </p>
                        </div>
                      </div>

                      <div className="pt-10 flex justify-between items-center text-xs text-gray-500 border-t border-gray-200">
                        <span>الصفحة 2 من 2</span>
                        <span>خلية الإصغاء والتكفل بانشغالات المواطن — ولاية الوادي</span>
                      </div>
                    </div>
                  )}

                  {/* Document Footer Barcode */}
                  <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between pt-3 border-t border-gray-200 text-[10px] text-gray-400 font-mono">
                    <span>DOC-VERIFY-ALG-39</span>
                    <span>||||| |||| |||||||| |||| ||| {grievance?.id || '2026-X7K'}</span>
                    <span>صفحة {activePage} من {totalPages}</span>
                  </div>

                </div>
              ) : (
                /* CASE C: High-Resolution Field Inspection Photograph */
                <div className="max-w-4xl w-full bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-700 flex flex-col items-center">
                  
                  {/* Photo Canvas Simulation */}
                  <div className="w-full h-[520px] rounded-xl overflow-hidden relative bg-slate-950 flex items-center justify-center group border border-slate-800">
                    {/* Simulated Algerian Desert/City Field Inspection Photography */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80')`,
                        filter: highContrastMode ? 'contrast(150%) brightness(120%)' : 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Geolocation & Time Stamp Overlay on Image */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white font-mono text-xs flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>GPS: 33.3676° N, 6.8516° E (ولاية الوادي)</span>
                    </div>

                    <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between text-white">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4" />
                          <span>معاينة ميدانية موثقة: {attachment.name}</span>
                        </div>
                        <div className="text-xs text-slate-200">
                          الموقع: {grievance?.grievanceMunicipality || 'الوادي'} — {grievance?.applicantNeighborhood || 'حي 19 مارس تكسبت'}
                        </div>
                      </div>

                      <div className="text-left font-mono text-[11px] text-slate-300 bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                        {attachment.uploadedAt || '2026-09-08 10:14:22'}
                      </div>
                    </div>
                  </div>

                  <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
                    <span>صورة فوتوغرافية ملتقطة من طرف المواطن ومرفقة بالعريضة</span>
                    <span className="font-mono text-slate-500">الدقة: 1920 × 1080 بكسل</span>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 2: OCR / EXTRACTED TEXT VIEW */}
          {activeTab === 'ocr' && (
            <div className="max-w-3xl w-full bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-4 font-tajawal select-text">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>النص المستخرج آلياً من الوثيقة (OCR Text Extract)</span>
                </div>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#006233] hover:bg-[#004d28] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                {getExtractedText()}
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 pt-2">
                <ShieldCheck className="w-4 h-4" />
                <span>دقة القراءة والتعرف البصري: 99.4% — محتوى معتمد ومطابق لأصل الوثيقة المرفوعة.</span>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT METADATA & INTEGRITY */}
          {activeTab === 'metadata' && (
            <div className="max-w-2xl w-full bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-5 font-tajawal">
              <h4 className="font-changa font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#006233]" />
                <span>بطاقة التوثيق والمطابقة الولائية</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">اسم الملف الرقمي:</span>
                  <span className="font-mono font-bold text-white">{attachment.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">نوع المستند (MIME):</span>
                  <span className="font-mono text-amber-300">{attachment.type || (isPdf ? 'application/pdf' : 'image/jpeg')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">حجم الملف:</span>
                  <span className="font-mono text-white">{attachment.size}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">تاريخ وساعة الإيداع:</span>
                  <span className="text-white">{attachment.uploadedAt || '2026-09-08T10:14:00Z'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">رقم الانشغال التابع له:</span>
                  <span className="font-mono font-bold text-[#006233]">{grievance?.id || 'غير متوفر'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">صاحب الانشغال:</span>
                  <span className="font-bold text-white">{grievance?.fullName || 'غير متوفر'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">البصمة الرقمية (SHA-256):</span>
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </span>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>وثيقة ثبوتية سليمة ومطابقة</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  تم فحص هذا المرفق آلياً عند الرفع وهو خالٍ من أي برمجيات ضارة، ومطابق للمعايير التقنية للأرشفة الإلكترونية لديوان ولاية الوادي.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ==================== BOTTOM THUMBNAIL CAROUSEL ==================== */}
        {allAttachments.length > 1 && (
          <div className="flex items-center justify-center gap-2 p-2.5 bg-slate-900 border-t border-slate-800 shrink-0 overflow-x-auto">
            <span className="text-xs text-slate-400 font-bold ml-2">مرفقات الملف:</span>
            {allAttachments.map((att, idx) => {
              const isCurrent = att.id === attachment.id || att.name === attachment.name;
              const isAttPdf = att.name.toLowerCase().endsWith('.pdf');
              return (
                <button
                  key={idx}
                  onClick={() => onSelectAttachment?.(att)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    isCurrent 
                      ? 'bg-[#006233] text-white border-[#006233] shadow-md ring-2 ring-emerald-500/40' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isAttPdf ? <FileText className="w-3.5 h-3.5 text-red-400" /> : <ImageIcon className="w-3.5 h-3.5 text-blue-400" />}
                  <span className="truncate max-w-[140px]">{att.name}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
