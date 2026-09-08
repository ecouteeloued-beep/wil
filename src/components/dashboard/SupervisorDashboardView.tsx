import React from 'react';
import { EnhancedGrievance, ExecutiveStats, SystemUser } from '../../types';
import { StatsCard } from './StatsCard';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  FileCheck2, 
  FileText, 
  Inbox, 
  MapPin, 
  PieChart, 
  Send, 
  ShieldAlert, 
  TrendingUp, 
  UserCheck, 
  Users 
} from 'lucide-react';

interface SupervisorDashboardViewProps {
  stats: ExecutiveStats;
  grievances: EnhancedGrievance[];
  employees: SystemUser[];
  onNavigateTab: (tabId: string) => void;
  onOpenGrievance: (g: EnhancedGrievance) => void;
  onOpenAssign: (g: EnhancedGrievance) => void;
  onOpenApproveClose: (g: EnhancedGrievance) => void;
}

export const SupervisorDashboardView: React.FC<SupervisorDashboardViewProps> = ({
  stats,
  grievances,
  employees,
  onNavigateTab,
  onOpenGrievance,
  onOpenAssign,
  onOpenApproveClose
}) => {
  // Urgent files needing supervisor immediate action
  const unassignedGrievances = grievances.filter(g => g.status === 'جديد');
  const pendingReviewGrievances = grievances.filter(g => g.status === 'بانتظار المراجعة');
  const overdueGrievances = grievances.filter(g => g.isOverdue);

  return (
    <div className="space-y-6 text-right">
      
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-[#006233]/90 rounded-2xl p-6 text-white shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#C67D2A]/30 text-[#F4EBDA] border border-[#C67D2A]/40 font-mono">
              لوحة القيادة والمتابعة المركزية للولاية
            </span>
            <span className="text-xs text-slate-300">• ديوان السيد الوالي</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Changa']">
            خلية الإصغاء والتكفل بانشغالات المواطن — التقرير التنفيذي
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            متابعة فورية وميدانية لكافة عرائض المواطنين عبر الـ 22 بلدية لولاية الوادي، مع مراقبة أداء المصالح والالتزام بميثاق الخدمة العمومية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('all_grievances')}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>إدارة جميع الانشغالات</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-4 py-2 rounded-xl bg-[#C67D2A] text-white text-xs font-bold hover:bg-[#b06d22] transition-colors shadow-xs flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>طباعة وتصدير التقارير</span>
          </button>
        </div>
      </div>

      {/* Primary Executive Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatsCard
          title="إجمالي الانشغالات"
          value={stats.total}
          sublabel="المسجلة بالخلية"
          icon={FileText}
          onClick={() => onNavigateTab('all_grievances')}
        />

        <StatsCard
          title="غير مسندة (جديدة)"
          value={stats.newUnassigned}
          sublabel="تتطلب توجيهاً لموظف"
          icon={Inbox}
          badge={stats.newUnassigned > 0 ? { text: 'تحتاج إسناد', variant: 'urgent' } : undefined}
          onClick={() => onNavigateTab('unassigned')}
        />

        <StatsCard
          title="قيد المعالجة"
          value={stats.inProgress}
          sublabel="تحت الدراسة الإدارية"
          icon={Clock}
          onClick={() => onNavigateTab('all_grievances')}
        />

        <StatsCard
          title="تنتظر الاعتماد"
          value={stats.pendingReview}
          sublabel="ردود جاهزة للمراجعة"
          icon={FileCheck2}
          badge={stats.pendingReview > 0 ? { text: 'للاعتماد', variant: 'warning' } : undefined}
          onClick={() => onNavigateTab('all_grievances')}
        />

        <StatsCard
          title="نسبة التسوية والإغلاق"
          value={`${stats.resolutionRate}%`}
          sublabel={`متوسط الرد: ${stats.averageResolutionDays} أيام`}
          icon={TrendingUp}
          badge={{ text: 'مؤشر ممتاز', variant: 'success' }}
        />

        <StatsCard
          title="متجاوزة للمهلة"
          value={stats.overdue}
          sublabel="تجاوزت مهلة 7 أيام"
          icon={ShieldAlert}
          badge={stats.overdue > 0 ? { text: 'تنبيه SLA', variant: 'urgent' } : undefined}
          onClick={() => onNavigateTab('overdue')}
        />
      </div>

      {/* Actionable Escalations: Pending Review & Unassigned */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Box 1: Files Pending Review (Ready for Supervisor Approval) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">ردود محررة بانتظار اعتمادكم</h3>
                  <p className="text-[11px] text-slate-500">تتطلب المراجعة النهائية والتوقيع وغلق الملف</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold font-mono">
                {pendingReviewGrievances.length}
              </span>
            </div>

            {pendingReviewGrievances.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                <p className="font-semibold text-slate-600">لا توجد ردود معلقة بانتظار الاعتماد حالياً.</p>
                <p className="text-slate-400 mt-0.5">كافة الردود التي حررها الموظفون تمت معالجتها.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingReviewGrievances.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">{item.id}</span>
                        <span className="text-[11px] text-slate-500">• بلدية {item.grievanceMunicipality}</span>
                      </div>
                      <p className="text-xs text-slate-800 truncate mt-0.5 font-medium">{item.subject}</p>
                      <span className="text-[11px] text-indigo-700">المحرر: {item.assignedToName}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenApproveClose(item)}
                        className="px-3 py-1.5 rounded-lg bg-[#006233] text-white text-xs font-semibold hover:bg-[#005029] transition-colors"
                      >
                        اعتماد وغلق
                      </button>
                      <button
                        onClick={() => onOpenGrievance(item)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-white transition-colors"
                      >
                        معاينة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pendingReviewGrievances.length > 3 && (
            <div className="pt-3 mt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigateTab('all_grievances')}
                className="text-xs text-[#006233] font-semibold hover:underline"
              >
                عرض باقي الردود المعلقة ({pendingReviewGrievances.length - 3}) ←
              </button>
            </div>
          )}
        </div>

        {/* Box 2: New Unassigned Files */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">عرائض جديدة مسجلة غير مسندة</h3>
                  <p className="text-[11px] text-slate-500">بحاجة للتوجيه الإداري وتكليف موظف الخلية</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold font-mono">
                {unassignedGrievances.length}
              </span>
            </div>

            {unassignedGrievances.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                <p className="font-semibold text-slate-600">كل الانشغالات المسجلة تم إسنادها وتوزيعها.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {unassignedGrievances.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">{item.id}</span>
                        <span className="text-[11px] text-slate-500">• {item.fullName}</span>
                      </div>
                      <p className="text-xs text-slate-800 truncate mt-0.5 font-medium">{item.subject}</p>
                      <span className="text-[11px] text-slate-500">بلدية {item.grievanceMunicipality} • {item.sector}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenAssign(item)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>إسناد الآن</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {unassignedGrievances.length > 3 && (
            <div className="pt-3 mt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigateTab('unassigned')}
                className="text-xs text-indigo-700 font-semibold hover:underline"
              >
                عرض باقي الملفات الجديدة ({unassignedGrievances.length - 3}) ←
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Visual Analytics Grid: Municipalities & Sectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Distribution by Municipality */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C67D2A]" />
                <span>توزيع الانشغالات حسب بلديات ولاية الوادي</span>
              </h3>
              <p className="text-[11px] text-slate-500">ترتيب البلديات حسب الحجم الإجمالي للعرائض المودعة</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {stats.byMunicipality.slice(0, 6).map((item, index) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">
                    <span className="text-slate-400 font-mono ml-1.5">{index + 1}.</span>
                    بلدية {item.name}
                  </span>
                  <span className="font-mono text-slate-600">
                    {item.count} ملف ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[#006233] to-[#C67D2A]"
                    style={{ width: `${Math.max(item.percentage, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Distribution by Sector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-700" />
                <span>حسب القطاع المختص</span>
              </h3>
              <p className="text-[11px] text-slate-500">نسبة الانشغال بكل قطاع ولائي</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {stats.bySector.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#006233] shrink-0" />
                  <span className="font-medium text-slate-800">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Staff Workload & Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#006233]" />
            <h3 className="text-sm font-bold font-['Changa'] text-slate-900">
              متابعة توزيع أعباء العمل على موظفي الخلية
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('staff')}
            className="text-xs text-[#006233] font-semibold hover:underline"
          >
            إدارة الموظفين ←
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">اسم الموظف</th>
                <th className="py-3 px-4">المصلحة التابع لها</th>
                <th className="py-3 px-4 text-center">الملفات المسندة</th>
                <th className="py-3 px-4 text-center">المعالجة والمنتهية</th>
                <th className="py-3 px-4 text-center">المتأخرة (SLA)</th>
                <th className="py-3 px-4 text-center">نسبة الإنجاز</th>
                <th className="py-3 px-4 text-center">آخر نشاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.filter(e => e.role === 'employee').map((emp) => {
                const total = emp.assignedCount;
                const done = emp.resolvedCount;
                const pct = total > 0 ? Math.round((done / (done + total)) * 100) : 100;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[11px]">
                          {emp.name.split(' ')[0][0]}
                        </div>
                        <span>{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{emp.department}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-700">
                      {emp.assignedCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                      {emp.resolvedCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-red-600">
                      {emp.overdueCount > 0 ? emp.overdueCount : '0'}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-800">{pct}%</span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                      {emp.lastActive}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
