import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  ArrowLeft, 
  PhoneCall, 
  ShieldCheck, 
  Building2, 
  Clock, 
  ExternalLink,
  Sparkles,
  X,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
  Globe
} from 'lucide-react';

interface SplashScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: 'new' | 'track') => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  isOpen, 
  onClose, 
  onSelectTab 
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleEnterPlatform = () => {
    if (dontShowAgain) {
      localStorage.setItem('eloued_skip_welcome', 'true');
    }
    onClose();
  };

  const handleAction = (tab: 'new' | 'track') => {
    if (dontShowAgain) {
      localStorage.setItem('eloued_skip_welcome', 'true');
    }
    onClose();
    onSelectTab(tab);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="official-welcome-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-[#0c244c] flex flex-col justify-between min-h-screen text-white font-tajawal selection:bg-[#0b9a39] selection:text-white"
          dir="rtl"
        >
          {/* =========================================================================
              1. OFFICIAL HEADER (Exact Replica of interieur.gov.dz top banner)
             ========================================================================= */}
          <div className="w-full bg-white text-gray-900 border-b border-gray-200 shadow-sm relative z-20 py-2.5 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Right: National Emblem & Wilaya Logo */}
              <div className="flex items-center gap-3 sm:gap-4 text-right">
                <div className="flex items-center gap-2">
                  <img 
                    src="/assets/eloued-logo.png" 
                    alt="شعار ولاية الوادي" 
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <img 
                    src="/assets/seal.svg" 
                    alt="شعار الجمهورية الجزائرية" 
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain opacity-95 hidden sm:block"
                  />
                </div>
                <div className="border-r-2 border-gray-200 pr-3">
                  <p className="font-noto font-bold text-xs sm:text-sm text-gray-900 leading-tight">
                    الجمهوريــة الجزائريـــة الديمقراطيـــة الشعبيـــــة
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-sans">
                    ⵜⴰⴳⴷⵓⴷⴰ ⵜⴰⵣⵣⴰⵢⵔⵉⵜ ⵜⴰⵎⴰⴳⴷⴰⵢⵜ ⵜⴰⵖⴻⵔⴼⴰⵏⵜ
                  </p>
                  <p className="font-tajawal font-bold text-[11px] sm:text-xs text-[#907b00] mt-0.5">
                    وزارة الداخليـــة و الجماعـــات المحليـــة و التهيئة العمرانية
                  </p>
                  <p className="font-changa font-extrabold text-base sm:text-xl text-[#006233] leading-none mt-0.5">
                    ولايــــــــــــــة الــــــــــــــــوادي
                  </p>
                </div>
              </div>

              {/* Center/Left: "في تواصل دائم معكم" + Skip button */}
              <div className="flex items-center gap-4 sm:gap-6 justify-between w-full md:w-auto">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[#D21034] font-bold text-xs sm:text-sm font-noto tracking-wider leading-none">
                    في تواصــــل دائــــــــم
                  </span>
                  <span className="text-[#0b9a39] font-black text-2xl sm:text-3xl font-noto leading-none mt-0.5 tracking-tight">
                    معكـــــــــم
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-gray-400 text-xs">
                    <Facebook className="w-3 h-3 hover:text-blue-600 transition-colors" />
                    <Youtube className="w-3 h-3 hover:text-red-600 transition-colors" />
                    <Twitter className="w-3 h-3 hover:text-black transition-colors" />
                    <Instagram className="w-3 h-3 hover:text-pink-600 transition-colors" />
                    <Globe className="w-3 h-3 hover:text-emerald-700 transition-colors" />
                  </div>
                </div>

                <button
                  onClick={handleEnterPlatform}
                  className="flex items-center gap-2 bg-[#113061] hover:bg-[#0a1e3d] text-white px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm border border-[#113061] hover:scale-102"
                >
                  <span>تخطي والدخول</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* =========================================================================
              2. GRAND WELCOME BANNER (Inspired by interieur.gov.dz banner & welcome-container)
             ========================================================================= */}
          <div 
            className="flex-1 relative flex items-center justify-center py-10 px-4 sm:px-6"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(17, 48, 97, 0.92) 0%, rgba(5, 17, 36, 0.98) 100%), url('/assets/header-bg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Islamic geometric pattern texture overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', 
                backgroundSize: '36px 36px' 
              }}
            />

            {/* Central Welcome Pavilion Container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center"
            >
              {/* Prestigious Glowing Seal of Wilaya */}
              <div className="relative mb-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 backdrop-blur-md p-3 border-2 border-emerald-400/40 shadow-2xl flex items-center justify-center relative">
                  <img 
                    src="/assets/eloued-logo.png" 
                    alt="شعار ولاية الوادي" 
                    className="w-full h-full object-contain filter drop-shadow-md"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  {/* Subtle rotating glow ring */}
                  <motion.div 
                    className="absolute -inset-1 rounded-full border border-dashed border-emerald-400/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-[#0b9a39] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 whitespace-nowrap shadow-sm">
                  ولاية الوادي 39
                </div>
              </div>

              {/* Title 1: مرحبا بكم (Styled identical to interieur.gov.dz .welcome-arabe) */}
              <h1 
                className="font-noto font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight leading-none text-[#2bdc9d] drop-shadow-[0_4px_16px_rgba(43,220,157,0.45)] mb-2"
                style={{
                  fontFamily: "'Noto Kufi Arabic', 'Amiri', sans-serif",
                }}
              >
                مرحبا بكم
              </h1>

              {/* Title 2: Tamazight Welcome (Styled identical to interieur.gov.dz .welcome-tamazight) */}
              <h2 className="text-xl sm:text-3xl text-emerald-200/90 font-sans tracking-widest font-bold mb-4 drop-shadow-sm">
                ⵣⴰⵡⴰⵙ ⵙⵉⵙⵡⴻⵏ
              </h2>

              {/* Department & Platform Subtitle */}
              <p className="text-base sm:text-xl text-gray-200 max-w-2xl leading-relaxed mb-8 font-tajawal">
                في البوابة الإلكترونية لسجل الشكاوى والعرائض لولاية الوادي
                <span className="block text-xs sm:text-sm text-amber-300/90 mt-1 font-medium">
                  ديوان السيد والي الولاية • خلية الإصغاء والتكفل بانشغالات المواطنين
                </span>
              </p>

              {/* Action Buttons Group (.btn-group like interieur.gov.dz) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-2xl mb-8">
                
                {/* 1. New Grievance Button (Green .btn style) */}
                <button
                  onClick={() => handleAction('new')}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 bg-[#0b9a39] hover:bg-[#098330] active:bg-[#076826] text-white py-3.5 px-6 rounded-xl font-changa font-bold text-base sm:text-lg transition-all duration-200 shadow-lg shadow-emerald-900/40 border border-emerald-400/30 hover:scale-102 group cursor-pointer"
                >
                  <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>إيداع عريضة جديدة</span>
                </button>

                {/* 2. Track Grievance Button (Navy/Blue .btn-default style) */}
                <button
                  onClick={() => handleAction('track')}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 bg-[#1D70B7] hover:bg-[#155a96] active:bg-[#104778] text-white py-3.5 px-6 rounded-xl font-changa font-bold text-base sm:text-lg transition-all duration-200 shadow-lg shadow-sky-950/40 border border-sky-400/30 hover:scale-102 group cursor-pointer"
                >
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform text-sky-200" />
                  <span>متابعة حالة عريضة</span>
                </button>

                {/* 3. Direct Platform Entrance Button */}
                <button
                  onClick={handleEnterPlatform}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white py-3.5 px-5 rounded-xl font-tajawal font-bold text-sm sm:text-base transition-all duration-200 backdrop-blur-md border border-white/25 hover:border-white/40 cursor-pointer"
                >
                  <span>الدخول المباشر</span>
                  <ArrowLeft className="w-4 h-4 text-amber-300" />
                </button>

              </div>

              {/* Trust & Official Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl text-right">
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 backdrop-blur-sm flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-emerald-500/20 text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-300 font-medium">المعالجة</span>
                    <span className="font-bold text-xs text-white">إشراف ديوان الوالي</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 backdrop-blur-sm flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-sky-500/20 text-sky-300">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-300 font-medium">التغطية</span>
                    <span className="font-bold text-xs text-white">10 دوائر و22 بلدية</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 backdrop-blur-sm flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-amber-500/20 text-amber-300">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-300 font-medium">الرقم الأخضر</span>
                    <span className="font-bold text-xs text-white font-mono">3099 (مجاني)</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 backdrop-blur-sm flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-purple-500/20 text-purple-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-300 font-medium">التوفر</span>
                    <span className="font-bold text-xs text-white">خدمة 24/24 ساعة</span>
                  </div>
                </div>

              </div>

              {/* Do not show again checkbox option */}
              <div className="mt-6 flex items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  id="dontShowAgain"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-white/30 text-[#0b9a39] focus:ring-0 cursor-pointer accent-[#0b9a39]"
                />
                <label htmlFor="dontShowAgain" className="cursor-pointer text-gray-300 hover:text-white">
                  عدم إظهار شاشة الترحيب هذه تلقائياً في الزيارات القادمة (يمكن فتحها دائماً من الشريط العلوي)
                </label>
              </div>

            </motion.div>
          </div>

          {/* =========================================================================
              3. OFFICIAL FOOTER (Exact copy of interieur.gov.dz intro footer)
             ========================================================================= */}
          <footer className="w-full bg-[#081830] text-gray-400 py-3 px-4 text-center text-xs border-t border-white/10 font-tajawal">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>
                الجمهورية الجزائرية الديمقراطية الشعبية • ولاية الوادي © جميع الحقوق محفوظة {new Date().getFullYear()}
              </span>
              <div className="flex items-center gap-4 text-[11px]">
                <a 
                  href="https://www.interieur.gov.dz/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>بوابة وزارة الداخلية والجماعات المحلية</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </footer>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
