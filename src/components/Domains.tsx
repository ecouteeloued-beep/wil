import React from 'react';
import { motion } from 'motion/react';
import { FileBadge2, Leaf, Building, Bus, HeartPulse, MessageCircle } from 'lucide-react';

const DOMAINS = [
  {
    title: 'الحالة المدنية',
    description: 'شهادات الميلاد، الزواج، الوفاة، بطاقات التعريف، جوازات السفر',
    icon: <FileBadge2 className="w-8 h-8 text-white" />,
    color: 'bg-[#D21034]',
    lightColor: 'bg-red-50',
  },
  {
    title: 'البيئة',
    description: 'النفايات، التلوث، المساحات الخضراء، جودة المياه والهواء',
    icon: <Leaf className="w-8 h-8 text-white" />,
    color: 'bg-[#4CAF50]',
    lightColor: 'bg-green-50',
  },
  {
    title: 'العمران',
    description: 'رخص البناء، الترميم، التهيئة العمرانية، الإسكان',
    icon: <Building className="w-8 h-8 text-white" />,
    color: 'bg-[#D4A373]',
    lightColor: 'bg-orange-50',
  },
  {
    title: 'النقل',
    description: 'الميترو، الترامواي، الحافلات، التيليفريك، الطرق',
    icon: <Bus className="w-8 h-8 text-white" />,
    color: 'bg-[#1D3557]',
    lightColor: 'bg-blue-50',
  },
  {
    title: 'الصحة',
    description: 'المستشفيات، الصيدليات، الإسعاف، الخدمات الصحية',
    icon: <HeartPulse className="w-8 h-8 text-white" />,
    color: 'bg-[#E63946]',
    lightColor: 'bg-red-50',
  },
  {
    title: 'أخرى',
    description: 'جميع المواضيع الأخرى المتعلقة بخدمات الولاية',
    icon: <MessageCircle className="w-8 h-8 text-white" />,
    color: 'bg-[#6D597A]',
    lightColor: 'bg-purple-50',
  },
];

export interface DomainsProps {
  onDomainClick: (title: string) => void;
}

export const Domains: React.FC<DomainsProps> = ({ onDomainClick }) => {
  return (
    <section id="domains-section" className="py-16 bg-gray-50 max-w-7xl mx-auto px-4">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h3 className="font-changa font-bold text-2xl sm:text-4xl text-gray-900 mb-2">
          مجالات انشغالاتي
        </h3>
        <span className="inline-block text-[10px] sm:text-xs font-bold font-tajawal text-gray-500 tracking-[0.2em] uppercase">
          مجالات التدخل
        </span>
        <div className="w-16 h-1 bg-[#006233] mx-auto mt-4 rounded-full"></div>
      </motion.div>

      {/* Domains Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {DOMAINS.map((domain, idx) => (
          <motion.button
            key={domain.title}
            onClick={() => onDomainClick(domain.title)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="w-full bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-gray-100 cursor-pointer text-right outline-none focus:ring-2 focus:ring-[#006233]"
          >
            {/* Background decorative circle */}
            <div className={`absolute -right-16 -top-16 w-40 h-40 rounded-full opacity-50 ${domain.lightColor} group-hover:scale-110 transition-transform duration-500`}></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm ${domain.color}`}>
                {domain.icon}
              </div>
              <h4 className="font-changa font-bold text-xl text-gray-900 mb-3">
                {domain.title}
              </h4>
              <p className="font-tajawal text-sm text-gray-500 leading-relaxed">
                {domain.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
};
