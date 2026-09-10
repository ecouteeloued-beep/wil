import React, { useEffect, useState } from 'react';
import { KeyRound, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const ResetPassword: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) setError('خدمة المصادقة غير مفعلة حالياً.');
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 8) return setError('يجب أن تتكون كلمة المرور من 8 أحرف أو أرقام على الأقل.');
    if (password !== confirmation) return setError('تأكيد كلمة المرور غير مطابق.');
    if (!supabase) return setError('تعذر الاتصال بخدمة المصادقة.');
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) return setError('انتهت صلاحية الرابط أو تعذر تحديث كلمة المرور. اطلب رابطاً جديداً.');
    setMessage('تم تحديث كلمة المرور بنجاح. يمكنك الآن الدخول إلى لوحة التحكم.');
    setPassword('');
    setConfirmation('');
  };

  return <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#124b2c_0%,#061b11_45%,#030c08_100%)] text-white flex items-center justify-center p-4 font-tajawal" dir="rtl">
    <div className="w-full max-w-md rounded-3xl border border-emerald-400/25 bg-[#082819]/95 p-6 sm:p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-7"><div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-emerald-300" /></div><div><h1 className="font-changa font-bold text-xl">تعيين كلمة مرور جديدة</h1><p className="text-xs text-emerald-100/70 mt-1">حماية حساب لوحة التحكم</p></div></div>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="block text-xs font-bold text-gray-300 mb-1.5">كلمة المرور الجديدة</label><div className="relative"><Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400" /><input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl bg-black/30 border border-white/10 focus:border-emerald-500 outline-none pr-10 py-3 text-sm font-mono" /></div></div>
        <div><label className="block text-xs font-bold text-gray-300 mb-1.5">تأكيد كلمة المرور</label><div className="relative"><KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400" /><input type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} className="w-full rounded-xl bg-black/30 border border-white/10 focus:border-emerald-500 outline-none pr-10 py-3 text-sm font-mono" /></div></div>
        {error && <p role="alert" className="text-red-300 text-xs font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
        {message && <p role="status" className="text-emerald-200 text-xs font-bold leading-6">{message}</p>}
        <button type="submit" disabled={saving} className="w-full py-3.5 rounded-xl bg-gradient-to-l from-[#006233] to-emerald-700 font-changa font-bold text-sm disabled:opacity-50">{saving ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور الجديدة'}</button>
        {message && <button type="button" onClick={onDone} className="w-full py-2.5 rounded-xl border border-white/15 text-xs font-bold text-gray-300 hover:text-white">الانتقال إلى تسجيل الدخول</button>}
      </form>
    </div>
  </div>;
};
