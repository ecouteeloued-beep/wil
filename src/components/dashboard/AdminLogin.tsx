import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, Lock, ShieldCheck, User as UserIcon } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseService } from '../../services/supabaseService';
import { SecurityRateLimiter } from '../../utils/security';
import { SystemUser } from '../../types';
import { getAuthenticatedStaff } from '../../services/authService';

interface AdminLoginProps {
  onLogin: (user: SystemUser) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!isSupabaseConfigured || !supabase) {
      setError('بوابة الإدارة غير مفعلة: يجب إعداد Supabase Auth قبل السماح بالدخول.');
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
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail || identifier,
      password,
    });

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
    <div className="min-h-screen bg-gradient-to-br from-[#06180e] via-[#0b2819] to-[#041209] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-tajawal" dir="rtl">
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 p-1.5 border border-white/20 flex items-center justify-center">
            <img src="/assets/algeria-emblem.png" alt="شعار الجمهورية الجزائرية" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-changa font-black text-sm sm:text-base text-amber-300">الجمهورية الجزائرية الديمقراطية الشعبية</h2>
            <p className="text-xs text-emerald-200/80">وزارة الداخلية والجماعات المحلية — ولاية الوادي</p>
          </div>
        </div>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white">
          العودة للموقع العام <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      <main className="max-w-xl w-full mx-auto my-auto py-12">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d2215]/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <h1 className="font-changa font-bold text-2xl">الدخول الآمن للموظفين</h1>
              <p className="text-sm text-gray-400 mt-1">تتم المصادقة عبر Supabase Auth ولا توجد رموز دخول تجريبية.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">البريد الإلكتروني المهني</label>
              <div className="relative"><UserIcon className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 rounded-xl pr-10 pl-4 py-3 text-sm text-white font-mono outline-none" placeholder="اسم المستخدم أو name@example.gov.dz" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">كلمة المرور</label>
              <div className="relative"><Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 rounded-xl pr-10 pl-10 py-3 text-sm text-white font-mono outline-none" placeholder="••••••••" />
                <button type="button" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            {error && <p role="alert" className="text-red-300 text-xs font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>}
            <button type="submit" disabled={isVerifying} className="w-full py-3.5 bg-gradient-to-r from-[#006233] to-emerald-700 hover:from-[#005029] hover:to-emerald-800 rounded-xl font-changa font-bold text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {isVerifying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound className="w-4 h-4 text-amber-300" />مصادقة الدخول</>}
            </button>
          </form>
        </motion.section>
      </main>

      <footer className="max-w-6xl w-full mx-auto text-center py-2 text-xs text-gray-500">الدخول محمي بالمصادقة المركزية وتحقق الصلاحيات من قاعدة البيانات.</footer>
    </div>
  );
};
