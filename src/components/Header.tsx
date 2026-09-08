import React, { useState } from 'react';
import { 
  PhoneCall, 
  Home, 
  FileText, 
  Search, 
  Layers, 
  HelpCircle, 
  ExternalLink, 
  Menu, 
  X, 
  Building2, 
  Globe, 
  Sparkles,
  Facebook,
  Youtube,
  Twitter,
  Instagram
} from 'lucide-react';
import { DAIRAS, DAIRAS_MUNICIPALITIES } from '../data';

interface HeaderProps {
  onNavigateToForm: (tab?: 'new' | 'track') => void;
  onOpenWelcome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToForm, onOpenWelcome }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMunicipalitiesModal, setShowMunicipalitiesModal] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'ar' | 'tif' | 'fr'>('ar');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header id="masthead" className="w-full bg-white shadow-md flex flex-col relative z-50 border-b border-gray-200">
        {/* =========================================================================
            1. TOP META BAR (#header-meta) - Inspired by interieur.gov.dz
           ========================================================================= */}
        <div className="w-full bg-[#113061] text-white py-1.5 px-4 text-xs font-tajawal border-b border-[#0b9a39]/40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            
            {/* Right side: Official Algerian Date & Hierarchy */}
            <div className="flex items-center gap-3 text-[11px] sm:text-xs">
              <span className="text-[#e2e8f0] flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0b9a39] inline-block animate-pulse"></span>
                اليوم: الثلاثاء 25 صفر 1448 هـ / 08 سبتمبر 2026
              </span>
              <span className="hidden md:inline text-white/40">|</span>
              <span className="hidden md:inline text-gray-300">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </span>
            </div>

            {/* Left side: Quick Links & Language Switcher */}
            <div className="flex items-center gap-3 text-[11px] sm:text-xs">
              <a
                href="https://www.interieur.gov.dz/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
              >
                <span>بوابة وزارة الداخلية</span>
                <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
              </a>

              <span className="text-white/40 hidden sm:inline">|</span>

              {/* Language Switcher Badges (like interieur.gov.dz top menu) */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveLanguage('ar')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    activeLanguage === 'ar' ? 'bg-[#0b9a39] text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => setActiveLanguage('tif')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    activeLanguage === 'tif' ? 'bg-[#0b9a39] text-white' : 'text-gray-300 hover:text-white'
                  }`}
                  title="ⵜⴰⵎⴰⵣⵉⵖⵜ"
                >
                  ⵜⴰⵎⴰⵣⵉⵖⵜ
                </button>
                <button
                  onClick={() => setActiveLanguage('fr')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    activeLanguage === 'fr' ? 'bg-[#0b9a39] text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Français
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            2. MAIN BRANDING BAR (#header-text-nav-wrap) - Exact Interior Ministry Layout
           ========================================================================= */}
        <div className="w-full bg-white py-4 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Right/Center Section: Official Ministry Seal & Official Title Hierarchy */}
            <div 
              className="flex items-center gap-3 sm:gap-5 cursor-pointer text-right w-full md:w-auto justify-between md:justify-start"
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Official Ministry Logo (Exact uploaded emblem from interieur.gov.dz) */}
                <div className="relative">
                  <img 
                    src="/assets/official-ministry-logo.jpg" 
                    alt="شعار وزارة الداخلية والجماعات المحلية" 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full shadow-sm border border-gray-100 p-0.5 hover:scale-105 transition-transform bg-white"
                    onError={(e) => { 
                      e.currentTarget.src = '/assets/cropped-549160908_1253679926802055_7139711205682662553_n-e1759419335360.jpg'; 
                    }}
                  />
                </div>
              </div>

              {/* Official Text Hierarchy - Modeled on interieur.gov.dz */}
              <div className="flex flex-col justify-center pr-1 sm:pr-3 border-r-2 border-gray-100">
                {/* 1. République */}
                <h2 className="font-noto font-bold text-sm sm:text-base text-gray-900 leading-tight">
                  الجمهوريــة الجزائريـــة الديمقراطيـــة الشعبيـــــة
                </h2>
                {/* 2. Tifinagh */}
                <p className="text-[11px] sm:text-xs text-gray-600 font-sans tracking-wider leading-snug">
                  ⵜⴰⴳⴷⵓⴷⴰ ⵜⴰⵣⵣⴰⵢⵔⵉⵜ ⵜⴰⵎⴰⴳⴷⴰⵢⵜ ⵜⴰⵖⴻⵔⴼⴰَنⵜ
                </p>
                {/* 3. Ministère */}
                <p className="font-tajawal font-bold text-xs sm:text-sm text-[#907b00] leading-snug mt-0.5">
                  وزارة الداخليـــة و الجماعـــات المحليـــة و التهيئة العمرانية
                </p>
                {/* 4. Wilaya d'El Oued in bold Algerian Green */}
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h1 className="font-changa font-extrabold text-lg sm:text-2xl text-[#006233] leading-none tracking-tight">
                    ولايــــــــــــــة الــــــــــــــــوادي
                  </h1>
                  <span className="hidden lg:inline text-[11px] font-tajawal text-gray-500 font-medium">
                    (ديوان الوالي • خلية الإصغاء والتكفل بانشغالات المواطنين)
                  </span>
                </div>
              </div>

              {/* Mobile Hamburger toggle */}
              <button 
                onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
                className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                aria-label="القائمة"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Left Section: Signature "في تواصل دائم معكم" Box + Call Center Hotline */}
            <div className="hidden md:flex items-center gap-6 shrink-0">
              
              {/* The Famous Ministry Box: في تواصل دائم معكم */}
              <div className="flex flex-col items-center justify-center text-center px-3 py-1">
                <span className="text-[#D21034] font-bold text-sm lg:text-base font-noto tracking-wider leading-none">
                  في تواصــــل دائــــــــم
                </span>
                <span className="text-[#0b9a39] font-black text-3xl lg:text-4xl font-noto leading-none mt-1 tracking-tight">
                  معكـــــــــم
                </span>
                
                {/* Social media icons (identical to interieur.gov.dz) */}
                <div className="flex items-center gap-2.5 mt-2 text-gray-500">
                  <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" title="Facebook" className="hover:text-[#1877F2] transition-colors">
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" title="YouTube" className="hover:text-[#FF0000] transition-colors">
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://twitter.com/" target="_blank" rel="noreferrer" title="X / Twitter" className="hover:text-black transition-colors">
                    <Twitter className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" title="Instagram" className="hover:text-[#E4405F] transition-colors">
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://www.interieur.gov.dz/" target="_blank" rel="noreferrer" title="البوابة الرسمية" className="hover:text-[#006233] transition-colors">
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="h-14 w-px bg-gray-200"></div>

              {/* Free Toll-Free Hotline 3099 Badge */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[11px] font-tajawal font-bold text-gray-500">الرقم الأخضر لولاية الوادي</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">مجاني</span>
                </div>
                <a 
                  href="tel:3099" 
                  className="group flex items-center gap-2.5 bg-emerald-50 hover:bg-[#006233] text-[#006233] hover:text-white px-3.5 py-2 rounded-lg border border-emerald-200 hover:border-[#006233] transition-all shadow-sm"
                  title="اتصل بالرقم الأخضر المجاني 3099"
                >
                  <div className="bg-[#006233] group-hover:bg-white text-white group-hover:text-[#006233] p-1.5 rounded-md transition-colors">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span className="font-changa text-2xl font-bold tracking-wider leading-none">
                    3099
                  </span>
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* =========================================================================
            3. INSTITUTIONAL HORIZONTAL MENU BAR (#mega-menu-primary) - Interieur Navy
           ========================================================================= */}
        <nav className="w-full bg-[#113061] border-b-2 border-[#0b9a39] text-white select-none">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            
            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-reverse space-x-1 py-1 text-sm font-tajawal">
              
              {/* Home Icon button */}
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-3 py-2 text-white hover:bg-white/10 rounded flex items-center gap-1.5 font-bold transition-colors"
                title="الصفحة الرئيسية"
              >
                <Home className="w-4 h-4 text-[#fde047]" />
                <span>الرئيسية</span>
              </button>

              {/* Submit Grievance (Highlighted Button) */}
              <button 
                onClick={() => onNavigateToForm('new')}
                className="bg-[#0b9a39] hover:bg-[#098330] text-white px-3.5 py-1.5 rounded font-bold flex items-center gap-1.5 shadow-sm transition-colors mr-1"
              >
                <FileText className="w-4 h-4" />
                <span>إيداع عريضة جديدة</span>
              </button>

              {/* Track Grievance */}
              <button 
                onClick={() => onNavigateToForm('track')}
                className="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded flex items-center gap-1.5 font-medium transition-colors"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span>متابعة عريضة</span>
              </button>

              {/* Dairas & Communes Guide */}
              <button 
                onClick={() => setShowMunicipalitiesModal(true)}
                className="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded flex items-center gap-1.5 font-medium transition-colors"
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>دوائر وبلديات الولاية (22)</span>
              </button>

              {/* Service Domains */}
              <button 
                onClick={() => scrollToSection('domains-section')}
                className="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded flex items-center gap-1.5 font-medium transition-colors"
              >
                <Layers className="w-4 h-4 text-sky-300" />
                <span>مجالات الانشغال</span>
              </button>

              {/* Contact & Hotline */}
              <button 
                onClick={() => scrollToSection('contact-methods-section')}
                className="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded flex items-center gap-1.5 font-medium transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-rose-300" />
                <span>الرقم الأخضر والتواصل</span>
              </button>

              {/* FAQ */}
              <button 
                onClick={() => scrollToSection('faq-section')}
                className="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded flex items-center gap-1.5 font-medium transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-purple-300" />
                <span>الأسئلة الشائعة</span>
              </button>
            </div>

            {/* Left side: External Ministry portal link */}
            <div className="hidden lg:flex items-center gap-3 py-1">
              <a 
                href="https://www.interieur.gov.dz/" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-amber-200 hover:text-white flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors font-medium border border-white/10"
              >
                <span>الموقع الرسمي لوزارة الداخلية</span>
                <ExternalLink className="w-3 h-3 text-amber-300" />
              </a>
            </div>

            {/* Mobile Header Bar quick actions */}
            <div className="md:hidden flex items-center justify-between w-full py-2">
              <button 
                onClick={() => onNavigateToForm('new')}
                className="bg-[#0b9a39] text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>إيداع عريضة</span>
              </button>

              <button 
                onClick={() => onNavigateToForm('track')}
                className="bg-white/10 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>تتبع عريضة</span>
              </button>

              <a 
                href="tel:3099"
                className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-black/20 px-2.5 py-1 rounded"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>3099</span>
              </a>
            </div>

          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#0c244c] border-t border-white/10 px-4 py-3 space-y-2 text-sm">
              <button 
                onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full text-right py-2 px-3 hover:bg-white/10 rounded flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-[#fde047]" />
                <span>الرئيسية</span>
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigateToForm('new'); }}
                className="w-full text-right py-2 px-3 bg-[#0b9a39] text-white rounded font-bold flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>إيداع عريضة جديدة</span>
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigateToForm('track'); }}
                className="w-full text-right py-2 px-3 hover:bg-white/10 rounded flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span>متابعة حالة العريضة</span>
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); setShowMunicipalitiesModal(true); }}
                className="w-full text-right py-2 px-3 hover:bg-white/10 rounded flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>دليل الدوائر والبلديات (22)</span>
              </button>
              <button 
                onClick={() => scrollToSection('domains-section')}
                className="w-full text-right py-2 px-3 hover:bg-white/10 rounded flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-sky-300" />
                <span>مجالات الانشغال</span>
              </button>
              <button 
                onClick={() => scrollToSection('contact-methods-section')}
                className="w-full text-right py-2 px-3 hover:bg-white/10 rounded flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-rose-300" />
                <span>الرقم الأخضر ووسائل التواصل</span>
              </button>
              <button 
                onClick={() => scrollToSection('faq-section')}
                className="w-full text-right py-2 px-3 hover:bg-white/10 rounded flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-purple-300" />
                <span>الأسئلة الشائعة</span>
              </button>
              <a 
                href="https://www.interieur.gov.dz/" 
                target="_blank" 
                rel="noreferrer"
                className="w-full text-right py-2 px-3 text-gray-300 hover:text-white rounded flex items-center justify-between text-xs"
              >
                <span>بوابة وزارة الداخلية الرسمية</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </nav>
      </header>

      {/* =========================================================================
          MUNICIPALITIES DIRECTORY MODAL (10 Dairas & 22 Municipalities)
         ========================================================================= */}
      {showMunicipalitiesModal && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#113061] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#0b9a39]">
              <div className="flex items-center gap-3">
                <div className="bg-[#0b9a39] p-2 rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-changa font-bold text-lg text-white">
                    التقسيم الإداري لولاية الوادي
                  </h3>
                  <p className="text-xs text-emerald-200 font-tajawal">
                    10 دوائر إدارية و22 بلدية مشمولة بسجل الشكاوى والعرائض
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowMunicipalitiesModal(false)}
                className="text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Dairas and Communes */}
            <div className="p-5 max-h-[70vh] overflow-y-auto font-tajawal space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DAIRAS.map((daira) => (
                  <div 
                    key={daira} 
                    className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/70 hover:bg-emerald-50/40 hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#006233]"></span>
                      <h4 className="font-changa font-bold text-[#113061] text-base">
                        دائرة {daira}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {DAIRAS_MUNICIPALITIES[daira]?.map((commune) => (
                        <span 
                          key={commune} 
                          className="bg-white border border-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded shadow-xs"
                        >
                          بلدية {commune}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to action in modal */}
              <div className="bg-[#006233]/10 border border-[#006233]/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
                <p className="text-xs text-gray-700 leading-relaxed">
                  يمكن للمواطنين المقيمين بكافة بلديات الولاية تقديم عرائضهم وانشغالاتهم، ومتابعة معالجتها آلياً.
                </p>
                <button
                  onClick={() => {
                    setShowMunicipalitiesModal(false);
                    onNavigateToForm('new');
                  }}
                  className="bg-[#006233] hover:bg-[#005029] text-white px-4 py-2 rounded-lg text-xs font-bold font-tajawal shrink-0 shadow-sm"
                >
                  تقديم عريضة الآن
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-5 py-3 flex justify-end border-t border-gray-200">
              <button
                onClick={() => setShowMunicipalitiesModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
