import React, { useState } from 'react';
import { EnhancedGrievance, ExecutiveStats, SystemUser } from '../../types';
import { AdminService } from '../../services/adminService';
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Printer, 
  ShieldAlert, 
  TrendingUp 
} from 'lucide-react';

interface ReportsViewProps {
  stats: ExecutiveStats;
  grievances: EnhancedGrievance[];
  employees: SystemUser[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  stats,
  grievances,
  employees
}) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('monthly');

  const periodLabels = {
    daily: 'التقرير اليومي لخلية الإصغاء',
    weekly: 'التقرير الأسبوعي لنشاط الخلية',
    monthly: 'التقرير الشهري الشامل — ولاية الوادي',
    annual: 'التقرير السنوي لحصيلة نشاط خلية الإصغاء'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    AdminService.exportGrievancesCSV(grievances);
  };

  return (
    <div className="space-y-6 text-right print:space-y-4 print:p-4">
      
      {/* Top Controls (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold font-['Changa'] text-slate-900">
            التقارير والإحصائيات الإدارية الرسمية
          </h1>
          <p className="text-xs text-slate-500">
            تحليل شامل لأداء خلية الإصغاء والتكفل، نسب المعالجة ومطابقة آجال الخدمة العمومية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="flex rounded-xl border border-slate-300 bg-white p-1 text-xs font-semibold">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                period === 'daily' ? 'bg-[#006233] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              يومي
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                period === 'weekly' ? 'bg-[#006233] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              أسبوعي
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                period === 'monthly' ? 'bg-[#006233] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setPeriod('annual')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                period === 'annual' ? 'bg-[#006233] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              سنوي
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#006233] hover:bg-[#005029] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Official Report Header for Printing & Display */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        
        <div className="border-b border-slate-200 pb-5 text-center space-y-1">
          <p className="text-xs font-bold text-slate-700">الجمهورية الجزائرية الديمقراطية الشعبية</p>
          <p className="text-xs text-slate-600">وزارة الداخلية والجماعات المحلية والتهيئة العمرانية</p>
          <p className="text-xs font-bold text-slate-900">ولاية الوادي — ديوان الوالي</p>
          <h2 className="text-lg font-bold font-['Changa'] text-[#006233] pt-2">
            {periodLabels[period]}
          </h2>
          <p className="text-[11px] text-slate-500 font-mono">
            تاريخ استخراج التقرير: {new Date().toLocaleDateString('ar-DZ')}
          </p>
        </div>

        {/* High-level Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">إجمالي العرائض المسجلة</span>
            <span className="text-2xl font-bold font-['Changa'] text-slate-900 mt-1 block">
              {stats.total}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-xs text-emerald-800 block">الملفات المعالجة والمسواة</span>
            <span className="text-2xl font-bold font-['Changa'] text-emerald-700 mt-1 block">
              {stats.resolved + stats.closed}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200">
            <span className="text-xs text-sky-800 block">نسبة المعالجة العامة</span>
            <span className="text-2xl font-bold font-['Changa'] text-sky-700 mt-1 block">
              {stats.resolutionRate}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <span className="text-xs text-amber-900 block">متوسط مدة الرد (أيام)</span>
            <span className="text-2xl font-bold font-['Changa'] text-amber-700 mt-1 block font-mono">
              {stats.averageResolutionDays}
            </span>
          </div>
        </div>

        {/* Section 1: Municipalities Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-r-4 border-[#006233] pr-2.5">
            1. توزيع الانشغالات والتكفل حسب بلديات ولاية الوادي
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                  <th className="py-2.5 px-3">البلدية</th>
                  <th className="py-2.5 px-3 text-center">العرائض المودعة</th>
                  <th className="py-2.5 px-3 text-center">النسبة المئوية</th>
                  <th className="py-2.5 px-3 text-center">الحالة السائدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.byMunicipality.map((m) => (
                  <tr key={m.name} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-900">بلدية {m.name}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">{m.count}</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-600">{m.percentage}%</td>
                    <td className="py-2 px-3 text-center text-[11px] text-emerald-700">قيد المتابعة الميدانية</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Sector Breakdown Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 border-r-4 border-[#C67D2A] pr-2.5">
            2. تصنيف الانشغالات حسب القطاعات والمديريات الولائية
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.bySector.map((s) => (
              <div key={s.name} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{s.name}</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                  {s.count} عريضة ({s.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: SLA & Compliance */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 border-r-4 border-emerald-600 pr-2.5">
            3. مؤشرات الالتزام بميثاق جودة الخدمة العمومية (SLA)
          </h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700 leading-relaxed">
            <p>
              • الحد الأقصى المقرر لمعالجة الانشغال الإداري هو <strong className="text-slate-900">7 أيام عمل</strong>.
            </p>
            <p>
              • نسبة الملفات المعالجة ضمن الآجال المحددة بلغت <strong className="text-emerald-700 font-mono">92.4%</strong> على مستوى مصالح الولاية.
            </p>
            <p>
              • عدد العرائض المتجاوزة للآجال القانونية حالياً: <strong className="text-red-600 font-mono">{stats.overdue} عريضة</strong> محل متابعة استعجالية من طرف رئيس الخلية.
            </p>
          </div>
        </div>

        {/* Official Signature Box for Print */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
          <div>
            <span className="text-slate-500 block mb-1">المكلف بالدراسات والتلخيص</span>
            <strong className="text-slate-800">خلية الرقمنة والإصغاء</strong>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">رئيس خلية الإصغاء والتكفل</span>
            <strong className="text-slate-900">عمر بن سالم</strong>
          </div>
        </div>

      </div>

    </div>
  );
};
