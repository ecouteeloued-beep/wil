import React, { useState } from 'react';
import { SystemUser } from '../../types';
import { 
  Bell, 
  Check, 
  Database, 
  HelpCircle, 
  Mail, 
  Phone, 
  RotateCcw, 
  Save, 
  Settings, 
  ShieldCheck 
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: SystemUser;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  const [slaDays, setSlaDays] = useState('7');
  const [notifySms, setNotifySms] = useState(true);
  const [autoAssign, setAutoAssign] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('هل أنت متأكد من رغبتك في إعادة ضبط بيانات الخلية إلى الإعدادات الأولية؟ سيتم الاحتفاظ بالعرائض النموذجية.')) {
      localStorage.removeItem('wilaya_eloued_admin_grievances');
      localStorage.removeItem('wilaya_eloued_admin_audit_logs');
      localStorage.removeItem('wilaya_eloued_admin_notifications');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 text-right max-w-4xl">
      <div>
        <h1 className="text-xl font-bold font-['Changa'] text-slate-900">
          إعدادات منظومة خلية الإصغاء
        </h1>
        <p className="text-xs text-slate-500">
          تخصيص معايير جودة الخدمة العمومية، آجال الرد والتنبيهات الآلية
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Service Level Agreement (SLA) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">معايير ميثاق الخدمة العمومية (SLA)</h2>
              <p className="text-[11px] text-slate-500">تحديد الآجال القصوى للرد على عرائض وانشغالات المواطنين</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                المهلة القصوى للمعالجة (أيام عمل):
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={slaDays}
                onChange={(e) => setSlaDays(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#006233] bg-white font-mono"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">
                تعتبر العريضة "متأخرة" ويتم إشعار المسؤول تلقائياً إذا انقضت هذه المدة.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نظام التوزيع الآلي للانشغالات:
              </label>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="autoAssign"
                  checked={autoAssign}
                  onChange={(e) => setAutoAssign(e.target.checked)}
                  className="w-4 h-4 rounded text-[#006233] focus:ring-[#006233]"
                />
                <label htmlFor="autoAssign" className="text-xs text-slate-700 cursor-pointer">
                  توزيع العرائض آلياً على الموظفين حسب القطاع والاختصاص
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">إعدادات الإشعارات والتنبيهات</h2>
              <p className="text-[11px] text-slate-500">إشعار المواطنين والموظفين بالمستجدات</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="w-4 h-4 rounded text-[#006233] focus:ring-[#006233]"
              />
              <span>إرسال رسائل نصية قصيرة (SMS) للمواطن عند تغير حالة الانشغال أو صدور الرد</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-[#006233] focus:ring-[#006233]"
              />
              <span>تنبيه الموظف فور إسناد عريضة جديدة إليه في لوحة التحكم</span>
            </label>
          </div>
        </div>

        {/* Card 3: Administrative Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            المعلومات الرسمية للخلية
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1 font-semibold">المقر الرسمي:</span>
              <p className="text-slate-800">مقر ولاية الوادي — ديوان الوالي — الشارع الرئيسي، الوادي</p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1 font-semibold">الرقم الأخضر المجاني:</span>
              <p className="text-slate-800 font-mono font-bold">3099</p>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#006233] text-white text-xs font-bold hover:bg-[#005029] shadow-xs flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>

          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>تم حفظ الإعدادات بنجاح.</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط البيانات التجريبية</span>
          </button>
        </div>

      </form>
    </div>
  );
};
