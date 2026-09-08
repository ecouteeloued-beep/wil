import React from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Mail, PhoneCall } from 'lucide-react';

export const ContactMethods: React.FC = () => {
  const methods = [
    {
      icon: <Clock className="w-6 h-6 text-white" />,
      title: 'ساعات العمل',
      desc1: 'الأحد - الخميس',
      desc2: '08:00 - 16:30',
    },
    {
      icon: <MapPin className="w-6 h-6 text-white" />,
      title: 'الاستقبال المباشر',
      desc1: 'مقر ولاية الوادي',
      desc2: 'حي 08 ماي 1945',
    },
    {
      icon: <Mail className="w-6 h-6 text-white" />,
      title: 'البريد الإلكتروني',
      desc1: 'contact@wilaya-eloued.dz',
      desc2: 'للشكاوى والاستفسارات',
    },
    {
      icon: <PhoneCall className="w-6 h-6 text-white" />,
      title: 'الرقم الأخضر',
      desc1: '3099',
      desc2: 'مجاني - 24/7',
    },
  ];

  return (
    <section id="contact-methods-section" className="py-12 max-w-xl md:max-w-6xl mx-auto px-4">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h3 className="font-changa font-bold text-2xl sm:text-4xl text-gray-900 mb-2">
          وسائل اتصال أخرى
        </h3>
        <span className="inline-block text-[10px] sm:text-xs font-bold font-tajawal text-gray-500 tracking-[0.2em] uppercase">
          تواصل معنا
        </span>
        <div className="w-12 h-1 bg-[#006233] mx-auto mt-4 rounded-full"></div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {methods.map((method, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-full bg-[#006233] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
              {method.icon}
            </div>
            <h4 className="font-changa font-bold text-lg text-gray-900 mb-3">
              {method.title}
            </h4>
            <p className="font-tajawal text-sm text-gray-500 leading-relaxed m-0" dir="ltr">
              {method.desc1}
            </p>
            <p className="font-tajawal text-sm text-gray-500 leading-relaxed m-0" dir="ltr">
              {method.desc2}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
