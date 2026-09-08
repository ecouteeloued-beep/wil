import React, { useState, useMemo } from 'react';
import { EnhancedGrievance, SystemUser, GrievanceStatus, GrievancePriority } from '../../types';
import { StatsCard } from './StatsCard';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileEdit, 
  Filter, 
  Inbox, 
  Search, 
  ShieldAlert, 
  SlidersHorizontal, 
  UserCheck 
} from 'lucide-react';

interface EmployeeDashboardViewProps {
  currentUser: SystemUser;
  grievances: EnhancedGrievance[];
  onOpenGrievance: (g: EnhancedGrievance) => void;
  onStartProcessing: (id: string) => void;
  onOpenDraftResponse: (g: EnhancedGrievance) => void;
}

export const EmployeeDashboardView: React.FC<EmployeeDashboardViewProps> = ({
  currentUser,
  grievances,
  onOpenGrievance,
  onStartProcessing,
  onOpenDraftResponse
}) => {
  // Filter only grievances assigned to this employee
  const myGrievances = useMemo(() => {
    return grievances.filter(g => g.assignedToId === currentUser.id);
  }, [grievances, currentUser.id]);

  // Status Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Counters
  const newAssignedCount = myGrievances.filter(g => g.status === 'تم الإسناد').length;
  const inProgressCount = myGrievances.filter(g => g.status === 'قيد المعالجة').length;
  const pendingReviewCount = myGrievances.filter(g => g.status === 'بانتظار المراجعة').length;
  const closedCount = myGrievances.filter(g => g.status === 'مغلق' || g.status === 'تمت المعالجة').length;
  const overdueCount = myGrievances.filter(g => g.isOverdue).length;

  // Filtered List
  const filteredGrievances = useMemo(() => {
    return myGrievances.filter(g => {
      // Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          if (!g.isOverdue) return false;
        } else if (g.status !== statusFilter) {
          return false;
        }
      }

      // Priority
      if (priorityFilter !== 'all' && g.priority !== priorityFilter) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = g.id.toLowerCase().includes(q);
        const matchesCitizen = g.fullName.toLowerCase().includes(q);
        const matchesSubject = g.subject.toLowerCase().includes(q);
        const matchesMunicipality = g.grievanceMunicipality.toLowerCase().includes(q);
        if (!matchesId && !matchesCitizen && !matchesSubject && !matchesMunicipality) {
          return false;
        }
      }

      return true;
    });
  }, [myGrievances, statusFilter, priorityFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredGrievances.length / itemsPerPage) || 1;
  const paginatedItems = filteredGrievances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 text-right">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-[#006233] to-[#0c4b2b] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              فضاء العمل اليومي للموظف
            </span>
            <span className="text-xs text-white/80">• {currentUser.department}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Changa']">
            مرحباً، {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1">
            لديك <span className="font-bold underline">{newAssignedCount + inProgressCount} ملفاً</span> يتطلب عنايتك ومتابعتك الميدانية حالياً.
          </p>
        </div>

        {overdueCount > 0 && (
          <div className="bg-red-500/20 border border-red-300/40 rounded-xl p-3 flex items-center gap-3 backdrop-blur-xs">
            <ShieldAlert className="w-6 h-6 text-red-300 shrink-0" />
            <div className="text-right">
              <span className="text-xs font-bold block text-red-100">تنبيه آجل قانوني:</span>
              <span className="text-[11px] text-white/90">
                يوجد لديك {overdueCount} ملف تجاوزت مهلة المعالجة، يرجى إعطاؤها الأولوية.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatsCard
          title="جديدة مسندة إليّ"
          value={newAssignedCount}
          sublabel="بانتظار مباشرة المعالجة"
          icon={Inbox}
          badge={newAssignedCount > 0 ? { text: 'جديد', variant: 'urgent' } : undefined}
          isActive={statusFilter === 'تم الإسناد'}
          onClick={() => {
            setStatusFilter(statusFilter === 'تم الإسناد' ? 'all' : 'تم الإسناد');
            setCurrentPage(1);
          }}
        />

        <StatsCard
          title="قيد المعالجة"
          value={inProgressCount}
          sublabel="مراسلات وتحريات جارية"
          icon={Clock}
          isActive={statusFilter === 'قيد المعالجة'}
          onClick={() => {
            setStatusFilter(statusFilter === 'قيد المعالجة' ? 'all' : 'قيد المعالجة');
            setCurrentPage(1);
          }}
        />

        <StatsCard
          title="تنتظر مراجعة الرد"
          value={pendingReviewCount}
          sublabel="تم إعداد الرد للمسؤول"
          icon={FileEdit}
          isActive={statusFilter === 'بانتظار المراجعة'}
          onClick={() => {
            setStatusFilter(statusFilter === 'بانتظار المراجعة' ? 'all' : 'بانتظار المراجعة');
            setCurrentPage(1);
          }}
        />

        <StatsCard
          title="الملفات المغلقة"
          value={closedCount}
          sublabel="تم التكفل والرد النهائي"
          icon={CheckCircle2}
          isActive={statusFilter === 'مغلق'}
          onClick={() => {
            setStatusFilter(statusFilter === 'مغلق' ? 'all' : 'مغلق');
            setCurrentPage(1);
          }}
        />

        <StatsCard
          title="متأخرة عن المهلة"
          value={overdueCount}
          sublabel="تجاوزت مهلة 7 أيام"
          icon={ShieldAlert}
          badge={overdueCount > 0 ? { text: 'حرجة', variant: 'urgent' } : undefined}
          isActive={statusFilter === 'overdue'}
          onClick={() => {
            setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue');
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Filter & Search Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold font-['Changa'] text-slate-900">
              قائمة انشغالاتي المسندة
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {filteredGrievances.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="بحث برقم الملف، المواطن، الموضوع..."
                className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006233] bg-white"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">كل الأولويات</option>
              <option value="عاجل">عاجل</option>
              <option value="قصوى">قصوى</option>
              <option value="متوسط">متوسط</option>
              <option value="عادي">عادي</option>
            </select>

            {/* Reset Filters */}
            {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1"
              >
                تفريغ الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {filteredGrievances.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">لا توجد انشغالات مطابقة لمعايير البحث الحالية.</p>
            <p className="text-slate-400 mt-1">جرب تغيير الفلاتر أو تفريغ كلمات البحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">رقم الملف</th>
                  <th className="py-3 px-4">المواطن</th>
                  <th className="py-3 px-4">البلدية والقطاع</th>
                  <th className="py-3 px-4">الموضوع</th>
                  <th className="py-3 px-4 text-center">الأولوية</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراء المتاح</th>
                  <th className="py-3 px-4 text-center">تفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onOpenGrievance(item)}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{item.id}</span>
                        {item.isOverdue && (
                          <span title="متأخر" className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                        )}
                      </div>
                    </td>

                    {/* Citizen */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{item.fullName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.phone}</span>
                    </td>

                    {/* Municipality & Sector */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block whitespace-nowrap">
                        بلدية {item.grievanceMunicipality}
                      </span>
                      <span className="text-[11px] text-slate-500 whitespace-nowrap block">
                        {item.sector}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="py-3.5 px-4 max-w-xs truncate" title={item.subject}>
                      <span className="truncate block">{item.subject}</span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <PriorityBadge priority={item.priority} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {item.status === 'تم الإسناد' ? (
                        <button
                          onClick={() => onStartProcessing(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#006233] text-white text-[11px] font-semibold hover:bg-[#005029] transition-colors inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>بدء المعالجة</span>
                        </button>
                      ) : item.status === 'قيد المعالجة' ? (
                        <button
                          onClick={() => onOpenDraftResponse(item)}
                          className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-[11px] font-semibold hover:bg-orange-700 transition-colors inline-flex items-center gap-1"
                        >
                          <FileEdit className="w-3 h-3" />
                          <span>صياغة الرد</span>
                        </button>
                      ) : item.status === 'بانتظار المراجعة' ? (
                        <span className="text-[11px] text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                          بانتظار اعتماد المسؤول
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          مكتمل المعالجة
                        </span>
                      )}
                    </td>

                    {/* View Button */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenGrievance(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="فتح ملف الانشغال"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              الصفحة {currentPage} من {totalPages} (إجمالي النتائج: {filteredGrievances.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                السابق
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
