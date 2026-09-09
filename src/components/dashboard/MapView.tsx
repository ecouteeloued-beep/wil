import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, AlertCircle, Building2, RefreshCw, Database, CheckCircle2 } from 'lucide-react';
import { AdminService, WILAYA_MUNICIPALITIES_22 } from '../../services/adminService';
import { EnhancedGrievance } from '../../types';

const MAP_URL = 'https://www.openstreetmap.org/export/embed.html?bbox=6.55%2C33.05%2C7.25%2C33.70&layer=mapnik&marker=33.3667%2C6.8667';

export const MapView: React.FC = () => {
  const [grievances, setGrievances] = useState<EnhancedGrievance[]>([]);
  const [lastRefresh, setLastRefresh] = useState('');

  const refresh = () => {
    setGrievances(AdminService.getGrievances());
    setLastRefresh(new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }));
  };

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('complaints_updated', onUpdate);
    return () => window.removeEventListener('complaints_updated', onUpdate);
  }, []);

  const municipalityStats = useMemo(() => WILAYA_MUNICIPALITIES_22.map(municipality => {
    const items = grievances.filter(item =>
      (item.grievanceMunicipality || item.applicantMunicipality || '').trim() === municipality.name
    );
    const resolved = items.filter(item => ['تم الحل', 'تم الرد', 'مغلق ومسوى', 'تمت المعالجة'].includes(item.status)).length;
    return { ...municipality, count: items.length, resolved };
  }).sort((a, b) => b.count - a.count), [grievances]);

  const activeMunicipalities = municipalityStats.filter(item => item.count > 0);
  const totalResolved = municipalityStats.reduce((sum, item) => sum + item.resolved, 0);

  return (
    <div className="space-y-6 font-tajawal">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">الخريطة الجيومكانية لولاية الوادي</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">استكشف توزيع الانشغالات على بلديات الولاية، كما في الخرائط الرقمية الحديثة.</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-[#006233] hover:text-[#006233] shadow-xs">
          <RefreshCw className="w-4 h-4" /> تحديث الخريطة
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4"><span className="text-xs text-gray-500 block">إجمالي الانشغالات</span><strong className="text-2xl text-gray-900 font-mono">{grievances.length}</strong></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4"><span className="text-xs text-gray-500 block">البلديات النشطة</span><strong className="text-2xl text-[#006233] font-mono">{activeMunicipalities.length}</strong><span className="text-[10px] text-gray-400">من أصل 22</span></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4"><span className="text-xs text-gray-500 block">تمت التسوية</span><strong className="text-2xl text-emerald-600 font-mono">{totalResolved}</strong></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4"><span className="text-xs text-gray-500 block">آخر تحديث</span><strong className="text-sm text-gray-800 font-mono">{lastRefresh || '—'}</strong></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
            <h3 className="font-changa font-bold text-base flex items-center gap-2 text-gray-900"><MapPin className="w-5 h-5 text-[#006233]" /> الخريطة التفاعلية لولاية الوادي</h3>
            <span className="text-[11px] text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> مركز الولاية</span>
          </div>
          <div className="relative h-[520px] bg-[#e8eef2]">
            <iframe title="خريطة ولاية الوادي" src={MAP_URL} className="w-full h-full border-0" loading="lazy" />
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg px-3 py-2 text-[11px] text-gray-600">خريطة مفتوحة المصدر · OpenStreetMap</div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-changa font-bold text-base flex items-center gap-2 text-gray-900"><AlertCircle className="w-5 h-5 text-[#D21034]" /> توزيع الانشغالات</h3><Database className="w-4 h-4 text-gray-400" /></div>
          {activeMunicipalities.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm"><Building2 className="w-8 h-8 mx-auto mb-3 text-gray-300" /><p>لا توجد انشغالات محفوظة لعرضها على الخريطة.</p><p className="text-xs mt-1">ستظهر البلديات تلقائيًا بعد استقبال أول انشغال.</p></div>
          ) : (
            <div className="space-y-2 max-h-[445px] overflow-y-auto custom-scrollbar">{activeMunicipalities.map(item => (<div key={item.code} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#006233]/30 hover:bg-gray-50"><div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-emerald-50 text-[#006233]"><Building2 className="w-4 h-4" /></div><div><h4 className="font-bold text-xs text-gray-900">{item.name}</h4><span className="text-[11px] text-gray-500">{item.daira}</span></div></div><div className="text-left"><strong className="font-mono text-sm text-gray-900">{item.count}</strong><span className="block text-[10px] text-emerald-600"><CheckCircle2 className="w-3 h-3 inline" /> {item.resolved} مسوى</span></div></div>))}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;

/* Map reference: OpenStreetMap / Leaflet-style public mapping experience inspired by ouedna.vercel.app/map. */
