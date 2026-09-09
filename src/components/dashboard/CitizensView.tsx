import React, { useState } from 'react';
import { Search, Filter, Eye, User, FileText, Phone, MapPin, Hash, Calendar, ShieldCheck, History, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

// Mock Data for Citizens
const mockCitizens = [
  {
    id: 'CIT-2026-001',
    nin: '198501234567890123',
    fullName: 'أحمد بن علي',
    phone: '0655123456',
    email: 'ahmed.ali@email.com',
    municipality: 'الوادي',
    neighborhood: 'حي 8 ماي',
    registrationDate: '2026-01-15T10:30:00Z',
    status: 'موثق',
    filesCount: 3,
    history: [
      { id: 'WL-2026-000125', date: '2026-09-08', subject: 'طلب تسوية سكن ريفي', category: 'السكن', status: 'جديد' },
      { id: 'WL-2025-004512', date: '2025-11-20', subject: 'إنارة عمومية', category: 'التنمية المحلية', status: 'مغلق' },
      { id: 'WL-2024-001102', date: '2024-05-10', subject: 'تعبيد طريق', category: 'الطرقات', status: 'مغلق' }
    ]
  },
  {
    id: 'CIT-2026-002',
    nin: '199009876543210987',
    fullName: 'فاطمة الزهراء',
    phone: '0544987654',
    email: 'fatima.z@email.com',
    municipality: 'قمار',
    neighborhood: 'الوسط',
    registrationDate: '2026-03-22T14:15:00Z',
    status: 'موثق',
    filesCount: 1,
    history: [
      { id: 'WL-2026-000124', date: '2026-09-07', subject: 'نقص الأدوية في المستوصف', category: 'الصحة', status: 'قيد المعالجة' }
    ]
  },
  {
    id: 'CIT-2026-003',
    nin: '197805554443332221',
    fullName: 'يوسف منصوري',
    phone: '0777123456',
    email: '',
    municipality: 'الرباح',
    neighborhood: 'حي الشهداء',
    registrationDate: '2026-06-10T09:00:00Z',
    status: 'قيد التحقق',
    filesCount: 2,
    history: [
      { id: 'WL-2026-000123', date: '2026-09-06', subject: 'تهيئة الطريق المؤدي للمدرسة', category: 'الطرقات', status: 'تم الحل' },
      { id: 'WL-2026-000088', date: '2026-07-01', subject: 'تسرب مياه الشرب', category: 'البيئة', status: 'مغلق' }
    ]
  }
];

export const CitizensView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState<typeof mockCitizens[0] | null>(null);

  const getStatusBadge = (status: string) => {
    if (status === 'موثق') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200"><ShieldCheck className="w-3 h-3" /> {status}</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200"><ShieldCheck className="w-3 h-3" /> {status}</span>;
  };

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'قيد المعالجة': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'تم الحل': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'مغلق': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 relative">
      {!selectedCitizen ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold font-changa text-gray-900">سجل المواطنين (Citizens Directory)</h2>
              <p className="text-sm text-gray-500 font-tajawal mt-1">إدارة الملفات الشخصية للمواطنين وتتبع سجل انشغالاتهم</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-tajawal text-gray-700 hover:bg-gray-50 shadow-sm font-bold">
                <Filter className="w-4 h-4" />
                تصفية متقدمة
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
              <div className="relative max-w-md w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="البحث برقم التعريف (NIN)، الاسم، أو رقم الهاتف..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 text-sm font-tajawal focus:border-[#006233] outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-white sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">رقم التعريف الوطني (NIN)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">المواطن</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">معلومات الاتصال</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">المقر (البلدية)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100 text-center">عدد الملفات</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">حالة الحساب</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {mockCitizens.map((citizen, index) => (
                    <tr key={index} onClick={() => setSelectedCitizen(citizen)} className="hover:bg-emerald-50/50 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-bold text-gray-900 tracking-widest bg-gray-100 px-2 py-1 rounded inline-block">
                          {citizen.nin}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#006233]/10 text-[#006233] flex items-center justify-center font-bold text-sm font-tajawal border border-[#006233]/20">
                            {citizen.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-tajawal text-sm font-bold text-gray-900 block">{citizen.fullName}</span>
                            <span className="text-xs text-gray-500 font-mono">ID: {citizen.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-tajawal text-sm font-bold text-gray-700 flex items-center gap-1.5" dir="ltr">
                            {citizen.phone} <Phone className="w-3 h-3 text-gray-400" />
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-tajawal text-sm font-bold text-gray-700 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" /> {citizen.municipality}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                          {citizen.filesCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(citizen.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-gray-400 hover:text-[#006233] hover:bg-emerald-100 rounded-lg transition-colors tooltip bg-gray-50 border border-gray-200" title="معاينة ملف المواطن">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Detailed Profile View */
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Main Info Column */}
          <div className="w-full lg:w-1/3 flex flex-col space-y-6">
            <button 
              onClick={() => setSelectedCitizen(null)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-tajawal text-sm font-bold w-fit transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> العودة للقائمة
            </button>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
              <div className="h-24 bg-gradient-to-r from-[#006233] to-[#004d28]"></div>
              <div className="px-6 pb-6 relative">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-[#006233] -mt-10 mx-auto text-3xl font-bold font-tajawal">
                  {selectedCitizen.fullName.charAt(0)}
                </div>
                
                <div className="text-center mt-3 mb-6">
                  <h3 className="text-xl font-black font-changa text-gray-900">{selectedCitizen.fullName}</h3>
                  <div className="flex justify-center mt-2">{getStatusBadge(selectedCitizen.status)}</div>
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-4 font-tajawal text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2"><Hash className="w-4 h-4" /> رقم التعريف (NIN)</span>
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{selectedCitizen.nin}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2"><Phone className="w-4 h-4" /> رقم الهاتف</span>
                    <span className="font-bold text-gray-900" dir="ltr">{selectedCitizen.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> الإقامة</span>
                    <span className="font-bold text-gray-900">بلدية {selectedCitizen.municipality}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> تاريخ التسجيل</span>
                    <span className="font-bold text-gray-900" dir="ltr">{new Date(selectedCitizen.registrationDate).toLocaleDateString('ar-DZ')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-2">
              <button className="w-full py-2.5 bg-emerald-50 text-[#006233] border border-emerald-200 rounded-lg font-tajawal font-bold text-sm hover:bg-emerald-100 transition-colors">
                مراسلة المواطن (SMS)
              </button>
              <button className="w-full py-2.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg font-tajawal font-bold text-sm hover:bg-gray-100 transition-colors">
                تعديل البيانات
              </button>
            </div>
          </div>

          {/* Grievance History Column */}
          <div className="flex-1 flex flex-col space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex-1">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <h3 className="font-changa font-bold text-lg text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#006233]" /> 
                  السجل التاريخي للانشغالات
                </h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm font-tajawal border border-gray-200">
                  إجمالي الملفات: {selectedCitizen.filesCount}
                </span>
              </div>

              <div className="space-y-4">
                {selectedCitizen.history.map((file, idx) => (
                  <div key={idx} className="p-4 border border-gray-100 rounded-xl hover:border-[#006233]/30 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#006233] group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 font-tajawal">{file.subject}</h4>
                          <span className="text-xs text-gray-500 font-mono tracking-wide">{file.id}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getFileStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-tajawal bg-white p-2 rounded-lg border border-gray-50">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> أودع في: <span dir="ltr">{file.date}</span></div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> القطاع: {file.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
