import React, { useState } from 'react';
import { EnhancedGrievance, SystemUser, GrievancePriority } from '../../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { ComplaintTimeline } from './ComplaintTimeline';
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Download, 
  FileEdit, 
  FileText, 
  Lock, 
  MapPin, 
  MessageSquare, 
  Paperclip, 
  Phone, 
  RefreshCw, 
  Send, 
  ShieldAlert, 
  User, 
  UserCheck, 
  X 
} from 'lucide-react';

interface GrievanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance: EnhancedGrievance | null;
  currentUser: SystemUser;
  onStartProcessing: (id: string) => void;
  onOpenAssign: (g: EnhancedGrievance) => void;
  onOpenDraftResponse: (g: EnhancedGrievance) => void;
  onOpenApproveClose: (g: EnhancedGrievance) => void;
  onOpenRequestInfo: (g: EnhancedGrievance) => void;
  onOpenInternalNote: (g: EnhancedGrievance) => void;
  onChangePriority: (id: string, priority: GrievancePriority) => void;
  onReturnToEmployee: (id: string, notes: string) => void;
  onReopen: (id: string, reason: string) => void;
}

export const GrievanceDetailModal: React.FC<GrievanceDetailModalProps> = ({
  isOpen,
  onClose,
  grievance,
  currentUser,
  onStartProcessing,
  onOpenAssign,
  onOpenDraftResponse,
  onOpenApproveClose,
  onOpenRequestInfo,
  onOpenInternalNote,
  onChangePriority,
  onReturnToEmployee,
  onReopen
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'notes' | 'response'>('timeline');
  const [prioritySelect, setPrioritySelect] = useState<GrievancePriority>(grievance?.priority || 'متوسط');
  const [returnNotes, setReturnNotes] = useState('');
  const [showReturnBox, setShowReturnBox] = useState(false);

  if (!isOpen || !grievance) return null;

  const isSupervisor = currentUser.role === 'supervisor' || currentUser.role === 'super_admin';
  const isAssignedEmployee = currentUser.role === 'employee' && grievance.assignedToId === currentUser.id;
  const isViewer = currentUser.role === 'viewer';

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as GrievancePriority;
    setPrioritySelect(val);
    onChangePriority(grievance.id, val);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnNotes.trim()) return;
    onReturnToEmployee(grievance.id, returnNotes.trim());
    setShowReturnBox(false);
    setReturnNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/55 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-right flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006233]/10 border border-[#006233]/20 text-[#006233] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Changa'] text-slate-900">
                  ملف انشغال: {grievance.id}
                </h2>
                {grievance.isOverdue && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    تجاوز المهلة (SLA)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                تاريخ الإيداع: {new Date(grievance.createdAt).toLocaleDateString('ar-DZ')} • القطاع: {grievance.sector}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={grievance.status} size="md" />
            <PriorityBadge priority={grievance.priority} size="md" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors mr-2"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Overview Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
            <div>
              <span className="text-slate-500 block mb-1 font-medium">بيانات المواطن:</span>
              <p className="font-bold text-slate-900 text-sm">{grievance.fullName}</p>
              <div className="flex items-center gap-1 text-slate-600 mt-1 font-mono">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{grievance.phone}</span>
              </div>
              {grievance.nin && (
                <div className="text-slate-500 mt-0.5 font-mono">
                  رقم التعريف: {grievance.nin}
                </div>
              )}
            </div>

            <div>
              <span className="text-slate-500 block mb-1 font-medium">الموقع الإداري والجغرافي:</span>
              <div className="flex items-center gap-1 text-slate-800 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#C67D2A]" />
                <span>بلدية {grievance.grievanceMunicipality} (دائرة {grievance.grievanceDaira})</span>
              </div>
              <p className="text-slate-500 mt-1">الحي: {grievance.applicantNeighborhood || 'غير محدد'}</p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1 font-medium">الموظف المسند إليه:</span>
              {grievance.assignedToName ? (
                <div>
                  <div className="flex items-center gap-1 text-slate-900 font-semibold">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{grievance.assignedToName}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{grievance.assignedDepartment}</p>
                </div>
              ) : (
                <span className="inline-block text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                  غير مسند حتى الآن (بانتظار توجيه المسؤول)
                </span>
              )}
            </div>
          </div>

          {/* Grievance Subject & Full Text */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>موضوع الانشغال:</span>
              <span className="text-slate-900 font-normal">{grievance.subject}</span>
            </h3>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line shadow-2xs">
              {grievance.details}
            </div>
          </div>

          {/* Attachments (if any) */}
          {grievance.attachments && grievance.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                <span>الوثائق والملفات المرفقة ({grievance.attachments.length}):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {grievance.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <div className="truncate text-right">
                        <span className="text-xs font-medium text-slate-800 truncate block font-mono">
                          {att.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{att.size}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`محاكاة تحميل الوثيقة الإدارية: ${att.name}`)}
                      className="p-1.5 text-slate-500 hover:text-[#006233] transition-colors"
                      title="تحميل"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-6 space-x-reverse text-xs font-semibold">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'timeline'
                    ? 'border-[#006233] text-[#006233]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>السجل الزمني والمراحل ({grievance.timeline.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'border-[#006233] text-[#006233]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>الملاحظات الداخلية للمصالح ({grievance.internalNotes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('response')}
                className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'response'
                    ? 'border-[#006233] text-[#006233]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>
                  الرد الرسمي
                  {grievance.officialResponse ? (grievance.officialResponse.approved ? ' (معتمد)' : ' (مسودة)') : ' (لم يحرر)'}
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content 1: Timeline */}
          {activeTab === 'timeline' && (
            <div className="pt-2">
              <ComplaintTimeline events={grievance.timeline} />
            </div>
          )}

          {/* Tab Content 2: Internal Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700">سجل الملاحظات الداخلية والاتصالات:</h4>
                {!isViewer && (
                  <button
                    onClick={() => onOpenInternalNote(grievance)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors flex items-center gap-1"
                  >
                    <span>+ إضافة ملاحظة جديدة</span>
                  </button>
                )}
              </div>

              {grievance.internalNotes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  لا توجد ملاحظات داخلية مدونة على هذا الملف بعد.
                </div>
              ) : (
                <div className="space-y-3">
                  {grievance.internalNotes.map((note) => (
                    <div key={note.id} className="p-3.5 rounded-lg bg-amber-50/40 border border-amber-200/60 text-right">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-mono">
                        <span className="font-semibold text-slate-800">{note.author} ({note.authorRole})</span>
                        <span>{new Date(note.createdAt).toLocaleString('ar-DZ')}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content 3: Official Response */}
          {activeTab === 'response' && (
            <div className="space-y-4 pt-2">
              {grievance.officialResponse ? (
                <div className="p-5 rounded-xl border bg-slate-50/70 border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <span className="text-xs text-slate-500 block">حالة الرد الرسمي:</span>
                      <span className={`text-xs font-bold ${grievance.officialResponse.approved ? 'text-emerald-700' : 'text-orange-700'}`}>
                        {grievance.officialResponse.approved ? 'معتمد رسمياً وقابل للتبليغ' : 'مسودة بانتظار مراجعة واعتماد المسؤول'}
                      </span>
                    </div>
                    {grievance.officialResponse.letterNumber && (
                      <div className="text-left font-mono text-xs">
                        <span className="text-slate-500 block">رقم المراسلة:</span>
                        <span className="font-bold text-slate-800">{grievance.officialResponse.letterNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    أعده الموظف: <span className="font-semibold text-slate-800">{grievance.officialResponse.preparedBy}</span>
                    {grievance.officialResponse.reviewedBy && (
                      <span> • اعتمده: <span className="font-semibold text-slate-800">{grievance.officialResponse.reviewedBy}</span></span>
                    )}
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-['Tajawal']">
                    {grievance.officialResponse.text}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
                  <p>لم يتم تحرير أي رد رسمي لهذا الانشغال حتى الآن.</p>
                  {isAssignedEmployee && (
                    <button
                      onClick={() => onOpenDraftResponse(grievance)}
                      className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>صياغة مسودة رد الآن</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Supervisor Return Box Toggle */}
          {showReturnBox && (
            <form onSubmit={handleReturnSubmit} className="p-4 rounded-xl border border-orange-300 bg-orange-50/70 space-y-3">
              <h4 className="text-xs font-bold text-orange-900">إعادة الملف للموظف مع توجيهات التعديل:</h4>
              <textarea
                rows={3}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                required
                placeholder="وضح للموظف النقاط الواجب تدقيقها أو المراسلات الناقصة..."
                className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReturnBox(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-700 text-white text-xs font-semibold hover:bg-orange-800 transition-colors"
                >
                  تأكيد الإعادة للموظف
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Action Bar strictly based on RBAC */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Priority Quick Change (Supervisor Only) */}
          {isSupervisor && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">تغيير الأولوية:</span>
              <select
                value={prioritySelect}
                onChange={handlePriorityChange}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
              >
                <option value="عادي">عادي</option>
                <option value="متوسط">متوسط</option>
                <option value="عاجل">عاجل</option>
                <option value="قصوى">قصوى</option>
              </select>
            </div>
          )}

          {/* Action Buttons based on Role */}
          <div className="flex flex-wrap items-center gap-2 mr-auto">
            
            {/* Viewer View */}
            {isViewer && (
              <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Lock className="w-3.5 h-3.5" />
                <span>حساب للمعاينة فقط (Read-Only)</span>
              </span>
            )}

            {/* Employee Actions */}
            {isAssignedEmployee && (
              <>
                {grievance.status === 'تم الإسناد' && (
                  <button
                    onClick={() => onStartProcessing(grievance.id)}
                    className="px-4 py-2 rounded-lg bg-[#006233] text-white text-xs font-semibold hover:bg-[#005029] transition-colors flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>بدء المعالجة رسمياً</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenRequestInfo(grievance)}
                  className="px-3.5 py-2 rounded-lg border border-purple-300 text-purple-800 bg-purple-50/50 hover:bg-purple-100 text-xs font-semibold transition-colors"
                >
                  طلب وثائق من المواطن
                </button>

                <button
                  onClick={() => onOpenDraftResponse(grievance)}
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors flex items-center gap-1.5"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>{grievance.officialResponse ? 'تعديل مسودة الرد' : 'صياغة الرد للمراجعة'}</span>
                </button>
              </>
            )}

            {/* Supervisor Actions */}
            {isSupervisor && (
              <>
                <button
                  onClick={() => onOpenAssign(grievance)}
                  className="px-3.5 py-2 rounded-lg border border-indigo-300 text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{grievance.assignedToId ? 'إعادة الإسناد' : 'إسناد لموظف'}</span>
                </button>

                {grievance.status === 'بانتظار المراجعة' && (
                  <>
                    <button
                      onClick={() => setShowReturnBox(!showReturnBox)}
                      className="px-3.5 py-2 rounded-lg border border-orange-300 text-orange-800 bg-orange-50 hover:bg-orange-100 text-xs font-semibold transition-colors"
                    >
                      إعادة للموظف للتعديل
                    </button>

                    <button
                      onClick={() => onOpenApproveClose(grievance)}
                      className="px-4 py-2 rounded-lg bg-[#006233] text-white text-xs font-semibold hover:bg-[#005029] transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>اعتماد الرد وغلق الملف</span>
                    </button>
                  </>
                )}

                {grievance.status === 'مغلق' && (
                  <button
                    onClick={() => {
                      const reason = prompt('يرجى كتابة سبب إعادة فتح الملف الإداري:');
                      if (reason) onReopen(grievance.id, reason);
                    }}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة فتح الملف</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
