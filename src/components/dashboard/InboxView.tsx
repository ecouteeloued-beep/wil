import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { EnhancedGrievance } from '../../types';

// Mock Data for the inbox
const mockInbox: Partial<EnhancedGrievance>[] = [
  {
    id: 'WL-2026-000125',
    fullName: 'أحمد بن علي',
    applicantMunicipality: 'الوادي',
    category: 'السكن',
    createdAt: '2026-09-08T10:30:00Z',
    status: 'جديد',
    priority: 'عاجل'
  },
  {
    id: 'WL-2026-000124',
    fullName: 'فاطمة الزهراء',
    applicantMunicipality: 'قمار',
    category: 'الصحة',
    createdAt: '2026-09-07T14:15:00Z',
    status: 'قيد المعالجة',
    priority: 'متوسط'
  },
  {
    id: 'WL-2026-000123',
    fullName: 'يوسف منصوري',
    applicantMunicipality: 'الرباح',
    category: 'الطرقات',
    createdAt: '2026-09-06T09:00:00Z',
    status: 'محول للمصلحة',
    priority: 'عادي'
  },
  {
    id: 'WL-2026-000122',
    fullName: 'سمير بوعلام',
    applicantMunicipality: 'البياضة',
    category: 'البيئة',
    createdAt: '2026-09-05T11:45:00Z',
    status: 'تم الحل',
    priority: 'عادي'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'جديد': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'قيد المعالجة': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'محول للمصلحة': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'تم الحل': return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'مغلق': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'عاجل': return 'text-[#D21034] bg-red-50';
    case 'متوسط': return 'text-amber-600 bg-amber-50';
    default: return 'text-gray-500 bg-gray-50';
  }
};

export const InboxView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">إدارة الملفات والانشغالات</h2>
          <p className="text-sm text-gray-500 font-tajawal mt-1">عرض وتصنيف وتوجيه انشغالات المواطنين</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-tajawal text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            تصفية متقدمة
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#006233] text-white rounded-lg text-sm font-tajawal hover:bg-[#004d28]">
            <FileText className="w-4 h-4" />
            تصدير التقرير
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="البحث برقم الملف، اسم المواطن، أو رقم الهاتف..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 text-sm font-tajawal focus:border-[#006233] outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-tajawal text-gray-500">
            <span>عرض:</span>
            <select className="border-none bg-transparent font-bold text-gray-900 outline-none cursor-pointer">
              <option>الكل</option>
              <option>الملفات الجديدة</option>
              <option>قيد المعالجة</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-white sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">رقم الملف</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">المواطن</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">المجال / البلدية</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">تاريخ الإيداع</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">الأولوية</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">الحالة</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {mockInbox.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-gray-900">{item.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs font-tajawal">
                        {item.fullName?.charAt(0)}
                      </div>
                      <span className="font-tajawal text-sm font-bold text-gray-900">{item.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-tajawal text-sm font-bold text-gray-900">{item.category}</span>
                      <span className="font-tajawal text-xs text-gray-500">{item.applicantMunicipality}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-500">
                      {new Date(item.createdAt!).toLocaleDateString('ar-DZ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold font-tajawal ${getPriorityColor(item.priority!)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-tajawal border ${getStatusColor(item.status!)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-[#006233] hover:bg-green-50 rounded-lg transition-colors tooltip" title="معاينة الملف">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="خيارات إضافية">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm font-tajawal text-gray-500">
          <span>عرض 1 إلى 4 من 1,245 ملف</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">السابق</button>
            <button className="px-3 py-1 rounded bg-[#006233] text-white">1</button>
            <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">3</button>
            <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">التالي</button>
          </div>
        </div>
      </div>
    </div>
  );
};
