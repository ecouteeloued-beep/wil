import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Inbox, MapIcon, BarChart3, Settings, 
  User, LogOut, Menu, X, Bell, Search, ShieldAlert,
  FileClock, MapPin, Building2, UsersRound, AlertTriangle, CheckCircle2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

type Toast = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
};

export const DashboardLayout: React.FC<{ user: SystemUser; onLogout: () => void }> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast Management
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Simulate incoming notifications on mount
  useEffect(() => {
    const timer1 = setTimeout(() => {
      addToast({
        type: 'info',
        title: 'انشغال جديد مسجل',
        message: 'تم استلام انشغال جديد من المواطن أحمد بن علي بخصوص (الإنارة العمومية).'
      });
    }, 2000);

    const timer2 = setTimeout(() => {
      addToast({
        type: 'warning',
        title: 'تنبيه موعد نهائي (Deadline Alert)',
        message: 'الملف رقم WL-2026-000125 اقترب من انتهاء المدة القانونية للمعالجة (بقي 24 ساعة).'
      });
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

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

  const activeMenuLabel = visibleMenuItems.find(m => m.id === currentView)?.label || '';

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex" dir="rtl">
      
      {/* Toast Notifications Container */}
      <div className="fixed top-24 left-6 z-[9999] flex flex-col gap-4 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 flex items-start gap-4 overflow-hidden relative"
            >
              <div className={`absolute right-0 top-0 bottom-0 w-1 ${
                toast.type === 'info' ? 'bg-blue-500' : 
                toast.type === 'warning' ? 'bg-amber-500' : 
                toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
              
              <div className="shrink-0 mt-0.5">
                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold font-changa text-gray-900 text-sm mb-1">{toast.title}</h4>
                <p className="text-xs font-tajawal text-gray-600 leading-relaxed">{toast.message}</p>
              </div>
              
              <button onClick={() => removeToast(toast.id)} className="shrink-0 text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-50">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: isSidebarOpen ? 0 : '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-gray-100 lg:relative lg:translate-x-0 flex flex-col transition-transform shadow-sm lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006233] flex items-center justify-center shadow-md shadow-[#006233]/20">
              <img src="/dz-seal.svg" alt="شعار الجمهورية" className="w-6 h-6 brightness-0 invert" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <div>
              <h1 className="font-changa font-bold text-[#006233] text-lg leading-tight">ولاية الوادي</h1>
              <span className="text-[10px] text-gray-500 font-tajawal uppercase tracking-wider">البوابة الإدارية</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-6 flex flex-col gap-1.5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-gray-400 font-changa px-4 mb-2">القائمة الرئيسية</div>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-tajawal text-sm transition-all group ${
                  isActive 
                    ? 'bg-emerald-50 text-[#006233] font-bold shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#006233]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#006233]">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-tajawal font-bold text-sm text-gray-900 truncate">{user.name}</p>
              <p className="font-tajawal text-[10px] text-gray-500 truncate uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 bg-white border border-gray-200 hover:bg-red-50 hover:text-[#D21034] hover:border-red-100 rounded-xl font-tajawal text-sm font-bold transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden sm:block">
              <h2 className="font-changa font-bold text-xl text-gray-900">{activeMenuLabel}</h2>
              <div className="text-xs text-gray-500 font-tajawal mt-1 flex items-center gap-2">
                <span>الفضاء الإداري</span>
                <span className="text-gray-300">/</span>
                <span className="text-[#006233] font-bold">{activeMenuLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-full w-72 focus-within:ring-2 focus-within:ring-[#006233]/20 focus-within:border-[#006233] transition-all shadow-sm">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="بحث برقم الملف، الاسم..."
                className="bg-transparent border-none outline-none text-sm font-tajawal w-full text-gray-700 placeholder:text-gray-400"
              />
            </div>
            
            <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

            <button className="relative p-2.5 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#D21034] rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full max-w-7xl mx-auto"
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
