import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle2, MapPin, Phone, Building2, Calendar, ArrowLeft, User, Briefcase, History, MessageSquare, MoreVertical, FileText, Paperclip, Download, ImageIcon } from 'lucide-react';
import { EnhancedGrievance } from '../../types';
import { motion } from 'motion/react';

const mockInbox: Partial<EnhancedGrievance>[] = [
  {
    id: 'WL-2026-000125',
    fullName: 'أحمد بن علي',
    phone: '0655123456',
    applicantMunicipality: 'الوادي',
    applicantNeighborhood: 'حي 8 ماي',
    category: 'السكن',
    subject: 'طلب تسوية سكن ريفي',
    details: 'أرجو من سيادتكم النظر في ملفي المتعلق بالسكن الريفي المودع منذ 2023. أواجه صعوبات كبيرة في إتمام البناء بسبب عدم تسوية الوضعية الإدارية لقطعة الأرض رغم استيفاء جميع الشروط القانونية.',
    createdAt: '2026-09-08T10:30:00Z',
    status: 'جديد',
    priority: 'عاجل',
    attachments: [
      { id: 'a1', name: 'نسخة_من_بطاقة_التعريف.pdf', size: '1.2 MB', type: 'application/pdf', uploadedAt: '2026-09-08T10:30:00Z' },
      { id: 'a2', name: 'صور_الأرضية.jpg', size: '3.4 MB', type: 'image/jpeg', uploadedAt: '2026-09-08T10:30:00Z' },
      { id: 'a3', name: 'وصل_إيداع_الملف_2023.pdf', size: '0.8 MB', type: 'application/pdf', uploadedAt: '2026-09-08T10:30:00Z' }
    ],
    timeline: [
      { id: '1', date: '2026-09-08', time: '10:30', author: 'النظام', authorRole: 'system', action: 'تم استقبال الانشغال بنجاح وتسجيله في المنصة.', statusTo: 'جديد' }
    ]
  },
  {
    id: 'WL-2026-000124',
    fullName: 'فاطمة الزهراء',
    phone: '0544987654',
    applicantMunicipality: 'قمار',
    applicantNeighborhood: 'الوسط',
    category: 'الصحة',
    subject: 'نقص الأدوية في المستوصف',
    details: 'نعاني من نقص حاد في أدوية الأمراض المزمنة (السكري وضغط الدم) في المستوصف المحلي لبلدية قمار، مما يضطرنا للتنقل إلى عاصمة الولاية بشكل مستمر.',
    createdAt: '2026-09-07T14:15:00Z',
    status: 'تم التوجيه للمصلحة المختصة',
    assignedDepartment: 'مديرية الصحة',
    priority: 'متوسط',
    timeline: [
      { id: '1', date: '2026-09-07', time: '14:15', author: 'النظام', authorRole: 'system', action: 'تم استقبال الانشغال وتعيين رقم مرجعي للملف.', statusTo: 'جديد' },
      { id: '2', date: '2026-09-08', time: '09:00', author: 'عمر بن سالم', authorRole: 'supervisor', action: 'تم مراجعة الملف وتحويله إلى مديرية الصحة للتحقيق والرد في الآجال المحددة.', statusTo: 'تم التوجيه للمصلحة المختصة' }
    ]
  },
  {
    id: 'WL-2026-000123',
    fullName: 'يوسف منصوري',
    phone: '0777123456',
    applicantMunicipality: 'الرباح',
    category: 'الطرقات',
    subject: 'تهيئة الطريق المؤدي للمدرسة',
    details: 'الطريق المؤدي لمدرسة ابتدائية مهترئ جدا ويسبب معاناة للتلاميذ خاصة في فصل الشتاء.',
    createdAt: '2026-09-06T09:00:00Z',
    status: 'تم الحل',
    assignedDepartment: 'مديرية الأشغال العمومية',
    priority: 'عادي',
    timeline: [
      { id: '1', date: '2026-09-06', time: '09:00', author: 'النظام', authorRole: 'system', action: 'تم تسجيل الانشغال.', statusTo: 'جديد' },
      { id: '2', date: '2026-09-06', time: '14:00', author: 'مسؤول المنصة', authorRole: 'supervisor', action: 'تم التوجيه لمديرية الأشغال العمومية.', statusTo: 'تم التوجيه' },
      { id: '3', date: '2026-09-08', time: '11:00', author: 'رئيس مصلحة الطرقات', authorRole: 'manager', action: 'تم برمجة عملية التهيئة ضمن ميزانية البلدية لسنة 2026 وتمت الإجابة على المواطن.', statusTo: 'تم الحل' }
    ]
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'جديد': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'تم التوجيه للمصلحة المختصة': 
    case 'تم التوجيه': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'قيد المعالجة': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'تم الحل': return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'مغلق': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'عاجل': return 'text-[#D21034] bg-red-50 border border-red-100';
    case 'متوسط': return 'text-amber-600 bg-amber-50 border border-amber-100';
    default: return 'text-gray-500 bg-gray-50 border border-gray-100';
  }
};

