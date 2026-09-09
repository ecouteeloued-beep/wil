import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, ShieldAlert, Edit, Trash2, Key, Check, X, 
  UserCheck, ShieldCheck, Shield, Building2, Phone, Mail, Lock, AlertCircle
} from 'lucide-react';
import { SystemUser } from '../../types';
import { AdminService, DEFAULT_ROLE_PERMISSIONS } from '../../services/adminService';
import { motion, AnimatePresence } from 'motion/react';

interface UsersViewProps {
  user?: SystemUser;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_all', label: 'الاطلاع الشامل على كافة العرائض والبلديات الـ 22' },
  { id: 'view_department', label: 'الاطلاع على عرائض المصلحة / الدائرة فقط' },
  { id: 'assign_grievance', label: 'إسناد وتوجيه الملفات للموظفين والمديريات' },
  { id: 'executive_directive', label: 'إصدار تعليمات ولائية استعجالية ملزمة' },
  { id: 'approve_reply', label: 'المصادقة على الردود الرسمية الموجهة للمواطن' },
  { id: 'draft_reply', label: 'تحرير مسودات الردود والمعاينات الميدانية' },
  { id: 'export_reports', label: 'تصدير التقارير الإحصائية الولائية (PDF/Excel)' },
  { id: 'manage_users', label: 'إدارة المستخدمين وضبط الصلاحيات وتعيين PIN' },
  { id: 'view_audit_logs', label: 'الاطلاع على سجل التدقيق الأمني الرقمي' },
  { id: 'manage_settings', label: 'تعديل الإعدادات والربط والنسخ الاحتياطي' }
];

