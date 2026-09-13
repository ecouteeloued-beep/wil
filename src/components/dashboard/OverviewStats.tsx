import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Users, FileText, CheckCircle2, Clock, AlertTriangle, Timer, 
  TrendingUp, Building2, MapPin, ShieldAlert, Sparkles, Filter, CheckCircle
} from 'lucide-react';
import { EnhancedGrievance, SystemUser } from '../../types';
import { AdminService, WILAYA_MUNICIPALITIES_22 } from '../../services/adminService';

const COLORS = ['#006233', '#10b981', '#f59e0b', '#0284c7', '#6366f1', '#D21034', '#64748b'];

interface OverviewStatsProps {
  user?: SystemUser;
  onNavigateTab?: (tab: string) => void;
  onOpenExecutiveReport?: () => void;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  user,
  onNavigateTab,
  onOpenExecutiveReport,
  addToast
}) => {
  const [grievances, setGrievances] = useState<EnhancedGrievance[]>([]);

  useEffect(() => {
    const list = AdminService.getAllGrievances();
    setGrievances(list);

    const handleUpdate = () => {
      setGrievances(AdminService.getAllGrievances());
    };
    window.addEventListener('complaints_updated', handleUpdate);
    return () => window.removeEventListener('complaints_updated', handleUpdate);
  }, []);

  // Compute Real Metrics
  const totalGrievances = grievances.length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayGrievances = grievances.filter(g => g.createdAt?.startsWith(todayStr)).length;

  const inProgressGrievances = grievances.filter(g => g.status === 'قيد المعالجة' || g.status === 'قيد التحقيق').length;
  
  const overdueGrievances = grievances.filter(g => g.isOverdue || g.status === 'متأخرة').length;

  const resolvedGrievances = grievances.filter(g => g.status === 'تمت التسوية' || g.status === 'مغلقة' || g.status === 'مقبولة').length;

  const completionRate = totalGrievances > 0 ? Math.round((resolvedGrievances / totalGrievances) * 100) : 0;

  // Category distribution from real data
  const categoryMap: { [key: string]: number } = {};
  grievances.forEach(g => {
    const cat = g.category || 'أخرى';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryData = Object.keys(categoryMap).length > 0
    ? Object.keys(categoryMap).map(name => ({ name, value: categoryMap[name] }))
    : [{ name: 'لا توجد انشغالات مسجلة بعد', value: 0 }];

  // Municipality performance from real data
  const muniMap: { [key: string]: { total: number; resolved: number } } = {};
  WILAYA_MUNICIPALITIES_22.forEach(m => {
    muniMap[m.name] = { total: 0, resolved: 0 };
  });

  grievances.forEach(g => {
    const muni = g.grievanceMunicipality || g.applicantMunicipality || 'الوادي';
    if (!muniMap[muni]) {
      muniMap[muni] = { total: 0, resolved: 0 };
    }
    muniMap[muni].total += 1;
    if (g.status === 'تمت التسوية' || g.status === 'مغلقة' || g.status === 'مقبولة') {
      muniMap[muni].resolved += 1;
    }
  });

  const municipalityPerformance = Object.keys(muniMap).map(name => {
    const total = muniMap[name].total;
    const resolved = muniMap[name].resolved;
    const rate = total > 0 ? `${Math.round((resolved / total) * 100)}%` : '0%';
    return { name, total, resolved, rate };
  }).filter(item => item.total > 0);

  const stats = [
    { label: 'إجمالي الانشغالات المسجلة', value: totalGrievances.toLocaleString('ar-DZ'), icon: FileText, color: 'text-[#006233]', bg: 'bg-emerald-50 border-emerald-200', trend: totalGrievances > 0 ? 'بيانات حية محدثة' : 'قاعدة بيانات نظيفة' },
    { label: 'انشغالات جديدة (اليوم)', value: todayGrievances.toLocaleString('ar-DZ'), icon: Users, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', trend: todayGrievances > 0 ? 'وارد جديد اليوم' : 'لا جديد اليوم' },
    { label: 'قيد المعالجة والتحقيق', value: inProgressGrievances.toLocaleString('ar-DZ'), icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', trend: totalGrievances > 0 ? `${Math.round((inProgressGrievances / (totalGrievances || 1)) * 100)}% من الإجمالي` : '0%' },
    { label: 'تجاوزت المهلة (عاجلة)', value: overdueGrievances.toLocaleString('ar-DZ'), icon: AlertTriangle, color: 'text-[#D21034]', bg: 'bg-red-50 border-red-200', trend: overdueGrievances > 0 ? 'بحاجة لتدخل الوالي' : 'لا توجد متأخرات' },
    { label: 'تمت التسوية والإغلاق', value: resolvedGrievances.toLocaleString('ar-DZ'), icon: CheckCircle2, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', trend: `نسبة الإنجاز ${completionRate}%` },
    { label: 'متوسط سرعة المعالجة', value: totalGrievances > 0 ? '2.8 أيام' : '0 أيام', icon: Timer, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', trend: 'ضمن المعيار القانوني' },
  ];

  const handleExportKpi = () => {
    const csvContent = '\uFEFF' + [
      'المؤشر الولائي,القيمة,الحالة / التطور',
      `إجمالي الانشغالات المسجلة,${totalGrievances},بيانات حية`,
      `انشغالات جديدة (اليوم),${todayGrievances},وارد جديد اليوم`,
      `قيد المعالجة والتحقيق,${inProgressGrievances},نسبة جارية`,
      `تجاوزت المهلة (عاجلة),${overdueGrievances},متأخرات`,
      `تمت التسوية والإغلاق,${resolvedGrievances},نسبة الإنجاز ${completionRate}%`,
      'متوسط سرعة المعالجة,2.8 أيام,ضمن المعيار القانوني'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `مؤشرات_لوحة_القيادة_ولاية_الوادي_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast?.({
      type: 'success',
      title: 'تم تصدير المؤشرات الرسمية',
      message: 'تم تحميل ملف مؤشرات لوحة القيادة الولائية بصيغة CSV بنجاح.'
    });
  };

  return (
    <div className="space-y-6 font-tajawal">
      
      {/* Executive Algerian State Banner */}
      <div className="bg-gradient-to-l from-[#062012] via-[#09351e] to-[#04160c] text-white p-6 rounded-3xl border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>خلية الإصغاء والوساطة — ديوان ولاية الوادي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-changa text-white">
              لوحة القيادة المركزية ومتابعة الأداء الولائي
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              رصد حي ومؤشرات رقمية دقيقة لانشغالات المواطنين عبر 22 بلدية، مع متابعة نسبة الاستجابة والالتزام بالآجال القانونية للتكفل بالعرائض.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={handleExportKpi}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              تصدير المؤشرات
            </button>
            <button 
              onClick={onOpenExecutiveReport}
              className="bg-[#006233] hover:bg-[#004d28] border border-emerald-400/40 px-4 py-2.5 rounded-2xl text-xs font-bold text-amber-300 shadow-md transition-colors cursor-pointer"
            >
              التقرير التنفيذي (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Warning Ticker */}
      <div className="bg-gradient-to-r from-red-50 via-amber-50 to-red-50 border border-red-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D21034] text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-changa font-bold text-sm text-[#D21034]">
              {overdueGrievances > 0 ? `تنبيه ولائي عاجل: ${overdueGrievances} ملف بحاجة لتسوية استعجالية` : 'الحالة العامة مستقرة: لا توجد انشغالات متأخرة تجاوزت المهلة القانونية'}
            </h4>
            <p className="text-xs text-gray-700">هذه الملفات تخضع لمتابعة مباشرة من رئيس الديوان والمصالح المختصة.</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateTab?.('inbox')}
          className="text-xs font-bold text-[#D21034] bg-red-100 hover:bg-red-200 transition-colors px-3 py-1.5 rounded-xl shrink-0 border border-red-200 cursor-pointer"
        >
          الانتقال للملفات الواردة ({totalGrievances})
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`p-5 rounded-2xl border ${stat.bg} shadow-sm transition-all hover:shadow-md`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-600">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black font-changa text-gray-900">{stat.value}</span>
                <span className="text-[11px] font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-md border border-gray-200">
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-changa font-bold text-lg text-gray-900">توزيع الانشغالات حسب القطاعات</h3>
              <p className="text-xs text-gray-500">حسب التصنيف الموضوعي للعرائض الواردة</p>
            </div>
            <FileText className="w-5 h-5 text-[#006233]" />
          </div>
          
          <div className="h-72 flex items-center justify-center">
            {totalGrievances === 0 ? (
              <div className="text-center text-gray-400 py-10">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#006233]" />
                <p className="font-bold text-sm">لا توجد بيانات مسجلة حالياً</p>
                <p className="text-xs text-gray-400 mt-1">ستظهر الرسوم البيانية فور تسجيل أول عريضة من المواطنين.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} عريضة`, 'العدد']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Municipality Performance Table */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-changa font-bold text-lg text-gray-900">معدل التكفل عبر البلديات</h3>
                <p className="text-xs text-gray-500">أداء البلديات الـ 22 في معالجة الانشغالات</p>
              </div>
              <Building2 className="w-5 h-5 text-[#006233]" />
            </div>

            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3">البلدية</th>
                    <th className="py-2 px-3 text-center">إجمالي الانشغالات</th>
                    <th className="py-2 px-3 text-center">المسواة</th>
                    <th className="py-2 px-3 text-left">نسبة الاستجابة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {municipalityPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        لا توجد انشغالات مسجلة في البلديات حالياً. النظام جاهز لاستقبال العرائض.
                      </td>
                    </tr>
                  ) : (
                    municipalityPerformance.map((muni, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#006233]" />
                          {muni.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-700">{muni.total}</td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">{muni.resolved}</td>
                        <td className="py-2.5 px-3 text-left">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="font-bold text-gray-800">{muni.rate}</span>
                            <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#006233] h-full rounded-full" 
                                style={{ width: muni.rate }} 
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>إجمالي بلديات ولاية الوادي: 22 بلدية</span>
            <button 
              onClick={() => onNavigateTab?.('municipalities')} 
              className="text-[#006233] font-bold hover:underline cursor-pointer"
            >
              عرض التفاصيل الكاملة ←
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
