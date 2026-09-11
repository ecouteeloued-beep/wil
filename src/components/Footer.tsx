import React from 'react';
import { MapPin, PhoneCall, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  onPrivacyClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onPrivacyClick }) => {
  return (
    <footer className="bg-[#111827] text-white mt-16 pt-12 pb-6 border-t-4 border-[#D21034]">
      <div className="max-w-xl md:max-w-5xl mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10 border-b border-white/10">
              
          {/* Brand/Identity Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm overflow-hidden border border-gray-200"
                title="بوابة ولاية الوادي الرسمية"
              >
                <img 
                  src="/assets/official-ministry-logo.jpg" 
                  alt="شعار وزارة الداخلية والجماعات المحلية" 
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => { e.currentTarget.src = '/assets/cropped-549160908_1253679926802055_7139711205682662553_n-e1759419335360.jpg'; }}
                />
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
          <button 
            onClick={onPrivacyClick}
            className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-gray-400 rounded-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#006233]" />
            <span className="underline underline-offset-4 decoration-gray-600">سياسة الخصوصية وحماية المعطيات الشخصية</span>
          </button>
          <p>
            جميع الحقوق محفوظة © ولاية الوادي 2026
          </p>
        </div>
      </div>
    </footer>
  );
};
