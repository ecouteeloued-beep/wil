import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, Lock, ShieldCheck, User as UserIcon, Crown, Landmark, Users } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseService } from '../../services/supabaseService';
import { SecurityRateLimiter } from '../../utils/security';
import { SystemUser } from '../../types';
import { getAuthenticatedStaff } from '../../services/authService';

interface AdminLoginProps {
  onLogin: (user: SystemUser) => void;
  onCancel: () => void;
}

const ENTRY_ROLES = [
  { title: 'والي ولاية الوادي', subtitle: 'المسؤول الأول للولاية', icon: Crown, tone: 'amber' },
  { title: 'الأمين العام للولاية', subtitle: 'التنسيق والمتابعة الإدارية', icon: Landmark, tone: 'emerald' },
  { title: 'رئيس الديوان', subtitle: 'تابع لديوان الوالي', icon: Users, tone: 'blue' },
];

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!isSupabaseConfigured || !supabase) {
      setError('بوابة الإدارة غير مفعلة: يجب إعداد Supabase Auth قبل السماح بالدخول.');
      return;
    }
    if (isRecovery) {
      const recoveryEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
        setError('أدخل البريد الإلكتروني المهني المرتبط بالحساب لاسترجاع كلمة المرور.');
        return;
      }
      setIsVerifying(true);
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      setIsVerifying(false);
      if (recoveryError) {
        setError('تعذر إرسال رابط الاسترجاع. تحقق من البريد وحاول مرة أخرى.');
        return;
      }
      setRecoverySent(true);
      return;
    }

    const identifier = email.trim().toLowerCase();
    const loginEmail = await SupabaseService.resolveLoginIdentifier(identifier);
    const limit = SecurityRateLimiter.checkLimit('admin-login', identifier || 'anonymous');
    if (limit.isLocked) {
      setError(limit.message || 'تم إيقاف المحاولات مؤقتاً لأسباب أمنية.');
      return;
    }
    setIsVerifying(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail || identifier, password });
    if (authError || !data.user) {
      SecurityRateLimiter.registerFailure('admin-login', identifier || 'anonymous');
      setIsVerifying(false);
      setError('اسم المستخدم أو البريد المهني أو كلمة المرور غير صحيحة.');
      return;
    }
    const authenticatedUser = await getAuthenticatedStaff();
    if (!authenticatedUser) {
      await supabase.auth.signOut();
      SecurityRateLimiter.registerFailure('admin-login', identifier || 'anonymous');
      setIsVerifying(false);
      setError('الحساب موثق لكنه لا يملك ملف موظف نشطاً في النظام.');
      return;
    }
    SecurityRateLimiter.reset('admin-login', identifier || 'anonymous');
    onLogin(authenticatedUser);
  };

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8 font-tajawal bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,98,51,.84), rgba(6,27,17,.82) 48%, rgba(210,16,52,.35)), url("/assets/wilaya-eloued-bg.webp")' }} dir="rtl">
      <header className="max-w-6xl mx-auto flex items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 p-1.5 border border-white/20 flex items-center justify-center">
            <img src="/assets/algeria-emblem.png" alt="شعار الجمهورية الجزائرية" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-changa font-black text-sm sm:text-base text-amber-300">الجمهورية الجزائرية الديمقراطية الشعبية</h2>
            <p className="text-xs text-emerald-200/80">وزارة الداخلية والجماعات المحلية — ولاية الوادي</p>
          </div>
        </div>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white">
          العودة للموقع العام <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      <main className="max-w-5xl mx-auto py-8 sm:py-12">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-emerald-400/25 bg-[#082819]/85 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#D21034] via-amber-400 to-[#006233]" />
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-700/50 border border-emerald-400/25 px-3 py-1.5 text-xs font-bold">ديوان والي ولاية الوادي <ShieldCheck className="w-4 h-4 text-emerald-300" /></span>
            <h1 className="font-changa font-black text-3xl sm:text-5xl leading-tight mt-5">منظومة القيادة<br /><span className="text-amber-300">وإصغاء المواطن المركزي</span></h1>
            <p className="text-sm text-emerald-100/70 mt-4 leading-7">الفضاء الإداري الموحد لمتابعة انشغالات المواطنين وتنسيق عمل المصالح التنفيذية الولائية.</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-7 text-xs text-emerald-100/80">
              <span className="rounded-xl bg-black/20 border border-white/5 p-3">ربط مؤسسي موحد وآمن</span>
              <span className="rounded-xl bg-black/20 border border-white/5 p-3">صلاحيات حسب الرتبة والدور</span>
              <span className="rounded-xl bg-black/20 border border-white/5 p-3">سجل تدقيق للعمليات الحساسة</span>
            </div>
          </div>
        </motion.section>

        <section className="mt-6 rounded-3xl border border-emerald-400/25 bg-[#061b11]/85 p-5 sm:p-8">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-700/70 border border-emerald-300/20 px-4 py-3 text-sm font-bold mb-5"><ShieldCheck className="w-4 h-4 text-amber-300" /> الهيئة التنفيذية — الدخول الآمن</div>
          <div className="grid sm:grid-cols-3 gap-3 mb-7">
            {ENTRY_ROLES.map(({ title, subtitle, icon: Icon, tone }) => (
              <div key={title} className="rounded-2xl bg-white/[0.06] border border-white/10 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone === 'amber' ? 'bg-amber-500/20 text-amber-300' : tone === 'blue' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'}`}><Icon className="w-5 h-5" /></div>
                <div><p className="font-bold text-sm">{title}</p><p className="text-[11px] text-gray-400 mt-1">{subtitle}</p></div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto rounded-2xl bg-[#0b2b19] border border-white/10 p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-6"><div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center"><Lock className="w-5 h-5 text-emerald-300" /></div><div><h2 className="font-changa font-bold text-xl">{isRecovery ? 'استرجاع كلمة المرور' : 'بيانات الاعتماد الرسمية'}</h2><p className="text-xs text-gray-400 mt-1">{isRecovery ? 'سيصلك رابط آمن على البريد المهني المسجل' : 'المصادقة المركزية عبر Supabase Auth'}</p></div></div>
            {recoverySent ? <div className="rounded-xl border border-emerald-400/25 bg-emerald-900/30 p-4 text-sm leading-7 text-emerald-100">تم إرسال رابط استرجاع كلمة المرور إذا كان البريد مسجلاً. راجع البريد المهني ومجلد الرسائل غير المرغوب فيها.</div> : <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-300 mb-1.5">اسم المستخدم أو البريد المهني</label><div className="relative"><UserIcon className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" /><input type="text" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/30 border border-white/10 focus:border-emerald-500 rounded-xl pr-10 pl-4 py-3 text-sm text-white font-mono outline-none" placeholder="name@example.gov.dz" /></div></div>
              {!isRecovery && <div><label className="block text-xs font-bold text-gray-300 mb-1.5">كلمة المرور</label><div className="relative"><Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" /><input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/30 border border-white/10 focus:border-emerald-500 rounded-xl pr-10 pl-10 py-3 text-sm text-white font-mono outline-none" placeholder="••••••••" /><button type="button" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>}
              {error && <p role="alert" className="text-red-300 text-xs font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>}
              <button type="submit" disabled={isVerifying} className="w-full py-3.5 bg-gradient-to-l from-[#006233] to-emerald-700 hover:from-[#005029] hover:to-emerald-800 rounded-xl font-changa font-bold text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">{isVerifying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound className="w-4 h-4 text-amber-300" />{isRecovery ? 'إرسال رابط الاسترجاع' : 'دخول آمن إلى لوحة التحكم'}</>}</button>
              <button type="button" onClick={() => { setIsRecovery(!isRecovery); setError(''); setRecoverySent(false); }} className="w-full text-xs text-emerald-300 hover:text-amber-300 underline">{isRecovery ? 'العودة إلى تسجيل الدخول' : 'نسيت كلمة المرور؟ استرجاع آمن عبر البريد'}</button>
            </form>}
          </div>
        </section>
      </main>
      <footer className="max-w-6xl mx-auto text-center py-2 text-xs text-gray-500">حماية مؤسسية متعددة المستويات — لا توجد رموز دخول تجريبية</footer>
    </div>
  );
};