export const UsersView: React.FC<UsersViewProps> = ({ user, addToast }) => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [pinResetUser, setPinResetUser] = useState<SystemUser | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<SystemUser | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    roleTitle: '',
    email: '',
    phone: '',
    department: 'ديوان والي ولاية الوادي',
    role: 'employee' as SystemUser['role'],
    status: 'active' as SystemUser['status'],
    pin: '1234',
    permissions: [] as string[]
  });

  const [newPin, setNewPin] = useState('');

  const loadUsers = () => {
    const list = AdminService.getUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const canManageUsers = useMemo(() => {
    if (!user) return true;
    return user.role === 'super_admin' || user.role === 'wali' || user.permissions?.includes('manage_users');
  }, [user]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (selectedRoleFilter && u.role !== selectedRoleFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchRole = (u.roleTitle || '').toLowerCase().includes(q);
        const matchDept = (u.department || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole && !matchDept) return false;
      }
      return true;
    });
  }, [users, searchTerm, selectedRoleFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      roleTitle: '',
      email: '',
      phone: '',
      department: 'ديوان والي ولاية الوادي',
      role: 'employee',
      status: 'active',
      pin: '1234',
      permissions: DEFAULT_ROLE_PERMISSIONS['employee'] || []
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (targetUser: SystemUser) => {
    setEditingUser(targetUser);
    setFormData({
      name: targetUser.name,
      roleTitle: targetUser.roleTitle || '',
      email: targetUser.email,
      phone: targetUser.phone || '',
      department: targetUser.department || 'ديوان والي ولاية الوادي',
      role: targetUser.role,
      status: targetUser.status || 'active',
      pin: '',
      permissions: targetUser.permissions || []
    });
  };

  const handleRoleChange = (newRole: SystemUser['role']) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: DEFAULT_ROLE_PERMISSIONS[newRole] || []
    }));
  };

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists 
          ? prev.permissions.filter(p => p !== permId) 
          : [...prev.permissions, permId]
      };
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingUser) {
      // Update existing
      AdminService.updateUser(editingUser.id, {
        name: formData.name,
        roleTitle: formData.roleTitle,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        role: formData.role,
        status: formData.status,
        permissions: formData.permissions
      });

      AdminService.logAudit({
        userId: user?.id || 'admin',
        userName: user?.name || 'المسؤول',
        userRole: user?.roleTitle || 'مسؤول',
        action: 'تعديل بيانات مستخدم',
        targetId: editingUser.id,
        targetType: 'مستخدم',
        newValue: formData.roleTitle,
        details: `تم تحديث بيانات وصلاحيات الحساب (${formData.name} - ${formData.roleTitle}).`
      });

      addToast?.({
        type: 'success',
        title: 'تم تحديث الحساب',
        message: `تم حفظ تعديلات الحساب (${formData.name}) بنجاح.`
      });
      setEditingUser(null);
    } else {
      // Create new
      const newUser = AdminService.addUser({
        name: formData.name,
        roleTitle: formData.roleTitle || 'عضو المنظومة',
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        role: formData.role,
        status: formData.status,
        permissions: formData.permissions
      }, formData.pin || '1234');

      AdminService.logAudit({
        userId: user?.id || 'admin',
        userName: user?.name || 'المسؤول',
        userRole: user?.roleTitle || 'مسؤول',
        action: 'إضافة مستخدم جديد',
        targetId: newUser.id,
        targetType: 'مستخدم',
        newValue: formData.role,
        details: `تم إنشاء حساب جديد باسم (${newUser.name}) برتبة (${newUser.roleTitle}).`
      });

      addToast?.({
        type: 'success',
        title: 'تمت إضافة المستخدم',
        message: `تم إنشاء حساب (${newUser.name}) برمز PIN: ${formData.pin || '1234'}`
      });
      setShowAddModal(false);
    }

    loadUsers();
  };

  const handleDeleteUser = () => {
    if (!deleteConfirmUser) return;
    
    // Safety lock: Cannot delete Wali or Super Admin
    if (deleteConfirmUser.role === 'wali' || deleteConfirmUser.id === 'usr-superadmin') {
      addToast?.({
        type: 'error',
        title: 'إجراء محظور سيادياً',
        message: 'لا يمكن حذف الحساب السيادي لوالي الولاية أو حساب المشرف التقني العام.'
      });
      setDeleteConfirmUser(null);
      return;
    }

    AdminService.deleteUser(deleteConfirmUser.id);
    AdminService.logAudit({
      userId: user?.id || 'admin',
      userName: user?.name || 'المسؤول',
      userRole: user?.roleTitle || 'مسؤول',
      action: 'حذف مستخدم',
      targetId: deleteConfirmUser.id,
      targetType: 'مستخدم',
      details: `تم حذف حساب المستخدم (${deleteConfirmUser.name} - ${deleteConfirmUser.roleTitle}).`
    });

    addToast?.({
      type: 'info',
      title: 'تم حذف الحساب',
      message: `تم إزالة حساب (${deleteConfirmUser.name}) من قاعدة البيانات المحلية.`
    });

    setDeleteConfirmUser(null);
    loadUsers();
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinResetUser || !newPin || newPin.length < 4) return;

    AdminService.setUserPin(pinResetUser.id, pinResetUser.role, newPin);

    AdminService.logAudit({
      userId: user?.id || 'admin',
      userName: user?.name || 'المسؤول',
      userRole: user?.roleTitle || 'مسؤول',
      action: 'إعادة تعيين رمز PIN',
      targetId: pinResetUser.id,
      targetType: 'مستخدم',
      details: `تم تغيير رمز PIN السري للحساب (${pinResetUser.name}).`
    });

    addToast?.({
      type: 'success',
      title: 'تم تحديث رمز PIN',
      message: `تم تعيين الرمز السري الجديد للحساب (${pinResetUser.name}) بنجاح.`
    });

    setPinResetUser(null);
    setNewPin('');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'wali': return 'bg-amber-100 text-amber-900 border-amber-300 font-black';
      case 'chef_cabinet': return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'head_department': return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
      case 'supervisor': return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      case 'employee': return 'bg-gray-100 text-gray-800 border-gray-300 font-bold';
      case 'super_admin': return 'bg-red-100 text-red-900 border-red-300 font-black';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 font-tajawal">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-changa text-gray-900">إدارة المستخدمين والمفتشين الولائيين</h2>
            <span className="bg-[#006233]/10 text-[#006233] text-xs font-bold font-mono px-2.5 py-1 rounded-full border border-[#006233]/20">
              {filteredUsers.length} مسؤول
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            التحكم في حسابات الإطارات، توزيع المسؤوليات، إدارة الصلاحيات المخصصة ورموز PIN السرية
          </p>
        </div>

        {canManageUsers && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#006233] hover:bg-[#004d28] text-white rounded-xl transition-colors text-xs sm:text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>إضافة مسؤول / موظف جديد</span>
          </button>
        )}
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="البحث بالاسم، الصفة، أو المصلحة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006233] text-xs font-tajawal shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-tajawal outline-none focus:border-[#006233] w-full sm:w-auto bg-white text-gray-700 shadow-2xs"
            >
              <option value="">كافة الرتب والمسؤوليات</option>
              <option value="wali">السيد والي الولاية</option>
              <option value="chef_cabinet">السيد الأمين العام للولاية</option>
              <option value="head_department">السادة رؤساء الدوائر</option>
              <option value="supervisor">مسؤولو خلية الإصغاء</option>
              <option value="employee">الموظفون المكلفون بالمعالجة</option>
              <option value="super_admin">المشرف العام وأمن المنظومة</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right font-tajawal border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">المسؤول / الإطار</th>
                <th className="px-6 py-4 font-bold">الرتبة والدور السيادي</th>
                <th className="px-6 py-4 font-bold">الهيئة والمصلحة</th>
                <th className="px-6 py-4 font-bold text-center">الصلاحيات</th>
                <th className="px-6 py-4 font-bold text-center">الحالة</th>
                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#006233] flex items-center justify-center font-bold text-base border border-emerald-200">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.role === 'wali' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                              سيادي
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${getRoleBadge(u.role)}`}>
                      <ShieldCheck className="w-3 h-3" />
                      {u.roleTitle || u.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-700 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{u.department || 'ديوان الوالي'}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 font-mono text-xs font-bold">
                      {u.permissions?.length || 0} صلاحية
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      u.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status === 'active' ? 'نشط ومفعل' : 'معطل مؤقتاً'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {canManageUsers ? (
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-[#006233] hover:bg-emerald-50 rounded-lg transition-colors"
                          title="تعديل الحساب والصلاحيات"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => { setPinResetUser(u); setNewPin(''); }}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="إعادة تعيين رمز PIN"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        {u.role !== 'wali' && u.id !== 'usr-superadmin' && (
                          <button 
                            onClick={() => setDeleteConfirmUser(u)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT USER */}
      <AnimatePresence>
        {(showAddModal || editingUser) && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col"
            >
              <div className="bg-[#006233] text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <h3 className="font-changa font-bold text-base">
                    {editingUser ? `تعديل حساب: ${editingUser.name}` : 'إضافة حساب مسؤول / موظف جديد'}
                  </h3>
                </div>
                <button 
                  onClick={() => { setShowAddModal(false); setEditingUser(null); }}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">الاسم واللقب</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: يوسف حركات"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">الصفة الإدارية الرسمية</label>
                    <input
                      type="text"
                      required
                      value={formData.roleTitle}
                      onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                      placeholder="مثال: رئيس دائرة الوادي"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">البريد الإلكتروني المهني</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@eloued.gov.dz"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">رقم الهاتف</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0655000000"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">الرتبة والدور في النظام</label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value as any)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none font-bold"
                    >
                      <option value="wali">السيد والي الولاية (صلاحيات سيادية كاملة)</option>
                      <option value="chef_cabinet">السيد الأمين العام للولاية (إشراف ومتابعة)</option>
                      <option value="head_department">رئيس دائرة (نطاق إقليمي)</option>
                      <option value="supervisor">مسؤول خلية الإصغاء والتكفل</option>
                      <option value="employee">موظف معالج وميداني</option>
                      <option value="super_admin">المشرف العام والرقمنة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">المصلحة أو الدائرة التابع لها</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="ديوان الوالي / دائرة الوادي"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                    />
                  </div>
                </div>

                {!editingUser && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">رمز PIN السري الأولي للدخول (4 أرقام)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      placeholder="1234"
                      className="w-32 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono font-bold text-base focus:border-[#006233] outline-none"
                    />
                  </div>
                )}

                {/* Granular RBAC Checkboxes */}
                <div>
                  <label className="block font-bold text-gray-800 mb-2 border-b pb-1">
                    ضبط الصلاحيات المخصصة لهذا الحساب ({formData.permissions.length} مفعلة)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    {AVAILABLE_PERMISSIONS.map(perm => (
                      <label key={perm.id} className="flex items-start gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 rounded text-[#006233] focus:ring-[#006233]"
                        />
                        <span className="text-[11px] text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingUser(null); }}
                    className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl shadow-sm transition-colors"
                  >
                    {editingUser ? 'حفظ التعديلات' : 'إنشاء وتفعيل الحساب'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: RESET PIN */}
      <AnimatePresence>
        {pinResetUser && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-[#006233] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-300" />
                  <h3 className="font-changa font-bold text-base">إعادة تعيين رمز PIN</h3>
                </div>
                <button onClick={() => setPinResetUser(null)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleResetPin} className="p-6 space-y-4 text-xs">
                <p className="text-gray-600">
                  سيتم تغيير الرمز السري المستخدم في المصادقة للدخول إلى لوحة التحكم للحساب:
                  <span className="font-bold text-gray-900 block mt-1">{pinResetUser.name} ({pinResetUser.roleTitle})</span>
                </p>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">الرمز السري الجديد (4 أرقام)</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="••••"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono font-bold text-lg tracking-widest focus:border-[#006233] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setPinResetUser(null)}
                    className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={newPin.length < 4}
                    className="px-5 py-2 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
                  >
                    حفظ الرمز السري
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CONFIRM DELETE */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-[#D21034] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-white" />
                  <h3 className="font-changa font-bold text-base">تأكيد حذف الحساب</h3>
                </div>
                <button onClick={() => setDeleteConfirmUser(null)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <p className="text-gray-700">
                  هل أنت متأكد من رغبتك في حذف الحساب الإداري التالي؟
                </p>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 space-y-1">
                  <p className="font-bold text-red-900">{deleteConfirmUser.name}</p>
                  <p className="text-red-700">{deleteConfirmUser.roleTitle || deleteConfirmUser.role}</p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setDeleteConfirmUser(null)}
                    className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    تراجع
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="px-5 py-2 bg-[#D21034] hover:bg-[#b00d2b] text-white font-bold rounded-xl shadow-sm"
                  >
                    تأكيد الحذف
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
