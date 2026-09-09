import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, BarChart3, Filter, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { SystemUser, EnhancedGrievance } from '../../types';
import { AdminService } from '../../services/adminService';

interface ReportsViewProps {
  user?: SystemUser;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
  onOpenExecutiveReport?: () => void;
}

const resolvedStatuses = new Set(['تمت التسوية', 'تمت المعالجة', 'مغلقة', 'مغلق', 'مقبولة', 'تم الحل']);

export const ReportsView: React.FC<ReportsViewProps> = ({ user, addToast, onOpenExecutiveReport }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'year' | 's1' | 's2'>('year');
  const [showPeriodFilter, setShowPeriodFilter] = useState(false);
  const [grievances, setGrievances] = useState<EnhancedGrievance[]>([]);

  useEffect(() => {
    const refresh = () => setGrievances(AdminService.getGrievancesForUser(user || ({} as SystemUser)));
    refresh();
    window.addEventListener('complaints_updated', refresh);
    return () => window.removeEventListener('complaints_updated', refresh);
  }, [user]);

  const periodGrievances = useMemo(() => {
    const year = new Date().getFullYear();
    return grievances.filter(item => {
      const date = new Date(item.createdAt);
      if (Number.isNaN(date.getTime()) || date.getFullYear() !== year) return false;
      if (selectedPeriod === 's1') return date.getMonth() < 6;
      if (selectedPeriod === 's2') return date.getMonth() >= 6;
      return true;
    });
  }, [grievances, selectedPeriod]);

  const metrics = useMemo(() => {
    const total = periodGrievances.length;
    const resolved = periodGrievances.filter(item => resolvedStatuses.has(item.status)).length;
    const overdue = periodGrievances.filter(item => item.isOverdue || item.status === 'متأخرة').length;
    const inProgress = periodGrievances.filter(item => !resolvedStatuses.has(item.status)).length;
    return { total, resolved, overdue, inProgress, rate: total ? Math.round((resolved / total) * 100) : 0 };
  }, [periodGrievances]);

  const monthlyData = useMemo(() => {
    const months = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months.map((name, month) => {
      const items = periodGrievances.filter(item => new Date(item.createdAt).getMonth() === month);
      return { name, total: items.length, resolved: items.filter(item => resolvedStatuses.has(item.status)).length };
    });
  }, [periodGrievances]);

  const departmentRows = useMemo(() => {
    const groups = new Map<string, EnhancedGrievance[]>();
    periodGrievances.forEach(item => {
      const key = item.assignedDepartment || 'غير مسندة بعد';
      groups.set(key, [...(groups.get(key) || []), item]);
    });
    return [...groups.entries()].map(([name, items]) => {
      const resolved = items.filter(item => resolvedStatuses.has(item.status)).length;
      const overdue = items.filter(item => item.isOverdue || String(item.status) === 'متأخرة').length;
      return { name, total: items.length, resolved, pending: items.length - resolved, overdue, rate: Math.round((resolved / items.length) * 100) };
    }).sort((a, b) => b.total - a.total);
  }, [periodGrievances]);

  const handleExportCsv = () => {
    const rows = [
      'المصلحة / المديرية,إجمالي الملفات,معالجة ومسواة,قيد الدراسة,متأخرة,نسبة الإنجاز',
      ...departmentRows.map(row => `${row.name},${row.total},${row.resolved},${row.pending},${row.overdue},${row.rate}%`)
    ];
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_فعلي_ولاية_الوادي_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast?.({ type: 'success', title: 'تم تصدير التقرير', message: 'تم تصدير البيانات الفعلية المتاحة بصيغة CSV.' });
  };

  const periodLabel = selectedPeriod === 'year' ? 'السنة الحالية' : selectedPeriod === 's1' ? 'السداسي الأول' : 'السداسي الثاني';

  return (
    <div className="space-y-6 font-tajawal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">التقارير التحليلية والمؤشرات الإحصائية</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">تقارير محسوبة من العرائض الفعلية المتاحة في النظام.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={() => setShowPeriodFilter(!showPeriodFilter)} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border bg-white text-gray-700 border-gray-200 hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" /> الفترة: {periodLabel}
          </button>
          <button onClick={handleExportCsv} className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-xs font-bold">
            <Download className="w-3.5 h-3.5 text-[#006233]" /> تصدير CSV
          </button>
          <button onClick={onOpenExecutiveReport || (() => window.print())} className="flex items-center gap-2 px-4 py-2 bg-[#D21034] text-white rounded-xl hover:bg-[#b00d2b] text-xs font-bold">
            <FileText className="w-3.5 h-3.5 text-amber-200" /> التقرير التنفيذي
          </button>
        </div>
      </div>

      {showPeriodFilter && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-gray-700">الفترة الزمنية:</span>
          {([['year', 'السنة الحالية'], ['s1', 'السداسي الأول'], ['s2', 'السداسي الثاني']] as const).map(([value, label]) => (
            <button key={value} onClick={() => { setSelectedPeriod(value); setShowPeriodFilter(false); }} className={`px-3 py-1.5 rounded-lg font-bold ${selectedPeriod === value ? 'bg-[#006233] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{label}</button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          ['إجمالي الملفات', metrics.total, FileText, 'text-[#006233]', 'bg-emerald-50'],
          ['تمت المعالجة', metrics.resolved, BarChart3, 'text-emerald-700', 'bg-emerald-50'],
          ['قيد الدراسة', metrics.inProgress, TrendingUp, 'text-amber-700', 'bg-amber-50'],
          ['متأخرة', metrics.overdue, FileText, 'text-[#D21034]', 'bg-red-50']
        ].map(([label, value, Icon, color, bg], index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
            <div className={`p-3.5 ${bg} ${color} rounded-xl`}><Icon className="w-6 h-6" /></div>
            <div><p className="text-xs text-gray-500 font-bold">{label}</p><h4 className="text-2xl font-black font-mono text-gray-900 mt-0.5">{value}</h4><span className="text-[11px] text-gray-500 font-bold">بيانات فعلية</span></div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-6"><div><h3 className="font-changa font-bold text-base text-gray-900">تطور العرائض خلال الفترة</h3><p className="text-xs text-gray-500">الإجمالي والمعالج شهرياً</p></div><span className="text-sm font-bold text-[#006233]">نسبة المعالجة: {metrics.rate}%</span></div>
        {metrics.total === 0 ? <div className="h-72 flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات فعلية كافية لعرض الرسم البياني.</div> : <div className="h-72" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" /><XAxis dataKey="name" tick={{ fontFamily: 'Tajawal', fontSize: 11 }} /><YAxis allowDecimals={false} /><RechartsTooltip /><Bar dataKey="total" name="الإجمالي" fill="#006233" radius={[4, 4, 0, 0]} /><Bar dataKey="resolved" name="المعالج" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between"><h3 className="font-changa font-bold text-base text-gray-900">كفاءة المصالح والمديريات</h3><span className="text-xs text-gray-500">{departmentRows.length} مصالح ذات بيانات</span></div>
        <div className="overflow-x-auto"><table className="w-full text-right font-tajawal border-collapse"><thead className="bg-gray-50 text-gray-500 text-xs border-b border-gray-200"><tr><th className="px-6 py-4">المصلحة</th><th className="px-6 py-4 text-center">الإجمالي</th><th className="px-6 py-4 text-center">المعالج</th><th className="px-6 py-4 text-center">قيد الدراسة</th><th className="px-6 py-4 text-center">متأخرة</th><th className="px-6 py-4">نسبة الإنجاز</th></tr></thead><tbody className="divide-y divide-gray-100 text-xs">{departmentRows.length === 0 ? <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">لا توجد عرائض مسجلة بعد.</td></tr> : departmentRows.map(row => <tr key={row.name} className="hover:bg-gray-50/60"><td className="px-6 py-4 font-bold text-gray-900">{row.name}</td><td className="px-6 py-4 text-center font-mono">{row.total}</td><td className="px-6 py-4 text-center font-mono text-emerald-600">{row.resolved}</td><td className="px-6 py-4 text-center font-mono text-amber-600">{row.pending}</td><td className="px-6 py-4 text-center font-mono text-[#D21034]">{row.overdue}</td><td className="px-6 py-4 font-bold">{row.rate}%</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
};
