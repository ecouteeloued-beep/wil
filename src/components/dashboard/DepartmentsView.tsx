import React from 'react';
import { Building2, Search, Plus, MoreVertical, FolderOpen, Users } from 'lucide-react';
import { motion } from 'motion/react';

export const DepartmentsView: React.FC = () => {
  const departments = [
    { id: '1', name: 'مديرية السكن والتعمير', head: 'يوسف منصوري', users: 12, activeFiles: 45, status: 'نشط' },
    { id: '2', name: 'مديرية الأشغال العمومية', head: 'أحمد بن علي', users: 8, activeFiles: 32, status: 'نشط' },
    { id: '3', name: 'مديرية الصحة والسكان', head: 'فاطمة الزهراء', users: 15, activeFiles: 89, status: 'نشط' },
    { id: '4', name: 'مؤسسة سونلغاز', head: 'محمد أمين', users: 5, activeFiles: 18, status: 'نشط' },
    { id: '5', name: 'مديرية الموارد المائية', head: 'غير محدد', users: 6, activeFiles: 24, status: 'معطل' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">الهيكل التنظيمي والمصالح</h2>
          <p className="text-sm text-gray-500 font-tajawal mt-1">إدارة المديريات، المؤسسات العمومية، والمصالح المعنية بمعالجة الانشغالات</p>
        </div>
        <button className="px-4 py-2 bg-[#006233] text-white rounded-lg font-tajawal text-sm font-bold shadow-sm hover:bg-[#004d28] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة مديرية جديدة
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="البحث عن مديرية..." 
              className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 text-sm font-tajawal focus:border-[#006233] outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {departments.map((dept, idx) => (
            <motion.div 
              key={dept.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="border border-gray-200 rounded-xl p-5 hover:border-[#006233]/50 transition-colors bg-white group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#006233] border border-gray-100 group-hover:bg-emerald-50 transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="font-bold text-gray-900 font-changa text-lg mb-1">{dept.name}</h3>
              <p className="text-xs text-gray-500 font-tajawal mb-4">المسؤول: <span className="font-bold">{dept.head}</span></p>

              <div className="flex items-center gap-4 text-xs font-tajawal text-gray-600 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-1.5" title="المستخدمين النشطين">
                  <Users className="w-4 h-4 text-gray-400" /> {dept.users}
                </div>
                <div className="flex items-center gap-1.5" title="الملفات قيد المعالجة">
                  <FolderOpen className="w-4 h-4 text-gray-400" /> {dept.activeFiles}
                </div>
                <div className="mr-auto">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${dept.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                    {dept.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
