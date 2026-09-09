import React, { useState } from 'react';
import { MapPin, AlertCircle, Building2, TrendingUp, Info, Eye, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export const MapView: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<any>(null);

  const hotZones: any[] = [];

  return (
    <div className="space-y-6 font-tajawal">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">الخريطة الجيومكانية لولاية الوادي</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            رصد التوزيع الجغرافي للانشغالات، البؤر ذات الكثافة العالية، ومناطق الظل التنموية عبر 22 بلدية
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D21034]"></span> ضغط مرتفع</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> متوسط</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span> مستقر</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs min-h-[520px] flex flex-col relative overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
            <h3 className="font-changa font-bold text-base flex items-center gap-2 text-gray-900">
              <MapPin className="w-5 h-5 text-[#006233]" />
              التمثيل الخرائطي المباشر
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
              GPS: 33.3667° N, 6.8667° E
            </span>
          </div>
          
          <div className="flex-1 w-full min-h-[460px] bg-gray-100 relative z-10">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
              <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={{ lat: 33.3667, lng: 6.8667 }}
                defaultZoom={10}
                gestureHandling={'greedy'}
                disableDefaultUI={false}
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              >
                {hotZones.map((zone, idx) => (
                  <AdvancedMarker 
                    key={idx} 
                    position={{ lat: zone.lat, lng: zone.lng }} 
                    title={zone.name}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <Pin 
                      background={zone.status === 'high' ? '#D21034' : zone.status === 'medium' ? '#F59E0B' : '#059669'} 
                      borderColor={'#ffffff'} 
                      glyphColor={'#ffffff'} 
                    />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        </div>

        {/* Hot Zones List & Inspector */}
        <div className="lg:col-span-4 space-y-4">
          
          {selectedZone && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-3"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-changa font-bold text-base text-[#006233]">{selectedZone.name}</h4>
                <button onClick={() => setSelectedZone(null)} className="text-gray-400 hover:text-gray-700">×</button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-gray-500 block">إجمالي الملفات</span>
                  <strong className="font-mono text-sm text-gray-900">{selectedZone.count}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-gray-500 block">تمت تسويتها</span>
                  <strong className="font-mono text-sm text-emerald-700">{selectedZone.resolved}</strong>
                </div>
              </div>

              <p className="text-gray-700 text-xs">
                القطاع الأكثر إلحاحاً: <strong className="text-gray-900">{selectedZone.topSector}</strong>
              </p>
            </motion.div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5">
            <h3 className="font-changa font-bold text-base mb-4 flex items-center gap-2 text-gray-900">
              <AlertCircle className="w-5 h-5 text-[#D21034]" />
              المناطق الأكثر تسجيلاً للانشغالات
            </h3>
            
            <div className="space-y-3">
              {hotZones.map((zone, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedZone(zone)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedZone?.name === zone.name 
                      ? 'bg-emerald-50/80 border-[#006233]' 
                      : 'border-gray-100 hover:border-[#006233]/30 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      zone.status === 'high' ? 'bg-red-50 text-[#D21034] border border-red-200' : 
                      zone.status === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 
                      'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs font-tajawal text-gray-900">{zone.name}</h4>
                      <span className="text-[11px] text-gray-500 font-mono">{zone.count} انشغال</span>
                    </div>
                  </div>
                  
                  <div className={`text-xs font-bold font-mono flex items-center gap-1 ${
                    zone.trend.startsWith('+') ? 'text-red-500' : 'text-emerald-600'
                  }`}>
                    <TrendingUp className={`w-3.5 h-3.5 ${zone.trend.startsWith('-') && 'rotate-180'}`} />
                    {zone.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
