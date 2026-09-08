import React, { useState } from 'react';
import { AuditLogEntry } from '../../types';
import { 
  Clock, 
  Download, 
  FileText, 
  Filter, 
  History, 
  Lock, 
  Search, 
  ShieldCheck, 
  User 
} from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (typeFilter !== 'all' && log.targetType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.targetId.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#006233]" />
            <h1 className="text-xl font-bold font-['Changa'] text-slate-900">
              سجل العمليات والرقابة الإدارية (Audit Log)
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            سجل رقمي مؤمن وغير قابل للحذف، يسجل كل إجراء، إسناد، تعديل حالة، أو اعتماد رد في المنظومة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>محمي من التعديل (Tamper-Proof)</span>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالموظف، الإجراء، رقم الملف..."
            className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006233] bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">نوع العنصر:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <option value="all">كافة العمليات</option>
            <option value="انشغال">انشغالات</option>
            <option value="موظف">موظفون وحسابات</option>
            <option value="إعدادات">إعدادات النظام</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>لا توجد سجلات تطابق معايير البحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">التوقيت والتاريخ</th>
                  <th className="py-3 px-4">القائم بالعملية</th>
                  <th className="py-3 px-4">الإجراء المنفذ</th>
                  <th className="py-3 px-4">العنصر المعني</th>
                  <th className="py-3 px-4">القيمة السابقة</th>
                  <th className="py-3 px-4">القيمة الجديدة</th>
                  <th className="py-3 px-4">تفاصيل العملية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap" dir="ltr">
                      {new Date(log.timestamp).toLocaleString('ar-DZ')}
                    </td>

                    {/* User */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <span className="text-[10.5px] text-slate-500 block">{log.userRole}</span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {log.targetId}
                    </td>

                    {/* Previous Value */}
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                      {log.previousValue ? (
                        <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100">
                          {log.previousValue}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* New Value */}
                    <td className="py-3 px-4 font-mono text-[11px] max-w-xs truncate">
                      {log.newValue ? (
                        <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-100 font-semibold">
                          {log.newValue}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 text-slate-600 max-w-md text-xs">
                      {log.details}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
