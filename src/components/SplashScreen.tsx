import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash for 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 800); // Wait for fade out animation
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#F8F9FA] flex flex-col items-center justify-center"
        >
          {/* Background subtle pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#006233 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center p-4 mb-8 overflow-hidden relative">
              <img 
                src="/assets/eloued-logo.png" 
                alt="شعار ولاية الوادي" 
                className="w-full h-full object-contain relative z-10"
                onError={(e) => {
                  // Fallback if logo is missing
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-[#006233]');
                }}
              />
              {/* Spinner around the logo */}
              <div className="absolute inset-0 border-4 border-[#F4EBDA] rounded-full"></div>
              <motion.div 
                className="absolute inset-0 border-4 border-t-[#006233] border-r-transparent border-b-[#D21034] border-l-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            
            <h1 className="font-changa font-bold text-3xl md:text-5xl text-gray-900 mb-4 tracking-tight">
              ولاية الوادي
            </h1>
            <p className="font-tajawal text-lg md:text-xl text-[#006233] font-bold tracking-wide">
              بوابة سجل الشكاوى والعرائض
            </p>
            
            <div className="mt-12 flex flex-col items-center">
              <p className="text-gray-400 text-sm font-tajawal mb-4">جاري تحميل المنصة...</p>
              <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#006233]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
