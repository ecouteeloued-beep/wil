import React, { useState, useMemo } from 'react';
import { 
  EnhancedGrievance, 
  Municipality, 
  SystemUser 
} from '../../types';
import { 
  Map, 
  Layers, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  TrendingUp, 
  Search, 
  Printer, 
  Eye, 
  Info,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';

interface SuperAdminMapViewProps {
  currentUser: SystemUser;
  grievances: EnhancedGrievance[];
  onSelectGrievance: (grievance: EnhancedGrievance) => void;
}

interface MunicipalityData {
  name: Municipality;
  daira: string;
  count: number;
  resolved: number;
  inProgress: number;
  unassigned: number;
  overdue: number;
  urgent: number;
  topSector: string;
  coords: { x: number; y: number }; // relative SVG coords (0-100)
}

// 10 Dairas of Wilaya of El Oued and their 22 Municipalities with geographical placements
const MUNICIPALITIES_MAP_CONFIG: { name: Municipality; daira: string; x: number; y: number }[] = [
  // North / Guemar Daira
  { name: 'قمار', daira: 'دائرة قمار', x: 42, y: 28 },
  { name: 'تغزوت', daira: 'دائرة قمار', x: 48, y: 22 },
  { name: 'ورماس', daira: 'دائرة قمار', x: 36, y: 24 },

  // North-West / Reguiba Daira
  { name: 'الرقيبة', daira: 'دائرة الرقيبة', x: 30, y: 32 },
  { name: 'الحمراية', daira: 'دائرة الرقيبة', x: 20, y: 22 },

  // Center / El Oued Daira
  { name: 'الوادي', daira: 'دائرة الوادي', x: 52, y: 46 },
  { name: 'كوينين', daira: 'دائرة الوادي', x: 48, y: 40 },

  // Center-South / Bayadha Daira
  { name: 'البياضة', daira: 'دائرة البياضة', x: 50, y: 53 },

  // North-East / Magrane Daira
  { name: 'المقرن', daira: 'دائرة المقرن', x: 62, y: 28 },
  { name: 'سيدي عون', daira: 'دائرة المقرن', x: 60, y: 36 },

  // East / Debila Daira
  { name: 'الدبيلة', daira: 'دائرة الدبيلة', x: 65, y: 45 },
  { name: 'حساني عبد الكريم', daira: 'دائرة الدبيلة', x: 58, y: 44 },

  // East-North / Hassi Khalifa Daira
  { name: 'حاسي خليفة', daira: 'دائرة حاسي خليفة', x: 74, y: 38 },
  { name: 'الطريفاوي', daira: 'دائرة حاسي خليفة', x: 68, y: 52 },

  // Far East / Taleb Larbi Daira
  { name: 'الطالب العربي', daira: 'دائرة الطالب العربي', x: 86, y: 50 },
  { name: 'بن قشة', daira: 'دائرة الطالب العربي', x: 84, y: 38 },
  { name: 'دوار الماء', daira: 'دائرة الطالب العربي', x: 88, y: 64 },

  // South / Robbah Daira
  { name: 'الرباح', daira: 'دائرة الرباح', x: 52, y: 64 },
  { name: 'النخلة', daira: 'دائرة الرباح', x: 60, y: 65 },
  { name: 'العقلة', daira: 'دائرة الرباح', x: 54, y: 73 },

  // South-West / Oum Touyour / Oumieh Ouensa Daira
  { name: 'أمية ونسه', daira: 'دائرة أمية ونسه', x: 38, y: 58 },
  { name: 'وادي العلندة', daira: 'دائرة أمية ونسه', x: 42, y: 68 },
];

export const SuperAdminMapView: React.FC<SuperAdminMapViewProps> = ({
  currentUser,
  grievances,
  onSelectGrievance
}) => {
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | 'all'>('all');
  const [selectedDaira, setSelectedDaira] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'split'>('split');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique Dairas
  const allDairas = useMemo(() => {
    const list = Array.from(new Set(MUNICIPALITIES_MAP_CONFIG.map(m => m.daira)));
    return list.sort();
  }, []);

  // Compute aggregated stats for each municipality
  const municipalityStats = useMemo<Record<string, MunicipalityData>>(() => {
    const map: Record<string, MunicipalityData> = {};

    MUNICIPALITIES_MAP_CONFIG.forEach(item => {
      const muniGrievances = grievances.filter(g => g.grievanceMunicipality === item.name);
      
      const resolved = muniGrievances.filter(g => g.status === 'تمت المعالجة' || g.status === 'مغلق').length;
      const inProgress = muniGrievances.filter(g => g.status === 'قيد المعالجة').length;
      const unassigned = muniGrievances.filter(g => g.status === 'جديد').length;
      const overdue = muniGrievances.filter(g => g.isOverdue).length;
      const urgent = muniGrievances.filter(g => g.priority === 'عاجل' || g.priority === 'قصوى').length;

      // Find top sector
      const sectorCounts: Record<string, number> = {};
      muniGrievances.forEach(g => {
        const cat = g.category || 'أخرى';
        sectorCounts[cat] = (sectorCounts[cat] || 0) + 1;
      });
      let topSector = 'متنوعة';
      let maxCount = 0;
      Object.entries(sectorCounts).forEach(([sec, cnt]) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          topSector = sec;
        }
      });

      map[item.name] = {
        name: item.name,
        daira: item.daira,
        count: muniGrievances.length,
        resolved,
        inProgress,
        unassigned,
        overdue,
        urgent,
        topSector,
        coords: { x: item.x, y: item.y }
      };
    });

    return map;
  }, [grievances]);

  // Filtered grievances for the list
  const filteredGrievances = useMemo(() => {
    return grievances.filter(g => {
      if (selectedMunicipality !== 'all' && g.grievanceMunicipality !== selectedMunicipality) {
        return false;
      }
      if (selectedDaira !== 'all' && g.grievanceDaira !== selectedDaira) {
        return false;
      }
      if (sectorFilter !== 'all' && g.category !== sectorFilter) {
        return false;
      }
      if (statusFilter !== 'all' && g.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubject = g.subject?.toLowerCase().includes(q);
        const matchName = g.fullName?.toLowerCase().includes(q);
        const matchId = g.id?.toLowerCase().includes(q);
        const matchMuni = g.grievanceMunicipality?.toLowerCase().includes(q);
        if (!matchSubject && !matchName && !matchId && !matchMuni) return false;
      }
      return true;
    });
  }, [grievances, selectedMunicipality, selectedDaira, sectorFilter, statusFilter, searchQuery]);

  // Overall totals
  const totalWilayaGrievances = grievances.length;
  const totalResolved = grievances.filter(g => g.status === 'تمت المعالجة' || g.status === 'مغلق').length;
  const resolutionRate = totalWilayaGrievances > 0 
    ? Math.round((totalResolved / totalWilayaGrievances) * 100) 
    : 0;
  const totalOverdue = grievances.filter(g => g.isOverdue).length;
  const totalUrgent = grievances.filter(g => g.priority === 'عاجل' || g.priority === 'قصوى').length;

  const handlePrintMapReport = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Super Admin Map Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-l from-slate-900 via-slate-800 to-[#1C2B33] text-white border border-slate-700 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#C67D2A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#006233]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#C67D2A] to-[#A05C18] p-3 flex items-center justify-center text-white shadow-lg shrink-0">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#C67D2A]/25 border border-[#C67D2A]/50 text-[#F4D03F] text-[11px] font-bold">
                  صلاحية حصرية — Super Admin
                </span>
                <span className="text-xs text-slate-400">نظام الرقابة الإقليمية</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-['Changa'] text-white mt-1">
                الخريطة الجغرافية التفاعلية لولاية الوادي (GIS)
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                متابعة مكانية آنية لتوزيع انشغالات المواطنين عبر دوائر ولاية الوادي الـ 10 وبلدياتها الـ 22 لرصد بؤر الاستعجال والتأخير واتخاذ القرارات الإدارية.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintMapReport}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="طباعة تقرير التوزيع الجغرافي"
            >
              <Printer className="w-4 h-4 text-[#C67D2A]" />
              <span>طباعة كشف ولائي</span>
            </button>
            <div className="flex items-center bg-black/30 rounded-xl p-1 border border-white/10 text-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'split' ? 'bg-[#006233] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                خريطة وقائمة
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'map' ? 'bg-[#006233] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                الخريطة كاملة
              </button>
            </div>
          </div>
        </div>

        {/* Executive Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10 text-right">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium block">إجمالي الانشغالات بالولاية</span>
            <span className="text-2xl font-black font-mono text-white">{totalWilayaGrievances}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">عبر 22 بلدية</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium block">نسبة التكفل والتسوية</span>
            <span className="text-2xl font-black font-mono text-emerald-400">{resolutionRate}%</span>
            <span className="text-[10px] text-emerald-300 block mt-0.5">{totalResolved} ملف مغلق ومسوى</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium block">الانشغالات العاجلة والقصوى</span>
            <span className="text-2xl font-black font-mono text-amber-400">{totalUrgent}</span>
            <span className="text-[10px] text-amber-300 block mt-0.5">تتطلب متابعة ذات أولوية</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium block">ملفات متأخرة عن الآجال (SLA)</span>
            <span className="text-2xl font-black font-mono text-rose-400">{totalOverdue}</span>
            <span className="text-[10px] text-rose-300 block mt-0.5">تنبيه رقابي للمسؤولين</span>
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-[#C67D2A]" />
            <span>تصفية مكانية:</span>
          </div>

          {/* Daira Selector */}
          <select
            value={selectedDaira}
            onChange={(e) => {
              setSelectedDaira(e.target.value);
              setSelectedMunicipality('all');
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="all">كافة دوائر الولاية (10)</option>
            {allDairas.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Municipality Selector */}
          <select
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="all">كافة البلديات (22 بلدية)</option>
            {MUNICIPALITIES_MAP_CONFIG
              .filter(m => selectedDaira === 'all' || m.daira === selectedDaira)
              .map(m => (
                <option key={m.name} value={m.name}>
                  {m.name} ({municipalityStats[m.name]?.count || 0})
                </option>
              ))}
          </select>

          {/* Sector Filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="all">كافة القطاعات</option>
            <option value="العمران">العمران والتهيئة</option>
            <option value="البيئة">البيئة والمياه</option>
            <option value="النقل">النقل والطرقات</option>
            <option value="الصحة">الصحة والمرافق</option>
            <option value="الحالة المدنية">الحالة المدنية</option>
            <option value="أخرى">أخرى</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="all">كافة الحالات</option>
            <option value="جديد">جديد غير مسند</option>
            <option value="قيد المعالجة">قيد المعالجة</option>
            <option value="بانتظار المراجعة">بانتظار المراجعة</option>
            <option value="تمت المعالجة">تمت المعالجة</option>
            <option value="مغلق">مغلق ومسوى</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بالموضوع، المواطن أو الرمز..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#C67D2A]"
          />
        </div>
      </div>

      {/* Main Map + Details Layout */}
      <div className={`grid gap-5 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* Interactive Territorial Map Container */}
        <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'col-span-1'} p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-[#006233]" />
              <h2 className="text-sm font-bold text-slate-800">
                مخطط التوزيع المكاني لبلديات ولاية الوادي
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>تسوية عالية</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>قيد المتابعة</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>بها تأخيرات</span>
              </span>
            </div>
          </div>

          {/* Interactive Geographic Map Canvas */}
          <div className="relative w-full aspect-4/3 bg-radial from-amber-50/50 to-slate-100/90 rounded-xl border border-slate-200 overflow-hidden select-none p-4 flex items-center justify-center">
            
            {/* Compass rose watermark */}
            <div className="absolute top-4 left-4 opacity-15 pointer-events-none">
              <Compass className="w-24 h-24 text-slate-800" />
            </div>

            {/* Map Territorial Representation SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-xs">
              <defs>
                {/* Gradient for wilaya territory boundary */}
                <linearGradient id="wilayaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#fed7aa" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Generalized Wilaya of El Oued boundary outline */}
              <polygon
                points="18,18 42,12 80,18 95,35 96,65 78,85 50,88 28,78 12,50 14,28"
                fill="url(#wilayaGrad)"
                stroke="#C67D2A"
                strokeWidth="0.8"
                strokeDasharray="2,1"
                className="transition-all duration-300"
              />

              {/* Subtle internal daira boundary links */}
              <line x1="42" y1="28" x2="52" y2="46" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="1,1" />
              <line x1="52" y1="46" x2="65" y2="45" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="1,1" />
              <line x1="52" y1="46" x2="50" y2="53" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="1,1" />
              <line x1="50" y1="53" x2="52" y2="64" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="1,1" />
              <line x1="65" y1="45" x2="86" y2="50" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="1,1" />
              <line x1="42" y1="28" x2="30" y2="32" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="1,1" />

              {/* Municipality Markers */}
              {MUNICIPALITIES_MAP_CONFIG.map((muni) => {
                const stat = municipalityStats[muni.name];
                const count = stat ? stat.count : 0;
                const overdue = stat ? stat.overdue : 0;
                const isSelected = selectedMunicipality === muni.name;
                const hasOverdue = overdue > 0;

                // Color code node by status
                const circleFill = isSelected 
                  ? '#C67D2A' 
                  : hasOverdue 
                  ? '#e11d48' 
                  : count > 3 
                  ? '#f59e0b' 
                  : '#059669';

                const radius = isSelected ? 4.2 : Math.min(3.8, Math.max(2.4, 2.0 + count * 0.3));

                return (
                  <g 
                    key={muni.name} 
                    onClick={() => setSelectedMunicipality(muni.name === selectedMunicipality ? 'all' : muni.name)}
                    className="cursor-pointer transition-all transform group"
                  >
                    {/* Pulsing ring for selected or overdue */}
                    {(isSelected || hasOverdue) && (
                      <circle
                        cx={muni.x}
                        cy={muni.y}
                        r={radius + 1.8}
                        fill="none"
                        stroke={hasOverdue ? '#f43f5e' : '#C67D2A'}
                        strokeWidth="0.6"
                        strokeOpacity="0.8"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={muni.x}
                      cy={muni.y}
                      r={radius}
                      fill={circleFill}
                      stroke="#ffffff"
                      strokeWidth="0.7"
                      className="transition-transform duration-200 group-hover:scale-125"
                    />

                    {/* Badge Count inside circle */}
                    <text
                      x={muni.x}
                      y={muni.y + 0.9}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="2.0"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {count}
                    </text>

                    {/* Municipality Name label */}
                    <text
                      x={muni.x}
                      y={muni.y - radius - 1.2}
                      textAnchor="middle"
                      fill={isSelected ? '#1C2B33' : '#334155'}
                      fontSize="2.1"
                      fontWeight={isSelected ? 'bold' : '600'}
                      fontFamily="Cairo, sans-serif"
                    >
                      {muni.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Selection Box */}
            {selectedMunicipality !== 'all' && (
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md text-right text-xs max-w-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-800 text-sm">{selectedMunicipality}</span>
                  <button 
                    onClick={() => setSelectedMunicipality('all')}
                    className="text-[10px] text-slate-400 hover:text-red-600 font-bold"
                  >
                    إلغاء التحديد ✕
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 mb-2">
                  دائرة {municipalityStats[selectedMunicipality]?.daira || ''}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <span className="bg-slate-100 p-1.5 rounded-md font-mono text-slate-700">
                    الانشغالات: <strong>{municipalityStats[selectedMunicipality]?.count || 0}</strong>
                  </span>
                  <span className="bg-emerald-50 p-1.5 rounded-md font-mono text-emerald-700">
                    المعالج: <strong>{municipalityStats[selectedMunicipality]?.resolved || 0}</strong>
                  </span>
                  <span className="bg-rose-50 p-1.5 rounded-md font-mono text-rose-700">
                    المتأخر: <strong>{municipalityStats[selectedMunicipality]?.overdue || 0}</strong>
                  </span>
                  <span className="bg-amber-50 p-1.5 rounded-md font-mono text-amber-700">
                    العاجل: <strong>{municipalityStats[selectedMunicipality]?.urgent || 0}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Municipalities Grid */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              البلديات الـ 22 (انقر للفرز الفوري):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {MUNICIPALITIES_MAP_CONFIG.map(m => {
                const stat = municipalityStats[m.name];
                const count = stat ? stat.count : 0;
                const isSel = selectedMunicipality === m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => setSelectedMunicipality(isSel ? 'all' : m.name)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                      isSel 
                        ? 'bg-[#C67D2A] text-white border-[#C67D2A] font-bold shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSel ? 'bg-white/20 text-white' : count > 0 ? 'bg-slate-200 text-slate-800' : 'bg-transparent text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grievances List in Selected Region */}
        {viewMode === 'split' && (
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  الانشغالات المسجلة {selectedMunicipality !== 'all' ? `ببلدية ${selectedMunicipality}` : 'بالولاية'}
                </h3>
                <span className="text-xs text-slate-500">
                  {filteredGrievances.length} انشغال مطابق للمعايير
                </span>
              </div>

              {selectedMunicipality !== 'all' && (
                <button
                  onClick={() => setSelectedMunicipality('all')}
                  className="text-xs text-[#C67D2A] font-bold hover:underline"
                >
                  عرض كافة البلديات
                </button>
              )}
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[520px] pr-1">
              {filteredGrievances.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  لا توجد انشغالات مسجلة تطابق هذه التصفية المكانية.
                </div>
              ) : (
                filteredGrievances.map(g => (
                  <div
                    key={g.id}
                    onClick={() => onSelectGrievance(g)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-[#C67D2A]/60 bg-white hover:bg-slate-50/70 transition-all cursor-pointer shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {g.id}
                        </span>
                        <PriorityBadge priority={g.priority} />
                      </div>
                      <StatusBadge status={g.status} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {g.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C67D2A]" />
                        <span>{g.grievanceMunicipality} ({g.grievanceDaira})</span>
                      </div>
                      <span className="font-medium text-slate-600">
                        {g.category}
                      </span>
                    </div>

                    {g.isOverdue && (
                      <div className="text-[10.5px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>تجاوز الآجال القانونية المحددة للرد</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Bottom summary note */}
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>انقر على أي ملف لمعاينة تفاصيله الكاملة والرقابة الإدارية</span>
              <Eye className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
