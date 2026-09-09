import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, Lock, ShieldCheck, User as UserIcon } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseService } from '../../services/supabaseService';
import { SecurityRateLimiter } from '../../utils/security';
import { SystemUser, UserRole } from '../../types';

interface AdminLoginProps {
  onLogin: (user: SystemUser) => void;
  onCancel: () => void;
}

const ROLE_TITLES: Record<string, string> = {
  super_admin: 'المشرف التقني العام',
  wali: 'والي الولاية',
  chef_cabinet: 'الأمين العام للولاية',
  head_department: 'رئيس الديوان',
  supervisor: 'رئيس خلية الإصغاء والتكفل',
  employee: 'الموظف المكلف',
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  wali: ['view_all', 'assign_grievance', 'draft_reply', 'approve_reply', 'manage_users', 'view_audit_logs', 'manage_settings'],
  chef_cabinet: ['view_all', 'assign_grievance', 'draft_reply', 'approve_reply', 'view_audit_logs'],
  super_admin: ['manage_users', 'view_audit_logs', 'manage_settings'],
  supervisor: ['view_department', 'assign_grievance', 'draft_reply', 'approve_reply', 'view_audit_logs'],
  head_department: ['view_department', 'assign_grievance', 'draft_reply', 'view_audit_logs'],
  employee: ['view_assigned', 'draft_reply'],
};

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

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id,username,name,email,role,department,phone,is_active')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_active) {
      await supabase.auth.signOut();
      SecurityRateLimiter.registerFailure('admin-login', identifier || 'anonymous');
      setIsVerifying(false);
      setError('الحساب موثق لكنه لا يملك ملف موظف نشطاً في النظام.');
      return;
    }

    SecurityRateLimiter.reset('admin-login', identifier || 'anonymous');
    const role = (profile.role || 'employee') as UserRole;
    onLogin({
      id: profile.id,
      username: profile.username,
      name: profile.name,
      role,
      roleTitle: ROLE_TITLES[role] || 'موظف النظام',
      email: profile.email,
      phone: profile.phone || '',
      department: profile.department || '',
      status: 'نشط',
      assignedCount: 0,
      resolvedCount: 0,
      overdueCount: 0,
      lastActive: new Date().toISOString(),
      permissions: ROLE_PERMISSIONS[role] || [],
    });
  };

  return (
    <div className="min-h-screen bg-[#eef2f5] text-[#17212b] flex flex-col font-tajawal" dir="rtl">
      <div className="h-1.5 bg-gradient-to-l from-[#D21034] via-white to-[#006233]" />
      <header className="bg-white border-b border-[#d7e0e7] shadow-sm px-4 sm:px-8 py-4">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-white p-1 border border-[#d7e0e7] shadow-sm flex items-center justify-center">
            <img src="/assets/algeria-emblem.png" alt="شعار الجمهورية الجزائرية" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-changa font-black text-sm sm:text-base text-[#006233]">الجمهورية الجزائرية الديمقراطية الشعبية</h2>
            <p className="text-xs text-[#526273] mt-1">وزارة الداخلية والجماعات المحلية — ولاية الوادي</p>
          </div>
        </div>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#f3f6f8] border border-[#d7e0e7] text-xs font-bold text-[#526273] hover:text-[#006233]">
          العودة للموقع العام <ArrowRight className="w-3.5 h-3.5" />
        </button>
        </div>
      </header>

      <main className="max-w-xl w-full mx-auto my-auto px-4 py-12">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#d7e0e7] rounded-2xl p-6 sm:p-10 shadow-[0_18px_50px_rgba(23,33,43,0.12)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#006233]/10 border border-[#006233]/20 text-[#006233] flex items-center justify-center"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <h1 className="font-changa font-bold text-2xl text-[#17212b]">فضاء الموظفين والإطارات</h1>
              <p className="text-sm text-[#526273] mt-1">الدخول إلى المنصة الإدارية لولاية الوادي</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#344454] mb-1.5">اسم المستخدم أو البريد المهني</label>
              <div className="relative"><UserIcon className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#f8fafc] border border-[#cbd7e3] focus:border-[#006233] rounded-xl pr-10 pl-4 py-3 text-sm text-[#17212b] font-mono outline-none" placeholder="wali أو name@example.gov.dz" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#344454] mb-1.5">كلمة المرور</label>
              <div className="relative"><Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#f8fafc] border border-[#cbd7e3] focus:border-[#006233] rounded-xl pr-10 pl-10 py-3 text-sm text-[#17212b] font-mono outline-none" placeholder="••••••••" />
                <button type="button" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            {error && <p role="alert" className="text-red-300 text-xs font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>}
            <button type="submit" disabled={isVerifying} className="w-full py-3.5 bg-[#006233] hover:bg-[#004d28] rounded-xl font-changa font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
              {isVerifying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound className="w-4 h-4 text-amber-300" />مصادقة الدخول</>}
            </button>
          </form>
        </motion.section>
      </main>

      <footer className="max-w-6xl w-full mx-auto text-center py-5 px-4 text-xs text-[#6b7b8a]">الدخول محمي بالمصادقة المركزية والتحقق من الصلاحيات في قاعدة البيانات — جميع الحقوق محفوظة لولاية الوادي</footer>
    </div>
  );
};
