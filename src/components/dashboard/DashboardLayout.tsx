import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Inbox, 
  Map as MapIcon, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  X,
  User,
  Bell,
  Search,
  UsersRound,
  ShieldAlert,
  Building2,
  MapPin,
  FileClock
} from 'lucide-react';
import { OverviewStats } from './OverviewStats';
import { InboxView } from './InboxView';
import { MapView } from './MapView';
import { ReportsView } from './ReportsView';
import { SettingsView } from './SettingsView';
import { AuditLogView } from './AuditLogView';
import { UsersView } from './UsersView';
import { CitizensView } from './CitizensView';
import { PermissionsView } from './PermissionsView';
import { DepartmentsView } from './DepartmentsView';
import { MunicipalitiesView } from './MunicipalitiesView';
import { SystemUser } from '../../types';

type DashboardView = 'overview' | 'inbox' | 'map' | 'reports' | 'users' | 'citizens' | 'permissions' | 'departments' | 'municipalities' | 'audit_log' | 'settings';

export const DashboardLayout: React.FC<{ user: SystemUser; onLogout: () => void }> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems: { id: DashboardView; icon: any; label: string; roles?: string[] }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'الرئيسية (الإحصائيات)' },
    { id: 'inbox', icon: Inbox, label: 'صندوق الانشغالات' },
    { id: 'citizens', icon: UsersRound, label: 'سجل المواطنين' },
    { id: 'map', icon: MapIcon, label: 'الخريطة التفاعلية' },
    { id: 'reports', icon: BarChart3, label: 'التقارير والإحصائيات' },
    { id: 'users', icon: ShieldAlert, label: 'إدارة المستخدمين', roles: ['super_admin'] },
    { id: 'permissions', icon: ShieldAlert, label: 'إدارة الصلاحيات', roles: ['super_admin'] },
    { id: 'departments', icon: Building2, label: 'الهيكل والمصالح', roles: ['super_admin', 'admin'] },
    { id: 'municipalities', icon: MapPin, label: 'البلديات والقطاعات', roles: ['super_admin', 'admin'] },
    { id: 'audit_log', icon: FileClock, label: 'سجل العمليات (Audit Log)', roles: ['super_admin', 'admin'] },
    { id: 'settings', icon: Settings, label: 'إعدادات النظام', roles: ['super_admin'] },
  ];

  // Filter menu based on user role
  const visibleMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user.role) || user.role === 'wali'
  );

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: isSidebarOpen ? 0 : '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-gray-200 lg:relative lg:translate-x-0 flex flex-col transition-transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#006233] flex items-center justify-center">
              <img src="/dz-seal.svg" alt="شعار الجمهورية" className="w-6 h-6 brightness-0 invert" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <div>
              <h1 className="font-changa font-bold text-[#006233] text-lg leading-tight">ولاية الوادي</h1>
              <span className="text-[10px] text-gray-500 font-tajawal">البوابة الرقمية للانشغالات</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-1 flex-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as DashboardView);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-tajawal text-sm transition-all ${
                  isActive 
                    ? 'bg-[#006233] text-white font-bold shadow-md shadow-[#006233]/20' 
                    : 'text-gray-600 hover:bg-green-50 hover:text-[#006233]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#006233]">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-tajawal font-bold text-sm text-gray-900 truncate">{user.name}</p>
              <p className="font-tajawal text-xs text-gray-500 truncate uppercase">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[#D21034] hover:bg-red-50 rounded-lg font-tajawal text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-64">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="بحث برقم الملف أو اسم المواطن..."
                className="bg-transparent border-none outline-none text-sm font-tajawal w-full text-gray-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D21034] rounded-full border border-white" />
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {currentView === 'overview' && <OverviewStats />}
              {currentView === 'inbox' && <InboxView />}
              {currentView === 'citizens' && <CitizensView />}
              {currentView === 'map' && <MapView />}
              {currentView === 'reports' && <ReportsView />}
              {currentView === 'users' && <UsersView />}
              {currentView === 'permissions' && <PermissionsView />}
              {currentView === 'departments' && <DepartmentsView />}
              {currentView === 'municipalities' && <MunicipalitiesView />}
              {currentView === 'audit_log' && <AuditLogView />}
              {currentView === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
