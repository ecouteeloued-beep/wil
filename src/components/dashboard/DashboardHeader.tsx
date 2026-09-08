import React from 'react';
import { SystemUser } from '../../types';
import { 
  Bell, 
  ChevronDown, 
  ExternalLink, 
  Menu, 
  Shield, 
  UserCheck, 
  Users 
} from 'lucide-react';

interface DashboardHeaderProps {
  currentUser: SystemUser;
  users: SystemUser[];
  onSwitchUser: (userId: string) => void;
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onExitDashboard: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  users,
  onSwitchUser,
  onToggleMobileSidebar,
  onOpenNotifications,
  unreadNotifsCount,
  onExitDashboard
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-20 shadow-2xs text-right">
      
      {/* Left (RTL Right): Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006233]" />
            <span className="text-xs font-semibold text-slate-500">
              منظومة الرقابة والتكفل — ولاية الوادي
            </span>
          </div>
          <span className="text-[11px] text-[#C67D2A] font-bold block">
            {currentUser.role === 'supervisor' 
              ? 'لوحة إدارة ومتابعة الخلية (Supervisor)' 
              : currentUser.role === 'employee'
              ? 'لوحة معالجة الانشغالات (Employee)'
              : currentUser.role === 'viewer'
              ? 'لوحة المعاينة والتفتيش (Viewer)'
              : 'لوحة الإدارة المركزية العامة (Super Admin)'}
          </span>
        </div>
      </div>

      {/* Right (RTL Left): Role Switcher & User & Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Quick Role Switcher (Ideal for testing both Employee & Supervisor views!) */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 rounded-xl px-2.5 py-1 border border-slate-200 text-xs">
          <Users className="w-3.5 h-3.5 text-[#C67D2A] shrink-0" />
          <span className="text-[11px] text-slate-500 hidden md:inline font-medium">
            تبديل الحساب:
          </span>
          <select
            value={currentUser.id}
            onChange={(e) => onSwitchUser(e.target.value)}
            className="bg-transparent border-0 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === 'supervisor' ? 'مسؤول الخلية' : u.role === 'employee' ? 'موظف معالجة' : u.role === 'viewer' ? 'مراقب' : 'Super Admin'})
              </option>
            ))}
          </select>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="الإشعارات والتنبيهات"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center font-mono ring-2 ring-white">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* Exit to Citizen Portal */}
        <button
          onClick={onExitDashboard}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          title="العودة لبوابة المواطن"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C67D2A]" />
          <span>بوابة المواطن</span>
        </button>

      </div>

    </header>
  );
};
