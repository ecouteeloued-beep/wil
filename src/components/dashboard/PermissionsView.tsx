import React from 'react';
import { Shield, Key, Check, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const PermissionsView: React.FC = () => {
  const roles = [
    { name: 'المشرف العام (Super Admin)', id: 'super_admin', color: 'bg-purple-100 text-purple-700' },
    { name: 'الوالي (Wali)', id: 'wali', color: 'bg-[#006233]/10 text-[#006233]' },
    { name: 'مدير الديوان (Chef Cabinet)', id: 'chef_cabinet', color: 'bg-blue-100 text-blue-700' },
    { name: 'رئيس مصلحة (Head of Dept)', id: 'head_department', color: 'bg-emerald-100 text-emerald-700' },
    { name: 'مشرف خلية (Supervisor)', id: 'supervisor', color: 'bg-amber-100 text-amber-700' },
    { name: 'موظف معالجة (Employee)', id: 'employee', color: 'bg-gray-100 text-gray-700' },
  ];

  const permissions = [
    { id: 'view_dashboard', label: 'الوصول للوحة القيادة', type: 'read' },
    { id: 'view_inbox', label: 'الاطلاع على الانشغالات', type: 'read' },
    { id: 'edit_status', label: 'تغيير حالة الانشغال', type: 'write' },
    { id: 'assign_dept', label: 'تحويل للمصالح', type: 'write' },
    { id: 'view_map', label: 'الخريطة التفاعلية', type: 'read' },
    { id: 'view_reports', label: 'التقارير والإحصائيات', type: 'read' },
    { id: 'manage_users', label: 'إدارة المستخدمين', type: 'admin' },
    { id: 'manage_roles', label: 'إدارة الصلاحيات', type: 'admin' },
    { id: 'system_settings', label: 'إعدادات النظام', type: 'admin' },
    { id: 'audit_log', label: 'سجل المراقبة (Audit Log)', type: 'admin' },
  ];

  const rolePermissions: Record<string, string[]> = {
    'super_admin': permissions.map(p => p.id),
    'wali': permissions.map(p => p.id),
    'chef_cabinet': ['view_dashboard', 'view_inbox', 'view_map', 'view_reports', 'audit_log'],
    'head_department': ['view_dashboard', 'view_inbox', 'edit_status', 'view_reports'],
    'supervisor': ['view_dashboard', 'view_inbox', 'edit_status', 'assign_dept', 'view_map'],
    'employee': ['view_dashboard', 'view_inbox', 'edit_status'],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">إدارة الصلاحيات (RBAC)</h2>
          <p className="text-sm text-gray-500 font-tajawal mt-1">تكوين وتخصيص صلاحيات الوصول لكل دور في النظام</p>
        </div>
        <button className="px-4 py-2 bg-[#006233] text-white rounded-lg font-tajawal text-sm font-bold shadow-sm hover:bg-[#004d28] transition-colors flex items-center gap-2">
          <Shield className="w-4 h-4" /> حفظ التعديلات
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 border-b border-gray-100 font-changa font-bold text-gray-700 min-w-[200px]">الصلاحية / الدور</th>
                {roles.map(role => (
                  <th key={role.id} className="px-4 py-4 border-b border-gray-100 text-center min-w-[150px]">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold font-tajawal ${role.color}`}>
                        {role.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {permissions.map((perm, idx) => (
                <motion.tr 
                  key={perm.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-tajawal font-bold text-sm text-gray-900">
                      {perm.type === 'admin' ? <ShieldAlert className="w-4 h-4 text-red-500" /> : <Key className="w-4 h-4 text-gray-400" />}
                      {perm.label}
                    </div>
                  </td>
                  {roles.map(role => {
                    const hasPerm = rolePermissions[role.id]?.includes(perm.id);
                    return (
                      <td key={`${role.id}-${perm.id}`} className="px-4 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={hasPerm} disabled={role.id === 'super_admin'} />
                          <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${role.id === 'super_admin' ? 'peer-checked:bg-gray-400 cursor-not-allowed' : 'peer-checked:bg-[#006233]'}`}></div>
                        </label>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
