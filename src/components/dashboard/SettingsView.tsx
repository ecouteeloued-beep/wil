import React from 'react';
import { Save, Shield, Mail, Bell, HardDrive, Globe } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">إعدادات النظام</h2>
          <p className="text-sm text-gray-500 font-tajawal mt-1">تكوين إعدادات المنصة، الإشعارات، والنسخ الاحتياطي</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-[#006233] text-white rounded-lg hover:bg-[#004d28] transition-colors font-tajawal text-sm font-bold shadow-sm">
          <Save className="w-4 h-4" />
          حفظ التعديلات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#006233] text-[#006233] rounded-xl font-bold text-sm shadow-sm">
            <Globe className="w-5 h-5" /> الإعدادات العامة
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent text-gray-600 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors">
            <Shield className="w-5 h-5 text-gray-400" /> الأمان وجلسات الدخول
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent text-gray-600 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors">
            <Mail className="w-5 h-5 text-gray-400" /> إعدادات البريد و SMS
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent text-gray-600 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors">
            <Bell className="w-5 h-5 text-gray-400" /> الرسائل التلقائية
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent text-gray-600 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors">
            <HardDrive className="w-5 h-5 text-gray-400" /> النسخ الاحتياطي (Backup)
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 font-tajawal">
            <h3 className="font-changa font-bold text-lg border-b border-gray-100 pb-4">معلومات المنصة</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم المنصة</label>
                <input type="text" defaultValue="وساطة المواطن — ولاية الوادي" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#006233]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني الرسمي</label>
                <input type="email" defaultValue="contact@eloued.gov.dz" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#006233]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">شعار الولاية (Logo)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <img src="/wilaya_background_clean.jpg" alt="Logo" className="w-full h-full object-cover rounded-lg opacity-50" />
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold">تغيير الشعار</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 font-tajawal">
            <h3 className="font-changa font-bold text-lg border-b border-gray-100 pb-4">إعدادات النظام الأساسية</h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer">
                <div>
                  <div className="font-bold text-gray-900">تفعيل الصيانة (Maintenance Mode)</div>
                  <div className="text-xs text-gray-500 mt-1">إيقاف استقبال انشغالات جديدة مؤقتاً مع إظهار رسالة للمواطنين</div>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform"></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer">
                <div>
                  <div className="font-bold text-gray-900">تنبيهات SMS التلقائية</div>
                  <div className="text-xs text-gray-500 mt-1">إرسال رسائل نصية للمواطن عند تغيير حالة ملفه</div>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-[#006233]">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform transform translate-x-6"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
