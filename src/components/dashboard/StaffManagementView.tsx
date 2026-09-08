import React, { useState } from 'react';
import { SystemUser, UserRole } from '../../types';
import { 
  Check, 
  Lock, 
  Mail, 
  Phone, 
  Plus, 
  Power, 
  Search, 
  ShieldCheck, 
  User, 
  UserCheck, 
  UserX, 
  Users, 
  X 
} from 'lucide-react';

interface StaffManagementViewProps {
  currentUser: SystemUser;
  employees: SystemUser[];
  onAddUser: (data: Omit<SystemUser, 'id' | 'assignedCount' | 'resolvedCount' | 'overdueCount' | 'lastActive'>) => void;
  onToggleStatus: (id: string) => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  currentUser,
  employees,
  onAddUser,
  onToggleStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('employee');
  const [newRoleTitle, setNewRoleTitle] = useState('ملحق إدارة رئيسي');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState('مصلحة الشؤون الاجتماعية والتنمية');

  const filteredUsers = employees.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    onAddUser({
      name: newName.trim(),
      role: newRole,
      roleTitle: newRoleTitle,
      email: newEmail.trim(),
      phone: newPhone.trim() || '032 21 XX XX',
      department: newDepartment,
      status: 'نشط',
      permissions: newRole === 'employee' ? ['view_assigned', 'process'] : ['view_all', 'reports']
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
  };

  return (
    <div className="space-y-5 text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-['Changa'] text-slate-900">
            إدارة موظفي ومستخدمي خلية الإصغاء
          </h1>
          <p className="text-xs text-slate-500">
            توزيع الصلاحيات، متابعة حسابات موظفي المعالجة والمراقبين بالخلية
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#006233] text-white text-xs font-bold hover:bg-[#005029] shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، المصلحة، البريد..."
            className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006233] bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">تصفية الدور:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <option value="all">كافة الأدوار (3)</option>
            <option value="supervisor">مسؤول الخلية (0000)</option>
            <option value="employee">موظفو المعالجة (1111)</option>
            <option value="super_admin">Super Admin (1234)</option>
          </select>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`p-5 rounded-2xl border bg-white shadow-xs transition-all ${
              user.status === 'معطل' ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#F4EBDA] border border-[#C67D2A]/30 text-[#1C2B33] flex items-center justify-center font-bold text-sm">
                  {user.name.split(' ')[0][0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
                  <span className="text-[11px] text-[#C67D2A] font-medium block">
                    {user.roleTitle}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  user.status === 'نشط' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {user.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-4">
              <div className="text-slate-700 font-medium">المصلحة: {user.department}</div>
              <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{user.phone}</span>
              </div>
            </div>

            {/* Performance Stats for Employees */}
            {user.role === 'employee' && (
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center border border-slate-200/60 mb-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">المسند</span>
                  <strong className="text-indigo-700 font-mono">{user.assignedCount}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">المعالج</span>
                  <strong className="text-emerald-700 font-mono">{user.resolvedCount}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">المتأخر</span>
                  <strong className={`font-mono ${user.overdueCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {user.overdueCount}
                  </strong>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                آخر ظهور: {user.lastActive}
              </span>

              {user.id !== currentUser.id && (
                <button
                  onClick={() => onToggleStatus(user.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    user.status === 'نشط'
                      ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{user.status === 'نشط' ? 'تعطيل الحساب' : 'تفعيل الحساب'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">إضافة مستخدم جديد إلى المنظومة</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-right">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  الاسم الكامل واللقب <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="مثال: محمد العمري"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#006233] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    الدور والصلاحية <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="employee">موظف معالج (PIN: 1111)</option>
                    <option value="supervisor">مسؤول خلية (PIN: 0000)</option>
                    <option value="super_admin">Super admin (PIN: 1234)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    الرتبة الوظيفية
                  </label>
                  <input
                    type="text"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    placeholder="مثال: مفتش إدارة رئيسي"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  المصلحة أو المديرية المعنية
                </label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="مصلحة الشؤون الاجتماعية والتنمية">مصلحة الشؤون الاجتماعية والتنمية</option>
                  <option value="مصلحة العمران والبيئة والتهيئة">مصلحة العمران والبيئة والتهيئة</option>
                  <option value="مصلحة النقل والمرافق العمومية">مصلحة النقل والمرافق العمومية</option>
                  <option value="مصلحة الموارد المائية والفلاحة">مصلحة الموارد المائية والفلاحة</option>
                  <option value="ديوان والي ولاية الوادي">ديوان والي ولاية الوادي</option>
                  <option value="المفتشية العامة للولاية">المفتشية العامة للولاية</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    البريد الإلكتروني المهني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    placeholder="name@eloued.gov.dz"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    رقم الهاتف الداخلي / المهني
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="032 21 XX XX"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#006233] text-white text-xs font-semibold hover:bg-[#005029]"
                >
                  إنشاء الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
