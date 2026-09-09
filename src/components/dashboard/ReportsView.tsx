import React from 'react';
import { Download, FileText, BarChart3, Filter } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

export const ReportsView: React.FC = () => {
  const data = [
    { name: 'جانفي', السكن: 400, البيئة: 240, الطرقات: 240 },
    { name: 'فيفري', السكن: 300, البيئة: 139, الطرقات: 221 },
    { name: 'مارس', السكن: 200, البيئة: 980, الطرقات: 229 },
    { name: 'أفريل', السكن: 278, البيئة: 390, الطرقات: 200 },
    { name: 'ماي', السكن: 189, البيئة: 480, الطرقات: 218 },
    { name: 'جوان', السكن: 239, البيئة: 380, الطرقات: 250 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">التقارير والإحصائيات</h2>
          <p className="text-sm text-gray-500 font-tajawal mt-1">إنشاء وعرض تقارير مفصلة حول أداء معالجة الانشغالات</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-tajawal text-sm font-bold shadow-sm">
            <Filter className="w-4 h-4" />
            تصفية
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#D21034] text-white rounded-lg hover:bg-[#b00d2b] transition-colors font-tajawal text-sm font-bold shadow-sm">
            <Download className="w-4 h-4" />
            تصدير PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-tajawal">الملفات المتأخرة</p>
            <h4 className="text-2xl font-bold font-mono text-gray-900">42</h4>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BarChart3 className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-tajawal">نسبة معالجة المصالح</p>
            <h4 className="text-2xl font-bold font-mono text-gray-900">85%</h4>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-tajawal">التقارير المصدرة (هذا الشهر)</p>
            <h4 className="text-2xl font-bold font-mono text-gray-900">12</h4>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-changa font-bold text-lg mb-6">تطور الانشغالات حسب القطاعات الاستراتيجية</h3>
        <div className="h-[400px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{fontFamily: 'Tajawal', fontSize: 12}} />
              <YAxis tick={{fontFamily: 'Tajawal', fontSize: 12}} />
              <RechartsTooltip contentStyle={{fontFamily: 'Tajawal', borderRadius: '8px'}} />
              <Area type="monotone" dataKey="السكن" stackId="1" stroke="#006233" fill="#006233" opacity={0.6} />
              <Area type="monotone" dataKey="البيئة" stackId="1" stroke="#D21034" fill="#D21034" opacity={0.6} />
              <Area type="monotone" dataKey="الطرقات" stackId="1" stroke="#F59E0B" fill="#F59E0B" opacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Table for department performance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-changa font-bold text-lg text-gray-900">أداء المصالح والمديريات</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right font-tajawal">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">المصلحة / المديرية</th>
                <th className="px-6 py-4 font-bold">إجمالي الملفات</th>
                <th className="px-6 py-4 font-bold">معالجة</th>
                <th className="px-6 py-4 font-bold">قيد الدراسة</th>
                <th className="px-6 py-4 font-bold">متأخرة</th>
                <th className="px-6 py-4 font-bold">نسبة الإنجاز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              <tr className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-900">مديرية السكن</td>
                <td className="px-6 py-4">420</td>
                <td className="px-6 py-4 text-emerald-600 font-bold">350</td>
                <td className="px-6 py-4 text-amber-600">50</td>
                <td className="px-6 py-4 text-red-600 font-bold">20</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '83%' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">83%</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-900">مديرية الأشغال العمومية</td>
                <td className="px-6 py-4">210</td>
                <td className="px-6 py-4 text-emerald-600 font-bold">190</td>
                <td className="px-6 py-4 text-amber-600">15</td>
                <td className="px-6 py-4 text-red-600 font-bold">5</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">90%</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-900">مديرية الصحة</td>
                <td className="px-6 py-4">150</td>
                <td className="px-6 py-4 text-emerald-600 font-bold">100</td>
                <td className="px-6 py-4 text-amber-600">40</td>
                <td className="px-6 py-4 text-red-600 font-bold">10</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '66%' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">66%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
