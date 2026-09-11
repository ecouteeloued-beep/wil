import React, { useMemo, useState } from 'react';
import { Check, CheckCircle2, Clipboard, Clock3, FileText, MapPin, Phone, RotateCcw, ShieldCheck, Download, Paperclip } from 'lucide-react';
import { EnhancedGrievance } from '../types';

interface CitizenTrackingDossierProps {
  complaint: EnhancedGrievance;
  onRefresh: (updatedComplaint: EnhancedGrievance) => void;
  onNewSearch: () => void;
}

const stages = ['تم تسجيل العريضة', 'تم الاطلاع على الملف', 'تم توجيه الملف للمصلحة المختصة', 'جاري دراسة الملف', 'تم الرد والحل'];

const normalizeStage = (complaint: EnhancedGrievance) => {
  const status = complaint.status || '';
  if (complaint.statusCode === 'RESOLVED' || status.includes('حل') || status.includes('معالج') || status.includes('رد')) return 4;
  if (complaint.statusCode === 'IN_PROGRESS' || status.includes('معالجة')) return 3;
  if (complaint.statusCode === 'ASSIGNED' || status.includes('توجيه') || status.includes('محول')) return 2;
  if (complaint.statusCode === 'VIEWED' || status.includes('اطلاع')) return 1;
  return 0;
};

export const CitizenTrackingDossier: React.FC<CitizenTrackingDossierProps> = ({ complaint, onNewSearch }) => {
  const [copied, setCopied] = useState(false);
  const currentStage = normalizeStage(complaint);
  const progress = Math.round(((currentStage + 1) / stages.length) * 100);
  const currentLabel = stages[currentStage];
  const createdDate = complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('ar-DZ') : 'غير متوفر';

  const statusText = useMemo(() => {
    if (currentStage === 4) return 'تم اعتماد الرد الرسمي وإغلاق الملف بالحل أو الإجراء المتخذ';
    if (currentStage === 3) return 'المصلحة المختصة تدرس العريضة حاليًا';
    if (currentStage === 2) return 'تم تحويل العريضة إلى المصلحة المختصة';
    if (currentStage === 1) return 'تم الاطلاع على العريضة وهي قيد التوجيه';
    return 'تم تسجيل العريضة بنجاح وهي بانتظار المعالجة';
  }, [currentStage]);

  const copyTracking = async () => {
    await navigator.clipboard.writeText(complaint.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden font-tajawal" dir="rtl" aria-live="polite">
      <header className="bg-[#006233] text-white p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0"><CheckCircle2 className="w-6 h-6 text-emerald-200" /></div>
          <div>
            <p className="text-xs text-emerald-100 mb-1">نتيجة التتبع</p>
            <h2 className="font-changa font-bold text-xl sm:text-2xl">معلومات عريضتك</h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-2">هذه المعلومات تظهر بعد التحقق من رقم التتبع والهاتف والرمز السري.</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-white/10 border border-white/20 p-3 flex items-center justify-between gap-3">
          <div><span className="block text-[11px] text-emerald-100">رقم التتبع</span><strong className="font-mono text-base sm:text-lg tracking-wider" dir="ltr">{complaint.id}</strong></div>
          <button type="button" onClick={() => void copyTracking()} className="inline-flex items-center gap-1.5 rounded-lg bg-white text-[#006233] px-3 py-2 text-xs font-bold shrink-0"><span>{copied ? 'تم النسخ' : 'نسخ الرقم'}</span>{copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}</button>
        </div>
      </header>

      <div className="p-5 sm:p-7 space-y-6">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3 items-start"><ShieldCheck className="w-5 h-5 text-[#006233] shrink-0 mt-0.5" /><div><strong className="block text-sm text-emerald-900">الوضعية الحالية: {currentLabel}</strong><p className="text-xs text-emerald-800 mt-1 leading-6">{statusText}</p></div></div>

        <div>
          <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-gray-700">مراحل معالجة العريضة</span><span className="text-xs font-bold text-[#006233]">{progress}%</span></div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-[#006233] rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
          <div className="mt-4 space-y-3">
            {stages.map((stage, index) => {
              const done = index <= currentStage;
              return <div key={stage} className="flex items-center gap-3"><span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${done ? 'bg-[#006233] text-white border-[#006233]' : 'bg-white text-gray-400 border-gray-300'}`}>{done ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}</span><span className={`text-sm ${done ? 'font-bold text-gray-800' : 'text-gray-400'}`}>{stage}</span></div>;
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex items-center gap-2 text-xs text-gray-500"><FileText className="w-4 h-4" />موضوع العريضة</div><p className="font-bold text-sm text-gray-800 mt-2">{complaint.subject || 'غير متوفر'}</p></div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex items-center gap-2 text-xs text-gray-500"><MapPin className="w-4 h-4" />البلدية المعنية</div><p className="font-bold text-sm text-gray-800 mt-2">{complaint.grievanceMunicipality || 'غير متوفر'}</p></div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex items-center gap-2 text-xs text-gray-500"><Clock3 className="w-4 h-4" />تاريخ الإيداع</div><p className="font-bold text-sm text-gray-800 mt-2">{createdDate}</p></div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-4 h-4" />المصلحة المعنية</div><p className="font-bold text-sm text-gray-800 mt-2">{complaint.assignedDepartment || 'سيتم تحديدها عند التوجيه'}</p></div>
        </div>

        {complaint.officialResponse?.approved && complaint.officialResponse.text && (
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#006233] text-white flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
              <div>
                <h3 className="font-changa font-bold text-base text-emerald-950">الرد الرسمي والحل</h3>
                <p className="text-xs text-emerald-800 mt-1">هذا الرد معتمد رسمياً من مصالح الولاية ومتاح لصاحب العريضة بعد التحقق.</p>
              </div>
            </div>
            <div className="rounded-xl bg-white border border-emerald-200 p-4 text-sm leading-7 text-gray-800 whitespace-pre-wrap">{complaint.officialResponse.text}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
              {complaint.officialResponse.letterNumber && <div><span className="text-emerald-700">رقم المراسلة:</span> <strong dir="ltr">{complaint.officialResponse.letterNumber}</strong></div>}
              {complaint.officialResponse.reviewedAt && <div><span className="text-emerald-700">تاريخ الاعتماد:</span> <strong>{new Date(complaint.officialResponse.reviewedAt).toLocaleDateString('ar-DZ')}</strong></div>}
            </div>
            {Array.isArray(complaint.officialResponse.attachments) && complaint.officialResponse.attachments.length > 0 && (
              <div className="pt-3 border-t border-emerald-200">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-950 mb-2"><Paperclip className="w-4 h-4" />ملفات مرفقة بالرد الرسمي</div>
                <div className="space-y-2">
                  {complaint.officialResponse.attachments.map(file => (
                    <a key={file.id} href={file.url || '#'} download={file.name} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg bg-white border border-emerald-200 px-3 py-2 text-xs text-gray-700 hover:bg-emerald-100">
                      <span className="truncate">{file.name}</span><Download className="w-4 h-4 text-[#006233] shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-6 text-blue-900"><strong>ماذا تفعل الآن؟</strong><br />احتفظ برقم التتبع والرمز السري. يمكنك العودة إلى صفحة التتبع في أي وقت لمعرفة آخر وضعية لعريضتك.</div>
        <button type="button" onClick={onNewSearch} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#006233] text-[#006233] hover:bg-emerald-50 px-5 py-3 text-sm font-bold"><RotateCcw className="w-4 h-4" />تتبع عريضة أخرى</button>
      </div>
    </section>
  );
};
