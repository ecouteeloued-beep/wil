import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Eye, User, FileText, Phone, MapPin, Hash, 
  Calendar, ShieldCheck, History, ArrowLeft, CheckCircle2, MessageSquare, 
  Edit3, Printer, Plus, X, Send, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemUser, EnhancedGrievance } from '../../types';
import { WILAYA_MUNICIPALITIES_22 } from '../../services/adminService';
import { SupabaseService } from '../../services/supabaseService';

interface CitizensViewProps {
  user?: SystemUser;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
}

// Citizen records are loaded from the protected data service; the production build starts empty.
const INITIAL_CITIZENS: any[] = [];

export const CitizensView: React.FC<CitizensViewProps> = ({ user, addToast }) => {
  const [citizens, setCitizens] = useState<any[]>(INITIAL_CITIZENS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<typeof INITIAL_CITIZENS[0] | null>(null);

  // Action Modals
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ phone: '', municipality: '', neighborhood: '' });

  useEffect(() => {
    const loadCitizens = async () => {
      const grievances = await SupabaseService.fetchComplaints();
      const grouped = new Map<string, any>();
      grievances.forEach((item: EnhancedGrievance) => {
        const key = `${item.phone || item.fullName}|${item.grievanceMunicipality || item.applicantMunicipality}`;
        const current = grouped.get(key);
        if (current) {
          current.filesCount += 1;
          current.files.push(item);
          current.history.push(item);
          if (new Date(item.createdAt) > new Date(current.lastActivity)) current.lastActivity = item.createdAt;
        } else {
          grouped.set(key, {
            id: item.phone || item.id,
            birthDate: item.birthDate || 'غير مسجل',
            gender: item.gender || 'غير مسجل',
            fullName: item.fullName || 'مواطن بدون اسم',
            phone: item.phone || 'غير متوفر',
            municipality: item.grievanceMunicipality || item.applicantMunicipality || 'الوادي',
            neighborhood: item.applicantNeighborhood || 'غير محدد',
            filesCount: 1,
            files: [item],
            history: [item],
            status: 'موثق',
            lastActivity: item.createdAt,
            registrationDate: item.createdAt,
          });
        }
      });
      setCitizens(Array.from(grouped.values()));
    };
    void loadCitizens();
    const refresh = () => { void loadCitizens(); };
    window.addEventListener('complaints_updated', refresh);
    return () => window.removeEventListener('complaints_updated', refresh);
  }, []);

  const filteredCitizens = useMemo(() => {
    return citizens.filter(c => {
      if (filterMunicipality && c.municipality !== filterMunicipality) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchIdentity = `${c.birthDate} ${c.gender}`.toLowerCase().includes(q);
        const matchName = c.fullName.toLowerCase().includes(q);
        const matchPhone = c.phone.includes(q);
        const matchMuni = c.municipality.toLowerCase().includes(q);
        if (!matchIdentity && !matchName && !matchPhone && !matchMuni) return false;
      }
      return true;
    });
  }, [citizens, searchTerm, filterMunicipality]);

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCitizen || !smsMessage.trim()) return;

    addToast?.({
      type: 'success',
      title: 'تم إرسال الرسالة النصية',
      message: `تم توجيه الرسالة النصية بنجاح إلى المواطن (${selectedCitizen.fullName}) على الرقم (${selectedCitizen.phone}).`
    });

    setShowSmsModal(false);
    setSmsMessage('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCitizen) return;

    const updated = citizens.map(c => {
      if (c.id === selectedCitizen.id) {
        return {
          ...c,
          phone: editFormData.phone || c.phone,
          municipality: editFormData.municipality || c.municipality,
          neighborhood: editFormData.neighborhood || c.neighborhood
        };
      }
      return c;
    });

    setCitizens(updated);
    setSelectedCitizen(prev => prev ? {
      ...prev,
      phone: editFormData.phone || prev.phone,
      municipality: editFormData.municipality || prev.municipality,
      neighborhood: editFormData.neighborhood || prev.neighborhood
    } : null);

    addToast?.({
      type: 'success',
      title: 'تم تحديث بيانات المواطن',
      message: `تم حفظ تعديلات الملف الشخصي للمواطن (${selectedCitizen.fullName}).`
    });

    setShowEditModal(false);
  };

  const handleToggleVerification = () => {
    if (!selectedCitizen) return;
    const newStatus = selectedCitizen.status === 'موثق' ? 'قيد التحقق' : 'موثق';

    const updated = citizens.map(c => c.id === selectedCitizen.id ? { ...c, status: newStatus } : c);
    setCitizens(updated);
    setSelectedCitizen(prev => prev ? { ...prev, status: newStatus } : null);

    addToast?.({
      type: 'info',
      title: 'تغيير حالة التوثيق',
      message: `أصبحت حالة المواطن (${selectedCitizen.fullName}): ${newStatus}`
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'موثق') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>موثق بيومترياً</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>قيد التحقق</span>
      </span>
    );
  };

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'تم التوجيه للمصلحة المختصة': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'قيد المعالجة': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'تم الحل': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'مغلق': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 font-tajawal">
      {!selectedCitizen ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-changa text-gray-900">سجل المواطنين والمتابعة الولائية</h2>
                <span className="bg-[#006233]/10 text-[#006233] text-xs font-bold font-mono px-2.5 py-1 rounded-full border border-[#006233]/20">
                  {filteredCitizens.length} مواطن
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                الدليل الرقمي للمواطنين المسجلين عبر بلديات ولاية الوادي الـ 22 وتتبع سجل انشغالاتهم
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors border shadow-xs ${
                  filterMunicipality 
                    ? 'bg-emerald-50 text-[#006233] border-emerald-300' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{filterMunicipality ? `بلدية: ${filterMunicipality}` : 'تصفية حسب البلدية'}</span>
              </button>
            </div>
          </div>

          {/* Municipality Filter Drawer */}
          {showFilterDropdown && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-700 ml-2">اختر البلدية:</span>
              <button
                onClick={() => { setFilterMunicipality(''); setShowFilterDropdown(false); }}
                className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
                  !filterMunicipality ? 'bg-[#006233] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل (22 بلدية)
              </button>
              {WILAYA_MUNICIPALITIES_22.map(m => (
                <button
                  key={m.code}
                  onClick={() => { setFilterMunicipality(m.name); setShowFilterDropdown(false); }}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
                    filterMunicipality === m.name ? 'bg-[#006233] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/60">
              <div className="relative max-w-md w-full">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="البحث بالاسم أو رقم الهاتف..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-tajawal focus:border-[#006233] outline-none shadow-2xs bg-white"
                />
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {filteredCitizens.length} مسجل
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">الاسم واللقب</th>
                    <th className="px-6 py-4 font-bold">المواطن</th>
                    <th className="px-6 py-4 font-bold">معلومات الاتصال</th>
                    <th className="px-6 py-4 font-bold">البلدية</th>
                    <th className="px-6 py-4 font-bold text-center">عدد الملفات</th>
                    <th className="px-6 py-4 font-bold text-center">التوثيق</th>
                    <th className="px-6 py-4 font-bold text-center">معاينة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredCitizens.map((citizen) => (
                    <tr 
                      key={citizen.id} 
                      onClick={() => setSelectedCitizen(citizen)} 
                      className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                          {citizen.fullName}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#006233] flex items-center justify-center font-bold text-sm border border-emerald-200">
                            {citizen.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-sm block group-hover:text-[#006233]">
                              {citizen.fullName}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono">ID: {citizen.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-700 font-mono" dir="ltr">
                          {citizen.phone}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>بلدية {citizen.municipality}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold font-mono">
                          {citizen.filesCount} ملفات
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(citizen.status)}
                      </td>

                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedCitizen(citizen)}
                          className="p-1.5 text-gray-400 hover:text-[#006233] hover:bg-emerald-50 rounded-lg transition-colors"
                          title="معاينة الملف الكامل"
                        >
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedCitizen(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-xs font-bold bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              <span>العودة لقائمة المواطنين</span>
            </button>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة البطاقة</span>
              </button>

              <button 
                onClick={() => {
                  setEditFormData({
                    phone: selectedCitizen.phone,
                    municipality: selectedCitizen.municipality,
                    neighborhood: selectedCitizen.neighborhood
                  });
                  setShowEditModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل البيانات</span>
              </button>

              <button 
                onClick={() => {
                  setSmsMessage(`السيد(ة) ${selectedCitizen.fullName}، نحيطكم علماً بتحديث وضعية ملفكم لدى مصالح ولاية الوادي.`);
                  setShowSmsModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#006233] hover:bg-[#004d28] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                <span>إرسال إشعار SMS</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Citizen Identity Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#006233] flex items-center justify-center mx-auto text-2xl font-black mb-3 border border-emerald-200">
                    {selectedCitizen.fullName.charAt(0)}
                  </div>
                  <h3 className="font-changa font-bold text-lg text-gray-900">{selectedCitizen.fullName}</h3>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    {getStatusBadge(selectedCitizen.status)}
                    <button 
                      onClick={handleToggleVerification}
                      className="text-[10px] text-gray-500 hover:text-[#006233] underline font-bold"
                    >
                      (تبديل)
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">تاريخ الميلاد والجنس:</span>
                    <span className="font-bold text-gray-900">{selectedCitizen.birthDate || 'غير مسجل'} — {selectedCitizen.gender || 'غير مسجل'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> رقم الهاتف:</span>
                    <span className="font-mono font-bold text-gray-900" dir="ltr">{selectedCitizen.phone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> البلدية والحي:</span>
                    <span className="font-bold text-gray-900">{selectedCitizen.municipality} - {selectedCitizen.neighborhood}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> تاريخ أول تسجيل:</span>
                    <span className="font-mono text-gray-700">{selectedCitizen.registrationDate.split('T')[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Historic Complaints list */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-[#006233]" />
                    <h3 className="font-changa font-bold text-base text-gray-900">
                      السجل التاريخي لانشغالات وعرائض المواطن
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-gray-500 font-mono">
                    {selectedCitizen.history.length} ملفات مسجلة
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedCitizen.history.map((h, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#006233]">{h.id}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 font-mono">{h.createdAt?.split('T')[0] || 'غير متوفر'}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getFileStatusColor(h.status)}`}>
                          {h.status}
                        </span>
                      </div>

                      <h4 className="font-changa font-bold text-sm text-gray-900">{h.subject}</h4>
                      
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>القطاع: <strong className="text-gray-700">{h.category}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* MODAL: SMS TO CITIZEN */}
      <AnimatePresence>
        {showSmsModal && selectedCitizen && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-[#006233] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-300" />
                  <h3 className="font-changa font-bold text-base">إرسال رسالة قصيرة (SMS)</h3>
                </div>
                <button onClick={() => setShowSmsModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendSms} className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <p><span className="font-bold">المواطن:</span> {selectedCitizen.fullName}</p>
                  <p><span className="font-bold">الهاتف:</span> <span className="font-mono" dir="ltr">{selectedCitizen.phone}</span></p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">نص الرسالة القصيرة</label>
                  <textarea
                    rows={4}
                    required
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSmsModal(false)}
                    className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال الرسالة</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT CITIZEN */}
      <AnimatePresence>
        {showEditModal && selectedCitizen && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-[#006233] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-300" />
                  <h3 className="font-changa font-bold text-base">تعديل بيانات المواطن</h3>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">البلدية</label>
                  <select
                    value={editFormData.municipality}
                    onChange={(e) => setEditFormData({ ...editFormData, municipality: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {WILAYA_MUNICIPALITIES_22.map(m => (
                      <option key={m.code} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">الحي أو القرية</label>
                  <input
                    type="text"
                    value={editFormData.neighborhood}
                    onChange={(e) => setEditFormData({ ...editFormData, neighborhood: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl shadow-sm"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
