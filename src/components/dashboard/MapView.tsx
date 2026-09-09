import React from 'react';
import { MapPin, AlertCircle, Building2, TrendingUp, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export const MapView: React.FC = () => {
  // Demo data for municipalities
  const hotZones = [
    { name: 'بلدية الوادي', count: 145, trend: '+12%', status: 'high', lat: 33.3667, lng: 6.8667 },
    { name: 'بلدية قمار', count: 89, trend: '+5%', status: 'medium', lat: 33.4833, lng: 6.8000 },
    { name: 'بلدية البياضة', count: 67, trend: '-2%', status: 'medium', lat: 33.3000, lng: 6.8833 },
    { name: 'بلدية الرباح', count: 112, trend: '+18%', status: 'high', lat: 33.2667, lng: 6.8833 },
    { name: 'بلدية حاسي خليفة', count: 34, trend: '-5%', status: 'low', lat: 33.5667, lng: 6.9667 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-changa text-gray-900">الخريطة التفاعلية للولاية</h2>
          <p className="text-sm text-gray-500 font-tajawal mt-1">التوزيع الجغرافي للانشغالات والمناطق الأكثر طلباً للتدخل (Powered by Google Maps)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-changa font-bold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#006233]" />
              خريطة التوزيع الجغرافي
            </h3>
            <span className="text-xs font-tajawal text-gray-500 flex items-center gap-1">
               <Info className="w-4 h-4" /> وضع المطور التجريبي
            </span>
          </div>
          
          <div className="flex-1 w-full h-[500px] bg-gray-100 relative z-10">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
              <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={{ lat: 33.3667, lng: 6.8667 }}
                defaultZoom={10}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              >
                {hotZones.map((zone, idx) => (
                  <AdvancedMarker key={idx} position={{ lat: zone.lat, lng: zone.lng }} title={zone.name}>
                    <Pin background={zone.status === 'high' ? '#D21034' : zone.status === 'medium' ? '#F59E0B' : '#059669'} borderColor={'#ffffff'} glyphColor={'#ffffff'} />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        </div>

        {/* Hot Zones List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-changa font-bold text-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#D21034]" />
            المناطق الأكثر طلباً للتدخل
          </h3>
          
          <div className="space-y-4">
            {hotZones.map((zone, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#006233]/30 hover:bg-emerald-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${zone.status === 'high' ? 'bg-red-100 text-red-600' : zone.status === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm font-tajawal text-gray-900">{zone.name}</h4>
                    <span className="text-xs text-gray-500">{zone.count} انشغال مسجل</span>
                  </div>
                </div>
                <div className={`text-xs font-bold flex items-center gap-1 ${zone.trend.startsWith('+') ? 'text-red-500' : 'text-emerald-500'}`}>
                  <TrendingUp className={`w-3 h-3 ${zone.trend.startsWith('-') && 'rotate-180'}`} />
                  {zone.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
