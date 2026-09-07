import React from 'react';
import { MapPin, PhoneCall, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111827] text-white mt-16 pt-12 pb-6 border-t-4 border-[#D21034]">
      <div className="max-w-xl md:max-w-5xl mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10 border-b border-white/10">
          
          {/* Brand/Identity Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="50" cy="50" r="46" stroke="#111827" strokeWidth="2" strokeDasharray="4 2" />
                  <path d="M22 76 Q50 64 78 76" stroke="#D21034" strokeWidth="3" strokeLinecap="round" />
                  <path d="M50 72 L50 38" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 38 Q32 28 20 40" stroke="#006233" strokeWidth="3" strokeLinecap="round" />
                  <path d="M50 38 Q68 28 80 40" stroke="#006233" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="24" r="6" fill="#D21034" />
                </svg>
              </div>
              <div>
                <h4 className="font-changa font-bold text-lg text-white">البوابة الرسمية للانشغالات</h4>
                <p className="text-xs text-[#E5E7EB] font-tajawal mt-0.5">خلية الإصغاء - ولاية الوادي</p>
              </div>
            </div>
            <p className="text-sm font-tajawal text-gray-400 leading-relaxed mt-2">
              منصة رقمية موثقة تابعة لديوان والي ولاية الوادي (الجمهورية الجزائرية الديمقراطية الشعبية)، تهدف لتقريب الإدارة من المواطن وتسهيل التكفل بالانشغالات.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4 text-sm font-tajawal">
            <h5 className="font-changa font-bold text-lg text-white mb-2">معلومات التواصل</h5>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#D21034] shrink-0 mt-0.5" />
              <span className="text-gray-300">مقر الولاية، حي الشهداء، بلدية الوادي، ولاية الوادي 39000</span>
            </div>
            
            <div className="flex items-start gap-3">
              <PhoneCall className="w-4 h-4 text-[#006233] shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-300 block">الرقم الأخضر المجاني: </span>
                <a href="tel:3099" className="font-bold text-white font-mono tracking-widest text-lg hover:text-[#D21034] transition-colors">3099</a>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex flex-col gap-4 text-sm font-tajawal">
            <h5 className="font-changa font-bold text-lg text-white mb-2">مواقيت العمل</h5>
            
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#E5E7EB] shrink-0 mt-0.5" />
              <div className="text-gray-300 space-y-1">
                <p>أوقات الاستقبال والمتابعة الهاتفية:</p>
                <p className="font-bold text-white">الأحد – الخميس: 08:00 صباحًا إلى 16:00 مساءً</p>
                <p className="text-[11px] text-[#D21034] mt-2 bg-[#D21034]/10 p-1.5 rounded inline-block border border-[#D21034]/20">المنصة الرقمية تعمل 24/7 لاستقبال العرائض</p>
              </div>
            </div>
          </div>
        </div>

        {/* Official Assurance & Copyright */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-tajawal text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#006233]" />
            <span>اتصال آمن ومحمي. بياناتكم تعامل بسرية تامة.</span>
          </div>
          <p>
            جميع الحقوق محفوظة © ولاية الوادي 2026
          </p>
        </div>
      </div>
    </footer>
  );
};
