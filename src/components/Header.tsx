import React from 'react';
import { PhoneCall } from 'lucide-react';

interface HeaderProps {
  onNavigateToForm: (tab?: 'new' | 'track') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToForm }) => {
  return (
    <header className="w-full bg-white shadow-sm flex flex-col relative z-50">
      {/* Top National Bar - Minimal & Official */}
      <div className="bg-[#006233] text-white py-2 px-4 border-b-2 border-[#D21034]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-xs font-tajawal font-bold tracking-wide gap-2">
          <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
          <span>وزارة الداخلية والجماعات المحلية والتهيئة العمرانية</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-5 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Right Section: National Emblem & Wilaya Title */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <img 
              src="/assets/eloued-logo.png" 
              alt="شعار ولاية الوادي" 
              className="w-14 h-14 md:w-16 md:h-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="flex flex-col justify-center border-r-2 border-gray-200 pr-4">
              <h1 className="font-changa font-bold text-xl md:text-2xl text-gray-900 leading-tight">
                ولاية الوادي
              </h1>
              <h2 className="font-tajawal text-xs md:text-sm text-gray-500 font-bold mt-1 tracking-wide">
                بوابة سجل الشكاوى والعرائض
              </h2>
            </div>
          </div>

          {/* Left Section: Call Center Badge */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end justify-center text-right hidden sm:flex">
              <span className="font-tajawal text-xs text-gray-500 font-bold">مركز النداء لولاية الوادي</span>
              <span className="font-changa text-sm font-bold text-[#D21034]">الرقم الأخضر المجاني</span>
            </div>
            
            <a 
              href="tel:3099"
              className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 text-[#006233] px-4 py-2.5 rounded-lg border border-gray-200 transition-colors shadow-sm"
            >
              <div className="bg-[#006233]/10 p-1.5 rounded-md">
                <PhoneCall className="w-5 h-5 md:w-6 md:h-6 text-[#006233]" fill="currentColor" />
              </div>
              <span className="font-changa text-xl md:text-2xl font-bold tracking-widest leading-none pt-1">
                3099
              </span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
