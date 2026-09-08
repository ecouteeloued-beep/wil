import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Users, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const stats = [
  { label: 'إجمالي الانشغالات', value: '1,245', icon: FileText, color: 'bg-blue-500', trend: '+12%' },
  { label: 'ملفات جديدة (اليوم)', value: '34', icon: Users, color: 'bg-[#006233]', trend: '+5%' },
  { label: 'قيد المعالجة', value: '312', icon: Clock, color: 'bg-amber-500', trend: '-2%' },
  { label: 'ملفات متأخرة', value: '18', icon: AlertTriangle, color: 'bg-[#D21034]', trend: '+1%' },
  { label: 'تم الحل والإغلاق', value: '881', icon: CheckCircle2, color: 'bg-teal-500', trend: '+15%' },
];

const categoryData = [
  { name: 'السكن', value: 400 },
  { name: 'البيئة', value: 300 },
  { name: 'الطرقات', value: 200 },
  { name: 'الصحة', value: 150 },
  { name: 'الخدمات الإدارية', value: 100 },
  { name: 'التنمية المحلية', value: 50 },
  { name: 'أخرى', value: 45 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#D21034', '#006233'];

const evolutionData = [
  { name: 'جانفي', new: 65, resolved: 40 },
  { name: 'فيفري', new: 59, resolved: 45 },
  { name: 'مارس', new: 80, resolved: 60 },
  { name: 'أفريل', new: 81, resolved: 70 },
  { name: 'ماي', new: 56, resolved: 50 },
  { name: 'جوان', new: 55, resolved: 52 },
];

export const OverviewStats: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">لوحة القيادة</h2>
          <p className="text-sm text-gray-500 font-tajawal mt-1">نظرة عامة على أداء معالجة الانشغالات على مستوى الولاية</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="border border-gray-200 rounded-lg px-4 py-2 font-tajawal text-sm bg-white text-gray-700 outline-none focus:border-[#006233]">
            <option>هذا الشهر</option>
            <option>الشهر الماضي</option>
            <option>هذا العام</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl text-white ${stat.color} shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold font-tajawal ${stat.trend.startsWith('+') ? 'text-[#006233]' : 'text-[#D21034]'}`}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <h4 className="text-3xl font-black font-mono text-gray-900">{stat.value}</h4>
                <p className="text-sm font-tajawal text-gray-500 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Evolution Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-changa font-bold text-lg mb-6">تطور الانشغالات شهرياً</h3>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{fontFamily: 'Tajawal', fontSize: 12}} />
                <YAxis tick={{fontFamily: 'Tajawal', fontSize: 12}} />
                <Tooltip contentStyle={{fontFamily: 'Tajawal', borderRadius: '8px'}} />
                <Legend wrapperStyle={{fontFamily: 'Tajawal', fontSize: '13px'}} />
                <Line type="monotone" dataKey="new" name="ملفات جديدة" stroke="#D21034" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="resolved" name="ملفات معالجة" stroke="#006233" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-changa font-bold text-lg mb-6">توزيع الانشغالات حسب المجال</h3>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{fontFamily: 'Tajawal', borderRadius: '8px'}} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontFamily: 'Tajawal', fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
