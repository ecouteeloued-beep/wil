import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../data';
import { motion } from 'motion/react';

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works-section" className="py-12 sm:py-20 max-w-xl md:max-w-6xl mx-auto px-4">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <h3 className="font-changa font-bold text-2xl sm:text-4xl text-gray-900 mb-2">
          كيف يعمل الفضاء؟
        </h3>
        <span className="inline-block text-[10px] sm:text-xs font-bold font-tajawal text-gray-500 tracking-[0.2em] uppercase">
          مسار المعالجة في 4 خطوات
        </span>
        <div className="w-16 h-1 bg-[#006233] mx-auto mt-4 rounded-full"></div>
      </motion.div>

      {/* Horizontal Steps Timeline */}
      <div className="relative">
        {/* Connecting solid green line for desktop */}
        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[3px] bg-[#006233] z-0"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <motion.div 
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="flex flex-col items-center text-center"
            >
              {/* Circle with Number */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-[3px] border-[#006233] flex items-center justify-center mb-6 text-[#006233] font-changa font-bold text-2xl sm:text-3xl shadow-sm z-10">
                {step.step}
              </div>

              {/* Step Content */}
              <div className="px-2">
                <h4 className="font-changa font-bold text-base sm:text-lg text-gray-900 mb-2">
                  {step.title}
                </h4>
                <p className="font-tajawal text-sm text-gray-500 leading-relaxed max-w-[250px] mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
