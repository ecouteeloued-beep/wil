import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Users, FileText, CheckCircle2, Clock, AlertTriangle, Timer, 
  TrendingUp, Building2, MapPin, ShieldAlert, Sparkles, Filter, CheckCircle
} from 'lucide-react';

const stats = [
  { label: 'إجمالي الانشغالات المسجلة', value: '1,245', icon: FileText, color: 'text-[#006233]', bg: 'bg-emerald-50 border-emerald-200', trend: '+12% هذا الشهر' },
  { label: 'انشغالات جديدة (اليوم)', value: '34', icon: Users, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', trend: '+5 وارد جديد' },
  { label: 'قيد المعالجة والتحقيق', value: '312', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', trend: '25% من الإجمالي' },
  { label: 'تجاوزت المهلة (عاجلة)', value: '18', icon: AlertTriangle, color: 'text-[#D21034]', bg: 'bg-red-50 border-red-200', trend: 'بحاجة لتدخل الوالي' },
  { label: 'تمت التسوية والإغلاق', value: '881', icon: CheckCircle2, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', trend: 'نسبة الإنجاز 71%' },
  { label: 'متوسط سرعة المعالجة', value: '3.4 أيام', icon: Timer, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', trend: 'ضمن المعيار القانوني' },
];

const categoryData = [
  { name: 'السكن والتعمير', value: 420 },
  { name: 'التهيئة الحضرية والبيئة', value: 295 },
  { name: 'شبكات الطرق والإنارة', value: 210 },
  { name: 'الصحة والمرافق العمومية', value: 145 },
  { name: 'الخدمات الإدارية والرقمنة', value: 95 },
  { name: 'التشغيل والاستثمار', value: 52 },
  { name: 'أخرى', value: 28 },
];

const COLORS = ['#006233', '#10b981', '#f59e0b', '#0284c7', '#6366f1', '#D21034', '#64748b'];

const evolutionData = [
  { name: 'جانفي', new: 65, resolved: 48 },
  { name: 'فيفري', new: 72, resolved: 56 },
  { name: 'مارس', new: 88, resolved: 71 },
  { name: 'أفريل', new: 94, resolved: 85 },
  { name: 'ماي', new: 78, resolved: 74 },
  { name: 'جوان', new: 82, resolved: 79 },
];

const municipalityPerformance = [
  { name: 'الوادي', total: 320, resolved: 245, rate: '76%' },
  { name: 'قمار', total: 210, resolved: 160, rate: '76%' },
  { name: 'البياضة', total: 180, resolved: 135, rate: '75%' },
  { name: 'الرباح', total: 150, resolved: 110, rate: '73%' },
  { name: 'الدبيلة', total: 95, resolved: 58, rate: '61%' },
  { name: 'الرقيبة', total: 85, resolved: 62, rate: '72%' },
  { name: 'حاسي خليفة', total: 75, resolved: 42, rate: '56%' }
];

export const OverviewStats: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  return (
    <div className="space-y-6 font-tajawal">
      
      {/* Executive Algerian State Banner */}
      <div className="bg-gradient-to-l from-[#062012] via-[#09351e] to-[#04160c] text-white p-6 rounded-3xl border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>خلية الإصغاء والوساطة — ديوان والي ولاية الوادي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-changa text-white">
              لوحة القيادة المركزية ومتابعة الأداء الولائي
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              رصد حي ومؤشرات رقمية دقيقة لانشغالات المواطنين عبر 22 بلدية، مع متابعة نسبة الاستجابة والالتزام بالآجال القانونية للتكفل بالعرائض.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
              <span className="block text-2xl font-black font-mono text-amber-300">71%</span>
              <span className="text-[11px] text-gray-300 font-bold">نسبة التسوية الشاملة</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
              <span className="block text-2xl font-black font-mono text-emerald-300">22 / 22</span>
              <span className="text-[11px] text-gray-300 font-bold">بلديات متفاعلة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Warning Ticker */}
      <div className="bg-gradient-to-r from-red-50 via-amber-50 to-red-50 border border-red-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D21034] text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-changa font-bold text-sm text-[#D21034]">تنبيه ولائي عاجل: 18 ملف بحاجة لتسوية استعجالية</h4>
            <p className="text-xs text-gray-700">هذه الملفات تجاوزت أجل 15 يوماً المحدد في تعليمة السيد الوالي وتتطلب تدخلاً مباشراً من المصالح المعنية.</p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#D21034] bg-red-100 px-3 py-1.5 rounded-xl shrink-0 border border-red-200">
          توجيه فوري للهيئة التنفيذية
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border ${stat.bg} shadow-xs flex flex-col justify-between transition-all hover:shadow-md bg-white`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} bg-white shadow-xs border border-gray-100`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold font-tajawal text-gray-500">
                  مؤشر رسمي
                </span>
              </div>
              <div>
                <h4 className="text-3xl font-black font-mono text-gray-900 tracking-tight">{stat.value}</h4>
                <p className="text-xs font-bold font-changa text-gray-800 mt-1">{stat.label}</p>
                <span className={`inline-block text-[11px] font-bold mt-2 ${stat.color}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Evolution Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-changa font-bold text-lg text-gray-900">المنحنى الشهري لمعالجة الانشغالات</h3>
              <p className="text-xs text-gray-500">مقارنة العرائض الواردة بالعرائض التي تم البت فيها وتسويتها</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[#D21034] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D21034]" />
                واردة
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#006233] font-bold mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006233]" />
                تمت التسوية
              </span>
            </div>
          </div>

          <div className="h-[280px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{fontFamily: 'Tajawal', fontSize: 12, fill: '#64748b'}} />
                <YAxis tick={{fontFamily: 'Tajawal', fontSize: 12, fill: '#64748b'}} />
                <Tooltip contentStyle={{fontFamily: 'Tajawal', borderRadius: '12px', border: '1px solid #e2e8f0'}} />
                <Line type="monotone" dataKey="new" name="عرائض جديدة" stroke="#D21034" strokeWidth={3} dot={{r: 4, fill: '#D21034'}} />
                <Line type="monotone" dataKey="resolved" name="عرائض تمت تسويتها" stroke="#006233" strokeWidth={3} dot={{r: 4, fill: '#006233'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-changa font-bold text-base text-gray-900">توزيع الانشغالات حسب القطاع</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">7 قطاعات</span>
            </div>

            <div className="h-[210px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{fontFamily: 'Tajawal', borderRadius: '8px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span>{cat.name}</span>
                </span>
                <span className="font-mono font-bold text-gray-900">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Municipalities Leaderboard & Distribution Table */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-changa font-bold text-lg text-gray-900">أداء البلديات في التكفل بانشغالات المواطنين</h3>
            <p className="text-xs text-gray-500">ترتيب البلديات الأكثر نشاطاً ونسب الإنجاز والتسوية الميدانية</p>
          </div>
          <span className="text-xs font-bold text-[#006233] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
            متابعة دورية لديوان الوالي
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-changa font-bold border-b border-gray-200">
                <th className="py-3 px-4">البلدية</th>
                <th className="py-3 px-4">إجمالي الانشغالات</th>
                <th className="py-3 px-4">تمت تسويتها</th>
                <th className="py-3 px-4">نسبة الإنجاز</th>
                <th className="py-3 px-4 text-center">حالة التفاعل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {municipalityPerformance.map((muni, idx) => (
                <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#006233]" />
                    <span>بلدية {muni.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{muni.total}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{muni.resolved}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            parseInt(muni.rate) >= 70 ? 'bg-[#006233]' : 'bg-amber-500'
                          }`}
                          style={{ width: muni.rate }} 
                        />
                      </div>
                      <span className="font-mono font-bold text-[11px]">{muni.rate}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      parseInt(muni.rate) >= 70 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      <CheckCircle className="w-3 h-3" />
                      {parseInt(muni.rate) >= 70 ? 'ممتاز' : 'متابعة مطلوبة'}
                    </span>
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
