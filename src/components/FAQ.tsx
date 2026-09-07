import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FAQ: React.FC = () => {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleAccordion = (idx: number) => {
    setOpenIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section id="faq-section" className="py-12 sm:py-16 max-w-xl md:max-w-3xl mx-auto px-4">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h3 className="font-changa font-bold text-2xl sm:text-3xl text-gray-900 mt-1 relative inline-block">
          دليل الاستخدام والأسئلة الشائعة
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#006233] rounded-full"></div>
        </h3>
        <p className="font-tajawal text-sm text-gray-600 mt-6 max-w-md mx-auto leading-relaxed">
          إجابات رسمية على تساؤلاتكم لضمان استخدام أمثل لخدمات البوابة
        </p>
      </motion.div>

      {/* Accordion Container - Official look */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white border rounded-md overflow-hidden transition-all duration-200 ${
                isOpen ? 'border-[#006233] shadow-sm' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                aria-expanded={isOpen}
                className={`w-full text-right p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#006233]/30 ${
                  isOpen ? 'bg-[#006233]/5' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className={`w-5 h-5 shrink-0 ${isOpen ? 'text-[#006233]' : 'text-gray-400'}`} />
                  <span className={`font-changa font-bold text-sm sm:text-base ${isOpen ? 'text-[#006233]' : 'text-gray-900'}`}>
                    {item.question}
                  </span>
                </div>
                <div
                  className={`w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'text-[#006233] rotate-180' : 'text-gray-400'
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="px-4 sm:px-12 pb-5 pt-1 bg-white">
                      <p className="font-tajawal text-sm text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
