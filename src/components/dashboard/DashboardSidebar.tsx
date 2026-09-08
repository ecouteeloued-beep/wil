import React from 'react';
import { SystemUser, UserRole } from '../../types';
import { 
  AlertCircle, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Compass, 
  FileEdit, 
  FileText, 
  History, 
  Home, 
  Inbox, 
  LayoutDashboard, 
  LogOut, 
  Map, 
  Send, 
  Settings, 
  ShieldAlert, 
  UserCheck, 
  Users, 
  X 
} from 'lucide-react';

interface DashboardSidebarProps {
  currentUser: SystemUser;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unassignedCount: number;
  newAssignedCount: number;
  inProgressCount: number;
  overdueCount: number;
  onExitDashboard: () => void;
  onLogout?: () => void;
}

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  unassignedCount,
  newAssignedCount,
  inProgressCount,
  overdueCount,
  onExitDashboard,
  onLogout
}) => {
  const isEmployee = currentUser.role === 'employee';
  const isSupervisor = currentUser.role === 'supervisor';
  const isSuperAdmin = currentUser.role === 'super_admin';

  const employeeMenuItems: SidebarMenuItem[] = [
    { id: 'employee_home', label: 'الرئيسية (مهامي)', icon: LayoutDashboard },
    { id: 'my_grievances', label: 'انشغالاتي المسندة', icon: FileText },
    { id: 'new_assigned', label: 'الجديدة المسندة', icon: Inbox, badge: newAssignedCount > 0 ? newAssignedCount : undefined, badgeColor: 'bg-indigo-100 text-indigo-700' },
    { id: 'in_progress', label: 'قيد المعالجة', icon: Clock, badge: inProgressCount > 0 ? inProgressCount : undefined, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'pending_review', label: 'تنتظر مراجعة الرد', icon: FileEdit },
    { id: 'closed', label: 'المغلقة والمسواة', icon: CheckCircle2 },
  ];

  const supervisorMenuItems: SidebarMenuItem[] = [
    { id: 'supervisor_home', label: 'الرئيسية (التقرير التنفيذي)', icon: LayoutDashboard },
    { id: 'all_grievances', label: 'جميع الانشغالات', icon: FileText },
    { id: 'unassigned', label: 'الانشغالات الجديدة غير المسندة', icon: Inbox, badge: unassignedCount > 0 ? unassignedCount : undefined, badgeColor: 'bg-sky-100 text-sky-800 font-bold' },
    { id: 'overdue', label: 'المتأخرة عن المهلة (SLA)', icon: ShieldAlert, badge: overdueCount > 0 ? overdueCount : undefined, badgeColor: 'bg-red-100 text-red-700 font-bold' },
    { id: 'staff', label: 'الموظفون والمستخدمون', icon: Users },
    { id: 'reports', label: 'التقارير والإحصائيات', icon: BarChart3 },
    { id: 'audit_log', label: 'سجل العمليات (Audit Log)', icon: History },
    { id: 'settings', label: 'إعدادات الخلية', icon: Settings },
  ];

  const superAdminMenuItems: SidebarMenuItem[] = [
    { 
      id: 'super_admin_map', 
      label: 'خريطة ولاية الوادي (GIS)', 
      icon: Compass, 
      badge: 'خاص', 
      badgeColor: 'bg-[#C67D2A] text-white font-bold text-[10px]' 
    },
    { id: 'supervisor_home', label: 'الرئيسية (التقرير التنفيذي)', icon: LayoutDashboard },
    { id: 'all_grievances', label: 'كافة انشغالات الولاية', icon: FileText },
    { id: 'unassigned', label: 'الانشغالات غير المسندة', icon: Inbox, badge: unassignedCount > 0 ? unassignedCount : undefined, badgeColor: 'bg-sky-100 text-sky-800 font-bold' },
    { id: 'overdue', label: 'المتأخرة ولائياً (SLA)', icon: ShieldAlert, badge: overdueCount > 0 ? overdueCount : undefined, badgeColor: 'bg-red-100 text-red-700 font-bold' },
    { id: 'staff', label: 'المستخدمون والمسؤولون', icon: Users },
    { id: 'reports', label: 'التقارير والإحصائيات الشاملة', icon: BarChart3 },
    { id: 'audit_log', label: 'سجل الرقابة العامة (Audit Log)', icon: History },
    { id: 'settings', label: 'الإعدادات العامة للمنظومة', icon: Settings },
  ];

  const menuItems = isEmployee
    ? employeeMenuItems
    : isSuperAdmin
    ? superAdminMenuItems
    : supervisorMenuItems;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1C2B33] text-white select-none text-right">
      
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/15 shrink-0">
            <img
              src="/emblem-algeria.svg"
              alt="شعار الجمهورية"
              className="w-full h-full object-contain filter drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="text-[10px] text-[#C67D2A] font-bold block uppercase tracking-wider">
              ولاية الوادي
            </span>
            <h2 className="text-sm font-bold font-['Changa'] text-white leading-tight">
              خلية الإصغاء والتكفل
            </h2>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Role Indicator Banner */}
      <div className="px-4 py-3 bg-white/5 border-b border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60 font-medium">مستوى الصلاحية:</span>
          <span className="px-2 py-0.5 rounded-md bg-[#006233] text-white font-bold text-[10.5px]">
            {currentUser.role === 'supervisor' 
              ? 'مسؤول الخلية (0000)' 
              : currentUser.role === 'employee' 
              ? 'موظف معالجة (1111)' 
              : 'Super Admin (1234)'}
          </span>
        </div>
        <p className="text-[11px] text-white/80 font-bold truncate mt-1">
          {currentUser.name}
        </p>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="text-[10px] font-bold text-white/40 px-3 py-1.5 uppercase tracking-wider">
          {isEmployee ? 'مهام الموظف' : isSuperAdmin ? 'الرقابة العامة والخريطة' : 'إدارة الخلية والمتابعة'}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#006233] text-white shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/60'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-white/20 text-white font-mono'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Return / Exit / Logout Buttons */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/80 hover:text-red-300 text-xs font-semibold transition-colors border border-white/10"
            title="تسجيل الخروج والعودة لشاشة رمز PIN"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>تسجيل الخروج (/admin)</span>
          </button>
        )}
        <button
          onClick={onExitDashboard}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
        >
          <span className="text-[#C67D2A]">←</span>
          <span>العودة لبوابة المواطن</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Always Visible on Desktop) */}
      <aside className="hidden lg:block w-64 shrink-0 border-l border-slate-200 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Visible when toggled on mobile) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
