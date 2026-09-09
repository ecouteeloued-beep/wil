import React from 'react';
import { Plus, Search, Filter, MoreVertical, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import { SystemUser } from '../../types';
import { SEED_USERS } from '../../services/adminService';

export const UsersView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">إدارة المستخدمين</h2>
          <p className="text-sm text-gray-500 font-tajawal mt-1">إضافة، تعديل، وحذف حسابات الموظفين والمسؤولين</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#006233] text-white rounded-lg hover:bg-[#004d28] transition-colors font-tajawal text-sm font-bold shadow-sm">
            <Plus className="w-4 h-4" />
            إضافة مستخدم جديد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            <input 
              type="text" 
              placeholder="البحث عن مستخدم..." 
              className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#006233] font-tajawal text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-tajawal outline-none focus:border-[#006233] w-full sm:w-auto text-gray-700">
              <option value="">جميع الأدوار</option>
              <option value="super_admin">SUPER ADMIN</option>
              <option value="admin">ADMIN</option>
              <option value="manager">MANAGER</option>
              <option value="supervisor">SUPERVISOR</option>
              <option value="employee">EMPLOYEE</option>
              <option value="viewer">VIEWER</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right font-tajawal">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">المستخدم</th>
                <th className="px-6 py-4 font-bold">الدور والصلاحية</th>
                <th className="px-6 py-4 font-bold">الجهة / المصلحة</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold">آخر دخول</th>
                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              <tr className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#006233] text-white flex items-center justify-center font-bold text-lg">
                      و
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">السيد والي الولاية</div>
                      <div className="text-xs text-gray-500">wali@eloued.gov.dz</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
                    <ShieldAlert className="w-3 h-3" /> SUPER ADMIN
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700 font-bold">ديوان الوالي</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">نشط</span>
                </td>
                <td className="px-6 py-4 text-gray-500">الآن</td>
                <td className="px-6 py-4 text-center">
                  <button className="text-gray-400 hover:text-[#006233] transition-colors p-1"><Edit className="w-4 h-4" /></button>
                </td>
              </tr>
              {SEED_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.department}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs" dir="ltr">{new Date(user.lastActive).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex items-center justify-center gap-2">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="تعديل"><Edit className="w-4 h-4" /></button>
                    <button className="text-gray-400 hover:text-red-600 transition-colors p-1" title="تعطيل"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
