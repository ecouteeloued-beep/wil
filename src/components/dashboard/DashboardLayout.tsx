import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Inbox, MapIcon, BarChart3, Settings, 
  User, LogOut, Menu, X, Bell, Search, ShieldAlert,
  FileClock, MapPin, Building2, UsersRound, AlertTriangle, CheckCircle2, Info,
  Printer, Download, Shield, Sparkles, ExternalLink, Calendar, Clock, Award, FileText
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
  const [showExecutiveReportModal, setShowExecutiveReportModal] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  // Live Algerian clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
        title: 'انشغال وارد جديد من بلدية قمار',
        message: 'تم إيداع عريضة جديدة للمواطن (س. مسعود) بخصوص تهيئة شبكة المياه الصالحة للشرب.'
      });
    }, 2500);

    const timer2 = setTimeout(() => {
      addToast({
        type: 'warning',
        title: 'تنبيه الأجل القانوني (Deadline Alert)',
        message: 'الملف رقم WL-2026-000125 بدائرة حاسي خليفة اقترب من انقضاء مهلة الرد (بقي 24 ساعة).'
      });
    }, 6500);

    const handleComplaintsUpdated = (e: any) => {
      if (e?.detail?.complaint) {
        addToast({
          type: 'success',
          title: 'عريضة جديدة واردة عبر البوابة الرقمية',
          message: `تم تسجيل الانشغال رقم ${e.detail.complaint.id} للمواطن (${e.detail.complaint.fullName}) ببلدية ${e.detail.complaint.grievanceMunicipality || 'الوادي'}.`
        });
      }
    };

    window.addEventListener('complaints_updated', handleComplaintsUpdated);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('complaints_updated', handleComplaintsUpdated);
    };
  }, []);

  const menuSections: {
    category: string;
    items: { id: DashboardView; icon: any; label: string; badge?: string; badgeColor?: string; roles?: string[] }[];
  }[] = [
    {
      category: 'المراقبة والاستشراف الولائي',
      items: [
        { id: 'overview', icon: LayoutDashboard, label: 'لوحة القيادة المركزية' },
        { id: 'map', icon: MapIcon, label: 'الخريطة التفاعلية للبلديات (22)', badge: 'مباشر', badgeColor: 'bg-emerald-500' },
        { id: 'reports', icon: BarChart3, label: 'التقارير التحليلية والمؤشرات' },
      ]
    },
    {
      category: 'إدارة ومعالجة العرائض',
      items: [
        { id: 'inbox', icon: Inbox, label: 'صندوق الانشغالات المركزي', badge: '1,245', badgeColor: 'bg-[#006233]' },
        { id: 'citizens', icon: UsersRound, label: 'سجل المواطنين والمتابعة' },
        { id: 'departments', icon: Building2, label: 'المصالح والهيكل الإداري', roles: ['super_admin', 'admin'] },
        { id: 'municipalities', icon: MapPin, label: 'دليل الدوائر والبلديات', roles: ['super_admin', 'admin'] },
      ]
    },
    {
      category: 'الحوكمة والأمن الرقمي',
      items: [
        { id: 'audit_log', icon: FileClock, label: 'سجل التدقيق الرقمي (Audit Log)', roles: ['super_admin', 'admin'] },
        { id: 'users', icon: ShieldAlert, label: 'إدارة المستخدمين والمفتشين', roles: ['super_admin'] },
        { id: 'permissions', icon: ShieldAlert, label: 'إدارة الصلاحيات (RBAC)', roles: ['super_admin'] },
        { id: 'settings', icon: Settings, label: 'إعدادات المنظومة والربط', roles: ['super_admin'] },
      ]
    }
  ];

  const handlePrintExecutiveReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-tajawal text-gray-900 selection:bg-[#006233] selection:text-white" dir="rtl">
      
      {/* Top Sovereign Republic Header Ribbon */}
      <div className="bg-[#04190c] text-white px-4 sm:px-6 py-2 border-b border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-amber-400/40">
            <img src="/assets/algeria-emblem.png" alt="شعار الدولة" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/assets/official-ministry-logo.jpg'; }} />
          </div>
          <span className="font-changa font-bold text-amber-300">الجمهورية الجزائرية الديمقراطية الشعبية</span>
          <span className="hidden md:inline text-white/30">•</span>
          <span className="hidden md:inline text-emerald-200">ولاية الوادي — ديوان الوالي | خلية الإصغاء والوساطة</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-[11px]">المنظومة مؤمنة (22 بلدية متصلة)</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 text-gray-300 font-mono text-[11px] bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentTime || '09:45:00'}</span>
          </div>

          <a 
            href="/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 hover:underline"
          >
            <span>بوابة المواطن</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Wrapper: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Toast Notifications */}
        <div className="fixed top-20 left-4 sm:left-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3.5 overflow-hidden relative"
              >
                <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${
                  toast.type === 'info' ? 'bg-[#006233]' : 
                  toast.type === 'warning' ? 'bg-amber-500' : 
                  toast.type === 'success' ? 'bg-emerald-500' : 'bg-[#D21034]'
                }`} />
                
                <div className="shrink-0 mt-0.5">
                  {toast.type === 'info' && <Info className="w-5 h-5 text-[#006233]" />}
                  {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-[#D21034]" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold font-changa text-gray-900 text-sm mb-1">{toast.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{toast.message}</p>
                </div>
                
                <button onClick={() => removeToast(toast.id)} className="shrink-0 text-gray-400 hover:text-gray-900 p-1 rounded-lg">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sovereign Sidebar */}
        <aside
          className={`fixed inset-y-0 right-0 z-50 w-72 bg-gradient-to-b from-[#071a10] via-[#092215] to-[#041109] text-white lg:static flex flex-col transition-transform duration-300 border-l border-emerald-900/40 shadow-2xl ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Official Brand */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-white/10 shrink-0 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 p-1.5 border border-amber-400/30 flex items-center justify-center shadow-md">
                <img 
                  src="/assets/algeria-emblem.png" 
                  alt="شعار الولاية" 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/assets/official-ministry-logo.jpg'; }}
                />
              </div>
              <div>
                <h1 className="font-changa font-black text-amber-300 text-base leading-tight">ولاية الوادي</h1>
                <span className="text-[11px] text-emerald-300/80 font-tajawal font-medium">القيادة الإدارية المركزية</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Categories */}
          <div className="px-3 py-5 flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar">
            {menuSections.map((section, sIdx) => {
              const visibleItems = section.items.filter(item => 
                !item.roles || item.roles.includes(user.role) || user.role === 'wali'
              );
              if (visibleItems.length === 0) return null;

              return (
                <div key={sIdx} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-emerald-400/70 font-changa px-3 uppercase tracking-wider">
                    {section.category}
                  </div>

                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-tajawal text-sm transition-all text-right group ${
                          isActive
                            ? 'bg-[#006233] text-white font-bold shadow-lg shadow-[#006233]/40 border border-emerald-400/30'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-amber-300' : 'text-emerald-400/80 group-hover:text-emerald-300'
                          }`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full text-white font-bold ${
                            isActive ? 'bg-black/30' : item.badgeColor || 'bg-white/10'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* User Profile Card & Sign out */}
          <div className="p-4 border-t border-white/10 bg-black/30 shrink-0">
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-changa font-bold text-sm text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="truncate">{user.roleTitle || user.department}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-[#D21034]/20 border border-white/10 hover:border-[#D21034]/40 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-[#D21034]" />
              <span>تسجيل الخروج الآمن</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          {/* Top Command Bar */}
          <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="font-changa font-bold text-lg text-[#006233] leading-tight">
                  {menuSections.flatMap(s => s.items).find(i => i.id === currentView)?.label || 'لوحة التحكم'}
                </h2>
                <span className="text-[11px] text-gray-500 font-tajawal hidden sm:inline">
                  ديوان والي ولاية الوادي — نظام الوساطة والإصغاء
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Executive Report Button */}
              <button
                onClick={() => setShowExecutiveReportModal(true)}
                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-[#006233] hover:bg-[#004d28] text-white text-xs font-changa font-bold rounded-xl shadow-sm transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>تقرير الوالي التنفيذي</span>
              </button>

              {/* Quick Search */}
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl w-60 focus-within:w-72 focus-within:border-[#006233] transition-all">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث سريع (رقم الملف، المواطن)..."
                  className="bg-transparent border-none outline-none text-xs w-full text-gray-700 placeholder:text-gray-400"
                />
              </div>

              {/* Notifications Dropdown Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                  className="relative p-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                  title="الإشعارات والتنبيهات"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#D21034] rounded-full" />
                </button>

                {showNotificationsMenu && (
                  <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="font-changa font-bold text-xs text-gray-900">تنبيهات المنظومة</span>
                      <span className="text-[10px] bg-[#D21034]/10 text-[#D21034] px-2 py-0.5 rounded-full font-bold">2 غير مقروءة</span>
                    </div>
                    <div className="py-2 space-y-2 text-xs">
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="font-bold text-amber-900">تنبيه مهلة قانونية (24 ساعة)</p>
                        <p className="text-amber-700 text-[11px]">الملف رقم WL-2026-000125 بحاجة لرد رسمي.</p>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="font-bold text-emerald-900">انشغال وارد جديد</p>
                        <p className="text-emerald-700 text-[11px]">انشغال جديد من بلدية قمار بخصوص شبكة المياه.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content Stage */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentView === 'overview' && (
                    <OverviewStats 
                      user={user} 
                      addToast={addToast} 
                      onNavigateTab={(tab) => setCurrentView(tab)} 
                      onOpenExecutiveReport={() => setShowExecutiveReportModal(true)} 
                    />
                  )}
                  {currentView === 'inbox' && <InboxView user={user} addToast={addToast} />}
                  {currentView === 'citizens' && <CitizensView user={user} addToast={addToast} />}
                  {currentView === 'map' && <MapView />}
                  {currentView === 'reports' && (
                    <ReportsView 
                      user={user} 
                      addToast={addToast} 
                      onOpenExecutiveReport={() => setShowExecutiveReportModal(true)} 
                    />
                  )}
                  {currentView === 'users' && <UsersView currentUser={user} addToast={addToast} />}
                  {currentView === 'permissions' && <PermissionsView user={user} addToast={addToast} />}
                  {currentView === 'departments' && <DepartmentsView user={user} addToast={addToast} />}
                  {currentView === 'municipalities' && <MunicipalitiesView user={user} addToast={addToast} />}
                  {currentView === 'audit_log' && <AuditLogView user={user} addToast={addToast} />}
                  {currentView === 'settings' && <SettingsView user={user} addToast={addToast} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* EXECUTIVE OFFICIAL BRIEFING MODAL (PDF Ready) */}
      {showExecutiveReportModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-300 max-h-[90vh] flex flex-col">
            
            {/* Modal Actions Bar */}
            <div className="bg-[#0b2b17] text-white px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <span className="font-changa font-bold text-sm">معاينة تقرير الوالي التنفيذي الرسمي</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintExecutiveReport}
                  className="px-3.5 py-1.5 bg-[#006233] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة رسمية (PDF)</span>
                </button>
                <button
                  onClick={() => setShowExecutiveReportModal(false)}
                  className="text-gray-300 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-8 overflow-y-auto font-tajawal text-gray-900 space-y-6 bg-white printable-area">
              
              {/* Official Algerian Republic Header */}
              <div className="text-center border-b-2 border-[#006233] pb-6">
                <h3 className="font-changa font-bold text-base text-gray-900">الجمهورية الجزائرية الديمقراطية الشعبية</h3>
                <h4 className="font-changa font-bold text-sm text-[#006233] mt-1">وزارة الداخلية والجماعات المحلية والتهيئة العمرانية</h4>
                <div className="flex items-center justify-center gap-4 my-3">
                  <div className="w-14 h-14">
                    <img src="/assets/algeria-emblem.png" alt="شعار الجمهورية" className="w-full h-full object-contain mx-auto" />
                  </div>
                </div>
                <h2 className="font-changa font-black text-xl text-gray-900">ولاية الوادي — ديوان الوالي</h2>
                <p className="text-xs text-gray-500 mt-1 font-mono">خلية الإصغاء والوساطة الإدارية | مرجع الوثيقة: DZ-39-SEC-2026</p>
              </div>

              {/* Title & Date */}
              <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <span className="font-bold">الموضوع: </span>
                  <span className="font-changa font-bold text-gray-900">تقرير الموقف الولائي الشامل لمعالجة انشغالات المواطنين</span>
                </div>
                <div className="text-gray-600 font-mono">
                  حرر بالوادي في: {new Date().toLocaleDateString('ar-DZ')}
                </div>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="block text-2xl font-black font-mono text-[#006233]">1,245</span>
                  <span className="text-xs text-gray-700 font-bold">إجمالي العرائض</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="block text-2xl font-black font-mono text-blue-800">881</span>
                  <span className="text-xs text-gray-700 font-bold">تمت تسويتها (71%)</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="block text-2xl font-black font-mono text-amber-800">312</span>
                  <span className="text-xs text-gray-700 font-bold">قيد المعالجة</span>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <span className="block text-2xl font-black font-mono text-[#D21034]">18</span>
                  <span className="text-xs text-gray-700 font-bold">ملفات متأخرة</span>
                </div>
              </div>

              {/* Narrative Summary */}
              <div className="text-sm leading-relaxed space-y-2 text-gray-800">
                <h5 className="font-changa font-bold text-gray-900 text-sm border-r-4 border-[#006233] pr-2">خلاصة المتابعة الميدانية:</h5>
                <p>
                  بناءً على تعليمات السيد والي ولاية الوادي المتعلقة بوجوب الرد على كافة الانشغالات في آجال أقصاها 15 يوماً، سجلت المنصة الرقمية تفاعلاً إيجابياً من 22 بلدية، مع انخفاض متوسط مدة الرد إلى 3.4 أيام.
                </p>
                <p className="text-xs text-[#D21034] font-bold">
                  توجيه: يتعين على رؤساء دوائر حاسي خليفة والدبيلة تسريع دراسة الملفات ذات الطابع العقاري والسكن الريفي العالقة.
                </p>
              </div>

              {/* Signatures and Official Stamp */}
              <div className="pt-8 border-t border-gray-200 flex items-center justify-between text-center text-xs">
                <div>
                  <p className="font-bold text-gray-700">رئيس خلية الإصغاء والوساطة</p>
                  <p className="text-gray-400 mt-8">(تأشيرة ومصادقة)</p>
                </div>

                <div className="w-24 h-24 border-2 border-dashed border-[#006233]/40 rounded-full flex items-center justify-center p-2 text-center text-[10px] text-[#006233] font-bold">
                  ختم ولاية الوادي الرسمي
                </div>

                <div>
                  <p className="font-bold text-gray-700">والي ولاية الوادي</p>
                  <p className="text-gray-400 mt-8">(المسؤول الأول للولاية)</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
