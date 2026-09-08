import React, { useState } from 'react';
import { EnhancedGrievance, SystemUser } from '../../types';
import { AlertCircle, CheckCircle, FileText, Send, UserCheck, X } from 'lucide-react';

// =========================================================================
// 1. ASSIGN MODAL (Supervisor)
// =========================================================================
interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance: EnhancedGrievance;
  employees: SystemUser[];
  onConfirm: (employeeId: string, instructions: string) => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  grievance,
  employees,
  onConfirm
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState(grievance.assignedToId || (employees[0]?.id || ''));
  const [instructions, setInstructions] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    onConfirm(selectedEmpId, instructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">إسناد وتوجيه الانشغال</h3>
              <p className="text-xs text-slate-500 font-mono">الملف رقم: {grievance.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              موضوع الانشغال:
            </label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
              {grievance.subject}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              اختيار الموظف المكلف بالمعالجة <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#006233] bg-white"
            >
              <option value="" disabled>-- اختر موظفاً من خلية الإصغاء --</option>
              {employees.filter(e => e.role === 'employee' && e.status === 'نشط').map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.department} (الملفات الجارية: {emp.assignedCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تعليمات وتوجيهات خاصة للموظف (اختياري)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="مثال: يرجى التنسيق المباشر مع رئيس مصلحة الري بالبلدية وإعداد تقرير خلال 48 ساعة..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#006233] bg-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#006233] text-white text-xs font-semibold hover:bg-[#005029] shadow-xs transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>تأكيد الإسناد</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// 2. DRAFT RESPONSE MODAL (Employee)
// =========================================================================
interface DraftResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance: EnhancedGrievance;
  onConfirm: (responseText: string) => void;
}

export const DraftResponseModal: React.FC<DraftResponseModalProps> = ({
  isOpen,
  onClose,
  grievance,
  onConfirm
}) => {
  const [responseText, setResponseText] = useState(grievance.officialResponse?.text || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    onConfirm(responseText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">صياغة الرد الرسمي وإحالته للمراجعة</h3>
              <p className="text-xs text-slate-500 font-mono">الملف رقم: {grievance.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right">
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">تنبيه إداري:</span> الرد الذي ستقوم بصياغته سيحال مباشرة لمراجعة واعتماد مسؤول الخلية قبل تبليغه رسمياً للمواطن وإغلاق الملف.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              نص الرد الرسمي المقترح <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              required
              placeholder="بناءً على الشكوى المقدمة من طرفكم بخصوص... يشرفنا إعلامكم أنه بعد التنسيق مع مصالح..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#006233] bg-white resize-none leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إحالة الرد للمراجعة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// 3. APPROVE & CLOSE MODAL (Supervisor)
// =========================================================================
interface ApproveCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance: EnhancedGrievance;
  onConfirm: (letterNumber: string, revisedText?: string) => void;
}

export const ApproveCloseModal: React.FC<ApproveCloseModalProps> = ({
  isOpen,
  onClose,
  grievance,
  onConfirm
}) => {
  const [letterNumber, setLetterNumber] = useState(
    grievance.officialResponse?.letterNumber || `2026/خ.إ/${Math.floor(100 + Math.random() * 900)}`
  );
  const [revisedText, setRevisedText] = useState(grievance.officialResponse?.text || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(letterNumber, revisedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">اعتماد الرد الرسمي وغلق الانشغال</h3>
              <p className="text-xs text-slate-500 font-mono">الملف رقم: {grievance.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              رقم المراسلة الإدارية / التسجيل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={letterNumber}
              onChange={(e) => setLetterNumber(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#006233] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              مراجعة وتعديل نص الرد النهائي (المعد من طرف: {grievance.officialResponse?.preparedBy || 'الموظف'})
            </label>
            <textarea
              rows={6}
              value={revisedText}
              onChange={(e) => setRevisedText(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#006233] bg-white resize-none leading-relaxed"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            سيتم حفظ الملف في الأرشيف الولائي كملف مسوى، وإشعار المواطن عبر منظومة المتابعة الرقمية.
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#006233] text-white text-xs font-semibold hover:bg-[#005029] shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>اعتماد وغلق الملف رسمياً</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// 4. REQUEST MORE INFO MODAL
// =========================================================================
interface RequestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance: EnhancedGrievance;
  onConfirm: (requestText: string) => void;
}

export const RequestInfoModal: React.FC<RequestInfoModalProps> = ({
  isOpen,
  onClose,
  grievance,
  onConfirm
}) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onConfirm(text.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
          <h3 className="text-base font-bold text-slate-900">طلب وثائق ومعلومات تكميلية من المواطن</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              حدد الوثائق أو الإيضاحات المطلوبة: <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              placeholder="مثال: يرجى إرسال نسخة واضحة من وصل إيداع الملف أو رقم رخصة البناء الصادرة عن البلدية..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-600 bg-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 shadow-xs transition-colors"
            >
              إرسال طلب المعلومات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// 5. INTERNAL NOTE MODAL
// =========================================================================
interface InternalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance: EnhancedGrievance;
  onConfirm: (noteText: string) => void;
}

export const InternalNoteModal: React.FC<InternalNoteModalProps> = ({
  isOpen,
  onClose,
  grievance,
  onConfirm
}) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onConfirm(text.trim());
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-base font-bold text-slate-900">إضافة ملاحظة داخلية (سرية للمصالح الإدارية)</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              نص الملاحظة الداخلية: <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              placeholder="سجل نتائج الاتصال الهاتفي بالمديرية المعنية أو المعاينة الميدانية..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#006233] bg-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 shadow-xs transition-colors"
            >
              حفظ الملاحظة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
