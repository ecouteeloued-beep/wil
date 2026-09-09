import React, { useState } from 'react';
import { MapPin, Search, Plus, MoreVertical, FileText, CheckCircle, X, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemUser } from '../../types';
import { WILAYA_MUNICIPALITIES_22, AdminService } from '../../services/adminService';

interface MunicipalitiesViewProps {
  user?: SystemUser;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
}

const MUNICIPALITIES_DATA = WILAYA_MUNICIPALITIES_22.map((m, idx) => ({
  id: String(idx + 1),
  name: m.name,
  code: m.code,
  daira: m.daira,
  type: m.name === 'الوادي' ? 'مقر الولاية' : m.name === m.daira ? 'مقر دائرة' : 'بلدية',
  files: Math.floor(40 + (22 - idx) * 9 + (idx % 3) * 12),
  status: 'نشط'
}));

export const MunicipalitiesView: React.FC<MunicipalitiesViewProps> = ({ user, addToast }) => {
  const [municipalities, setMunicipalities] = useState(MUNICIPALITIES_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', daira: 'الوادي', type: 'بلدية' });

  const filtered = municipalities.filter(m => 
    m.name.includes(searchTerm) || 
    m.code.includes(searchTerm) || 
    m.daira.includes(searchTerm)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newMuni = {
      id: String(Date.now()),
      name: formData.name.trim(),
      code: formData.code.trim() || '3923',
      daira: formData.daira,
      type: formData.type,
      files: 0,
      status: 'نشط'
    };

    setMunicipalities([...municipalities, newMuni]);
    setShowAddModal(false);
    setFormData({ name: '', code: '', daira: 'الوادي', type: 'بلدية' });

    addToast?.({
      type: 'success',
      title: 'تمت إضافة البلدية / التقسيم',
      message: `تم إدراج (${newMuni.name}) ضمن التقسيم الإداري لولاية الوادي.`
    });
  };

  const handleToggleStatus = (id: string, name: string) => {
    setMunicipalities(municipalities.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'نشط' ? 'معطل' : 'نشط';
        addToast?.({
          type: 'info',
          title: 'تحديث حالة البلدية',
          message: `تم تغيير حالة (${name}) إلى: ${nextStatus}`
        });
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-6 font-tajawal">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-changa text-gray-900">البلديات والمقاطعات الإدارية (22 بلدية)</h2>
            <span className="bg-emerald-50 text-[#006233] text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              ولاية الوادي (39)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            متابعة النشاط الإداري ومعدلات معالجة العرائض والانشغالات عبر كافة بلديات ودوائر الولاية
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#006233] hover:bg-[#004d28] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>إضافة تقسيم إداري</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="البحث باسم البلدية، الدائرة، أو الرمز (ONS)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-tajawal focus:border-[#006233] outline-none shadow-2xs bg-white"
            />
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {filtered.length} بلدية
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">رمز البلدية (ONS)</th>
                <th className="px-6 py-4 font-bold">البلدية</th>
                <th className="px-6 py-4 font-bold">الدائرة التابعة لها</th>
                <th className="px-6 py-4 font-bold">التصنيف الإداري</th>
                <th className="px-6 py-4 font-bold text-center">الملفات المسجلة</th>
                <th className="px-6 py-4 font-bold text-center">الحالة</th>
                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.map((item, idx) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                      {item.code}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#006233] flex items-center justify-center border border-emerald-100">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-gray-700 font-bold">دائرة {item.daira}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      item.type === 'مقر الولاية' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      item.type === 'مقر دائرة' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-gray-800 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <FileText className="w-3 h-3 text-gray-400" />
                      {item.files}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === 'نشط' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleToggleStatus(item.id, item.name)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title={item.status === 'نشط' ? 'تعطيل استقبال الانشغالات' : 'تفعيل'}
                    >
                      <Power className={`w-4 h-4 ${item.status === 'نشط' ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD MUNICIPALITY */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-[#006233] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-300" />
                  <h3 className="font-changa font-bold text-base">إضافة تقسيم إداري جديد</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">اسم البلدية / التجمع السكاني *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: بلدية جديدة"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#006233]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">رمز البلدية (ONS Code)</label>
                  <input
                    type="text"
                    placeholder="مثال: 3923"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">الدائرة التابعة لها</label>
                  <input
                    type="text"
                    value={formData.daira}
                    onChange={(e) => setFormData({ ...formData, daira: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#006233] hover:bg-[#004d28] text-white font-bold rounded-xl shadow-sm"
                  >
                    حفظ وإدراج التقسيم
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
