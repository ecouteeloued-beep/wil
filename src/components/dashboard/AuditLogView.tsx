import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, History, AlertCircle } from 'lucide-react';
import { AdminService } from '../../services/adminService';

export const AuditLogView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    const refresh = () => setAuditLogs(AdminService.getAuditLogs(200));
    refresh();
    window.addEventListener('audit_updated', refresh);
    return () => window.removeEventListener('audit_updated', refresh);
  }, []);

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(log => JSON.stringify(log).toLowerCase().includes(q));
  }, [auditLogs, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold font-changa text-gray-900">سجل العمليات</h2><p className="text-sm text-gray-500 font-tajawal mt-1">تتبع الإجراءات والتغييرات المسجلة فعلياً في النظام.</p></div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-tajawal text-sm font-bold"><Filter className="w-4 h-4" /> تصفية السجل</button>
      </div>
      <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50 shadow-sm flex items-start gap-3"><AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" /><div><h4 className="font-bold text-amber-900 font-tajawal text-sm">سجل تدقيق فعلي</h4><p className="text-amber-800 text-xs mt-1 font-tajawal">تظهر هنا الإجراءات التي تم تنفيذها بعد بدء الاستخدام الفعلي للمنظومة.</p></div></div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50"><div className="relative w-full sm:w-96"><Search className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" /><input value={query} onChange={e => setQuery(e.target.value)} type="text" placeholder="البحث في السجل..." className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#006233] font-tajawal text-sm" /></div></div>
        <div className="overflow-x-auto"><table className="w-full text-right font-tajawal"><thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200"><tr><th className="px-6 py-4">التاريخ والوقت</th><th className="px-6 py-4">المستخدم</th><th className="px-6 py-4">العملية</th><th className="px-6 py-4">الملف / الكيان</th><th className="px-6 py-4">التفاصيل</th></tr></thead><tbody className="divide-y divide-gray-100 text-sm">
          {filteredLogs.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">لا توجد عمليات مسجلة بعد.</td></tr> : filteredLogs.map(log => <tr key={log.id} className="hover:bg-gray-50/50"><td className="px-6 py-4 text-gray-500" dir="ltr">{new Date(log.timestamp).toLocaleString('ar-DZ')}</td><td className="px-6 py-4 font-bold text-gray-900">{log.userName || 'مستخدم النظام'}</td><td className="px-6 py-4"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100"><History className="w-3 h-3" /> {log.action}</span></td><td className="px-6 py-4 font-bold text-gray-700 font-mono">{log.targetId || '—'}</td><td className="px-6 py-4 text-xs text-gray-600">{log.details || `${log.previousValue || ''} ← ${log.newValue || ''}`}</td></tr>)}
        </tbody></table></div>
      </div>
    </div>
  );
};
