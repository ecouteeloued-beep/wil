import React from 'react';
import { MapPin, Search, Plus, MoreVertical, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export const MunicipalitiesView: React.FC = () => {
  const municipalities = [
    { id: '1', name: 'بلدية الوادي', code: '3901', type: 'مقر الولاية', files: 145, status: 'نشط' },
    { id: '2', name: 'بلدية قمار', code: '3902', type: 'مقر دائرة', files: 89, status: 'نشط' },
    { id: '3', name: 'بلدية البياضة', code: '3903', type: 'بلدية', files: 67, status: 'نشط' },
    { id: '4', name: 'بلدية الرباح', code: '3904', type: 'مقر دائرة', files: 112, status: 'نشط' },
    { id: '5', name: 'بلدية حاسي خليفة', code: '3905', type: 'بلدية', files: 34, status: 'نشط' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">البلديات والمقاطعات</h2>
          <p className="text-sm text-gray-500 font-tajawal mt-1">إدارة التقسيم الإداري ومتابعة نشاط كل بلدية</p>
        </div>
        <button className="px-4 py-2 bg-[#006233] text-white rounded-lg font-tajawal text-sm font-bold shadow-sm hover:bg-[#004d28] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة تقسيم جديد
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="البحث عن بلدية..." 
              className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 text-sm font-tajawal focus:border-[#006233] outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-white sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">رمز البلدية (ONS)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">اسم البلدية / المقاطعة</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">التصنيف</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">الملفات المسجلة</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">الحالة</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {municipalities.map((item, idx) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{item.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#006233] flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-tajawal text-sm font-bold text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-tajawal text-xs text-gray-500">{item.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 font-tajawal text-sm text-gray-700">
                      <FileText className="w-4 h-4 text-gray-400" /> {item.files}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
