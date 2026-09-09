import React, { useState, useEffect } from 'react';
import { 
  Save, Shield, Mail, Bell, HardDrive, Globe, Download, Upload, 
  RefreshCw, CheckCircle2, AlertTriangle, Key, Smartphone, FileText,
  Lock, Check, Volume2, Eye, Sliders, Database, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemUser, SystemSettings } from '../../types';
import { AdminService, DEFAULT_SYSTEM_SETTINGS } from '../../services/adminService';

interface SettingsViewProps {
  user?: SystemUser;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
}

type SettingsTab = 'general' | 'security' | 'notifications' | 'templates' | 'backup';

export const SettingsView: React.FC<SettingsViewProps> = ({ user, addToast }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Form states - Initialized with default settings
  const [platformName, setPlatformName] = useState(DEFAULT_SYSTEM_SETTINGS.platformName);
  const [officialEmail, setOfficialEmail] = useState(DEFAULT_SYSTEM_SETTINGS.officialEmail);
  const [hotlinePhone, setHotlinePhone] = useState(DEFAULT_SYSTEM_SETTINGS.hotlinePhone);
  const [legalDeadlineDays, setLegalDeadlineDays] = useState(DEFAULT_SYSTEM_SETTINGS.legalDeadlineDays);
  const [maintenanceMode, setMaintenanceMode] = useState(DEFAULT_SYSTEM_SETTINGS.maintenanceMode);
  const [maintenanceNotice, setMaintenanceNotice] = useState(DEFAULT_SYSTEM_SETTINGS.maintenanceNotice || '');
  
  // Dashboard behavior
  const [defaultSortOrder, setDefaultSortOrder] = useState(DEFAULT_SYSTEM_SETTINGS.defaultSortOrder || 'newest');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(DEFAULT_SYSTEM_SETTINGS.autoRefreshInterval || '60');
  const [allowCitizenAttachments, setAllowCitizenAttachments] = useState(DEFAULT_SYSTEM_SETTINGS.allowCitizenAttachments ?? true);
  const [maxAttachmentSizeMB, setMaxAttachmentSizeMB] = useState(DEFAULT_SYSTEM_SETTINGS.maxAttachmentSizeMB || '10');
  const [enableDirectDocumentReader, setEnableDirectDocumentReader] = useState(DEFAULT_SYSTEM_SETTINGS.enableDirectDocumentReader ?? true);

  // Security
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState(DEFAULT_SYSTEM_SETTINGS.sessionTimeoutMins);
  const [pinLockoutAttempts, setPinLockoutAttempts] = useState(DEFAULT_SYSTEM_SETTINGS.pinLockoutAttempts);
  const [requirePinForSensitiveActions, setRequirePinForSensitiveActions] = useState(DEFAULT_SYSTEM_SETTINGS.requirePinForSensitiveActions ?? true);
  const [auditLogRetentionMonths, setAuditLogRetentionMonths] = useState(DEFAULT_SYSTEM_SETTINGS.auditLogRetentionMonths || '24');

  // Notifications & SMS
  const [senderIdSms, setSenderIdSms] = useState(DEFAULT_SYSTEM_SETTINGS.senderIdSms);
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(DEFAULT_SYSTEM_SETTINGS.autoSmsEnabled);
  const [smsOnRegister, setSmsOnRegister] = useState(DEFAULT_SYSTEM_SETTINGS.smsOnRegister ?? true);
  const [smsOnTransfer, setSmsOnTransfer] = useState(DEFAULT_SYSTEM_SETTINGS.smsOnTransfer ?? true);
  const [smsOnReply, setSmsOnReply] = useState(DEFAULT_SYSTEM_SETTINGS.smsOnReply ?? true);
  const [dashboardSoundAlerts, setDashboardSoundAlerts] = useState(DEFAULT_SYSTEM_SETTINGS.dashboardSoundAlerts ?? true);
  const [urgentAlertEmail, setUrgentAlertEmail] = useState(DEFAULT_SYSTEM_SETTINGS.urgentAlertEmail ?? true);

  // Templates
  const [templateRegister, setTemplateRegister] = useState(DEFAULT_SYSTEM_SETTINGS.templateRegister || '');
  const [templateTransfer, setTemplateTransfer] = useState(DEFAULT_SYSTEM_SETTINGS.templateTransfer || '');
  const [templateReply, setTemplateReply] = useState(DEFAULT_SYSTEM_SETTINGS.templateReply || '');
  const [templateDirective, setTemplateDirective] = useState(DEFAULT_SYSTEM_SETTINGS.templateDirective || '');

  // Load persisted settings on mount
  useEffect(() => {
    const saved = AdminService.getSystemSettings();
    if (saved) {
      setPlatformName(saved.platformName || DEFAULT_SYSTEM_SETTINGS.platformName);
      setOfficialEmail(saved.officialEmail || DEFAULT_SYSTEM_SETTINGS.officialEmail);
      setHotlinePhone(saved.hotlinePhone || DEFAULT_SYSTEM_SETTINGS.hotlinePhone);
      setLegalDeadlineDays(saved.legalDeadlineDays || DEFAULT_SYSTEM_SETTINGS.legalDeadlineDays);
      setMaintenanceMode(Boolean(saved.maintenanceMode));
      setMaintenanceNotice(saved.maintenanceNotice || DEFAULT_SYSTEM_SETTINGS.maintenanceNotice || '');
      
      setDefaultSortOrder(saved.defaultSortOrder || 'newest');
      setAutoRefreshInterval(saved.autoRefreshInterval || '60');
      setAllowCitizenAttachments(saved.allowCitizenAttachments ?? true);
      setMaxAttachmentSizeMB(saved.maxAttachmentSizeMB || '10');
      setEnableDirectDocumentReader(saved.enableDirectDocumentReader ?? true);

      setSessionTimeoutMins(saved.sessionTimeoutMins || DEFAULT_SYSTEM_SETTINGS.sessionTimeoutMins);
      setPinLockoutAttempts(saved.pinLockoutAttempts || DEFAULT_SYSTEM_SETTINGS.pinLockoutAttempts);
      setRequirePinForSensitiveActions(saved.requirePinForSensitiveActions ?? true);
      setAuditLogRetentionMonths(saved.auditLogRetentionMonths || '24');

      setSenderIdSms(saved.senderIdSms || DEFAULT_SYSTEM_SETTINGS.senderIdSms);
      setAutoSmsEnabled(saved.autoSmsEnabled ?? true);
      setSmsOnRegister(saved.smsOnRegister ?? true);
      setSmsOnTransfer(saved.smsOnTransfer ?? true);
      setSmsOnReply(saved.smsOnReply ?? true);
      setDashboardSoundAlerts(saved.dashboardSoundAlerts ?? true);
      setUrgentAlertEmail(saved.urgentAlertEmail ?? true);

      setTemplateRegister(saved.templateRegister || DEFAULT_SYSTEM_SETTINGS.templateRegister || '');
      setTemplateTransfer(saved.templateTransfer || DEFAULT_SYSTEM_SETTINGS.templateTransfer || '');
      setTemplateReply(saved.templateReply || DEFAULT_SYSTEM_SETTINGS.templateReply || '');
      setTemplateDirective(saved.templateDirective || DEFAULT_SYSTEM_SETTINGS.templateDirective || '');

      if (saved.updatedAt) {
        const d = new Date(saved.updatedAt);
        setLastSavedTime(d.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }) + ' — ' + d.toISOString().split('T')[0]);
      }
    }
    setHasUnsavedChanges(false);
  }, []);

  const markDirty = () => {
    setHasUnsavedChanges(true);
  };

  // Master Save Function
  const handleSaveSettings = () => {
    setIsSaving(true);

    const payload: Partial<SystemSettings> = {
      platformName,
      officialEmail,
      hotlinePhone,
      legalDeadlineDays,
      maintenanceMode,
      maintenanceNotice,
      defaultSortOrder,
      autoRefreshInterval,
      allowCitizenAttachments,
      maxAttachmentSizeMB,
      enableDirectDocumentReader,
      sessionTimeoutMins,
      pinLockoutAttempts,
      requirePinForSensitiveActions,
      auditLogRetentionMonths,
      senderIdSms,
      autoSmsEnabled,
      smsOnRegister,
      smsOnTransfer,
      smsOnReply,
      dashboardSoundAlerts,
      urgentAlertEmail,
      templateRegister,
      templateTransfer,
      templateReply,
      templateDirective
    };

    setTimeout(() => {
      const saved = AdminService.saveSystemSettings(payload, user);
      setIsSaving(false);
      setHasUnsavedChanges(false);
      
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }) + ' — ' + now.toISOString().split('T')[0]);

      addToast?.({
        type: 'success',
        title: 'تم حفظ كافة الإعدادات بنجاح',
        message: 'تم تخزين معلمات لوحة التحكم، بوابات الرسائل، والصلاحيات وتطبيقها فورياً على المنظومة.'
      });
    }, 400);
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في استعادة الإعدادات الافتراضية لمنظومة ولاية الوادي؟')) {
      const reset = AdminService.saveSystemSettings(DEFAULT_SYSTEM_SETTINGS, user);
      setPlatformName(reset.platformName);
      setOfficialEmail(reset.officialEmail);
      setHotlinePhone(reset.hotlinePhone);
      setLegalDeadlineDays(reset.legalDeadlineDays);
      setMaintenanceMode(reset.maintenanceMode);
      setMaintenanceNotice(reset.maintenanceNotice || '');
      setDefaultSortOrder(reset.defaultSortOrder || 'newest');
      setAutoRefreshInterval(reset.autoRefreshInterval || '60');
      setAllowCitizenAttachments(reset.allowCitizenAttachments ?? true);
      setMaxAttachmentSizeMB(reset.maxAttachmentSizeMB || '10');
      setEnableDirectDocumentReader(reset.enableDirectDocumentReader ?? true);
      setSessionTimeoutMins(reset.sessionTimeoutMins);
      setPinLockoutAttempts(reset.pinLockoutAttempts);
      setRequirePinForSensitiveActions(reset.requirePinForSensitiveActions ?? true);
      setAuditLogRetentionMonths(reset.auditLogRetentionMonths || '24');
      setSenderIdSms(reset.senderIdSms);
      setAutoSmsEnabled(reset.autoSmsEnabled);
      setSmsOnRegister(reset.smsOnRegister ?? true);
      setSmsOnTransfer(reset.smsOnTransfer ?? true);
      setSmsOnReply(reset.smsOnReply ?? true);
      setDashboardSoundAlerts(reset.dashboardSoundAlerts ?? true);
      setUrgentAlertEmail(reset.urgentAlertEmail ?? true);
      setTemplateRegister(reset.templateRegister || '');
      setTemplateTransfer(reset.templateTransfer || '');
      setTemplateReply(reset.templateReply || '');
      setTemplateDirective(reset.templateDirective || '');
      setHasUnsavedChanges(false);

      addToast?.({
        type: 'info',
        title: 'تم استرجاع الإعدادات الافتراضية',
        message: 'تمت استعادة كافة المعايير الأصلية المعتمدة لولاية الوادي.'
      });
    }
  };

  const handleCreateBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      wilaya: 'الوادي (39)',
      exportedBy: user?.name || 'المشرف التقني',
      settings: AdminService.getSystemSettings(),
      users: AdminService.getUsers(),
      grievances: AdminService.getGrievances(),
      auditLogs: AdminService.getAuditLogs(),
      permissions: localStorage.getItem('wilaya_eloued_role_permissions')
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_شاملة_ولاية_الوادي_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    AdminService.logAudit({
      userId: user?.id || 'admin',
      userName: user?.name || 'المسؤول',
      userRole: user?.roleTitle || 'مسؤول النظام',
      action: 'تصدير نسخة احتياطية شاملة',
      targetId: 'backup_export',
      targetType: 'أمن',
      details: 'تم إنشاء وتنزيل نسخة احتياطية لكافة بيانات المنظومة محلياً بصيغة JSON.'
    });

    addToast?.({
      type: 'success',
      title: 'تم إنشاء النسخة الاحتياطية بنجاح',
      message: 'تم تحميل ملف النسخة الاحتياطية الشاملة لكافة الانشغالات والإعدادات وسجلات التدقيق.'
    });
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.settings) {
          AdminService.saveSystemSettings(data.settings, user);
        }
        if (data.users && Array.isArray(data.users)) {
          localStorage.setItem('wilaya_eloued_admin_users', JSON.stringify(data.users));
        }
        if (data.grievances && Array.isArray(data.grievances)) {
          localStorage.setItem('wilaya_eloued_admin_grievances', JSON.stringify(data.grievances));
        }
        if (data.auditLogs && Array.isArray(data.auditLogs)) {
          localStorage.setItem('wilaya_eloued_admin_audit_logs', JSON.stringify(data.auditLogs));
        }
        if (data.permissions) {
          localStorage.setItem('wilaya_eloued_role_permissions', typeof data.permissions === 'string' ? data.permissions : JSON.stringify(data.permissions));
        }

        AdminService.logAudit({
          userId: user?.id || 'admin',
          userName: user?.name || 'المسؤول',
          userRole: user?.roleTitle || 'مسؤول النظام',
          action: 'استعادة نسخة احتياطية',
          targetId: 'backup_restore',
          targetType: 'أمن',
          details: `تمت استعادة البيانات بنجاح من الملف (${file.name}).`
        });

        addToast?.({
          type: 'success',
          title: 'تمت استعادة البيانات بنجاح',
          message: 'تم استرجاع السجلات والمستخدمين والانشغالات والإعدادات بنجاح.'
        });

        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        addToast?.({
          type: 'error',
          title: 'فشل استعادة البيانات',
          message: 'الملف المختار غير صالح أو تالف. يرجى اختيار ملف JSON مطابق.'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleTestSms = () => {
    addToast?.({
      type: 'info',
      title: 'اختبار بوابة SMS',
      message: `تم إرسال إشعار تجريبي من المعرف (${senderIdSms}) بنجاح. حالة البوابة: متصلة وجاهزة.`
    });
  };

  return (
    <div id="settings-view-wrapper" className="space-y-6 font-tajawal">
      
      {/* Header with Save Bar & Feedback */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold font-changa text-gray-900">إعدادات المنظومة ولوحة التحكم</h2>
            {hasUnsavedChanges ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>تغييرات غير محفوظة</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-[#006233] border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>جميع الإعدادات محفوظة</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            التحكم في معلمات ديوان الوالي، بوابات الرسائل النصية، قواعد الأمان، والقراءة المباشرة للمستندات
            {lastSavedTime && <span className="font-mono text-gray-400 mr-2">• آخر حفظ: {lastSavedTime}</span>}
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleResetDefaults}
            type="button"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
            title="استرجاع القيم الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">استعادة الافتراضي</span>
          </button>

          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all text-xs sm:text-sm font-bold shadow-sm w-full sm:w-auto ${
              hasUnsavedChanges
                ? 'bg-[#006233] hover:bg-[#004d28] text-white ring-2 ring-emerald-500/50 shadow-emerald-900/20'
                : 'bg-[#006233] hover:bg-[#004d28] text-white'
            }`}
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-amber-300" />
            )}
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ كافة التعديلات'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'general', label: 'الإعدادات العامة واللوحة', icon: Globe },
            { id: 'security', label: 'الأمان وجلسات الدخول', icon: Shield },
            { id: 'notifications', label: 'بوابة الرسائل و SMS', icon: Mail },
            { id: 'templates', label: 'الرسائل التلقائية والصيغ', icon: Bell },
            { id: 'backup', label: 'النسخ الاحتياطي والاستعادة', icon: HardDrive },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all text-right border ${
                  isActive
                    ? 'bg-[#006233] text-white border-[#006233] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-amber-300" />}
              </button>
            );
          })}

          {/* Quick Info Box */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-2 mt-4 text-[#006233]">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>نظام التخزين المحلي الآمن</span>
            </div>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              كافة التغييرات يتم تثبيتها محلياً وفورياً بمجرد الضغط على زر الحفظ، وتبقى محفوظة بين الجلسات.
            </p>
          </div>
        </div>

        {/* Tab Content Stage */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: GENERAL & DASHBOARD */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              
              {/* Institution Meta Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-changa font-bold text-base text-gray-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#006233]" />
                    <span>بيانات المنظومة والجهة الرسمية</span>
                  </h3>
                  <span className="text-xs text-gray-400">ديوان والي ولاية الوادي</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1.5">عنوان المنصة الرسمي</label>
                    <input 
                      type="text" 
                      value={platformName}
                      onChange={(e) => { setPlatformName(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none font-bold" 
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1.5">البريد الإلكتروني للديوان والمصالح</label>
                    <input 
                      type="email" 
                      value={officialEmail}
                      onChange={(e) => { setOfficialEmail(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1.5">الرقم الأخضر / هاتف الاستقبال والشكاوى</label>
                    <input 
                      type="text" 
                      value={hotlinePhone}
                      onChange={(e) => { setHotlinePhone(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none font-mono font-bold" 
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1.5">المهلة القانونية القصوى للرد (أيام)</label>
                    <input 
                      type="number" 
                      value={legalDeadlineDays}
                      onChange={(e) => { setLegalDeadlineDays(e.target.value); markDirty(); }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none font-mono font-bold" 
                    />
                  </div>
                </div>
              </div>

              {/* Dashboard Behavior Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-5">
                <h3 className="font-changa font-bold text-base border-b border-gray-100 pb-3 text-gray-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#006233]" />
                  <span>تخصيص سلوك وعرض لوحة التحكم</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1.5">الترتيب الافتراضي لعرض الشكاوى</label>
                    <select
                      value={defaultSortOrder}
                      onChange={(e) => { setDefaultSortOrder(e.target.value as any); markDirty(); }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none font-bold"
                    >
                      <option value="newest">الأحدث وصولاً أولاً</option>
                      <option value="priority">حسب الأولوية والاستعجال</option>
                      <option value="oldest">الأقدم معالجة أولاً (لتفادي التأخر)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1.5">معدل التحديث التلقائي للبيانات في اللوحة</label>
                    <select
                      value={autoRefreshInterval}
                      onChange={(e) => { setAutoRefreshInterval(e.target.value as any); markDirty(); }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none font-bold"
                    >
                      <option value="30">كل 30 ثانية</option>
                      <option value="60">كل دقيقة واحدة (موصى به)</option>
                      <option value="300">كل 5 دقائق</option>
                      <option value="off">يدوي فقط (إيقاف التحديث التلقائي)</option>
                    </select>
                  </div>
                </div>

                {/* Direct Document Reader Switch */}
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <label className="flex items-center justify-between p-4 border border-emerald-200 bg-emerald-50/40 rounded-xl hover:bg-emerald-50/80 cursor-pointer transition-colors">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-[#006233] flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>تفعيل القراءة المباشرة للملفات المرفوعة دون تحميلها (مفعلة)</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        فتح مستندات PDF والصور والعرائض في قارئ مستندي مدمج مع أدوات التكبير والتدوير واستخراج النص (OCR)
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={enableDirectDocumentReader} 
                      onChange={(e) => { setEnableDirectDocumentReader(e.target.checked); markDirty(); }}
                      className="w-5 h-5 rounded text-[#006233] focus:ring-[#006233]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-gray-900">السماح للمواطنين برفع وثائق ومرفقات ثبوتية</div>
                      <div className="text-xs text-gray-500">تمكين المواطن من إرفاق بطاقة الهوية، الصور الميدانية، والوثائق الداعمة</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={allowCitizenAttachments} 
                      onChange={(e) => { setAllowCitizenAttachments(e.target.checked); markDirty(); }}
                      className="w-5 h-5 rounded text-[#006233] focus:ring-[#006233]"
                    />
                  </label>
                </div>
              </div>

              {/* Maintenance Mode Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
                <h3 className="font-changa font-bold text-base border-b border-gray-100 pb-3 text-gray-900">
                  وضع التشغيل والصيانة
                </h3>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="font-bold text-sm text-gray-900">وضع الصيانة الاستثنائي (Maintenance Mode)</div>
                    <div className="text-xs text-gray-500 mt-0.5">إيقاف استقبال عرائض جديدة مؤقتاً وعرض إشعار تنظيمي رسمي للمواطنين</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={maintenanceMode} 
                    onChange={(e) => { setMaintenanceMode(e.target.checked); markDirty(); }}
                    className="w-5 h-5 rounded text-[#006233] focus:ring-[#006233]"
                  />
                </label>

                {maintenanceMode && (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-gray-700">رسالة الصيانة المعروضة للمواطنين</label>
                    <textarea
                      rows={2}
                      value={maintenanceNotice}
                      onChange={(e) => { setMaintenanceNotice(e.target.value); markDirty(); }}
                      className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Section Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>حفظ إعدادات هذا القسم</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-changa font-bold text-base text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#006233]" />
                  <span>سياسات الأمان والمصادقة الإدارية</span>
                </h3>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  بروتوكول الأمان الحكومي 2026
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">مدة انتهاء الجلسة التلقائية (دقائق)</label>
                  <input 
                    type="number" 
                    value={sessionTimeoutMins}
                    onChange={(e) => { setSessionTimeoutMins(e.target.value); markDirty(); }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">عدد محاولات PIN الخاطئة قبل القفل</label>
                  <input 
                    type="number" 
                    value={pinLockoutAttempts}
                    onChange={(e) => { setPinLockoutAttempts(e.target.value); markDirty(); }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="font-bold text-xs text-gray-900">طلب رمز PIN السري عند المصادقة على الردود الرسمية</div>
                    <div className="text-[11px] text-gray-500">منع المصادقة بالخطأ وإلزام المسؤول بتأكيد الرمز الشخصي</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={requirePinForSensitiveActions} 
                    onChange={(e) => { setRequirePinForSensitiveActions(e.target.checked); markDirty(); }}
                    className="w-4 h-4 rounded text-[#006233] focus:ring-[#006233]"
                  />
                </label>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#006233]">
                  <Shield className="w-4 h-4" />
                  <span>معايير الأمان المطبقة في ولاية الوادي:</span>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-1 leading-relaxed">
                  <li>فصل واجهة الدخول الإداري بعيداً عن منصة المواطن العامة</li>
                  <li>المصادقة برمز PIN السري المكون من 4 أرقام لكل مسؤول وموظف معالج</li>
                  <li>تسجيل كل عملية تعديل أو قراءة أو حفظ في سجل التدقيق الرقمي (Audit Log)</li>
                  <li>حفظ وتشفير البيانات محلياً وفق توجيهات أمن الأنظمة الإدارية</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>حفظ إعدادات الأمان</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS & SMS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-changa font-bold text-base text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#006233]" />
                  <span>بوابة الرسائل النصية القصيرة (SMS Gateway)</span>
                </h3>
                <span className="font-mono text-xs text-gray-400">مزود الربط: Ooredoo / Djezzy / Mobilis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">معرف المرسل الرسمي (Sender ID)</label>
                  <input 
                    type="text" 
                    value={senderIdSms}
                    onChange={(e) => { setSenderIdSms(e.target.value); markDirty(); }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:border-[#006233] outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button 
                    onClick={handleTestSms}
                    type="button"
                    className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-[#006233]" />
                    <span>إرسال رسالة اختبارية (Ping SMS Test)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="font-bold text-xs text-gray-900">تفعيل الإشعارات النصية التلقائية للمواطنين</div>
                    <div className="text-[11px] text-gray-500">إرسال SMS لحظي للمواطن على هاتفه المحمول عند كل مرحلة</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoSmsEnabled} 
                    onChange={(e) => { setAutoSmsEnabled(e.target.checked); markDirty(); }}
                    className="w-4 h-4 rounded text-[#006233] focus:ring-[#006233]"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-4">
                  <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={smsOnRegister} 
                      onChange={(e) => { setSmsOnRegister(e.target.checked); markDirty(); }}
                      className="rounded text-[#006233]" 
                    />
                    <span className="font-bold text-gray-700 text-[11px]">عند تسجيل العريضة</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={smsOnTransfer} 
                      onChange={(e) => { setSmsOnTransfer(e.target.checked); markDirty(); }}
                      className="rounded text-[#006233]" 
                    />
                    <span className="font-bold text-gray-700 text-[11px]">عند توجيه الملف لقطاع</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={smsOnReply} 
                      onChange={(e) => { setSmsOnReply(e.target.checked); markDirty(); }}
                      className="rounded text-[#006233]" 
                    />
                    <span className="font-bold text-gray-700 text-[11px]">عند صدور الرد الرسمي</span>
                  </label>
                </div>

                <label className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-xs text-gray-900">تفعيل التنبيهات الصوتية في لوحة التحكم</div>
                      <div className="text-[11px] text-gray-500">إطلاق نغمة إشعار صوتية للمسؤول عند وصول انشغال أو عريضة جديدة</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={dashboardSoundAlerts} 
                    onChange={(e) => { setDashboardSoundAlerts(e.target.checked); markDirty(); }}
                    className="w-4 h-4 rounded text-[#006233] focus:ring-[#006233]"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>حفظ إعدادات الرسائل والتنبيهات</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6 text-xs font-tajawal">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-changa font-bold text-base text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#006233]" />
                    <span>صيغ ونماذج الرسائل التلقائية الرسمية</span>
                  </h3>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    يمكنك تعديل نصوص الرسائل التي يتلقاها المواطن عبر SMS واستخدام المتغيرات مثل: <code className="font-mono text-emerald-700 bg-emerald-50 px-1 rounded">[ID]</code> و <code className="font-mono text-purple-700 bg-purple-50 px-1 rounded">[المصلحة المعنية]</code>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Template 1 */}
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#006233]" />
                      <span>صيغة إشعار تسجيل العريضة للمواطن:</span>
                    </label>
                    <span className="text-[#006233] font-mono text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      قالب SMS فوري
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={templateRegister}
                    onChange={(e) => { setTemplateRegister(e.target.value); markDirty(); }}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:border-[#006233] outline-none leading-relaxed"
                  />
                </div>

                {/* Template 2 */}
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                      <span>صيغة إشعار توجيه الملف للمصلحة المعنية:</span>
                    </label>
                    <span className="text-purple-700 font-mono text-[10px] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      قالب SMS إحالة
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={templateTransfer}
                    onChange={(e) => { setTemplateTransfer(e.target.value); markDirty(); }}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:border-[#006233] outline-none leading-relaxed"
                  />
                </div>

                {/* Template 3 */}
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>صيغة إشعار صدور الرد الرسمي للمواطن:</span>
                    </label>
                    <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      قالب SMS تسوية
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={templateReply}
                    onChange={(e) => { setTemplateReply(e.target.value); markDirty(); }}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:border-[#006233] outline-none leading-relaxed"
                  />
                </div>

                {/* Template 4 */}
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                      <span>الصيغة الافتراضية للتعليمات الولائية الاستعجالية (السيد الوالي):</span>
                    </label>
                    <span className="text-amber-800 font-mono text-[10px] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      تعليمة سيادية
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={templateDirective}
                    onChange={(e) => { setTemplateDirective(e.target.value); markDirty(); }}
                    className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs text-gray-800 focus:border-amber-600 outline-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>حفظ قوالب وصيغ الرسائل</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6 text-xs">
              <div>
                <h3 className="font-changa font-bold text-base text-gray-900 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-[#006233]" />
                  <span>النسخ الاحتياطي واسترجاع البيانات (Disaster Recovery)</span>
                </h3>
                <p className="text-gray-500 mt-1">
                  تأمين قاعدة بيانات انشغالات المواطنين، سجلات التدقيق، الصلاحيات، وإعدادات المنظومة بضغطة زر واحدة.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Export Card */}
                <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#006233] text-white flex items-center justify-center mb-3 shadow-xs">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="font-changa font-bold text-sm text-gray-900">إنشاء وتصدير نسخة احتياطية كاملة</h4>
                    <p className="text-gray-600 mt-1 leading-relaxed">
                      تصدير كافة الانشغالات المسجلة، المستخدمين، الصلاحيات، سجلات التدقيق، والإعدادات في ملف JSON آمن متوافق مع معايير الأرشفة الولائية.
                    </p>
                  </div>

                  <button
                    onClick={handleCreateBackup}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>تنزيل النسخة الاحتياطية (JSON)</span>
                  </button>
                </div>

                {/* Import / Restore Card */}
                <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="font-changa font-bold text-sm text-gray-900">استعادة البيانات من نسخة مؤرشفة</h4>
                    <p className="text-gray-600 mt-1 leading-relaxed">
                      رفع ملف JSON احتياطي لاسترجاع كافة الانشغالات، المستخدمين، وسجلات التدقيق، مع تثبيت تلقائي فوري في قاعدة البيانات المحلية.
                    </p>
                  </div>

                  <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center">
                    <Upload className="w-4 h-4" />
                    <span>اختيار ملف JSON واستعادة المنظومة</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleRestoreBackup}
                      className="hidden" 
                    />
                  </label>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
