import React, { useState } from 'react';
import { Building2, Search, Plus, MoreVertical, FolderOpen, Users, X, Check, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemUser } from '../../types';
import { AdminService } from '../../services/adminService';

interface DepartmentsViewProps {
  user?: SystemUser;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
}

const INITIAL_DEPTS = [
  { id: '1', name: 'مديرية السكن والتعمير', head: 'يوسف منصوري', users: 12, activeFiles: 45, status: 'نشط' },
  { id: '2', name: 'مديرية الأشغال العمومية', head: 'أحمد بن علي', users: 8, activeFiles: 32, status: 'نشط' },
  { id: '3', name: 'مديرية الصحة والسكان', head: 'فاطمة الزهراء شريف', users: 15, activeFiles: 89, status: 'نشط' },
  { id: '4', name: 'مؤسسة سونلغاز (توزيع الكهرباء والغاز)', head: 'محمد أمين قدور', users: 5, activeFiles: 18, status: 'نشط' },
  { id: '5', name: 'الجزائرية للمياه (ADE) - وحدة الوادي', head: 'بلقاسم التجاني', users: 9, activeFiles: 41, status: 'نشط' },
  { id: '6', name: 'مديرية الموارد المائية والري', head: 'صالح بوعافية', users: 6, activeFiles: 24, status: 'نشط' },
  { id: '7', name: 'مديرية المصالح الفلاحية (DSA)', head: 'عمار سالمي', users: 11, activeFiles: 37, status: 'نشط' },
  { id: '8', name: 'مديرية النشاط الاجتماعي والتضامن (DASS)', head: 'خديجة بن ناصر', users: 7, activeFiles: 29, status: 'نشط' }
];

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({ user, addToast }) => {
  const [departments, setDepartments] = useState(INITIAL_DEPTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', head: '', users: '4' });

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newDept = {
      id: String(Date.now()),
      name: formData.name.trim(),
      head: formData.head.trim() || 'قيد التعيين',
      users: parseInt(formData.users) || 1,
      activeFiles: 0,
      status: 'نشط'
    };

    setDepartments([...departments, newDept]);
    setShowAddModal(false);
    setFormData({ name: '', head: '', users: '4' });

    AdminService.logAudit({
      userId: user?.id || 'admin',
      userName: user?.name || 'المسؤول',
      userRole: user?.roleTitle || 'مسؤول الهيكل',
      action: 'إضافة مصلحة / مديرية جديدة',
      targetId: newDept.id,
      targetType: 'هيكل إداري',
      details: `تمت إضافة (${newDept.name}) برئاسة (${newDept.head}) إلى الهيكل التنظيمي للمنظومة.`
    });

    addToast?.({
      type: 'success',
      title: 'تمت إضافة المديرية',
      message: `تم إدراج (${newDept.name}) ضمن المصالح والمديريات المتفاعلة مع المنظومة.`
    });
  };

  const handleToggleStatus = (id: string, name: string) => {
    setDepartments(departments.map(d => {
      if (d.id === id) {
        const nextStatus = d.status === 'نشط' ? 'معطل' : 'نشط';
        addToast?.({
          type: 'info',
          title: 'تحديث حالة المصلحة',
          message: `تم تغيير حالة (${name}) إلى: ${nextStatus}`
        });
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  return (
    <div className="space-y-6 font-tajawal">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-changa text-gray-900">الهيكل التنظيمي والمصالح المعنية</h2>
            <span className="bg-emerald-50 text-[#006233] text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {departments.length} مصالح تنفيذية
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            إدارة وتعيين المديريات، المؤسسات العمومية، والمصالح الولائية المكلفة بدراسة الانشغالات والرد عليها
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#006233] hover:bg-[#004d28] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>إضافة مديرية / مصلحة</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="البحث بالاسم أو المسؤول المباشر..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-tajawal focus:border-[#006233] outline-none shadow-2xs bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {filtered.map((dept, idx) => (
            <motion.div 
              key={dept.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              className="border border-gray-200 rounded-2xl p-5 hover:border-[#006233]/40 transition-all bg-white group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#006233] border border-emerald-100">
                    <Building2 className="w-5 h-5" />
                  </div>
                  
                  <button 
                    onClick={() => handleToggleStatus(dept.id, dept.name)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title={dept.status === 'نشط' ? 'تعطيل الاستقبال' : 'تفعيل الاستقبال'}
                  >
                    <Power className={`w-4 h-4 ${dept.status === 'نشط' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  </button>
                </div>
                
                <h3 className="font-bold text-gray-900 font-changa text-base mb-1">{dept.name}</h3>
                <p className="text-xs text-gray-500 mb-4">المسؤول: <span className="font-bold text-gray-800">{dept.head}</span></p>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5" title="الموظفون المكلفون بالمعالجة">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono font-bold">{dept.users}</span>
                </div>
                <div className="flex items-center gap-1.5" title="الملفات قيد المعالجة حالياً">
                  <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono font-bold text-amber-600">{dept.activeFiles}</span>
                </div>
                <div className="mr-auto">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    dept.status === 'نشط' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {dept.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD DEPARTMENT */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-[#006233] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-300" />
                  <h3 className="font-changa font-bold text-base">إضافة مصلحة / مديرية جديدة</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDept} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">اسم المصلحة / المديرية *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مديرية التجارة وترقية الصادرات"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#006233]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">اسم المدير / رئيس المصلحة</label>
                  <input
                    type="text"
                    placeholder="مثال: عبد القادر عثماني"
                    value={formData.head}
                    onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#006233]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">عدد حسابات الموظفين المخصصة</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.users}
                    onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl shadow-sm"
                  >
                    حفظ وإضافة المصلحة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
