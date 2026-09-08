import React from 'react';
import { motion } from 'motion/react';
import { FileBadge2, Leaf, Building, Bus, HeartPulse, MessageCircle, Sparkles, Eye, ArrowLeft } from 'lucide-react';
import { GrievanceCategory } from '../types';
import { TopicDemo, getTopicDemoByCategory } from '../demoData';

const DOMAINS: Array<{
  title: GrievanceCategory;
  description: string;
  icon: React.ReactNode;
  color: string;
  lightColor: string;
  sampleBadge: string;
}> = [
  {
    title: 'الحالة المدنية',
    description: 'شهادات الميلاد، الزواج، الوفاة، بطاقات التعريف البيومترية، جوازات السفر وتصحيح الألقاب',
    icon: <FileBadge2 className="w-8 h-8 text-white" />,
    color: 'bg-[#D21034]',
    lightColor: 'bg-red-50',
    sampleBadge: 'تصحيح خطأ مادي في عقد الميلاد'
  },
  {
    title: 'البيئة',
    description: 'الماء الشروب، الصرف الصحي، النظافة، النفايات، المساحات الخضراء وجودة الهواء',
    icon: <Leaf className="w-8 h-8 text-white" />,
    color: 'bg-[#4CAF50]',
    lightColor: 'bg-green-50',
    sampleBadge: 'تذبذب تزويد الحي بالماء الشروب'
  },
  {
    title: 'العمران',
    description: 'رخص البناء والمطابقة، الكهرباء الفلاحية، التهيئة العمرانية والسكن الريفي',
    icon: <Building className="w-8 h-8 text-white" />,
    color: 'bg-[#D4A373]',
    lightColor: 'bg-orange-50',
    sampleBadge: 'ربط المحيط الفلاحي بالكهرباء'
  },
  {
    title: 'النقل',
    description: 'النقل المدرسي، حافلات النقل الريفي، المحطات، صيانة الطرق والمسالك',
    icon: <Bus className="w-8 h-8 text-white" />,
    color: 'bg-[#1D3557]',
    lightColor: 'bg-blue-50',
    sampleBadge: 'توفير حافلة نقل مدرسي للقرى'
  },
  {
    title: 'الصحة',
    description: 'العيادات متعددة الخدمات، المناوبة الليلية، مصل العقارب، الخدمات الوقائية والإسعاف',
    icon: <HeartPulse className="w-8 h-8 text-white" />,
    color: 'bg-[#E63946]',
    lightColor: 'bg-red-50',
    sampleBadge: 'مناوبة ليلية وأمصال التسمم العقربي'
  },
  {
    title: 'أخرى',
    description: 'الإنارة العمومية، شبكات الاتصال، والمرافق العمومية المرتبطة بخدمات الولاية',
    icon: <MessageCircle className="w-8 h-8 text-white" />,
    color: 'bg-[#6D597A]',
    lightColor: 'bg-purple-50',
    sampleBadge: 'صيانة شبكة الإنارة والأسلاك المكشوفة'
  },
];

export interface DomainsProps {
  onDomainClick: (title: string) => void;
  onOpenTopicDemoModal?: (category: GrievanceCategory) => void;
  onApplyTopicDemo?: (demo: TopicDemo) => void;
}

export const Domains: React.FC<DomainsProps> = ({ 
  onDomainClick,
  onOpenTopicDemoModal,
  onApplyTopicDemo
}) => {
  return (
    <section id="domains-section" className="py-14 sm:py-20 bg-gray-50 max-w-7xl mx-auto px-4">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 sm:mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-tajawal font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>مجالات التدخل والاختصاص المعتمدة لولاية الوادي</span>
        </div>

        <h3 className="font-changa font-bold text-2xl sm:text-4xl text-gray-900 mb-3">
          مجالات ومواضيع انشغالاتي
        </h3>
        
        <p className="font-tajawal text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          اختر المجال المناسب لانشغالكم، أو قم بالاطلاع على <strong className="text-emerald-800">الرؤية التجريبية للمواضيع</strong> للتعرف على الوثائق المطلوبة والآجال ونماذج المعالجة الواقعية.
        </p>

        {/* Global Demo Preview CTA Button */}
        {onOpenTopicDemoModal && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => onOpenTopicDemoModal('الحالة المدنية')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-emerald-50 text-[#006233] border-2 border-[#006233] rounded-xl text-xs sm:text-sm font-bold font-tajawal shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#006233]" />
              <span>استعراض الرؤية التجريبية للمواضيع (نماذج جاهزة مع الآجال والوثائق)</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </button>
          </div>
        )}

        <div className="w-16 h-1 bg-[#006233] mx-auto mt-6 rounded-full"></div>
      </motion.div>

      {/* Domains Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {DOMAINS.map((domain, idx) => {
          const topicDemo = getTopicDemoByCategory(domain.title);
          return (
            <motion.div
              key={domain.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-gray-200 flex flex-col justify-between text-right"
            >
              {/* Background decorative circle */}
              <div className={`absolute -right-16 -top-16 w-40 h-40 rounded-full opacity-40 ${domain.lightColor} group-hover:scale-110 transition-transform duration-500 pointer-events-none`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${domain.color}`}>
                    {domain.icon}
                  </div>

                  <span className="text-[11px] font-tajawal font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                    قطاع رسمي
                  </span>
                </div>

                <h4 className="font-changa font-bold text-lg sm:text-xl text-gray-900 mb-2">
                  {domain.title}
                </h4>

                <p className="font-tajawal text-xs sm:text-sm text-gray-600 leading-relaxed min-h-[44px] mb-4">
                  {domain.description}
                </p>

                {/* Sample Case Pill */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-5 text-[11px] font-tajawal text-gray-700">
                  <span className="text-gray-400 block text-[10px] mb-0.5">نموذج تجريبي معتمد:</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006233]" />
                    {domain.sampleBadge}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Preview Demo or Apply */}
              <div className="relative z-10 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => onOpenTopicDemoModal && onOpenTopicDemoModal(domain.title)}
                  className="px-3 py-2 bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 border border-gray-200 hover:border-emerald-300 rounded-lg text-xs font-bold font-tajawal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="الاطلاع على النموذج التجريبي والوثائق المطلوبة"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>معاينة تجريبية</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onApplyTopicDemo && topicDemo) {
                      onApplyTopicDemo(topicDemo);
                    } else {
                      onDomainClick(domain.title);
                    }
                  }}
                  className="px-3 py-2 bg-[#006233] hover:bg-[#004d28] text-white rounded-lg text-xs font-bold font-tajawal flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="تعبئة الاستمارة بهذا الموضوع فوراً"
                >
                  <span>تسجيل عريضة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

