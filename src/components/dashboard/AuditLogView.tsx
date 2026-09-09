import React from 'react';
import { Search, Filter, History, AlertCircle } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const auditLogs = [
    { id: '1', user: 'محمد صالح (Admin)', time: '08/09/2026 14:30', action: 'تحويل ملف', target: 'WL-2026-00125', from: 'مصلحة البيئة', to: 'مصلحة الأشغال العمومية' },
    { id: '2', user: 'عمر بن سالم (Supervisor)', time: '08/09/2026 13:15', action: 'تغيير حالة', target: 'WL-2026-00122', from: 'بانتظار الرد', to: 'تمت المعالجة' },
    { id: '3', user: 'السيد والي الولاية (Super Admin)', time: '08/09/2026 10:00', action: 'إنشاء مستخدم', target: 'أحمد سعيد', from: '', to: 'موظف بمديرية النقل' },
    { id: '4', user: 'سميرة بلخير (Employee)', time: '07/09/2026 16:45', action: 'إضافة ملاحظة', target: 'WL-2026-00089', from: '', to: 'ملف سري' },
    { id: '5', user: 'محمد صالح (Admin)', time: '07/09/2026 09:20', action: 'تعديل صلاحيات', target: 'عمر بن سالم', from: 'Supervisor', to: 'Manager' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">سجل العمليات (Audit Log)</h2>
          <p className="text-sm text-gray-500 font-tajawal mt-1">تتبع كافة الإجراءات والتغييرات التي تتم على النظام</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-tajawal text-sm font-bold shadow-sm">
            <Filter className="w-4 h-4" />
            تصفية السجل
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50 shadow-sm flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-amber-900 font-tajawal text-sm">مستوى الأمان: مرتفع</h4>
          <p className="text-amber-800 text-xs mt-1 font-tajawal leading-relaxed">
            جميع الإجراءات الإدارية وتغييرات حالة الملفات يتم تسجيلها وحفظها بشكل غير قابل للتعديل لضمان الشفافية والمسؤولية الإدارية.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            <input 
              type="text" 
              placeholder="البحث في السجل..." 
              className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#006233] font-tajawal text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right font-tajawal">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">التاريخ والوقت</th>
                <th className="px-6 py-4 font-bold">المستخدم</th>
                <th className="px-6 py-4 font-bold">العملية</th>
                <th className="px-6 py-4 font-bold">الملف / الكيان المتأثر</th>
                <th className="px-6 py-4 font-bold">التفاصيل (من / إلى)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-500" dir="ltr">{log.time}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{log.user}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                      <History className="w-3 h-3" /> {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700 font-mono">{log.target}</td>
                  <td className="px-6 py-4">
                    {log.from ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 line-through">{log.from}</span>
                        <span className="text-gray-400">←</span>
                        <span className="font-bold text-emerald-600">{log.to}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600">{log.to}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
