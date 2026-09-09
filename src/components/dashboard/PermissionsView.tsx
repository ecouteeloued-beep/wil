import React, { useState, useEffect } from 'react';
import { Shield, Key, Check, ShieldAlert, RotateCcw, Save, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { SystemUser } from '../../types';
import { AdminService, DEFAULT_ROLE_PERMISSIONS } from '../../services/adminService';

interface PermissionsViewProps {
  user?: SystemUser;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
}

const ROLES = [
  { id: 'wali', name: 'والي الولاية', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'chef_cabinet', name: 'الأمين العام', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'head_department', name: 'رئيس الدائرة', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'supervisor', name: 'مسؤول الخلية', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'employee', name: 'موظف معالج', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { id: 'super_admin', name: 'المشرف التقني', color: 'bg-red-100 text-red-900 border-red-300' },
];

const PERMISSIONS = [
  { id: 'view_all', label: 'الاطلاع الشامل على كافة العرائض والبلديات (22)', desc: 'تمكين تصفح والاطلاع على كافة ملفات مواطني الولاية دون قيود', type: 'read' },
  { id: 'view_department', label: 'الاطلاع الإقليمي / الخاص بالمصلحة فقط', desc: 'تقييد المشاهدة بملفات دائرة أو مصلحة المستخدم فقط', type: 'read' },
  { id: 'assign_grievance', label: 'إحالة وتوجيه الملفات للمديريات والموظفين', desc: 'صلاحية توجيه العرائض للمصالح التنفيذية وتعيين المكلفين بالدراسة', type: 'write' },
  { id: 'executive_directive', label: 'إصدار تعليمات ولائية استعجالية ملزمة', desc: 'صلاحية سيادية لإلزام المصالح بالتدخل الاستعجالي وتحديد المهل', type: 'admin' },
  { id: 'approve_reply', label: 'المصادقة على الرد الرسمي للمواطن وغلق الملف', desc: 'اعتماد الرد النهائي والتوقيع الإداري عليه في المنظومة', type: 'write' },
  { id: 'draft_reply', label: 'تحرير مسودات الردود وإضافة محاضر المعاينة', desc: 'كتابة المقترحات ومحاضر التحقيق الميداني والردود الإدارية', type: 'write' },
  { id: 'export_reports', label: 'تصدير التقارير الإحصائية والبيانات (Excel/PDF)', desc: 'تحميل كشوفات المؤشرات الرقمية وتصدير السجلات', type: 'read' },
  { id: 'manage_users', label: 'إدارة حسابات المستخدمين وتعيين رموز PIN', desc: 'إنشاء وتعديل وتجميد حسابات الموظفين وتعيين الصلاحيات', type: 'admin' },
  { id: 'view_audit_logs', label: 'فحص سجل التدقيق الأمني الرقمي (Audit Log)', desc: 'مراقبة العمليات الحساسة وتتبع حركات المستخدمين', type: 'admin' },
  { id: 'manage_settings', label: 'تعديل إعدادات المنظومة والنسخ الاحتياطي', desc: 'التحكم في معلمات النظام والربط والنسخ واستعادة البيانات', type: 'admin' },
];

const STORAGE_KEY = 'wilaya_eloued_role_permissions';

export const PermissionsView: React.FC<PermissionsViewProps> = ({ user, addToast }) => {
  const [roleMatrix, setRoleMatrix] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleToggle = (roleId: string, permId: string) => {
    // Super admin permissions are locked to full access
    if (roleId === 'super_admin') return;

    setRoleMatrix(prev => {
      const currentList = prev[roleId] || [];
      const exists = currentList.includes(permId);
      const nextList = exists 
        ? currentList.filter(p => p !== permId) 
        : [...currentList, permId];

      return {
        ...prev,
        [roleId]: nextList
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roleMatrix));
      setHasUnsavedChanges(false);

      AdminService.logAudit({
        userId: user?.id || 'admin',
        userName: user?.name || 'المسؤول',
        userRole: user?.roleTitle || 'مسؤول الصلاحيات',
        action: 'تحديث مصفوفة الصلاحيات (RBAC)',
        targetId: 'rbac-matrix',
        targetType: 'صلاحيات',
        details: 'تم تحديث وحفظ مصفوفة الصلاحيات العامة للأدوار في المنظومة.'
      });

      addToast?.({
        type: 'success',
        title: 'تم حفظ الصلاحيات بنجاح',
        message: 'تم تطبيق مصفوفة الصلاحيات (RBAC) المحدثة على كافة مستخدمي المنظومة.'
      });
    } catch (e) {
      addToast?.({
        type: 'error',
        title: 'خطأ في الحفظ',
        message: 'تعذر حفظ الصلاحيات في التخزين المحلي.'
      });
    }
  };

  const handleResetToDefault = () => {
    setRoleMatrix(DEFAULT_ROLE_PERMISSIONS);
    localStorage.removeItem(STORAGE_KEY);
    setHasUnsavedChanges(false);

    addToast?.({
      type: 'info',
      title: 'استعادة الإعدادات الافتراضية',
      message: 'تمت استعادة مصفوفة الصلاحيات الأصلية المعتمدة لولاية الوادي.'
    });
  };

  return (
    <div className="space-y-6 font-tajawal">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-changa text-gray-900">إدارة الصلاحيات وحوكمة الأدوار (RBAC)</h2>
            <span className="bg-emerald-50 text-[#006233] text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              نموذج حوكمة ولاية الوادي
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            التحكم في وصول كل رتبة إدارية في المنظومة لضمان الفصل المؤسساتي بين المهام وصون سرية المداولات
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            title="استعادة الصلاحيات الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>

          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              hasUnsavedChanges
                ? 'bg-[#006233] hover:bg-[#004d28] text-white animate-pulse'
                : 'bg-[#006233] hover:bg-[#004d28] text-white'
            }`}
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>حفظ تعديلات الصلاحيات</span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Permissions Matrix Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50/70 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-changa font-bold text-gray-800 text-xs min-w-[280px]">
                  الصلاحية الإدارية والوصف الوظيفي
                </th>
                {ROLES.map(role => (
                  <th key={role.id} className="px-4 py-4 text-center min-w-[140px]">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border font-bold">
                      <span className={role.color}>{role.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {PERMISSIONS.map((perm) => (
                <tr key={perm.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {perm.type === 'admin' ? (
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                        ) : (
                          <Key className="w-4 h-4 text-[#006233]" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs">{perm.label}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{perm.desc}</p>
                      </div>
                    </div>
                  </td>

                  {ROLES.map(role => {
                    const isSuperAdmin = role.id === 'super_admin';
                    const isWali = role.id === 'wali';
                    const hasPerm = (roleMatrix[role.id] || []).includes(perm.id);

                    return (
                      <td key={`${role.id}-${perm.id}`} className="px-4 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={hasPerm} 
                            disabled={isSuperAdmin}
                            onChange={() => handleToggle(role.id, perm.id)}
                          />
                          <div className={`w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                            isSuperAdmin 
                              ? 'peer-checked:bg-gray-400 cursor-not-allowed' 
                              : isWali
                              ? 'peer-checked:bg-amber-600'
                              : 'peer-checked:bg-[#006233]'
                          }`} />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
