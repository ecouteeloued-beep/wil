import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, FileText, User, Tag, 
  ShieldCheck, AlertTriangle, Printer, Copy, Check, 
  UploadCloud, Star, QrCode, Download, Send, RefreshCw,
  ExternalLink, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EnhancedGrievance } from '../types';
import { ComplaintService } from '../services/complaintService';
import { getBaseTrackingUrl } from '../config/demoConfig';

interface CitizenTrackingDossierProps {
  complaint: EnhancedGrievance;
  onRefresh: (updatedComplaint: EnhancedGrievance) => void;
  onNewSearch: () => void;
}

export const CitizenTrackingDossier: React.FC<CitizenTrackingDossierProps> = ({
  complaint,
  onRefresh,
  onNewSearch
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  
  // Document upload simulation
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadSuccess, setDocUploadSuccess] = useState(false);
  const [citizenNoteInput, setCitizenNoteInput] = useState('');

  // Rating state
  const [ratingScore, setRatingScore] = useState<number>(complaint.citizenRating?.score || 5);
  const [ratingComment, setRatingComment] = useState<string>(complaint.citizenRating?.comment || '');
  const [hasRated, setHasRated] = useState<boolean>(!!complaint.citizenRating);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // PDF download simulation
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const trackingUrl = getBaseTrackingUrl(complaint.id);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(complaint.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Simulate Document Upload
  const handleSimulateDocumentUpload = async () => {
    setIsUploadingDoc(true);
    try {
      // Simulate network latency
      await new Promise(r => setTimeout(r, 600));
      const updated = await ComplaintService.submitCitizenDocument(
        complaint.id,
        'document-example.pdf',
        citizenNoteInput || 'وثيقة إثبات الهوية والملكية'
      );
      setDocUploadSuccess(true);
      onRefresh(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Submit Rating
  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRating(true);
    try {
      const updated = await ComplaintService.submitCitizenRating(
        complaint.id,
        ratingScore,
        ratingComment
      );
      setHasRated(true);
      onRefresh(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Simulate PDF Download
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      setIsGeneratingPdf(false);
      // Trigger print or alert
      window.print();
    }, 500);
  };

  // Dynamic status styling
  const getStatusBadge = () => {
    const status = complaint.status;
    if (status === 'تمت المعالجة' || status === 'تم الرد') {
      return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-600' };
    }
    if (status === 'بانتظار معلومات' || status === 'في انتظار معلومات من المواطن') {
      return { bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-600' };
    }
    if (status === 'بانتظار المراجعة' || status === 'في انتظار المراجعة') {
      return { bg: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-600' };
    }
    if (status === 'مغلق') {
      return { bg: 'bg-gray-200 text-gray-800 border-gray-400', dot: 'bg-gray-600' };
    }
    if (status === 'عاجل') {
      return { bg: 'bg-rose-100 text-rose-900 border-rose-300', dot: 'bg-rose-600' };
    }
    return { bg: 'bg-blue-100 text-blue-900 border-blue-300', dot: 'bg-blue-600' };
  };

  const statusBadge = getStatusBadge();

  // Determine stage progression for dynamic timeline
  const getTimelineStages = () => {
    const isNew = complaint.status === 'جديد' || complaint.statusCode === 'NEW';
    const isAssigned = complaint.status === 'تم الإسناد' || complaint.statusCode === 'ASSIGNED';
    const isWaitingCitizen = complaint.status === 'بانتظار معلومات' || complaint.statusCode === 'WAITING_CITIZEN';
    const isWaitingReview = complaint.status === 'بانتظار المراجعة' || complaint.statusCode === 'WAITING_REVIEW';
    const isInProgress = complaint.status === 'قيد المعالجة' || complaint.statusCode === 'IN_PROGRESS';
    const isResolved = complaint.status === 'تمت المعالجة' || complaint.statusCode === 'RESOLVED';
    const isClosed = complaint.status === 'مغلق' || complaint.statusCode === 'CLOSED';

    return [
      {
        label: 'تم تسجيل الانشغال',
        done: true,
        current: isNew,
        date: complaint.timeline?.[0]?.date || '08 سبتمبر 2026',
        time: complaint.timeline?.[0]?.time || '09:32'
      },
      {
        label: 'تمت المراجعة الأولية',
        done: !isNew,
        current: isAssigned,
        date: !isNew ? '08 سبتمبر 2026' : undefined,
        time: !isNew ? '11:15' : undefined
      },
      {
        label: 'تم توجيه الانشغال',
        done: !isNew && !isAssigned,
        current: isWaitingCitizen,
        date: !isNew && !isAssigned ? '08 سبتمبر 2026' : undefined,
        time: !isNew && !isAssigned ? '14:20' : undefined
      },
      {
        label: isWaitingCitizen 
          ? 'في انتظار معلومات من المواطن' 
          : isWaitingReview 
          ? 'في انتظار المراجعة والاعتماد' 
          : 'قيد المعالجة والمتابعة',
        done: isResolved || isClosed,
        current: isInProgress || isWaitingCitizen || isWaitingReview,
        date: '09 سبتمبر 2026',
        time: '10:05'
      },
      {
        label: 'الرد الرسمي المعتمد',
        done: isResolved || isClosed,
        current: false,
        date: (isResolved || isClosed) ? '10 سبتمبر 2026' : undefined
      },
      {
        label: 'الإغلاق النهائي والأرشفة',
        done: isClosed,
        current: isClosed,
        date: isClosed ? '12 سبتمبر 2026' : undefined
      }
    ];
  };

  const stages = getTimelineStages();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-md"
    >
      {/* 1. Header Bar with Tracking Code and Actions */}
      <div className="bg-[#111827] px-4 sm:px-6 py-4 text-white flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-tajawal text-white/70">
            <FileText className="w-4 h-4 text-[#D21034]" />
            <span>رقم التتبع المعتمد:</span>
            <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-tajawal font-bold">
              ملف رسمي مقيّد
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono font-bold tracking-wider text-lg sm:text-xl text-amber-300 select-all">
              {complaint.id}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="نسخ رقم التتبع"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* QR Code Button */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-tajawal flex items-center gap-1.5 transition-colors cursor-pointer"
            title="عرض رمز QR المباشر"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">رمز QR</span>
          </button>

          {/* Copy Direct Link */}
          <button
            type="button"
            onClick={handleCopyUrl}
            className="px-3 py-1.5 rounded-lg bg-[#006233] hover:bg-[#005228] text-white text-xs font-tajawal font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="نسخ رابط التتبع المباشر"
          >
            {copiedUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>تم نسخ الرابط</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-200"
          >
            <h4 className="font-changa font-bold text-base text-gray-900 mb-1">
              رمز الاستجابة السريعة (QR Code)
            </h4>
            <p className="font-tajawal text-xs text-gray-500 mb-4">
              يمكنك مسح هذا الرمز للوصول المباشر إلى تتبع هذا الانشغال
            </p>

            {/* Generated QR visual */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center mx-auto mb-4">
              <svg 
                className="w-44 h-44" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simulated crisp QR pattern */}
                <rect width="100" height="100" fill="#FFFFFF"/>
                {/* Top-left position block */}
                <rect x="10" y="10" width="24" height="24" fill="#111827"/>
                <rect x="14" y="14" width="16" height="16" fill="#FFFFFF"/>
                <rect x="18" y="18" width="8" height="8" fill="#111827"/>
                {/* Top-right position block */}
                <rect x="66" y="10" width="24" height="24" fill="#111827"/>
                <rect x="70" y="14" width="16" height="16" fill="#FFFFFF"/>
                <rect x="74" y="18" width="8" height="8" fill="#111827"/>
                {/* Bottom-left position block */}
                <rect x="10" y="66" width="24" height="24" fill="#111827"/>
                <rect x="14" y="70" width="16" height="16" fill="#FFFFFF"/>
                <rect x="18" y="74" width="8" height="8" fill="#111827"/>
                {/* Custom data elements */}
                <rect x="40" y="14" width="6" height="6" fill="#006233"/>
                <rect x="50" y="14" width="6" height="6" fill="#111827"/>
                <rect x="44" y="24" width="6" height="6" fill="#D21034"/>
                <rect x="54" y="24" width="6" height="6" fill="#111827"/>
                <rect x="14" y="44" width="6" height="6" fill="#111827"/>
                <rect x="24" y="44" width="6" height="6" fill="#006233"/>
                <rect x="34" y="44" width="6" height="6" fill="#111827"/>
                <rect x="44" y="44" width="12" height="12" fill="#006233"/>
                <rect x="60" y="44" width="6" height="6" fill="#111827"/>
                <rect x="70" y="44" width="6" height="6" fill="#111827"/>
                <rect x="80" y="44" width="6" height="6" fill="#006233"/>
                <rect x="40" y="64" width="6" height="6" fill="#111827"/>
                <rect x="50" y="64" width="6" height="6" fill="#111827"/>
                <rect x="60" y="64" width="6" height="6" fill="#006233"/>
                <rect x="70" y="64" width="6" height="6" fill="#111827"/>
                <rect x="44" y="74" width="6" height="6" fill="#111827"/>
                <rect x="54" y="74" width="6" height="6" fill="#D21034"/>
                <rect x="64" y="74" width="6" height="6" fill="#111827"/>
                <rect x="74" y="74" width="6" height="6" fill="#006233"/>
                <rect x="84" y="74" width="6" height="6" fill="#111827"/>
              </svg>
              <span className="text-[10px] font-mono text-gray-500 mt-2 truncate max-w-[200px]" dir="ltr">
                {trackingUrl}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg font-tajawal transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </motion.div>
        </div>
      )}

      {/* 2. Main Content Body */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs font-tajawal">
          <div>
            <span className="text-gray-400 block text-[10px] mb-0.5">تاريخ التسجيل:</span>
            <span className="font-bold text-gray-900">
              {new Date(complaint.createdAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] mb-0.5">الحالة الحالية:</span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              {complaint.status}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] mb-0.5">الدائرة والبلدية:</span>
            <span className="font-bold text-gray-900">
              {complaint.grievanceDaira || complaint.applicantDaira} / {complaint.grievanceMunicipality || complaint.applicantMunicipality}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] mb-0.5">المجال / القطاع:</span>
            <span className="font-bold text-emerald-800">
              {complaint.category} {complaint.sector ? `(${complaint.sector})` : ''}
            </span>
          </div>
        </div>

        {/* Subject & Summary */}
        <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-2">
          <div className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2 font-changa">
            <Tag className="w-4 h-4 text-[#006233]" />
            <span>{complaint.subject}</span>
          </div>
          <p className="text-gray-700 text-xs sm:text-sm leading-relaxed font-tajawal whitespace-pre-line bg-gray-50/70 p-3 rounded-lg border border-gray-100">
            {complaint.details}
          </p>
        </div>

        {/* ⚠️ ACTION REQUIRED FROM CITIZEN (When status is WAITING_CITIZEN) */}
        {(complaint.status === 'بانتظار معلومات' || complaint.statusCode === 'WAITING_CITIZEN' || complaint.citizenActionRequired) && (
          <div className="border-2 border-amber-400 bg-amber-50/80 rounded-xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-white" />
              </span>
              <div>
                <h5 className="font-changa font-bold text-sm sm:text-base text-amber-950 flex items-center gap-2">
                  ⚠️ مطلوب إجراء منك
                  <span className="text-[10px] font-tajawal bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    إجراء مطلوب
                  </span>
                </h5>
                <p className="font-tajawal text-xs sm:text-sm text-amber-900 mt-1 leading-relaxed">
                  لاستكمال دراسة انشغالك، يرجى تقديم:
                </p>
                <div className="font-tajawal font-bold text-xs sm:text-sm text-amber-950 bg-white/80 p-2.5 rounded-lg border border-amber-200 mt-1.5">
                  {complaint.citizenActionRequired?.reason || 'نسخة من الوثيقة المطلوبة (المخطط المسحي أو وصل الإيداع البلدي)'}
                </div>
              </div>
            </div>

            {/* Document upload controls */}
            {complaint.citizenActionRequired?.submittedDocument || docUploadSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-xs font-tajawal flex items-center justify-between gap-2 text-emerald-900 font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم إرفاق الوثيقة التكميلية بنجاح وإحالتها للمراجعة الإدارية</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  قيد المراجعة
                </span>
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  disabled={isUploadingDoc}
                  onClick={handleSimulateDocumentUpload}
                  className="px-4 py-2 bg-[#006233] hover:bg-[#004d28] text-white text-xs font-bold font-tajawal rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-70"
                >
                  {isUploadingDoc ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري إرسال الوثيقة التكميلية...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>إرفاق الوثيقة التكميلية المطلوبة</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] font-tajawal text-amber-800 text-center sm:text-right">
                  * سيتم إحالة الوثيقة إلى المصالح المختصة فورياً لتحديث حالة دراسة الانشغال.
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3. Official Administrative Response (When resolved / answered) */}
        {complaint.officialResponse && (
          <div className="border-2 border-[#006233] bg-emerald-50/50 rounded-xl p-5 relative overflow-hidden space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-[#006233] text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                </span>
                <div>
                  <h5 className="font-changa font-bold text-sm sm:text-base text-[#006233]">
                    الرد الرسمي المعتمد
                  </h5>
                  <span className="text-[11px] font-tajawal text-gray-500">
                    صادر عن ديوان والي ولاية الوادي — خلية الإصغاء والتكفل بانشغالات المواطنين
                  </span>
                </div>
              </div>

              {complaint.officialResponse.letterNumber && (
                <div className="text-left font-tajawal text-xs">
                  <span className="text-gray-400 block text-[10px]">رقم المراسلة الإدارية:</span>
                  <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-0.5 rounded border border-emerald-200 shadow-2xs">
                    {complaint.officialResponse.letterNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Official response text */}
            <div className="text-xs sm:text-sm font-tajawal text-gray-900 leading-relaxed bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs whitespace-pre-line">
              {complaint.officialResponse.text || 'تمت دراسة انشغالكم واتخاذ الإجراءات المناسبة من طرف المصالح المختصة.'}
            </div>

            {/* Response Footer with Stamp and PDF Button */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-tajawal">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>الموقّع: مسؤول خلية الإصغاء والتكفل (بإذن من السيد والي ولاية الوادي)</span>
              </div>

              {/* PDF Download Button */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-3.5 py-1.5 bg-[#006233] hover:bg-[#004e29] text-white rounded-lg text-xs font-bold font-tajawal flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التجهيز...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل الرد PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 4. Citizen Satisfaction Rating (Interactive) */}
        {(complaint.status === 'تمت المعالجة' || complaint.status === 'مغلق' || complaint.statusCode === 'RESOLVED' || complaint.statusCode === 'CLOSED') && (
          <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3">
            <h5 className="font-changa font-bold text-sm text-gray-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>تقييم المواطن لخدمة التكفل بالانشغال</span>
            </h5>

            {hasRated ? (
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs font-tajawal text-gray-700 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star 
                        key={n} 
                        className={`w-4 h-4 ${n <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{ratingComment || 'شكراً على المعالجة'}"</p>
                </div>
                <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                  تم تسجيل تقييمك
                </span>
              </div>
            ) : (
              <form onSubmit={handleRateSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-tajawal text-gray-600">درجة الرضا:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingScore(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        title={`${star} نجوم`}
                      >
                        <Star className={`w-5 h-5 ${star <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    placeholder="ملاحظتكم أو رأيكم حول التكفل (اختياري)..."
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-tajawal outline-none focus:border-[#006233]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingRating}
                    className="px-3 py-1.5 bg-[#111827] hover:bg-black text-white text-xs font-bold font-tajawal rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>إرسال التقييم</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 5. Dynamic Interactive Timeline */}
        <div className="space-y-4 pt-2">
          <span className="block text-sm font-changa font-bold text-gray-900 bg-gray-50 p-2.5 rounded-lg border-r-4 border-[#006233]">
            مراحل مسار التكفل والمعالجة (Timeline)
          </span>

          <div className="relative border-r-2 border-gray-200 mr-3 space-y-5 pr-5">
            {stages.map((stage, idx) => {
              return (
                <div key={idx} className="relative group">
                  {/* Timeline bullet */}
                  <span className={`absolute -right-[27px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white ${
                    stage.done 
                      ? 'bg-emerald-600 text-white' 
                      : stage.current 
                      ? 'bg-amber-500 text-white animate-pulse' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {stage.done ? (
                      <span className="text-[10px] font-bold">✓</span>
                    ) : stage.current ? (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    ) : (
                      <span className="text-[9px]">○</span>
                    )}
                  </span>

                  <div className="flex items-center justify-between gap-2">
                    <h5 className={`font-tajawal font-bold text-xs sm:text-sm ${
                      stage.done 
                        ? 'text-emerald-950' 
                        : stage.current 
                        ? 'text-amber-950' 
                        : 'text-gray-400'
                    }`}>
                      {stage.label}
                    </h5>

                    {stage.date && (
                      <span className="text-[11px] text-gray-400 font-mono">
                        {stage.date} {stage.time ? `— ${stage.time}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Footer Actions */}
        <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold font-tajawal flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة وصل المعاينة</span>
          </button>

          <button
            type="button"
            onClick={onNewSearch}
            className="px-4 py-2 bg-[#111827] hover:bg-[#1f2937] text-white rounded-lg text-xs font-bold font-tajawal transition-colors cursor-pointer"
          >
            استعلام عن انشغال آخر
          </button>
        </div>
      </div>
    </motion.div>
  );
};
