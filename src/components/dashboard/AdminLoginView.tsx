import React, { useState } from 'react';
import { UserRole, SystemUser } from '../../types';
import { AdminService, ROLE_PINS } from '../../services/adminService';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  UserCheck, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  MapPin,
  Building2,
  Compass,
  CheckCircle2,
  Delete,
  Copy,
  Check,
  Globe
} from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: (user: SystemUser) => void;
  onExitToCitizenPortal: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onExitToCitizenPortal
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('supervisor');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const directAdminUrl = "https://wil-seven-tan.vercel.app/admin";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(directAdminUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const roleConfigs = [
    {
      role: 'supervisor' as UserRole,
      title: 'مسؤول خلية',
      officialPin: '0000',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: ShieldCheck,
      desc: 'إدارة وتوجيه الانشغالات، اعتماد الردود برقم مراسلة رسمي، متابعة الموظفين وإعدادات الخلية.',
      spec: 'إشراف تشغيلي واعتماد رسمي'
    },
    {
      role: 'employee' as UserRole,
      title: 'موظف معالج',
      officialPin: '1111',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: UserCheck,
      desc: 'دراسة ومعالجة الانشغالات المسندة، إضافة الملاحظات الميدانية، طلب وثائق تكميلية، وصياغة مسودة الرد.',
      spec: 'معالجة تنفيذية متخصصة'
    },
    {
      role: 'super_admin' as UserRole,
      title: 'Super Admin',
      officialPin: '1234',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: Compass,
      desc: 'الرقابة الشاملة على كامل الولاية، سجل العمليات العام (Audit Log)، والخريطة الجغرافية التفاعلية لبلديات ولاية الوادي الـ 22.',
      spec: 'رقابة عليا وخريطة تفاعلية (GIS)'
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setPinInput('');
  };

  const handleKeypadPress = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMsg(null);
      if (nextPin.length === 4) {
        attemptLogin(selectedRole, nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const attemptLogin = (role: UserRole, pin: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const result = AdminService.loginWithPinAndRole(role, pin);
      setIsLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.error || 'الرمز السري غير صحيح. يرجى التأكد وإعادة المحاولة.');
        setPinInput('');
      }
    }, 200);
  };

  const handleQuickDemoLogin = (role: UserRole, pin: string) => {
    setSelectedRole(role);
    setPinInput(pin);
    attemptLogin(role, pin);
  };

  return (
    <div className="min-h-screen bg-[#F4EBDA] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-['Cairo',sans-serif] text-slate-800" dir="rtl">
      
      {/* Algerian Republic Institutional Top Header */}
      <div className="max-w-4xl mx-auto w-full text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <img
            src="/emblem-algeria.svg"
            alt="شعار الجمهورية الجزائرية"
            className="w-11 h-11 object-contain filter drop-shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div className="text-right sm:text-center">
            <span className="text-xs sm:text-sm font-bold text-slate-700 block font-['Amiri']">
              الجمهورية الجزائرية الديمقراطية الشعبية
            </span>
            <span className="text-[11px] sm:text-xs text-slate-600 block">
              ولاية الوادي — ديوان الوالي — خلية الإصغاء والتكفل بانشغالات المواطنين
            </span>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-3xl mx-auto w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden my-6">
        
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-[#1C2B33] via-[#243742] to-[#1C2B33] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 p-2 flex items-center justify-center text-[#C67D2A]">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-[#C67D2A] bg-black/40 px-2.5 py-0.5 rounded-md font-bold">
                  /admin
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 px-2 py-0.5 rounded transition-all cursor-pointer"
                  title="انقر لنسخ الرابط المباشر"
                >
                  <Globe className="w-3 h-3" />
                  <span>https://wil-seven-tan.vercel.app/admin</span>
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-emerald-400" />}
                </button>
              </div>
              <h1 className="text-lg sm:text-xl font-bold font-['Changa'] text-white mt-1.5">
                تسجيل الدخول الإداري بنظام الرموز المعتمدة (PIN)
              </h1>
            </div>
          </div>

          <button
            onClick={onExitToCitizenPortal}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white transition-colors flex items-center gap-1.5 self-end sm:self-center cursor-pointer"
          >
            <span>بوابة المواطن</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180 text-[#C67D2A]" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Step 1: Select Role */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#C67D2A] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <span>اختر الصفة الإدارية (3 أدوار رسمية مخصصة):</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                لكل دور اختصاص وصلاحيات محددة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {roleConfigs.map(cfg => {
                const Icon = cfg.icon;
                const isSelected = selectedRole === cfg.role;

                return (
                  <div
                    key={cfg.role}
                    onClick={() => handleRoleSelect(cfg.role)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative text-right flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#C67D2A] bg-amber-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#C67D2A] text-white' : 'bg-slate-200 text-slate-700'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-bold border ${cfg.badgeColor}`}>
                          PIN: {cfg.officialPin}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-800">
                        {cfg.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-3">
                        {cfg.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[10.5px]">
                      <span className="text-[#C67D2A] font-bold">
                        {cfg.spec}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#006233]" />
                      ) : (
                        <span className="text-slate-400">تحديد</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Enter PIN */}
          <div className="pt-4 border-t border-slate-100 flex flex-col items-center text-center space-y-4">
            
            <div>
              <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#006233] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                <span>
                  أدخل رمز الدخول (PIN) لـ{' '}
                  <strong className="text-[#C67D2A]">
                    {roleConfigs.find(r => r.role === selectedRole)?.title}
                  </strong>
                </span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                الرمز المعتمد: <strong className="font-mono text-slate-800">{roleConfigs.find(r => r.role === selectedRole)?.officialPin}</strong>
              </p>
            </div>

            {/* PIN Indicator Dots */}
            <div className="flex items-center justify-center gap-3 my-1">
              {[0, 1, 2, 3].map((index) => {
                const hasDigit = pinInput.length > index;
                return (
                  <div
                    key={index}
                    className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all ${
                      hasDigit
                        ? 'border-[#006233] bg-[#006233] text-white shadow-xs'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    {hasDigit && (
                      <span className="w-3.5 h-3.5 rounded-full bg-white animate-in zoom-in-75 duration-150" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 max-w-md animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs w-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                <button
                  key={digit}
                  onClick={() => handleKeypadPress(digit)}
                  className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-lg font-bold font-mono text-slate-800 transition-all flex items-center justify-center shadow-xs"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setPinInput('')}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 border border-slate-200 transition-all flex items-center justify-center"
              >
                مسح الكل
              </button>
              <button
                onClick={() => handleKeypadPress('0')}
                className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-lg font-bold font-mono text-slate-800 transition-all flex items-center justify-center shadow-xs"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all flex items-center justify-center"
                title="حذف رقم"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Authorized Access Profiles */}
            <div className="w-full pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 block mb-2">
                حسابات المهام المعتمدة (اختيار سريع):
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('supervisor', '0000')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>مسؤول الخلية الولائية (0000)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('employee', '1111')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-700" />
                  <span>موظف معالج (1111)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('super_admin', '1234')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-700" />
                  <span>المشرف العام / ديوان الوالي (1234)</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer info banner */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          نظام رقابي مؤمن تابع لولاية الوادي — الولوج مخصص حصراً لمسؤولي وموظفي الخلية والمشرف العام.
        </div>
      </div>

      {/* Institutional Footer */}
      <div className="text-center text-xs text-slate-600">
        منظومة الرقمنة والإصغاء — ديوان والي ولاية الوادي © 2026
      </div>

    </div>
  );
};
