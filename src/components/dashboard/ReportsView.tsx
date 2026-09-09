import React, { useState } from 'react';
import { Download, FileText, BarChart3, Filter, Printer, Calendar, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { SystemUser } from '../../types';

interface ReportsViewProps {
  user?: SystemUser;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
  onOpenExecutiveReport?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ user, addToast, onOpenExecutiveReport }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'s1' | 's2' | 'year'>('year');
  const [showPeriodFilter, setShowPeriodFilter] = useState(false);

  const data = [
    { name: 'جانفي', السكن: 400, البيئة: 240, الطرقات: 240 },
    { name: 'فيفري', السكن: 300, البيئة: 139, الطرقات: 221 },
    { name: 'مارس', السكن: 200, البيئة: 380, الطرقات: 229 },
    { name: 'أفريل', السكن: 278, البيئة: 390, الطرقات: 200 },
    { name: 'ماي', السكن: 189, البيئة: 480, الطرقات: 218 },
    { name: 'جوان', السكن: 239, البيئة: 380, الطرقات: 250 },
  ];

  const handleExportCsv = () => {
    const csvContent = '\uFEFF' + [
      'المصلحة / المديرية,إجمالي الملفات,معالجة ومسواة,قيد الدراسة,متأخرة,نسبة الإنجاز',
      'مديرية السكن,420,350,50,20,83%',
      'مديرية الأشغال العمومية,210,190,15,5,90%',
      'مديرية الصحة والسكان,150,100,40,10,66%',
      'مديرية الموارد المائية (ADE),185,145,30,10,78%',
      'مؤسسة سونلغاز,140,115,20,5,82%'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_أداء_مديريات_ولاية_الوادي_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast?.({
      type: 'success',
      title: 'تم تصدير التقرير الإحصائي',
      message: 'تم تحميل ملف جداول أداء المديريات التنفيذية لولاية الوادي بنجاح.'
    });
  };

  return (
    <div className="space-y-6 font-tajawal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">التقارير التحليلية والمؤشرات الإحصائية</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            لوحة الاستشراف الولائي — قياس كفاءة استجابة المديريات ومعدل الالتزام بالآجال القانونية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => setShowPeriodFilter(!showPeriodFilter)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors shadow-2xs ${
              showPeriodFilter ? 'bg-emerald-50 text-[#006233] border-emerald-300' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>تصفية الفترة ({selectedPeriod === 'year' ? 'كامل سنة 2026' : selectedPeriod === 's1' ? 'السداسي الأول' : 'السداسي الثاني'})</span>
          </button>

          <button 
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#006233]" />
            <span>تصدير Excel</span>
          </button>

          <button 
            onClick={onOpenExecutiveReport || (() => window.print())}
            className="flex items-center gap-2 px-4 py-2 bg-[#D21034] text-white rounded-xl hover:bg-[#b00d2b] transition-colors text-xs font-bold shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-amber-200" />
            <span>تقرير الوالي التنفيذي (PDF)</span>
          </button>
        </div>
      </div>

      {/* Period Filter Drawer */}
      {showPeriodFilter && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3 text-xs">
          <span className="font-bold text-gray-700">الفترة الزمنية:</span>
          <button 
            onClick={() => { setSelectedPeriod('year'); setShowPeriodFilter(false); }}
            className={`px-3 py-1.5 rounded-lg font-bold ${selectedPeriod === 'year' ? 'bg-[#006233] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            سنة 2026 كاملة
          </button>
          <button 
            onClick={() => { setSelectedPeriod('s1'); setShowPeriodFilter(false); }}
            className={`px-3 py-1.5 rounded-lg font-bold ${selectedPeriod === 's1' ? 'bg-[#006233] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            السداسي الأول (جانفي - جوان)
          </button>
          <button 
            onClick={() => { setSelectedPeriod('s2'); setShowPeriodFilter(false); }}
            className={`px-3 py-1.5 rounded-lg font-bold ${selectedPeriod === 's2' ? 'bg-[#006233] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            السداسي الثاني (جويلية - ديسمبر)
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-red-50 text-[#D21034] rounded-xl border border-red-100"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold">الملفات المتجاوزة للمهلة القانونية</p>
            <h4 className="text-2xl font-black font-mono text-gray-900 mt-0.5">18 ملف</h4>
            <span className="text-[11px] text-[#D21034] font-bold">تتطلب تدخلاً استعجالياً</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-[#006233] rounded-xl border border-emerald-100"><BarChart3 className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold">معدل الاستجابة الشامل للمصالح</p>
            <h4 className="text-2xl font-black font-mono text-gray-900 mt-0.5">85.4%</h4>
            <span className="text-[11px] text-emerald-700 font-bold">+4% مقارنة بالشهر السابق</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold">التقارير التوجيهية المصدرة للوالي</p>
            <h4 className="text-2xl font-black font-mono text-gray-900 mt-0.5">12 تقريراً</h4>
            <span className="text-[11px] text-blue-700 font-bold">معتمدة وموجهة للهيئة التنفيذية</span>
          </div>
        </div>
      </div>

      {/* Strategic Sectors Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <h3 className="font-changa font-bold text-base text-gray-900 mb-6">
          تطور حجم الانشغالات حسب القطاعات الاستراتيجية لولاية الوادي
        </h3>
        <div className="h-[360px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{fontFamily: 'Tajawal', fontSize: 12}} />
              <YAxis tick={{fontFamily: 'Tajawal', fontSize: 12}} />
              <RechartsTooltip contentStyle={{fontFamily: 'Tajawal', borderRadius: '12px', border: '1px solid #E5E7EB'}} />
              <Area type="monotone" dataKey="السكن" stackId="1" stroke="#006233" fill="#006233" opacity={0.7} />
              <Area type="monotone" dataKey="البيئة" stackId="1" stroke="#D21034" fill="#D21034" opacity={0.6} />
              <Area type="monotone" dataKey="الطرقات" stackId="1" stroke="#F59E0B" fill="#F59E0B" opacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Table for department performance */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <h3 className="font-changa font-bold text-base text-gray-900">
            جدول كفاءة ومعالجة المصالح والمديريات الولائية
          </h3>
          <span className="text-xs text-gray-500 font-mono">تحديث لحظي</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right font-tajawal border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">المصلحة / المديرية التنفيذية</th>
                <th className="px-6 py-4 font-bold text-center">إجمالي العرائض</th>
                <th className="px-6 py-4 font-bold text-center">تمت التسوية</th>
                <th className="px-6 py-4 font-bold text-center">قيد الدراسة</th>
                <th className="px-6 py-4 font-bold text-center">متأخرة</th>
                <th className="px-6 py-4 font-bold">نسبة الإنجاز الفعلي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {[
                { name: 'مديرية السكن والتعمير', total: 420, resolved: 350, pending: 50, overdue: 20, rate: 83, color: 'bg-emerald-500' },
                { name: 'مديرية الأشغال العمومية', total: 210, resolved: 190, pending: 15, overdue: 5, rate: 90, color: 'bg-emerald-500' },
                { name: 'مديرية الموارد المائية (ADE)', total: 185, resolved: 145, pending: 30, overdue: 10, rate: 78, color: 'bg-emerald-500' },
                { name: 'مؤسسة سونلغاز (الكهرباء والغاز)', total: 140, resolved: 115, pending: 20, overdue: 5, rate: 82, color: 'bg-emerald-500' },
                { name: 'مديرية الصحة والسكان', total: 150, resolved: 100, pending: 40, overdue: 10, rate: 66, color: 'bg-amber-500' },
              ].map((dept, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{dept.name}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-gray-700">{dept.total}</td>
                  <td className="px-6 py-4 text-center font-mono text-emerald-600 font-bold">{dept.resolved}</td>
                  <td className="px-6 py-4 text-center font-mono text-amber-600 font-bold">{dept.pending}</td>
                  <td className="px-6 py-4 text-center font-mono text-[#D21034] font-bold">{dept.overdue}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${dept.color} h-2 rounded-full`} style={{ width: `${dept.rate}%` }}></div>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-700">{dept.rate}%</span>
                    </div>
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
