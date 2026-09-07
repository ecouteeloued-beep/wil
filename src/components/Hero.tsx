import React from 'react';
import { SendHorizontal, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onSelectTab: (tab: 'new' | 'track') => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectTab }) => {
  const handleAction = (tab: 'new' | 'track') => {
    onSelectTab(tab);
    const formSection = document.getElementById('interactive-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section className="relative bg-[#006233] text-white pt-10 sm:pt-16 pb-16 overflow-hidden border-b-4 border-[#D21034]">
      {/* Official Geometric Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-xl md:max-w-4xl mx-auto px-4 text-center z-10"
      >
        {/* Small Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-tajawal font-bold uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#D21034] animate-pulse" />
            <span>وساطة المواطن — ولاية الوادي</span>
          </div>
        </motion.div>

        {/* Large Headline */}
        <motion.h2 variants={itemVariants} className="font-changa font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.3] sm:leading-[1.25] text-white mb-6">
          فضاء انشغالاتي <br className="hidden sm:block" />
        </motion.h2>

        {/* Subtitle */}
        <motion.p variants={itemVariants} className="font-tajawal text-sm sm:text-base md:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto mb-10 font-normal py-2 text-center">
          صوتك مسموع وانشغالك أولوية. منصة رسمية للتواصل المباشر مع ولاية الوادي، لتقديم شكواكم واقتراحاتكم في كل القطاعات. نتعهد بدراسة كل طلب والرد عليه في غضون <span className="text-[#D21034] font-bold">7 أيام عمل</span>
        </motion.p>

        {/* Quick Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="font-changa text-2xl font-bold text-[#D21034] mb-1">7</div>
            <div className="text-xs text-white/90 font-tajawal">أيام أقصى للرد</div>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="font-changa text-2xl font-bold text-[#D21034] mb-1">94%</div>
            <div className="text-xs text-white/90 font-tajawal">نسبة الرضا</div>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="font-changa text-2xl font-bold text-[#D21034] mb-1">+1,299</div>
            <div className="text-xs text-white/90 font-tajawal">عريضة تمت معالجتها</div>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="font-changa text-2xl font-bold text-[#D21034] mb-1">24/7</div>
            <div className="text-xs text-white/90 font-tajawal">منصة متاحة</div>
          </div>
        </motion.div>

        {/* Action Buttons - Structured */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 max-w-[500px] mx-auto mb-4">
          <button
            id="hero-new-grievance-btn"
            type="button"
            onClick={() => handleAction('new')}
            className="flex-1 flex items-center justify-center gap-2.5 bg-[#D21034] hover:bg-[#a00020] text-white font-tajawal font-bold text-base py-3.5 px-6 rounded-md shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-white cursor-pointer border border-[#a00020]"
          >
            <SendHorizontal className="w-5 h-5 text-white" />
            <span>انشغالاتي</span>
          </button>

          <button
            id="hero-track-request-btn"
            type="button"
            onClick={() => handleAction('track')}
            className="flex-1 flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 text-white border-2 border-white/50 hover:border-white font-tajawal font-bold text-base py-3.5 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          >
            <Search className="w-5 h-5 text-white" />
            <span>تتبع مسار انشغال</span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};
