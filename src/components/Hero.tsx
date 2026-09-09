import React, { useEffect, useState } from 'react';
import { SendHorizontal, Search } from 'lucide-react';
import { GrievanceService } from '../services/grievanceService';

interface HeroProps {
  onSelectTab: (tab: 'new' | 'track') => void;
  onVisionClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectTab, onVisionClick }) => {
  const [stats, setStats] = useState({ total: 0, resolved: 0 });

  useEffect(() => {
    setStats(GrievanceService.getStats());
  }, []);

  const handleAction = (tab: 'new' | 'track') => {
    onSelectTab(tab);
    const formSection = document.getElementById('interactive-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative bg-[#28533f] text-white pt-10 sm:pt-16 pb-16 overflow-hidden border-b-4 border-[#c67d2a]">
      {/* El Oued atmosphere: golden dunes, palm green and a calm desert horizon. */}
      <div className="absolute inset-0 opacity-95 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 8% 12%, rgba(247,205,119,.55) 0 12%, transparent 38%), radial-gradient(ellipse at 92% 18%, rgba(103,164,117,.38) 0 11%, transparent 36%), linear-gradient(165deg, #173d36 0%, #28533f 44%, #b8823e 100%)' }}></div>
      <div className="absolute -bottom-20 -left-20 w-[70%] h-56 rounded-[50%] bg-[#d7a85b]/35 blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-[75%] h-64 rounded-[50%] bg-[#e3b96d]/30 blur-2xl pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="relative max-w-4xl mx-auto px-4 text-center z-10 animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-tajawal font-bold uppercase tracking-wider shadow-sm">
            <span>وساطة المواطن — ولاية الوادي</span>
            <span className="w-2 h-2 rounded-full bg-[#D21034] animate-pulse" />
          </div>
        </div>

        <h1 className="font-changa font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.3] text-white mb-6">
          فضاء انشغالاتي
        </h1>

        <p className="font-tajawal text-sm sm:text-base md:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto mb-10 font-normal py-2 text-center">
          صوتك مسموع وانشغالك أولوية. منصة رسمية للتواصل المباشر مع ولاية الوادي، لتقديم شكواكم واقتراحاتكم في كل القطاعات. نتعهد بدراسة كل طلب والرد عليه في غضون <span className="text-[#D21034] font-bold">7 أيام عمل</span>
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col items-center justify-center backdrop-blur-sm">
            <span className="font-changa text-3xl font-bold text-[#D21034] mb-2">7</span>
            <span className="font-tajawal text-sm text-white/90">أيام أقصى للرد</span>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col items-center justify-center backdrop-blur-sm">
            <span className="font-changa text-3xl font-bold text-[#D21034] mb-2">24/7</span>
            <span className="font-tajawal text-sm text-white/90">استقبال العرائض</span>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col items-center justify-center backdrop-blur-sm">
            <span className="font-changa text-3xl font-bold text-[#D21034] mb-2">{stats.total}</span>
            <span className="font-tajawal text-sm text-white/90">إجمالي الانشغالات (مباشر)</span>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col items-center justify-center backdrop-blur-sm">
            <span className="font-changa text-3xl font-bold text-[#D21034] mb-2">{stats.resolved}</span>
            <span className="font-tajawal text-sm text-white/90">عريضة تمت معالجتها</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => handleAction('new')}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-6 py-4 bg-[#D21034] hover:bg-[#b00d2b] text-white rounded-xl text-lg font-changa font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <span>انشغالاتي</span>
            <SendHorizontal className="w-5 h-5 rtl:-scale-x-100" />
          </button>
          
          <button
            onClick={() => handleAction('track')}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-6 py-4 bg-transparent border-2 border-white/30 hover:border-white/60 hover:bg-white/10 text-white rounded-xl text-lg font-changa font-bold transition-all cursor-pointer"
          >
            <span>تتبع مسار انشغال</span>
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
