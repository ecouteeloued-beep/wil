import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Building2, 
  FileText, 
  Send, 
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  FileBadge2,
  Leaf,
  Building,
  Bus,
  HeartPulse,
  MessageCircle
} from 'lucide-react';
import { TOPIC_DEMOS, TopicDemo } from '../demoData';
import { GrievanceCategory } from '../types';

interface TopicDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: GrievanceCategory;
  onSelectAndApplyDemo: (demo: TopicDemo) => void;
}

const CATEGORY_ICONS: Record<GrievanceCategory, React.ReactNode> = {
  'الحالة المدنية': <FileBadge2 className="w-5 h-5" />,
  'البيئة': <Leaf className="w-5 h-5" />,
  'العمران': <Building className="w-5 h-5" />,
  'النقل': <Bus className="w-5 h-5" />,
  'الصحة': <HeartPulse className="w-5 h-5" />,
  'أخرى': <MessageCircle className="w-5 h-5" />,
};

export const TopicDemoModal: React.FC<TopicDemoModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  onSelectAndApplyDemo
}) => {
  const [selectedCat, setSelectedCat] = useState<GrievanceCategory>(initialCategory || 'الحالة المدنية');

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCat(initialCategory);
    }
  }, [initialCategory]);

  if (!isOpen) return null;

  const currentDemo = TOPIC_DEMOS.find(d => d.category === selectedCat) || TOPIC_DEMOS[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200 overflow-hidden my-auto"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-[#006233] to-[#004d28] p-5 sm:p-6 text-white flex items-start justify-between relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-changa font-bold text-lg sm:text-xl text-white">
                    معاينة تجريبية للمواضيع والانشغالات
                  </h3>
                  <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-tajawal">
                    رؤية تجريبية تفاعلية
                  </span>
                </div>
                <p className="font-tajawal text-xs sm:text-sm text-white/80 mt-1">
                  استعرض النماذج الواقعية المعتمدة لكل مجال، واطلع على الوثائق المطلوبة والآجال القانونية
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {TOPIC_DEMOS.map(demo => {
              const isActive = demo.category === selectedCat;
              return (
                <button
                  key={demo.id}
                  onClick={() => setSelectedCat(demo.category)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold font-tajawal transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#006233] text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{CATEGORY_ICONS[demo.category]}</span>
                  <span>{demo.category}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-7 max-h-[70vh] overflow-y-auto space-y-6">
            {/* Title & Tag */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border font-tajawal ${currentDemo.badgeColor}`}>
                  {currentDemo.tag}
                </span>
                <span className="text-xs text-gray-500 font-tajawal flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  أجل المعالجة المعتاد: <strong className="text-gray-800">{currentDemo.expectedSla}</strong>
                </span>
              </div>
              <h4 className="font-changa font-bold text-base sm:text-lg text-gray-900">
                {currentDemo.title}
              </h4>
              <p className="font-tajawal text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                {currentDemo.subtitle}
              </p>
            </div>

            {/* Simulated Case Preview Card */}
            <div className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="font-changa font-bold text-sm text-[#006233] flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  بيانات نموذج العريضة التجريبية
                </span>
                <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                  ولاية الوادي / {currentDemo.grievanceMunicipality}
                </span>
              </div>

              {/* Citizen Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-tajawal">
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] mb-0.5">صاحب العريضة (تجريبي):</span>
                  <span className="font-bold text-gray-800">{currentDemo.fullName}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] mb-0.5">الدائرة والبلدية:</span>
                  <span className="font-bold text-gray-800">دائرة {currentDemo.grievanceDaira} — بلدية {currentDemo.grievanceMunicipality}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px] mb-0.5">الحي / التجمع:</span>
                  <span className="font-bold text-gray-800">{currentDemo.applicantNeighborhood}</span>
                </div>
              </div>

              {/* Subject */}
              <div className="text-xs font-tajawal bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                <span className="text-emerald-800 font-bold block mb-1">موضوع العريضة:</span>
                <p className="text-gray-900 font-medium">{currentDemo.subject}</p>
              </div>

              {/* Details text */}
              <div className="text-xs font-tajawal bg-gray-50 p-3.5 rounded-lg border border-gray-200">
                <span className="text-gray-500 font-bold block mb-1">نص العريضة النموذجي:</span>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-[13px]">
                  {currentDemo.details}
                </p>
              </div>
            </div>

            {/* Department & Documents Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <span className="font-changa font-bold text-xs text-gray-900 flex items-center gap-1.5 mb-2.5">
                  <Building2 className="w-4 h-4 text-[#006233]" />
                  جهة التوجيه والمتابعة المباشرة
                </span>
                <p className="font-tajawal text-xs text-gray-700 font-medium">
                  {currentDemo.competentDepartment}
                </p>
                <div className="mt-3 text-[11px] text-gray-500 font-tajawal flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006233]" />
                  تحت إشراف مباشر لخلية الإصغاء لديوان الوالي
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <span className="font-changa font-bold text-xs text-gray-900 flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006233]" />
                  المستندات الثبوتية المطلوبة
                </span>
                <ul className="space-y-1.5 text-xs font-tajawal text-gray-600">
                  {currentDemo.requiredDocuments.map((doc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006233] mt-1.5 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500 font-tajawal flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>سيتم ملء جميع الحقول تلقائياً للبدء في تجربة الإيداع فوراً</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-bold font-tajawal transition-colors cursor-pointer"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectAndApplyDemo(currentDemo);
                  onClose();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#006233] hover:bg-[#004d28] text-white rounded-lg text-xs font-bold font-tajawal shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>تعبئة الاستمارة بهذا النموذج التجريبي</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
