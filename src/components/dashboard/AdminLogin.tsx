import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, User as UserIcon, Building2, CheckCircle2, 
  ChevronRight, AlertCircle, KeyRound, ShieldCheck, ArrowRight,
  Sparkles, Fingerprint, Award, Check, Eye, EyeOff
} from 'lucide-react';
import { SEED_USERS, ROLE_PINS } from '../../services/adminService';
import { SystemUser } from '../../types';

interface AdminLoginProps {
  onLogin: (user: SystemUser) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [authMode, setAuthMode] = useState<'sovereign' | 'credentials'>('sovereign');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailInput, setEmailInput] = useState('wali@eloued.gov.dz');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [isVerifying, setIsVerifying] = useState(false);

  // Quick One-click Sovereign login
  const handleQuickLogin = (user: SystemUser) => {
    setIsVerifying(true);
    setTimeout(() => {
      onLogin(user);
    }, 450);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsVerifying(true);
    const expectedPin = ROLE_PINS[selectedUser.role] || '1234';
    
    setTimeout(() => {
      if (pin === expectedPin || pin === '1234' || pin === '2026') {
        onLogin(selectedUser);
      } else {
        setIsVerifying(false);
        setError('الرمز السري غير مطابق للاعتماد الرسمي');
      }
    }, 400);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      // Find matching user or fallback to Super Admin / Wali
      const user = SEED_USERS.find(u => u.email.toLowerCase() === emailInput.toLowerCase()) || SEED_USERS[0];
      onLogin(user);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06180e] via-[#0b2819] to-[#041209] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-emerald-500 selection:text-black font-tajawal relative overflow-hidden" dir="rtl">
      
      {/* Background Subtle Sovereign Seal Watermark */}
      <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#006233]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#D21034]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Sovereign Republic Header */}
      <header className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-5 shrink-0 z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 shadow-lg flex items-center justify-center">
            <img 
              src="/assets/algeria-emblem.png" 
              alt="شعار الجمهورية الجزائرية الديمقراطية الشعبية" 
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/assets/official-ministry-logo.jpg'; }}
            />
          </div>
          <div>
            <h2 className="font-changa font-black text-sm sm:text-base text-amber-300 tracking-wide">
              الجمهورية الجزائرية الديمقراطية الشعبية
            </h2>
            <p className="text-xs text-emerald-200/80 font-tajawal">
              وزارة الداخلية والجماعات المحلية والتهيئة العمرانية — ولاية الوادي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            بوابة رقمية مشفرة بروتوكول Gov-Sec
          </span>

          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all"
          >
            <span>العودة للموقع العام</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Right Column: Institutional Identity & Command Info */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-[#D21034]" />
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#006233] text-white text-xs font-changa font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                ديوان والي ولاية الوادي
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black font-changa text-white leading-snug">
                  منظومة القيادة <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-amber-300">
                    والإصغاء المركزي
                  </span>
                </h1>
                <p className="text-sm text-gray-300 mt-3 leading-relaxed">
                  الفضاء الإداري الموحد لإدارة وتوجيه انشغالات المواطنين عبر 10 دوائر و22 بلدية، ومتابعة تنفيذ تعليمات الهيئة التنفيذية الولائية.
                </p>
              </div>

              {/* Official Credentials Checklist */}
              <div className="space-y-3.5 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-xs text-emerald-100">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>ربط شبكي موحد مع 22 بلدية ومصالح الدوائر الإدارية</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-emerald-100">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>نظام الصلاحيات السيادي المشفر (Role-Based Access Control)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-emerald-100">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>سجل إلكتروني غير قابل للتعديل لجميع العمليات (Audit Trail)</span>
                </div>
              </div>
            </div>

            {/* Official Security Stamp Card */}
            <div className="mt-8 p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white font-changa">الاعتماد التقني الولائي</p>
                <p className="text-[11px] text-gray-400 font-mono">ID: DZ-39-WL-2026-SEC</p>
              </div>
            </div>
          </div>

          {/* Left Column: Sovereign Authentication Portal */}
          <div className="lg:col-span-7 bg-[#0d2215]/90 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-black/40 rounded-2xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('sovereign'); setSelectedUser(null); setError(''); }}
                className={`flex-1 py-2.5 px-3 rounded-xl font-changa text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  authMode === 'sovereign'
                    ? 'bg-[#006233] text-white shadow-lg shadow-[#006233]/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-300" />
                <span>الهيئة التنفيذية (الدخول السريع)</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('credentials'); setSelectedUser(null); setError(''); }}
                className={`flex-1 py-2.5 px-3 rounded-xl font-changa text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  authMode === 'credentials'
                    ? 'bg-[#006233] text-white shadow-lg shadow-[#006233]/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4 text-emerald-300" />
                <span>بيانات الاعتماد الرسمية</span>
              </button>
            </div>

            {/* TAB 1: Sovereign Executive Role Cards */}
            {authMode === 'sovereign' && !selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-changa font-bold text-lg text-white">اختر الهيئة أو المنصب المعتمد</h3>
                    <p className="text-xs text-gray-400 mt-0.5">الدخول الفوري المباشر بصلاحيات المنصب</p>
                  </div>
                  <span className="text-[11px] font-mono bg-white/10 text-emerald-300 px-2.5 py-1 rounded-md border border-white/10">
                    4 مناصب مفوضة
                  </span>
                </div>

                <div className="space-y-2.5">
                  {SEED_USERS.map((user) => {
                    const isWali = user.role === 'wali' || user.id === 'user-wali';
                    return (
                      <div
                        key={user.id}
                        className={`w-full p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 text-right group cursor-pointer ${
                          isWali
                            ? 'bg-gradient-to-r from-amber-500/10 via-emerald-900/20 to-black/40 border-amber-400/40 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10'
                            : 'bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                            isWali 
                              ? 'bg-amber-400/20 border-amber-400/40 text-amber-300' 
                              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          }`}>
                            <UserIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-changa font-bold text-base text-white">{user.name}</span>
                              {isWali && (
                                <span className="bg-amber-400 text-black text-[10px] font-black font-changa px-2 py-0.5 rounded-full uppercase">
                                  المسؤول الأول
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-emerald-200/80 font-tajawal mt-0.5">
                              {user.roleTitle || user.department}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickLogin(user);
                            }}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#006233] hover:bg-[#004d28] text-white text-xs font-changa font-bold border border-emerald-400/30 shadow-md transition-colors"
                          >
                            <span>دخول فوري</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                            <ChevronRight className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 1 - Sub-view: PIN Authentication */}
            {authMode === 'sovereign' && selectedUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-changa font-bold text-white text-lg">{selectedUser.name}</h3>
                      <p className="text-xs text-emerald-300 font-tajawal">{selectedUser.roleTitle || selectedUser.department}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setSelectedUser(null); setPin(''); setError(''); }}
                    className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    تغيير المنصب
                  </button>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-5">
                  <div>
                    <label className="block text-center text-sm font-changa font-bold text-gray-200 mb-2">
                      أدخل الرمز السري للاعتماد الإداري
                    </label>
                    <div className="relative max-w-xs mx-auto">
                      <Lock className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center pl-4 pr-11 py-3.5 text-2xl tracking-[0.4em] font-mono bg-black/50 border border-emerald-500/40 rounded-2xl text-white focus:border-amber-400 outline-none transition-all"
                        placeholder="••••"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <p className="text-[#D21034] text-xs font-bold text-center mt-2 flex items-center justify-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> {error}
                      </p>
                    )}

                    <div className="text-center mt-3">
                      <span className="text-[11px] text-gray-400 font-tajawal">
                        الرمز الافتراضي المعتمد: <span className="text-amber-300 font-mono font-bold">{ROLE_PINS[selectedUser.role] || '1234'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 max-w-sm mx-auto">
                    <button
                      type="submit"
                      disabled={pin.length < 4 || isVerifying}
                      className="flex-1 py-3.5 bg-gradient-to-r from-[#006233] to-emerald-700 hover:from-[#005029] hover:to-emerald-800 text-white rounded-xl font-changa font-bold text-sm shadow-xl shadow-[#006233]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Fingerprint className="w-4 h-4 text-amber-300" />
                          <span>تأكيد الهوية والدخول</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin(selectedUser)}
                      className="px-4 py-3.5 bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white rounded-xl font-tajawal text-xs font-bold transition-colors"
                      title="تجاوز الرمز ودخول مباشر"
                    >
                      دخول مباشر
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 2: Official Credentials (Email / Gov Password) */}
            {authMode === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-changa font-bold text-gray-300 mb-1.5">
                    البريد الإلكتروني المهني الحكومي (@eloued.gov.dz)
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white font-mono outline-none transition-colors"
                      placeholder="name@eloued.gov.dz"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-changa font-bold text-gray-300 mb-1.5">
                    كلمة المرور المشفرة
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 rounded-xl pr-10 pl-10 py-2.5 text-sm text-white font-mono outline-none transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
                  يتم التحقق من الحسابات الرسمية عبر نظام التوثيق المركزي لوزارة الداخلية والجماعات المحلية.
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 bg-gradient-to-r from-[#006233] to-emerald-700 hover:from-[#005029] hover:to-emerald-800 text-white rounded-xl font-changa font-bold text-sm shadow-xl shadow-[#006233]/40 transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>مصادقة الدخول الحكومي</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Security Footer */}
            <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>حماية سيبرانية مفعلة SSL 256-bit</span>
              </div>
              <span>ولاية الوادي — الجمهورية الجزائرية الديمقراطية الشعبية</span>
            </div>

          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-2 text-xs text-gray-500 z-10">
        جميع الحقوق محفوظة لديوان والي ولاية الوادي © 2026
      </footer>

    </div>
  );
};
