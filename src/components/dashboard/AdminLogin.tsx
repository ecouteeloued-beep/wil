import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User as UserIcon, Building2, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { SEED_USERS, ROLE_PINS } from '../../services/adminService';
import { SystemUser } from '../../types';

interface AdminLoginProps {
  onLogin: (user: SystemUser) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    // In a real app, you would hash/verify against backend. For demo:
    const expectedPin = ROLE_PINS[selectedUser.role];
    if (pin === expectedPin) {
      onLogin(selectedUser);
    } else {
      setError('الرمز السري غير صحيح');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Branding Side */}
        <div className="hidden md:flex flex-col justify-center items-start text-right space-y-6">
          <div className="w-20 h-20 bg-[#006233] rounded-2xl flex items-center justify-center shadow-lg shadow-[#006233]/20">
             <Shield className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black font-changa text-gray-900 leading-tight">البوابة الإدارية <br/> وساطة المواطن</h1>
            <p className="text-gray-500 font-tajawal mt-3 text-lg">منصة إدارة وتتبع ومعالجة انشغالات مواطني ولاية الوادي</p>
          </div>
          
          <div className="space-y-4 font-tajawal mt-8">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              صلاحيات الوصول حسب الدور (RBAC)
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              تشفير البيانات وحماية الجلسات
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              سجل تدقيق لجميع العمليات (Audit Log)
            </div>
          </div>
        </div>

        {/* Login Form Side */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          {!selectedUser ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-changa text-gray-900">تسجيل الدخول للنظام</h2>
                <p className="text-sm text-gray-500 font-tajawal mt-2">اختر حسابك التجريبي للمتابعة</p>
              </div>

              <div className="space-y-3">
                {SEED_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#006233] hover:bg-emerald-50/50 transition-all group text-right"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#006233] group-hover:text-white transition-colors">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 font-tajawal">{user.name}</div>
                        <div className="text-xs text-gray-500 font-tajawal mt-0.5">{user.roleTitle || user.department}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#006233] group-hover:-translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>

              <button 
                onClick={onCancel}
                className="w-full mt-6 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-tajawal text-sm font-bold transition-colors"
              >
                العودة للموقع العام
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <button 
                onClick={() => { setSelectedUser(null); setPin(''); setError(''); }}
                className="text-gray-400 hover:text-gray-800 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-white shadow-sm flex items-center justify-center text-[#006233] mx-auto mb-4">
                  <UserIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold font-changa text-gray-900">{selectedUser.name}</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold font-tajawal mt-2">
                  <Building2 className="w-3.5 h-3.5" />
                  {selectedUser.department}
                </span>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 font-tajawal mb-2 text-center">أدخل الرمز السري (PIN)</label>
                  <div className="relative max-w-[200px] mx-auto">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center pl-4 pr-10 py-3 text-2xl tracking-widest font-mono border-2 border-gray-200 rounded-xl focus:border-[#006233] outline-none transition-colors"
                      placeholder="••••"
                      autoFocus
                    />
                  </div>
                  {error && (
                    <p className="text-[#D21034] text-xs font-bold font-tajawal text-center mt-3 flex items-center justify-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs font-tajawal text-center mt-3">
                    للعرض التجريبي: أدخل الرمز {ROLE_PINS[selectedUser.role]}
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={pin.length < 4}
                  className="w-full py-4 bg-[#006233] text-white rounded-xl font-tajawal font-bold text-lg hover:bg-[#004d28] transition-colors shadow-lg shadow-[#006233]/30 disabled:opacity-50 disabled:shadow-none"
                >
                  تسجيل الدخول
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
