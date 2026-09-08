import React from 'react';
import { motion } from 'motion/react';
import { FileBadge2, Leaf, Building, Bus, HeartPulse, MessageCircle, ShieldCheck, ArrowLeft, Home as HomeIcon, Briefcase } from 'lucide-react';
import { GrievanceCategory } from '../types';

const DOMAINS: Array<{
  title: GrievanceCategory;
  description: string;
  icon: React.ReactNode;
  color: string;
  lightColor: string;
  sampleBadge: string;
}> = [
  {
    title: 'السكن',
    description: 'السكن الريفي، السكن الاجتماعي، رخص البناء، وتسوية الوضعية العمرانية',
    icon: <HomeIcon className="w-8 h-8 text-white" />,
    color: 'bg-[#006233]',
    lightColor: 'bg-green-50',
    sampleBadge: 'طلبات السكن والتسوية العمرانية'
  },
  {
    title: 'البيئة',
    description: 'الماء الشروب، الصرف الصحي، النظافة، النفايات، والمساحات الخضراء',
    icon: <Leaf className="w-8 h-8 text-white" />,
    color: 'bg-[#4CAF50]',
    lightColor: 'bg-green-50',
    sampleBadge: 'التزود بالمياه الصالحة للشرب والصرف الصحي'
  },
  {
    title: 'الطرقات',
    description: 'صيانة الطرقات، فك العزلة، الإنارة العمومية، وتهيئة المسالك الريفية',
    icon: <Bus className="w-8 h-8 text-white" />,
    color: 'bg-[#D4A373]',
    lightColor: 'bg-orange-50',
    sampleBadge: 'تهيئة وصيانة شبكة الطرقات'
  },
  {
    title: 'الصحة',
    description: 'العيادات متعددة الخدمات، المناوبة الليلية، مصل العقارب، والخدمات الوقائية',
    icon: <HeartPulse className="w-8 h-8 text-white" />,
    color: 'bg-[#D21034]',
    lightColor: 'bg-red-50',
    sampleBadge: 'المرافق الصحية الجوارية والمناوبات'
  },
  {
    title: 'الخدمات الإدارية',
    description: 'استخراج الوثائق، الحالة المدنية، وسير المرافق العمومية',
    icon: <FileBadge2 className="w-8 h-8 text-white" />,
    color: 'bg-[#113061]',
    lightColor: 'bg-blue-50',
    sampleBadge: 'تبسيط الإجراءات الإدارية'
  },
  {
    title: 'التنمية المحلية',
    description: 'المشاريع الجوارية، الشباب والرياضة، ومناطق الظل',
    icon: <Briefcase className="w-8 h-8 text-white" />,
    color: 'bg-[#1D3557]',
    lightColor: 'bg-blue-50',
    sampleBadge: 'دعم المشاريع التنموية المحلية'
  }
];

export interface DomainsProps {
  onDomainClick: (title: string) => void;
}

export const Domains: React.FC<DomainsProps> = ({ 
  onDomainClick,
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
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>مجالات التدخل والاختصاص المعتمدة لولاية الوادي</span>
        </div>

        <h3 className="font-changa font-bold text-2xl sm:text-4xl text-gray-900 mb-3">
          مجالات ومواضيع انشغالاتي
        </h3>
        
        <p className="font-tajawal text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          حدد القطاع الإداري المناسب لانشغالكم لتوجيه العريضة مباشرة إلى المصالح المختصة بديوان الوالي أو الدوائر والبلديات التابعة.
        </p>

        <div className="w-16 h-1 bg-[#006233] mx-auto mt-6 rounded-full"></div>
      </motion.div>

      {/* Domains Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {DOMAINS.map((domain, idx) => {
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
                  <span className="text-gray-400 block text-[10px] mb-0.5">أمثلة شائعة للانشغالات:</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006233]" />
                    {domain.sampleBadge}
                  </span>
                </div>
              </div>

              {/* Action Button: Register Grievance */}
              <div className="relative z-10 pt-4 border-t border-gray-100 mt-auto">
                <button
                  type="button"
                  onClick={() => onDomainClick(domain.title)}
                  className="w-full py-2.5 px-4 bg-[#006233] hover:bg-[#004d28] text-white rounded-lg text-xs sm:text-sm font-bold font-tajawal flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <span>تقديم عريضة في قطاع {domain.title}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