export const InboxView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Partial<EnhancedGrievance> | null>(null);

  return (
    <div className="h-full flex flex-col space-y-4 relative">
      {!selectedTicket ? (
        <>
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

          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
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
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-white sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">رقم الملف</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">المواطن</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">الموضوع / المجال</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">تاريخ الإيداع</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">الأولوية</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100">الحالة</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 font-tajawal border-b border-gray-100 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {mockInbox.map((item, index) => (
                    <tr key={index} onClick={() => setSelectedTicket(item)} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-gray-900">{item.id}</span>
                        {item.attachments && item.attachments.length > 0 && (
                          <div className="flex items-center gap-1 text-gray-400 mt-1" title="يحتوي على مرفقات">
                            <Paperclip className="w-3 h-3" />
                            <span className="text-[10px] font-mono">{item.attachments.length}</span>
                          </div>
                        )}
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
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          <span className="font-tajawal text-sm font-bold text-gray-900 truncate" title={item.subject}>{item.subject}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#006233] font-bold bg-green-50 px-2 py-0.5 rounded">{item.category}</span>
                            <span className="font-tajawal text-[10px] text-gray-500 truncate" title={item.applicantMunicipality}>{item.applicantMunicipality}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-500" dir="ltr">
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
            
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm font-tajawal text-gray-500">
              <span>عرض 1 إلى 3 من 1,245 ملف</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">السابق</button>
                <button className="px-3 py-1 rounded bg-[#006233] text-white">1</button>
                <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">2</button>
                <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">3</button>
                <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">التالي</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col space-y-6">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-tajawal text-sm font-bold w-fit transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> العودة للقائمة
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#006233]"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black font-changa text-gray-900">{selectedTicket.id}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedTicket.status!)}`}>
                      {selectedTicket.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorityColor(selectedTicket.priority!)}`}>
                      أولوية: {selectedTicket.priority}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 font-tajawal">{selectedTicket.subject}</h4>
                </div>
                
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-emerald-50 text-[#006233] rounded-lg font-tajawal text-sm font-bold border border-emerald-200 hover:bg-emerald-100">
                    تحويل للمصلحة
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-tajawal text-sm font-bold hover:bg-gray-200">
                    تعديل الحالة
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-tajawal">المواطن</p>
                    <p className="font-bold text-gray-900 font-tajawal">{selectedTicket.fullName}</p>
                    <p className="text-sm text-gray-600 font-tajawal" dir="ltr">{selectedTicket.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-tajawal">الموقع</p>
                    <p className="font-bold text-gray-900 font-tajawal">بلدية {selectedTicket.applicantMunicipality}</p>
                    <p className="text-sm text-gray-600 font-tajawal">{selectedTicket.applicantNeighborhood || 'غير محدد'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-tajawal">المجال / القطاع</p>
                    <p className="font-bold text-gray-900 font-tajawal">{selectedTicket.category}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-tajawal">تاريخ التسجيل</p>
                    <p className="font-bold text-gray-900 font-tajawal" dir="ltr">
                      {new Date(selectedTicket.createdAt!).toLocaleString('ar-DZ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-tajawal mb-2">نص الانشغال (موضوع الشكوى)</p>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-tajawal leading-relaxed text-sm">
                  {selectedTicket.details}
                </div>
              </div>

              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-tajawal mb-3 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4" /> 
                    الملفات والمرفقات الأدلة ({selectedTicket.attachments.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedTicket.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:border-[#006233]/50 transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${file.type.includes('image') ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                            {file.type.includes('image') ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold font-tajawal text-gray-900 truncate" title={file.name} dir="ltr">{file.name}</p>
                            <p className="text-[10px] text-gray-500 font-tajawal mt-0.5" dir="ltr">{file.size}</p>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-[#006233] hover:bg-emerald-50 rounded-lg transition-colors tooltip" title="تحميل الملف">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
               <h3 className="font-changa font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                  <MessageSquare className="w-5 h-5 text-[#006233]" />
                  إضافة ملاحظة أو إجراء
               </h3>
               <textarea 
                 rows={3} 
                 placeholder="اكتب ملاحظة داخلية للإدارة أو رسالة للمواطن..."
                 className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#006233] font-tajawal text-sm mb-3 resize-none bg-gray-50"
               ></textarea>
               <div className="flex justify-between items-center">
                 <div className="flex gap-2">
                    <label className="flex items-center gap-2 text-sm font-tajawal text-gray-600 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#006233] focus:ring-[#006233]" />
                      ملاحظة داخلية (سرية)
                    </label>
                 </div>
                 <button className="px-6 py-2 bg-[#006233] text-white rounded-lg font-tajawal text-sm font-bold hover:bg-[#004d28]">
                   حفظ الإجراء
                 </button>
               </div>
            </div>
          </div>

          <div className="w-full lg:w-[350px] flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 font-tajawal">
              <h3 className="font-changa font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Building2 className="w-4 h-4 text-gray-500" /> الإسناد والمتابعة
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">الجهة المكلفة</p>
                  <p className="font-bold text-gray-800 bg-gray-50 p-2 rounded border border-gray-100">
                    {selectedTicket.assignedDepartment || 'غير موجه بعد'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">الموظف المسؤول</p>
                  <p className="font-bold text-gray-800 bg-gray-50 p-2 rounded border border-gray-100">
                    {selectedTicket.assignedToName || 'لم يتم التعيين'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 font-tajawal flex-1 min-h-[300px]">
              <h3 className="font-changa font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <History className="w-4 h-4 text-gray-500" /> المسار الزمني (Timeline)
              </h3>
              
              <div className="space-y-6 mt-4 relative before:absolute before:inset-0 before:right-3 before:translate-x-px before:h-full before:w-0.5 before:bg-gray-200 mr-2">
                {selectedTicket.timeline?.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-500 text-white shadow shrink-0 relative z-10 mr-0 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900 text-xs">{event.statusTo}</span>
                        <time className="text-[10px] text-gray-500 font-mono" dir="ltr">{event.date} {event.time}</time>
                      </div>
                      <div className="text-xs text-gray-600 mb-2 leading-relaxed">{event.action}</div>
                      <div className="text-[10px] text-gray-400">بواسطة: {event.author}</div>
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
