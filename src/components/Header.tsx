import React from 'react';
import { PhoneCall } from 'lucide-react';

interface HeaderProps {
  onNavigateToForm: (tab?: 'new' | 'track') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToForm }) => {
  return (
    <header className="w-full bg-white shadow-sm flex flex-col relative z-50">
      {/* Top National Bar - Minimal & Official */}
      <div className="bg-[#006233] text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-xs font-tajawal font-bold tracking-wide gap-2">
          <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
          <span>وزارة الداخلية والجماعات المحلية والتهيئة العمرانية</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div 
        className="w-full border-b-[4px] border-[#D21034] bg-white relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/header-bg.jpg')" }}
      >
        {/* Overlay to ensure text readability but keep image visible */}
        <div className="absolute inset-0 bg-white/70 sm:bg-gradient-to-l sm:from-white/95 sm:via-white/70 sm:to-white/20 backdrop-blur-[1px] z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Right Section: National Emblem & Wilaya Title */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <img 
              src="/assets/eloued-logo.png" 
              alt="شعار ولاية الوادي" 
              className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-sm"
            />
            <div className="flex flex-col justify-center border-r-2 border-gray-200 pr-4">
              <h1 className="font-changa font-bold text-2xl md:text-3xl text-gray-900 leading-tight">
                ولاية الوادي
              </h1>
              <h2 className="font-tajawal text-sm md:text-base text-[#006233] font-bold mt-1">
                بوابة سجل الشكاوى والعرائض
              </h2>
            </div>
          </div>

          {/* Left Section: Call Center Badge */}
          <div className="flex items-center gap-4 bg-gray-50 p-2 md:p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col items-end justify-center text-right hidden xs:flex">
              <span className="font-tajawal text-xs text-gray-500 font-bold">مركز النداء لولاية الوادي</span>
              <span className="font-changa text-sm font-bold text-[#D21034]">الرقم الأخضر المجاني</span>
            </div>
            <a 
              href="tel:3099"
              className="flex items-center gap-3 bg-[#006233] hover:bg-[#004d28] text-white px-4 py-2.5 rounded-lg transition-colors shadow-md border-b-4 border-[#004d28] active:border-b-0 active:translate-y-1"
            >
              <div className="bg-white/20 p-1.5 rounded-md">
                <PhoneCall className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" />
              </div>
              <span className="font-changa text-2xl md:text-3xl font-bold tracking-widest leading-none pt-1">
                3099
              </span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};

