import React, { useState, useMemo } from 'react';
import { EnhancedGrievance, SystemUser, GrievancePriority, GrievanceStatus } from '../../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { MUNICIPALITIES, DAIRAS } from '../../data';
import { AdminService } from '../../services/adminService';
import { 
  Download, 
  Eye, 
  Filter, 
  Inbox, 
  RotateCcw, 
  Search, 
  Send, 
  SlidersHorizontal 
} from 'lucide-react';

interface SupervisorGrievancesViewProps {
  grievances: EnhancedGrievance[];
  employees: SystemUser[];
  onOpenGrievance: (g: EnhancedGrievance) => void;
  onOpenAssign: (g: EnhancedGrievance) => void;
  onOpenApproveClose: (g: EnhancedGrievance) => void;
  initialFilter?: string;
}

export const SupervisorGrievancesView: React.FC<SupervisorGrievancesViewProps> = ({
  grievances,
  employees,
  onOpenGrievance,
  onOpenAssign,
  onOpenApproveClose,
  initialFilter
}) => {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'all');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('all');
  const [dairaFilter, setDairaFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Filter logic
  const filtered = useMemo(() => {
    return grievances.filter((g) => {
      // Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          if (!g.isOverdue) return false;
        } else if (statusFilter === 'unassigned') {
          if (g.status !== 'جديد' && g.assignedToId) return false;
        } else if (g.status !== statusFilter) {
          return false;
        }
      }

      // Municipality
      if (municipalityFilter !== 'all' && g.grievanceMunicipality !== municipalityFilter) {
        return false;
      }

      // Daira
      if (dairaFilter !== 'all' && g.grievanceDaira !== dairaFilter) {
        return false;
      }

      // Employee
      if (employeeFilter !== 'all') {
        if (employeeFilter === 'none') {
          if (g.assignedToId) return false;
        } else if (g.assignedToId !== employeeFilter) {
          return false;
        }
      }

      // Priority
      if (priorityFilter !== 'all' && g.priority !== priorityFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = g.id.toLowerCase().includes(q);
        const matchesCitizen = g.fullName.toLowerCase().includes(q);
        const matchesSubject = g.subject.toLowerCase().includes(q);
        const matchesPhone = g.phone.toLowerCase().includes(q);
        if (!matchesId && !matchesCitizen && !matchesSubject && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [
    grievances, 
    statusFilter, 
    municipalityFilter, 
    dairaFilter, 
    employeeFilter, 
    priorityFilter, 
    searchQuery
  ]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMunicipalityFilter('all');
    setDairaFilter('all');
    setEmployeeFilter('all');
    setPriorityFilter('all');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    AdminService.exportGrievancesCSV(filtered);
  };

  return (
    <div className="space-y-5 text-right">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-['Changa'] text-slate-900">
            إدارة ومتابعة كافة انشغالات المواطنين
          </h1>
          <p className="text-xs text-slate-500">
            قاعدة البيانات المركزية لجميع العرائض المودعة عبر بلديات ولاية الوادي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>تصدير البيانات (CSV)</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Box */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="بحث برقم الملف، المواطن، الهاتف..."
              className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006233] bg-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">كافة الحالات</option>
              <option value="جديد">جديد (غير مسند)</option>
              <option value="تم الإسناد">تم الإسناد</option>
              <option value="قيد المعالجة">قيد المعالجة</option>
              <option value="بانتظار معلومات">بانتظار معلومات</option>
              <option value="بانتظار المراجعة">بانتظار المراجعة</option>
              <option value="تمت المعالجة">تمت المعالجة</option>
              <option value="مغلق">مغلق ومسوى</option>
              <option value="overdue">متأخرة فقط (SLA)</option>
            </select>
          </div>

          {/* Municipality Filter */}
          <div>
            <select
              value={municipalityFilter}
              onChange={(e) => {
                setMunicipalityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">كافة البلديات (22)</option>
              {MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  بلدية {m}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Employee Filter */}
          <div>
            <select
              value={employeeFilter}
              onChange={(e) => {
                setEmployeeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">كافة الموظفين</option>
              <option value="none">غير مسند لأي موظف</option>
              {employees.filter(e => e.role === 'employee').map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">كافة الأولويات</option>
              <option value="عاجل">عاجل</option>
              <option value="قصوى">قصوى</option>
              <option value="متوسط">متوسط</option>
              <option value="عادي">عادي</option>
            </select>
          </div>

        </div>

        {/* Filter Summary & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            نتائج التصفية: <strong className="text-slate-900 font-mono">{filtered.length}</strong> ملف
          </span>
          <button
            onClick={resetFilters}
            className="text-xs text-slate-600 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">لا توجد انشغالات مطابقة لمعايير البحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">رقم الملف</th>
                  <th className="py-3 px-4">المواطن</th>
                  <th className="py-3 px-4">البلدية والقطاع</th>
                  <th className="py-3 px-4">الموضوع</th>
                  <th className="py-3 px-4">الموظف المسند إليه</th>
                  <th className="py-3 px-4 text-center">الأولوية</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">تاريخ الإيداع</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => onOpenGrievance(item)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{item.id}</span>
                        {item.isOverdue && (
                          <span title="تجاوز المهلة" className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{item.fullName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.phone}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800 block">
                        بلدية {item.grievanceMunicipality}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {item.sector}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate" title={item.subject}>
                      <span className="truncate block font-medium">{item.subject}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.assignedToName ? (
                        <span className="text-slate-800 font-medium">{item.assignedToName}</span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                          غير مسند
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <PriorityBadge priority={item.priority} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {item.createdAt.split('T')[0]}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {!item.assignedToId && (
                          <button
                            onClick={() => onOpenAssign(item)}
                            className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-semibold border border-indigo-200"
                            title="إسناد لموظف"
                          >
                            إسناد
                          </button>
                        )}

                        {item.status === 'بانتظار المراجعة' && (
                          <button
                            onClick={() => onOpenApproveClose(item)}
                            className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-semibold border border-emerald-200"
                            title="اعتماد وغلق"
                          >
                            اعتماد
                          </button>
                        )}

                        <button
                          onClick={() => onOpenGrievance(item)}
                          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="معاينة الملف"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              الصفحة {currentPage} من {totalPages} (إجمالي النتائج: {filtered.length})
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
