import React from 'react';
import { ArrowRight, BarChart3, Building2, CheckCircle2, FileText, Leaf, MapPin, ShieldCheck, Sprout, TrendingUp } from 'lucide-react';

type Sector = 'agriculture' | 'investment';

const CONTENT = {
  agriculture: {
    title: 'قطاع الفلاحة والتنمية الريفية',
    subtitle: 'متابعة ملفات الأراضي الفلاحية، السقي، الدعم والإنتاج الريفي عبر مصالح الولاية.',
    icon: Sprout,
    color: 'emerald',
    directorate: 'مديرية الفلاحة والتنمية الريفية',
    cards: [
      ['ملفات السقي والري', 'متابعة انشغالات مياه السقي، الآبار، وشبكات الري الفلاحي.'],
      ['العقار الفلاحي', 'توجيه ملفات الأراضي الفلاحية، الامتياز، والتسوية إلى المصلحة المختصة.'],
      ['الدعم والإنتاج', 'تجميع طلبات الدعم، حماية المواشي، ومرافقة المنتجين المحليين.'],
    ],
  },
  investment: {
    title: 'قطاع الاستثمار وترقية المؤسسات',
    subtitle: 'لوحة متابعة العراقيل الاستثمارية، العقار الاقتصادي، وتسهيل مرافقة أصحاب المشاريع.',
    icon: TrendingUp,
    color: 'amber',
    directorate: 'مديرية الاستثمار وترقية المؤسسات',
    cards: [
      ['مرافقة المستثمرين', 'تسجيل الطلبات ومتابعة مراحل التوجيه والرد الإداري على المستثمر.'],
      ['رفع العراقيل', 'تجميع العراقيل المتعلقة بالتراخيص، العقار، الربط، والآجال.'],
      ['المشاريع والمؤسسات', 'متابعة المشاريع المحلية والمؤسسات الصغيرة ومؤشرات المعالجة.'],
    ],
  },
} as const;

export const SectorDetailsView: React.FC<{ sector: Sector; onBack: () => void }> = ({ sector, onBack }) => {
  const content = CONTENT[sector];
  const Icon = content.icon;
  const isAgriculture = sector === 'agriculture';
  return <div className="space-y-6 font-tajawal">
    <button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#006233]"><ArrowRight className="w-4 h-4" />العودة إلى لوحة القيادة</button>
    <section className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl ${isAgriculture ? 'bg-gradient-to-l from-[#075b38] to-[#123b2c]' : 'bg-gradient-to-l from-[#855a18] to-[#3f3018]'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div><span className="inline-flex items-center gap-2 text-xs font-bold rounded-full bg-white/10 border border-white/20 px-3 py-1.5"><ShieldCheck className="w-4 h-4" />قطاع مؤسسي معتمد</span><h1 className="font-changa font-black text-2xl sm:text-4xl mt-4">{content.title}</h1><p className="text-sm text-white/75 mt-3 max-w-2xl leading-7">{content.subtitle}</p></div>
        <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center"><Icon className="w-10 h-10 text-amber-300" /></div>
      </div>
    </section>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{content.cards.map(([title, description]) => <article key={title} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"><div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006233] flex items-center justify-center mb-4"><CheckCircle2 className="w-5 h-5" /></div><h2 className="font-changa font-bold text-base text-gray-900">{title}</h2><p className="text-xs text-gray-500 leading-6 mt-2">{description}</p></article>)}</div>
    <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm"><h2 className="font-changa font-bold text-lg text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#006233]" />مؤشرات المتابعة</h2><div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">{[['الملفات الجديدة', 'تُحسب من صندوق الانشغالات'], ['قيد المعالجة', 'حسب الحالة الحالية'], ['الملفات المحالة', content.directorate], ['متوسط الرد', 'يُحسب من سجل التدقيق']].map(([label, value]) => <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-4"><p className="text-[11px] text-gray-500">{label}</p><p className="text-sm font-bold text-gray-800 mt-2">{value}</p></div>)}</div></section>
    <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm"><h2 className="font-changa font-bold text-lg text-gray-900">مسار التوجيه الإداري</h2><div className="flex flex-col sm:flex-row gap-3 mt-5">{[<><FileText className="w-4 h-4" />تسجيل الانشغال</>, <><MapPin className="w-4 h-4" />تحديد البلدية والمصلحة</>, <><Building2 className="w-4 h-4" />الإحالة إلى {content.directorate}</>].map((step, index) => <div key={index} className="flex-1 rounded-xl bg-gray-50 border border-gray-100 p-4 text-xs font-bold text-gray-700 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#006233] text-white flex items-center justify-center">{index + 1}</span>{step}</div>)}</div></section>
  </div>;
};
