import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Filter, Eye, CheckCircle2, MapPin, Phone, Building2, Calendar, 
  ArrowLeft, User, Briefcase, History, MessageSquare, MoreVertical, 
  FileText, Paperclip, Download, ImageIcon, Send, Clock, AlertTriangle,
  Printer, ShieldAlert, Sparkles, X, ChevronDown, Check, Forward, Award,
  Star, Bookmark, Save, Edit, Trash2, Tag, CheckCheck, ListFilter,
  RefreshCw, Cloud, Database
} from 'lucide-react';
import { EnhancedGrievance, SystemUser, AttachmentFile } from '../../types';
import { AdminService, WILAYA_MUNICIPALITIES_22 } from '../../services/adminService';
import { SupabaseService } from '../../services/supabaseService';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentReaderModal } from './DocumentReaderModal';

interface InboxViewProps {
  user?: SystemUser;
  addToast?: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void;
  initialSearchQuery?: string;
  initialSearchMode?: 'all' | 'id' | 'name' | 'keyword';
  initialSelectedTicketId?: string | null;
  onClearInitialSearch?: () => void;
}

const DIRECTORATES = [
  'مديرية السكن والتعمير',
  'مديرية الأشغال العمومية',
  'مديرية الموارد المائية (ADE)',
  'مديرية الصحة والسكان',
  'مؤسسة سونلغاز (الكهرباء والغاز)',
  'مديرية التربية الوطنية',
  'مديرية الفلاحة والتنمية الريفية',
  'مديرية النقل والمواصلات',
  'مديرية التجارة وترقية الصادرات',
  'مصالح ديوان والي الولاية',
  'الدائرة المختصة إقليمياً',
  'المجلس الشعبي البلدي المختص (APC)'
];

const CATEGORIES = [
  'السكن',
  'البيئة',
  'الموارد المائية',
  'الطرقات',
  'الصحة',
  'الإنارة العمومية',
  'التربية والتعليم',
  'النقل المدرسي',
  'التشغيل والتنمية',
  'الوثائق الإدارية',
  'أخرى'
];

const POPULAR_KEYWORDS = [
  { label: 'سكن وتعليم', kw: 'سكن' },
  { label: 'مياه صالحة', kw: 'ماء' },
  { label: 'كهرباء وغاز', kw: 'كهرباء' },
  { label: 'طرق وتهيئة', kw: 'طرق' },
  { label: 'صحة واستشفاء', kw: 'صحة' },
  { label: 'نظافة وبيئة', kw: 'نظافة' },
  { label: 'فلاحة وري', kw: 'فلاحة' },
  { label: 'استعجالي', kw: 'عاجل' }
];

export const InboxView: React.FC<InboxViewProps> = ({ 
  user, 
  addToast,
  initialSearchQuery = '',
  initialSearchMode = 'all',
  initialSelectedTicketId = null,
  onClearInitialSearch
}) => {
  const [grievances, setGrievances] = useState<EnhancedGrievance[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [searchMode, setSearchMode] = useState<'all' | 'id' | 'name' | 'keyword'>(initialSearchMode);
  const [statusFilter, setStatusFilter] = useState<string>('الكل');
  const [selectedTicket, setSelectedTicket] = useState<EnhancedGrievance | null>(null);

  const handleAttachmentViewed = useCallback(() => {
    if (!selectedTicket) return;
    void SupabaseService.markComplaintViewed(selectedTicket.id);
    setSelectedTicket(previous => previous ? { ...previous, status: 'تم الاطلاع', statusCode: 'VIEWED' } : previous);
  }, [selectedTicket]);

  // Saved Searches state
  const [savedSearches, setSavedSearches] = useState<{ id: string; name: string; query: string; mode: string; date: string }[]>([]);
  const [showSavedSearchesDropdown, setShowSavedSearchesDropdown] = useState(false);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [saveSearchTitle, setSaveSearchTitle] = useState('');

  // Complaint edit & save state
  const [showEditComplaintModal, setShowEditComplaintModal] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editMunicipality, setEditMunicipality] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState<any>('عادي');
  const [editDept, setEditDept] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editInternalNotes, setEditInternalNotes] = useState('');

  // Advanced filter states
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Action modals states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDirectiveModal, setShowDirectiveModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form states inside modals
  const [transferDept, setTransferDept] = useState(DIRECTORATES[0]);
  const [transferNotes, setTransferNotes] = useState('');
  const [newStatus, setNewStatus] = useState('قيد المعالجة');
  const [statusNotes, setStatusNotes] = useState('');
  
  // Executive directive state (Wali / SG)
  const [directiveRef, setDirectiveRef] = useState(`2026/ت.و/${Math.floor(100 + Math.random() * 900)}`);
  const [directiveText, setDirectiveText] = useState('نظراً للطابع الاستعجالي لهذا الانشغال، يُطلب من المصلحة المعنية التدخل الفوري خلال 48 ساعة وموافاتنا بتقرير كتابي مفصل.');
  const [directiveDeadline, setDirectiveDeadline] = useState('48 ساعة');

  // Internal Note state
  const [newInternalNote, setNewInternalNote] = useState('');
  const [isConfidentialNote, setIsConfidentialNote] = useState(false);

  // Official Response Draft state (Employee / Supervisor)
  const [officialReplyText, setOfficialReplyText] = useState('');
  const [replyRefNumber, setReplyRefNumber] = useState(`2026/خ.إ/${Math.floor(100 + Math.random() * 900)}`);

  // Active role filtering toggle (e.g. for employee to view assigned files only)
  const [showOnlyAssignedToMe, setShowOnlyAssignedToMe] = useState(false);

  // Document Reader Modal state for direct reading
  const [readingAttachment, setReadingAttachment] = useState<AttachmentFile | null>(null);
  const [isDocumentReaderOpen, setIsDocumentReaderOpen] = useState<boolean>(false);

  const getTicketAttachments = (ticket: EnhancedGrievance): AttachmentFile[] => {
    if (ticket.attachments && ticket.attachments.length > 0) {
      return ticket.attachments;
    }
    const isAgri = (ticket.category || '').includes('فلاح') || (ticket.subject || '').includes('فلاح');
    return [
      {
        id: `att-id-${ticket.id}`,
        name: 'بطاقة_التعريف_الوطنية_البيومترية.pdf',
        size: '1.4 MB',
        type: 'application/pdf',
        uploadedAt: ticket.createdAt?.split('T')[0] || '2026-09-08',
        documentType: 'id_card',
        pageCount: 2
      },
      {
        id: `att-doc-${ticket.id}`,
        name: isAgri ? 'بطاقة_فلاح_ومهنية_معتمدة.pdf' : 'عريضة_الانشغال_الرسمية_الموقعة.pdf',
        size: '2.1 MB',
        type: 'application/pdf',
        uploadedAt: ticket.createdAt?.split('T')[0] || '2026-09-08',
        documentType: 'petition_letter',
        pageCount: 2
      },
      {
        id: `att-photo-${ticket.id}`,
        name: 'معاينة_ميدانية_مصورة_للموقع.jpg',
        size: '3.8 MB',
        type: 'image/jpeg',
        uploadedAt: ticket.createdAt?.split('T')[0] || '2026-09-08',
        documentType: 'field_photo',
        pageCount: 1
      }
    ];
  };

  const handleOpenDocumentReader = (att: AttachmentFile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReadingAttachment(att);
    setIsDocumentReaderOpen(true);
  };

  // Cloud synchronization state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Load grievances on mount and whenever changed
  const loadData = () => {
    const list = AdminService.getGrievances();
    setGrievances(list);
    // If ticket is currently selected, refresh its reference
    if (selectedTicket) {
      const refreshed = list.find(g => g.id === selectedTicket.id);
      if (refreshed) setSelectedTicket(refreshed);
    }
  };

  useEffect(() => {
    loadData();
    setSavedSearches(AdminService.getSavedSearches());

    // 1. Initial Cloud Sync if Supabase is configured
    if (SupabaseService.isConfigured()) {
      setIsSyncing(true);
      AdminService.syncWithSupabase().then(res => {
        loadData();
        setLastSyncTime(new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }));
        setIsSyncing(false);
        if (res.newAdded > 0) {
          addToast?.({
            type: 'info',
            title: 'تمت المزامنة مع السحابة المركزية',
            message: `تم جلب ${res.newAdded} عريضة جديدة واردة عبر منصة المواطن.`
          });
        }
      }).catch(() => setIsSyncing(false));
    }

    // 2. Listen to custom event dispatched when complaints are added or updated in real-time
    const handleComplaintsUpdated = (e: any) => {
      loadData();
      if (e?.detail?.complaint) {
        addToast?.({
          type: 'info',
          title: 'عريضة جديدة واردة عبر البوابة الإلكترونية',
          message: `تم استلام العريضة رقم ${e.detail.complaint.id} للمواطن (${e.detail.complaint.fullName || 'مواطن'}).`
        });
      }
    };

    // 3. Listen to browser storage changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wilaya_eloued_admin_grievances' || e.key === 'wilaya_eloued_grievances') {
        loadData();
      }
    };

    window.addEventListener('complaints_updated', handleComplaintsUpdated);
    window.addEventListener('storage', handleStorageChange);

    // 4. Supabase Realtime channel subscription
    const unsubscribeSupabase = SupabaseService.subscribeToComplaints((newComplaint) => {
      AdminService.addGrievanceDirectly(newComplaint);
      loadData();
      addToast?.({
        type: 'success',
        title: 'عريضة جديدة سحابية (مباشر)',
        message: `تم استلام عريضة جديدة رقم ${newComplaint.id} في قطاع (${newComplaint.category}).`
      });
    });

    // 5. Background periodic sync every 30 seconds
    const interval = setInterval(() => {
      if (SupabaseService.isConfigured()) {
        AdminService.syncWithSupabase().then(res => {
          if (res.newAdded > 0) {
            loadData();
          }
        });
      }
    }, 30000);

    return () => {
      window.removeEventListener('complaints_updated', handleComplaintsUpdated);
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeSupabase();
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      if (SupabaseService.isConfigured()) {
        const res = await AdminService.syncWithSupabase();
        loadData();
        const timeNow = new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timeNow);
        addToast?.({
          type: 'success',
          title: 'اكتملت المزامنة السحابية',
          message: res.newAdded > 0 
            ? `تم تحديث البيانات وجلب ${res.newAdded} عريضة جديدة بنجاح.` 
            : `البيانات متطابقة ومحدثة بالكامل مع قاعدة بيانات ولاية الوادي (${timeNow}).`
        });
      } else {
        loadData();
        addToast?.({
          type: 'info',
          title: 'تحديث البيانات المحلية',
          message: 'تم إعادة فحص وتحديث قائمة العرائض المخزنة محلياً بنجاح.'
        });
      }
    } catch (e) {
      addToast?.({
        type: 'error',
        title: 'فشل في المزامنة',
        message: 'تعذر الاتصال بقاعدة البيانات السحابية.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchTerm(initialSearchQuery);
      if (initialSearchMode) setSearchMode(initialSearchMode);
    }
  }, [initialSearchQuery, initialSearchMode]);

  useEffect(() => {
    if (initialSelectedTicketId && grievances.length > 0) {
      const match = grievances.find(g => g.id === initialSelectedTicketId);
      if (match) setSelectedTicket(match);
    }
  }, [initialSelectedTicketId, grievances]);

  // Handlers for saving complaint and toggling bookmarks
  const handleToggleSaveTicket = (ticketId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSavedState = AdminService.toggleSaveGrievance(ticketId, user);
    loadData();
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, isSaved: newSavedState } : null);
    }
    addToast?.({
      type: newSavedState ? 'success' : 'info',
      title: newSavedState ? 'تم حفظ الشكوى في قائمة المتابعة' : 'تم إلغاء حفظ الشكوى',
      message: newSavedState 
        ? `أُضيفت الشكوى رقم (${ticketId}) إلى قائمة المحفوظات للمتابعة الشخصية.`
        : `أُزيلت الشكوى رقم (${ticketId}) من قائمة المحفوظات.`
    });
  };

  const handleOpenEditModal = () => {
    if (!selectedTicket) return;
    setEditSubject(selectedTicket.subject || '');
    setEditDetails(selectedTicket.details || '');
    setEditMunicipality(selectedTicket.grievanceMunicipality || selectedTicket.applicantMunicipality || 'الوادي');
    setEditCategory(selectedTicket.category || 'أخرى');
    setEditPriority(selectedTicket.priority || 'عادي');
    setEditDept(selectedTicket.assignedDepartment || DIRECTORATES[0]);
    setEditPhone(selectedTicket.phone || '');
    setEditInternalNotes(selectedTicket.internalNotes || '');
    setShowEditComplaintModal(true);
  };

  const handleSaveComplaintDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const actorName = user?.name || 'مسؤول الإدارة';
    const actorRole = user?.roleTitle || 'إدارة المنظومة';

    const updated = AdminService.updateGrievance(selectedTicket.id, {
      subject: editSubject,
      details: editDetails,
      grievanceMunicipality: editMunicipality,
      applicantMunicipality: editMunicipality,
      category: editCategory as any,
      priority: editPriority,
      assignedDepartment: editDept,
      phone: editPhone,
      internalNotes: editInternalNotes,
      timeline: [
        ...(selectedTicket.timeline || []),
        {
          id: `t-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
          author: actorName,
          authorRole: actorRole,
          action: 'تعديل وحفظ بيانات الانشغال',
          note: `تم تعديل وتثبيت الموضوع، التفاصيل، البلدية (${editMunicipality}) والقطاع (${editCategory}) مع حفظ التغييرات نهائياً.`
        }
      ]
    }, user);

    if (updated) {
      setSelectedTicket(updated);
    }
    loadData();
    setShowEditComplaintModal(false);
    addToast?.({
      type: 'success',
      title: 'تم حفظ تعديلات الشكوى بنجاح',
      message: `تم تثبيت وحفظ كافة البيانات المحدثة للملف رقم ${selectedTicket.id}.`
    });
  };

  const handleSaveSearchQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const modeLabel = searchMode === 'id' ? 'رقم طلب' : searchMode === 'name' ? 'مواطن' : searchMode === 'keyword' ? 'كلمات' : 'شامل';
    const title = saveSearchTitle.trim() || `${modeLabel}: ${searchTerm.trim()}`;
    AdminService.saveSearchQuery(title, searchTerm.trim(), searchMode);
    setSavedSearches(AdminService.getSavedSearches());
    setShowSaveSearchModal(false);
    setSaveSearchTitle('');
    addToast?.({
      type: 'success',
      title: 'تم حفظ معيار البحث بنجاح',
      message: `تمت إضافة "${title}" إلى قائمة عمليات البحث المحفوظة.`
    });
  };

  const handleApplySavedSearch = (s: { query: string; mode: string }) => {
    setSearchTerm(s.query);
    setSearchMode(s.mode as any);
    setShowSavedSearchesDropdown(false);
    addToast?.({
      type: 'info',
      title: 'تم تطبيق معيار البحث المحفوظ',
      message: `تمت تصفية الشكاوى بنجاح وفق: "${s.query}".`
    });
  };

  const handleDeleteSavedSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    AdminService.deleteSavedSearch(id);
    setSavedSearches(AdminService.getSavedSearches());
    addToast?.({
      type: 'info',
      title: 'تم حذف البحث المحفوظ',
      message: 'تم حذف معيار البحث من القائمة.'
    });
  };

  // Filtered grievances list
  const filteredGrievances = useMemo(() => {
    return grievances.filter(item => {
      // Role scope (Chef de Daïra d'El Oued territorial filter if requested)
      if (user?.role === 'head_department' && user.id === 'usr-daira-eloued' && !showOnlyAssignedToMe) {
        // defaults to complaints in El Oued or Kouinine unless changed
      }

      if (showOnlyAssignedToMe && user) {
        if (item.assignedToId !== user.id && item.assignedToName !== user.name) return false;
      }

      // Search match by mode
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchId = item.id.toLowerCase().includes(query) || (item.trackingNumber && item.trackingNumber.toLowerCase().includes(query));
        const matchName = item.fullName?.toLowerCase().includes(query);
        const matchPhone = item.phone?.toLowerCase().includes(query);
        const matchKeywords = [
          item.subject,
          item.details,
          item.category,
          item.sector,
          item.grievanceMunicipality,
          item.applicantMunicipality,
          item.assignedDepartment,
          ...(item.internalNotes?.map(n => n.text) || []),
          item.officialResponse?.text || ''
        ].some(txt => txt && txt.toLowerCase().includes(query));

        if (searchMode === 'id') {
          if (!matchId) return false;
        } else if (searchMode === 'name') {
          if (!matchName) return false;
        } else if (searchMode === 'keyword') {
          if (!matchKeywords) return false;
        } else {
          // 'all'
          if (!matchId && !matchName && !matchPhone && !matchKeywords) return false;
        }
      }

      // Status tab match
      if (statusFilter === 'المحفوظة' && !item.isSaved) return false;
      if (statusFilter === 'جديد' && item.status !== 'جديد') return false;
      if (statusFilter === 'قيد المعالجة' && item.status !== 'قيد المعالجة' && item.status !== 'تم التوجيه للمصلحة المختصة') return false;
      if (statusFilter === 'بانتظار الرد' && item.status !== 'بانتظار المراجعة' && item.status !== 'بانتظار الرد') return false;
      if (statusFilter === 'تم الحل' && item.status !== 'تم الحل' && item.status !== 'مغلق ومسوى') return false;
      if (statusFilter === 'عاجل' && item.priority !== 'عاجل') return false;

      // Advanced filters
      if (filterMunicipality && (item.grievanceMunicipality !== filterMunicipality && item.applicantMunicipality !== filterMunicipality)) {
        return false;
      }
      if (filterCategory && item.category !== filterCategory) {
        return false;
      }
      if (filterPriority && item.priority !== filterPriority) {
        return false;
      }

      return true;
    });
  }, [grievances, searchTerm, searchMode, statusFilter, filterMunicipality, filterCategory, filterPriority, showOnlyAssignedToMe, user]);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: grievances.length,
      saved: grievances.filter(g => !!g.isSaved).length,
      new: grievances.filter(g => g.status === 'جديد').length,
      processing: grievances.filter(g => g.status === 'قيد المعالجة' || g.status === 'تم التوجيه للمصلحة المختصة').length,
      review: grievances.filter(g => g.status === 'بانتظار المراجعة' || g.status === 'بانتظار الرد').length,
      resolved: grievances.filter(g => g.status === 'تم الحل' || g.status === 'مغلق ومسوى').length,
      urgent: grievances.filter(g => g.priority === 'عاجل').length,
    };
  }, [grievances]);

  // Handlers for action modals
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const actorName = user?.name || 'مسؤول الإدارة';
    const actorRole = user?.roleTitle || 'إدارة المنظومة';

    const updated = AdminService.updateGrievance(selectedTicket.id, {
      assignedDepartment: transferDept,
      status: 'تم التوجيه للمصلحة المختصة',
      timeline: [
        ...(selectedTicket.timeline || []),
        {
          id: `t-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
          author: actorName,
          authorRole: actorRole,
          action: `تم توجيه الملف رسمياً إلى: ${transferDept}`,
          note: transferNotes || undefined,
          statusFrom: selectedTicket.status,
          statusTo: 'تم التوجيه للمصلحة المختصة'
        }
      ]
    });

    AdminService.logAudit({
      userId: user?.id || 'admin',
      userName: actorName,
      userRole: actorRole,
      action: 'إحالة وتوجيه انشغال',
      targetId: selectedTicket.id,
      targetType: 'انشغال',
      previousValue: selectedTicket.assignedDepartment || 'غير محدد',
      newValue: transferDept,
      details: `تم توجيه الانشغال رقم ${selectedTicket.id} إلى (${transferDept}). الملاحظة: ${transferNotes || 'لا توجد'}`
    });

    loadData();
    setShowTransferModal(false);
    setTransferNotes('');
    addToast?.({
      type: 'success',
      title: 'تم توجيه الملف بنجاح',
      message: `أُحيل الانشغال رقم ${selectedTicket.id} إلى ${transferDept} لمباشرة الإجراءات.`
    });
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const actorName = user?.name || 'مسؤول الإدارة';
    const actorRole = user?.roleTitle || 'إدارة المنظومة';

    AdminService.updateGrievance(selectedTicket.id, {
      status: newStatus,
      timeline: [
        ...(selectedTicket.timeline || []),
        {
          id: `t-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
          author: actorName,
          authorRole: actorRole,
          action: `تعديل حالة الملف إلى: ${newStatus}`,
          note: statusNotes || undefined,
          statusFrom: selectedTicket.status,
          statusTo: newStatus
        }
      ]
    });

    AdminService.logAudit({
      userId: user?.id || 'admin',
      userName: actorName,
      userRole: actorRole,
      action: 'تعديل حالة انشغال',
      targetId: selectedTicket.id,
      targetType: 'انشغال',
      previousValue: selectedTicket.status,
      newValue: newStatus,
      details: `تم تغيير حالة الانشغال رقم ${selectedTicket.id} من (${selectedTicket.status}) إلى (${newStatus}).`
    });

    loadData();
    setShowStatusModal(false);
    setStatusNotes('');
    addToast?.({
      type: 'success',
      title: 'تم تحديث حالة الملف',
      message: `أصبحت حالة الانشغال رقم ${selectedTicket.id}: ${newStatus}`
    });
  };

  const handleDirectiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const actorName = user?.name || 'السيد والي الولاية';
    const actorRole = user?.roleTitle || 'والي ولاية الوادي';

    AdminService.updateGrievance(selectedTicket.id, {
      priority: 'عاجل',
      status: 'قيد المعالجة',
      timeline: [
        ...(selectedTicket.timeline || []),
        {
          id: `t-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
          author: actorName,
          authorRole: actorRole,
          action: `إصدار تعليمة ولائية استعجالية رقم ${directiveRef}`,
          note: `نص التعليمة: ${directiveText} | المهلة القصوى: ${directiveDeadline}`,
          statusTo: 'قيد المعالجة'
        }
      ]
    });

    AdminService.logAudit({
      userId: user?.id || 'wali',
      userName: actorName,
      userRole: actorRole,
      action: 'إصدار تعليمة ولائية استعجالية',
      targetId: selectedTicket.id,
      targetType: 'انشغال',
      newValue: `تعليمة رقم ${directiveRef}`,
      details: `أصدر ${actorName} تعليمة ولائية ملزمة بخصوص الملف ${selectedTicket.id} مع تحديد مهلة ${directiveDeadline}.`
    });

    loadData();
    setShowDirectiveModal(false);
    addToast?.({
      type: 'warning',
      title: 'تم إصدار التعليمة الولائية',
      message: `تم قيد التعليمة رقم ${directiveRef} وتوجيه إشعار استعجالي للمصلحة المعنية.`
    });
  };

  const handleAddInternalNote = () => {
    if (!newInternalNote.trim() || !selectedTicket) return;

    const actorName = user?.name || 'محرر الإجراء';
    const actorRole = user?.roleTitle || 'عضو الخلية';

    AdminService.updateGrievance(selectedTicket.id, {
      timeline: [
        ...(selectedTicket.timeline || []),
        {
          id: `t-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
          author: actorName,
          authorRole: actorRole,
          action: isConfidentialNote ? 'إضافة ملاحظة تحقيق سرية' : 'إضافة إجراء ميداني وملاحظة معالجة',
          note: newInternalNote
        }
      ]
    });

    loadData();
    setNewInternalNote('');
    setIsConfidentialNote(false);
    addToast?.({
      type: 'info',
      title: 'تم حفظ الإجراء والملاحظة',
      message: `أُضيفت الملاحظة إلى السجل الزمني للملف رقم ${selectedTicket.id}.`
    });
  };

  const handleSaveOfficialReply = (approveImmediately: boolean = false) => {
    if (!officialReplyText.trim() || !selectedTicket) return;

    const actorName = user?.name || 'محرر الرد';
    const newStatus = approveImmediately ? 'تم الحل' : 'بانتظار المراجعة';

    AdminService.updateGrievance(selectedTicket.id, {
      status: newStatus,
      officialResponse: {
        text: officialReplyText,
        preparedBy: actorName,
        preparedAt: new Date().toISOString(),
        approved: approveImmediately
      },
      timeline: [
        ...(selectedTicket.timeline || []),
        {
          id: `t-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
          author: actorName,
          authorRole: user?.roleTitle || 'عضو المعالجة',
          action: approveImmediately ? 'المصادقة على الرد الرسمي وغلق الملف' : 'صياغة مسودة الرد وإحالتها للاعتماد',
          note: officialReplyText,
          statusTo: newStatus
        }
      ]
    });

    loadData();
    addToast?.({
      type: 'success',
      title: approveImmediately ? 'تم اعتماد الرد الرسمي بنجاح' : 'تم حفظ مسودة الرد',
      message: approveImmediately 
        ? `تم اعتماد الرد الرسمي وإخطار المواطن بإغلاق الملف ${selectedTicket.id}.`
        : `أُحيلت المسودة للمسؤول للمصادقة عليها.`
    });
  };

  const handleExportCsv = () => {
    if (filteredGrievances.length === 0) {
      addToast?.({
        type: 'warning',
        title: 'لا توجد بيانات',
        message: 'لا توجد ملفات تطابق معايير التصفية الحالية لتصديرها.'
      });
      return;
    }

    const headers = ['رقم الملف', 'الرقم التعريفي (NIN)', 'المواطن', 'الهاتف', 'البلدية', 'القطاع', 'الموضوع', 'الحالة', 'درجة الاستعجال', 'تاريخ الإيداع', 'المصلحة المعنية'];
    const rows = filteredGrievances.map(g => [
      g.id,
      g.nin || '',
      `"${g.fullName || ''}"`,
      g.phone || '',
      g.grievanceMunicipality || g.applicantMunicipality || '',
      g.category || '',
      `"${(g.subject || '').replace(/"/g, '""')}"`,
      g.status,
      g.priority,
      g.createdAt?.split('T')[0] || '',
      `"${g.assignedDepartment || 'ديوان الوالي'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `انشغالات_ولاية_الوادي_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast?.({
      type: 'success',
      title: 'تم تصدير التقرير',
      message: `تم تحميل ملف الإكسل (CSV) متضمناً ${filteredGrievances.length} ملف بنجاح.`
    });
  };

  const handleSimulateSms = () => {
    if (!selectedTicket) return;
    setShowSmsModal(false);
    addToast?.({
      type: 'success',
      title: 'تم إرسال إشعار SMS للمواطن',
      message: `أُرسلت رسالة نصية قصيرة إلى الرقم (${selectedTicket.phone}) لإعلامه بآخر مستجدات معالجة ملفه.`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'تم التوجيه للمصلحة المختصة': 
      case 'تم التوجيه': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'قيد المعالجة': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'بانتظار المراجعة':
      case 'بانتظار الرد': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'تم الحل': 
      case 'مغلق ومسوى': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 font-tajawal">
      
      {/* View Header & Action Toolbar */}
      {!selectedTicket ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-changa text-gray-900">صندوق الانشغالات المركزي</h2>
                <span className="bg-[#006233]/10 text-[#006233] text-xs font-bold font-mono px-2.5 py-1 rounded-full border border-[#006233]/20">
                  {filteredGrievances.length} ملف
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                منظومة الفرز، التوجيه، والمتابعة الرقمية لانشغالات وعرائض مواطني ولاية الوادي الـ 22 بلدية
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Employee Assigned filter toggle */}
              {user?.role === 'employee' && (
                <button
                  onClick={() => setShowOnlyAssignedToMe(!showOnlyAssignedToMe)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    showOnlyAssignedToMe
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>الملفات المسندة إلي فقط</span>
                </button>
              )}

              <button 
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors border shadow-xs ${
                  showAdvancedFilter || filterMunicipality || filterCategory || filterPriority
                    ? 'bg-emerald-50 text-[#006233] border-emerald-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>تصفية متقدمة</span>
                {(filterMunicipality || filterCategory || filterPriority) && (
                  <span className="w-2 h-2 rounded-full bg-[#006233]" />
                )}
              </button>

              {/* Cloud Sync / Live Refresh Button */}
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border shadow-xs ${
                  SupabaseService.isConfigured()
                    ? 'bg-emerald-50/80 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
                title={
                  SupabaseService.isConfigured() 
                    ? `مزامنة حية مع قاعدة بيانات Supabase (آخر مزامنة: ${lastSyncTime || 'الآن'})` 
                    : 'تحديث قائمة الانشغالات المحلية'
                }
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`} />
                <span>{isSyncing ? 'جاري المزامنة...' : 'تحديث ومزامنة'}</span>
                {SupabaseService.isConfigured() ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-mono">
                    سحابي
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
                    محلي
                  </span>
                )}
              </button>

              <button 
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-2 bg-[#006233] hover:bg-[#004d28] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors"
                title="تصدير جدول البيانات الحالي كملف Excel / CSV"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>تصدير التقرير (Excel)</span>
              </button>
            </div>
          </div>

          {/* Advanced Filter Drawer */}
          <AnimatePresence>
            {showAdvancedFilter && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white p-5 rounded-2xl border border-emerald-500/30 shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#006233]" />
                    <h4 className="font-changa font-bold text-sm text-gray-900">معايير التصفية المتقدمة</h4>
                  </div>
                  <button 
                    onClick={() => {
                      setFilterMunicipality('');
                      setFilterCategory('');
                      setFilterPriority('');
                    }}
                    className="text-xs text-[#D21034] hover:underline font-bold"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">البلدية أو المقاطعة</label>
                    <select
                      value={filterMunicipality}
                      onChange={(e) => setFilterMunicipality(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#006233] outline-none"
                    >
                      <option value="">جميع بلديات الولاية (22)</option>
                      {WILAYA_MUNICIPALITIES_22.map(m => (
                        <option key={m.code} value={m.name}>{m.name} (دائرة {m.daira})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">القطاع والموضوع</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#006233] outline-none"
                    >
                      <option value="">جميع القطاعات</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">درجة الاستعجال</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#006233] outline-none"
                    >
                      <option value="">كافة الدرجات</option>
                      <option value="عاجل">عاجل جداً (أولوية قصوى)</option>
                      <option value="متوسط">متوسط</option>
                      <option value="عادي">عادي</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Tabs Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'الكل', label: 'كافة الانشغالات', count: counts.all, color: 'text-gray-700' },
              { id: 'المحفوظة', label: 'الشكاوى المحفوظة', count: counts.saved, color: 'text-amber-600', isSavedTab: true },
              { id: 'جديد', label: 'وارد جديد', count: counts.new, color: 'text-blue-700' },
              { id: 'قيد المعالجة', label: 'قيد المعالجة والتوجيه', count: counts.processing, color: 'text-purple-700' },
              { id: 'بانتظار الرد', label: 'بانتظار المراجعة', count: counts.review, color: 'text-amber-700' },
              { id: 'تم الحل', label: 'تمت التسوية', count: counts.resolved, color: 'text-emerald-700' },
              { id: 'عاجل', label: 'استعجالي (تنبيه الوالي)', count: counts.urgent, color: 'text-[#D21034]' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  statusFilter === tab.id
                    ? tab.isSavedTab
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-[#006233] text-white border-[#006233] shadow-sm'
                    : tab.isSavedTab
                      ? 'bg-amber-50/80 text-amber-900 border-amber-300 hover:bg-amber-100'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.isSavedTab && (
                  <Star className={`w-3.5 h-3.5 ${statusFilter === tab.id ? 'fill-white text-white' : 'fill-amber-500 text-amber-500'}`} />
                )}
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Grievances Table Container */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            
            {/* Search Bar in Table Head */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/70 space-y-3">
              
              {/* Top Row: Search Input, Search Mode Selector, and Save Search Action */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                
                {/* Search Bar with Clear Button */}
                <div className="relative flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={
                      searchMode === 'id' ? 'أدخل رقم الطلب أو رمز التتبع (مثال: WL-2026-000125)...' :
                      searchMode === 'name' ? 'أدخل اسم أو لقب المواطن (مثال: أحمد، بلقاسم)...' :
                      searchMode === 'keyword' ? 'أدخل كلمة مفتاحية (مثال: سكن، سونلغاز، ماء، طرق)...' :
                      'البحث برقم الطلب، اسم المواطن، أو الكلمات المفتاحية...'
                    } 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-10 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:border-[#006233] focus:ring-1 focus:ring-[#006233]/20 outline-none shadow-2xs font-tajawal transition-all"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        onClearInitialSearch?.();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      title="مسح البحث"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Mode Segmented Control */}
                <div className="flex items-center bg-gray-200/80 p-1 rounded-xl gap-1 text-xs shrink-0 self-start lg:self-auto overflow-x-auto">
                  <button
                    onClick={() => setSearchMode('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] whitespace-nowrap ${
                      searchMode === 'all'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    بحث شامل
                  </button>
                  <button
                    onClick={() => setSearchMode('id')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] whitespace-nowrap ${
                      searchMode === 'id'
                        ? 'bg-[#006233] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🏷️ رقم الطلب
                  </button>
                  <button
                    onClick={() => setSearchMode('name')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] whitespace-nowrap ${
                      searchMode === 'name'
                        ? 'bg-[#006233] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    👤 اسم المواطن
                  </button>
                  <button
                    onClick={() => setSearchMode('keyword')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] whitespace-nowrap ${
                      searchMode === 'keyword'
                        ? 'bg-[#006233] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📝 الكلمات المفتاحية
                  </button>
                </div>

                {/* Save Search and Saved Searches Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Save current search button */}
                  {searchTerm.trim() && (
                    <button
                      onClick={() => {
                        setSaveSearchTitle(`${searchMode === 'id' ? 'طلب' : searchMode === 'name' ? 'مواطن' : 'كلمات'}: ${searchTerm.trim()}`);
                        setShowSaveSearchModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006233] border border-emerald-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      title="حفظ معيار البحث الحالي للرجوع إليه لاحقاً"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>حفظ البحث</span>
                    </button>
                  )}

                  {/* Saved Searches Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSavedSearchesDropdown(!showSavedSearchesDropdown)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        savedSearches.length > 0 
                          ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300' 
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}
                      disabled={savedSearches.length === 0}
                      title="استعراض عمليات البحث المحفوظة مسبقاً"
                    >
                      <ListFilter className="w-3.5 h-3.5 text-amber-600" />
                      <span>عمليات البحث المحفوظة</span>
                      {savedSearches.length > 0 && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                          {savedSearches.length}
                        </span>
                      )}
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {showSavedSearchesDropdown && savedSearches.length > 0 && (
                      <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-40 animate-in fade-in">
                        <div className="p-2 border-b border-gray-100 text-xs font-bold text-gray-700 flex justify-between items-center">
                          <span>معايير البحث المفضلة</span>
                          <span className="text-[10px] text-gray-400 font-mono">{savedSearches.length} محفوظ</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 py-1">
                          {savedSearches.map(saved => (
                            <div 
                              key={saved.id}
                              onClick={() => handleApplySavedSearch(saved)}
                              className="p-2 hover:bg-emerald-50 rounded-lg flex items-center justify-between cursor-pointer group transition-colors"
                            >
                              <div className="truncate pr-2">
                                <p className="text-xs font-bold text-gray-800 group-hover:text-[#006233] truncate">
                                  {saved.name}
                                </p>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {saved.mode === 'id' ? 'رقم طلب' : saved.mode === 'name' ? 'اسم مواطن' : saved.mode === 'keyword' ? 'كلمات مفتاحية' : 'شامل'} : {saved.query}
                                </span>
                              </div>
                              <button
                                onClick={(e) => handleDeleteSavedSearch(saved.id, e)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors shrink-0"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Row: Quick Keywords Cloud and Match Count */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-200/60">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 font-bold pl-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    كلمات مفتاحية شائعة:
                  </span>
                  {POPULAR_KEYWORDS.map(item => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setSearchTerm(item.kw);
                        setSearchMode('keyword');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        searchTerm === item.kw && searchMode === 'keyword'
                          ? 'bg-[#006233] text-white shadow-2xs'
                          : 'bg-white hover:bg-emerald-50 text-gray-600 hover:text-[#006233] border border-gray-200/80'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-gray-500 font-mono">
                  عرض {filteredGrievances.length} من أصل {grievances.length} ملف
                </span>
              </div>

            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200 font-tajawal">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">رقم الملف والتاريخ</th>
                    <th className="px-5 py-3.5 font-bold">المواطن والموقع</th>
                    <th className="px-5 py-3.5 font-bold">الموضوع والقطاع</th>
                    <th className="px-5 py-3.5 font-bold">المصلحة المعنية</th>
                    <th className="px-5 py-3.5 font-bold text-center">الحالة</th>
                    <th className="px-5 py-3.5 font-bold text-center">الاستعجال</th>
                    <th className="px-5 py-3.5 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-tajawal">
                  {filteredGrievances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p className="font-bold text-sm text-gray-600">لا توجد ملفات تطابق معايير البحث الحالية</p>
                        <p className="text-xs text-gray-400 mt-1">جرّب تعديل كلمات البحث أو إلغاء فلاتر التصفية</p>
                      </td>
                    </tr>
                  ) : (
                    filteredGrievances.map((ticket) => (
                      <tr 
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {/* Star / Bookmark Toggle Button */}
                            <button
                              onClick={(e) => handleToggleSaveTicket(ticket.id, e)}
                              className="p-1 rounded-lg hover:bg-amber-100/70 transition-colors"
                              title={ticket.isSaved ? 'إلغاء حفظ الشكوى من قائمة المتابعة' : 'حفظ الشكوى في قائمة المتابعة والمفضلة'}
                            >
                              <Star 
                                className={`w-4 h-4 transition-transform active:scale-125 ${
                                  ticket.isSaved 
                                    ? 'fill-amber-500 text-amber-500' 
                                    : 'text-gray-300 hover:text-amber-400'
                                }`} 
                              />
                            </button>
                            <div>
                              <div className="font-mono font-bold text-gray-900 group-hover:text-[#006233]">
                                {ticket.id}
                              </div>
                              <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{ticket.createdAt?.split('T')[0]}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900">{ticket.fullName || 'مواطن'}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span>{ticket.grievanceMunicipality || ticket.applicantMunicipality || 'بلدية الوادي'}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4 max-w-xs">
                          <div className="font-bold text-gray-800 line-clamp-1">{ticket.subject}</div>
                          <div className="text-[11px] text-[#006233] font-bold mt-0.5">
                            {ticket.category || 'عام'}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            {ticket.assignedDepartment || 'ديوان الوالي'}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            ticket.priority === 'عاجل' 
                              ? 'bg-red-100 text-[#D21034] border border-red-200' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {/* Fast Bookmark Toggle in Actions */}
                            <button
                              onClick={(e) => handleToggleSaveTicket(ticket.id, e)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                ticket.isSaved 
                                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                                  : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                              }`}
                              title={ticket.isSaved ? 'إلغاء حفظ الشكوى' : 'حفظ الشكوى للمتابعة'}
                            >
                              <Star className={`w-4 h-4 ${ticket.isSaved ? 'fill-amber-500' : ''}`} />
                            </button>

                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="p-1.5 text-gray-500 hover:text-[#006233] hover:bg-emerald-50 rounded-lg transition-colors"
                              title="معاينة ومعالجة الملف"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowTransferModal(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="تحويل فوري للمصلحة"
                            >
                              <Forward className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* TICKET DETAILS VIEW & ACTION CENTER */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Bar Details with Sovereign Back button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                title="رجوع للقائمة"
              >
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-changa font-bold text-xl text-gray-900">
                    ملف انشغال رقم: <span className="font-mono text-[#006233]">{selectedTicket.id}</span>
                  </h3>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                  {selectedTicket.priority === 'عاجل' && (
                    <span className="bg-[#D21034] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      عاجل جداً
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  المودع بتاريخ: {selectedTicket.createdAt?.split('T')[0]} | البلدية: {selectedTicket.grievanceMunicipality || selectedTicket.applicantMunicipality || 'الوادي'}
                </p>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Save / Bookmark Grievance Button */}
              <button
                onClick={(e) => handleToggleSaveTicket(selectedTicket.id, e)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
                  selectedTicket.isSaved
                    ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300'
                }`}
                title={selectedTicket.isSaved ? 'إلغاء حفظ الشكوى من قائمة المتابعة' : 'حفظ الشكوى في قائمة المتابعة والمفضلة'}
              >
                <Star className={`w-4 h-4 ${selectedTicket.isSaved ? 'fill-white text-white' : 'text-amber-500'}`} />
                <span>{selectedTicket.isSaved ? 'محفوظة بالمتابعة ⭐' : 'حفظ الشكوى'}</span>
              </button>

              {/* Edit & Save Complaint Details Button */}
              <button
                onClick={handleOpenEditModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006233] border border-emerald-300 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                title="تعديل وحفظ بيانات وموضوع الشكوى وتفاصيلها"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>تعديل وحفظ الشكوى</span>
              </button>

              {/* Wali & SG Executive Directive Button */}
              {(user?.role === 'wali' || user?.role === 'chef_cabinet' || user?.role === 'super_admin') && (
                <button
                  onClick={() => setShowDirectiveModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Award className="w-4 h-4 text-amber-100" />
                  <span>إصدار تعليمة ولائية استعجالية</span>
                </button>
              )}

              {/* Transfer to Department */}
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors"
              >
                <Forward className="w-4 h-4" />
                <span>تحويل للمصلحة المختصة</span>
              </button>

              {/* Edit Status */}
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تعديل الحالة الإدارية</span>
              </button>

              {/* Send SMS Notification */}
              <button
                onClick={() => setShowSmsModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006233] border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                title="إرسال رسالة SMS للمواطن"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">إشعار SMS</span>
              </button>

              {/* Print Receipt */}
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                title="طباعة بطاقة الملف والوصل"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">طباعة</span>
              </button>
            </div>
          </div>

          {/* Ticket Body: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Right Column: Citizen Details & Subject & Official Response */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Citizen Card & Grievance Narrative */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006233] flex items-center justify-center font-bold text-lg border border-emerald-100">
                      {selectedTicket.fullName?.charAt(0) || 'م'}
                    </div>
                    <div>
                      <h4 className="font-changa font-bold text-base text-gray-900">{selectedTicket.fullName}</h4>
                      <p className="text-xs text-gray-500 font-mono">الرقم التعريفي (NIN): {selectedTicket.nin || 'غير مسجل'}</p>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                      هاتف: <span className="font-mono text-gray-900" dir="ltr">{selectedTicket.phone || '032 21 00 00'}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-[#006233] text-[11px] font-bold rounded-md mb-2">
                    {selectedTicket.category || 'انشغال إداري'}
                  </span>
                  <h3 className="font-changa font-bold text-lg text-gray-900 mb-2">
                    {selectedTicket.subject}
                  </h3>
                  {selectedTicket.meetingRequest && (
                    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
                      طلب لقاء موجه إلى: {selectedTicket.meetingRequest}
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.details}
                  </div>
                </div>

                {/* Attachments Section with Direct Reading */}
                {(() => {
                  const attachmentsList = getTicketAttachments(selectedTicket);
                  return (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-changa font-bold text-xs text-gray-800 flex items-center gap-1.5">
                          <Paperclip className="w-4 h-4 text-[#006233]" />
                          <span>المرفقات والوثائق الثبوتية للمواطن ({attachmentsList.length})</span>
                        </h5>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006233] border border-emerald-200">
                          <Eye className="w-3 h-3" />
                          <span>قراءة مباشرة مفعلة بدون تحميل</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {attachmentsList.map((att, idx) => {
                          const isPdf = att.name.toLowerCase().endsWith('.pdf');
                          return (
                            <div 
                              key={att.id || idx} 
                              onClick={() => handleOpenDocumentReader(att)}
                              className="group relative flex flex-col justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-[#006233] hover:shadow-md transition-all cursor-pointer"
                            >
                              <div className="flex items-start gap-2.5 overflow-hidden">
                                <div className={`p-2 rounded-xl shrink-0 ${isPdf ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                  {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-bold text-gray-900 truncate block group-hover:text-[#006233] transition-colors">
                                    {att.name}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                                    <span>{att.size}</span>
                                    <span>•</span>
                                    <span>{att.uploadedAt || '2026-09-08'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenDocumentReader(att, e)}
                                  className="flex items-center gap-1.5 text-xs font-bold text-[#006233] hover:text-white bg-emerald-50 hover:bg-[#006233] px-2.5 py-1 rounded-lg transition-all"
                                  title="قراءة محتوى الوثيقة مباشرة على الشاشة دون تحميلها"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>قراءة مباشرة</span>
                                </button>

                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToast?.({ type: 'info', title: 'تحميل المرفق', message: `بدأ تحميل الملف ${att.name}` });
                                  }}
                                  title="تحميل الملف إلى جهازك"
                                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Official Response Editor / Display */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#006233]" />
                    <h4 className="font-changa font-bold text-base text-gray-900">الرد الرسمي الموجه للمواطن</h4>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">المرجع: {replyRefNumber}</span>
                </div>

                {selectedTicket.officialResponse?.text ? (
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#006233]">
                        محرر بواسطة: {selectedTicket.officialResponse.preparedBy}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedTicket.officialResponse.approved 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedTicket.officialResponse.approved ? 'معتمد رسمياً' : 'مسودة بانتظار الاعتماد'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed font-tajawal">
                      {selectedTicket.officialResponse.text}
                    </p>
                  </div>
                ) : null}

                {/* Response Drafting form */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700">
                    تحرير / تحديث مسودة الرد الرسمي
                  </label>
                  <textarea
                    rows={4}
                    value={officialReplyText}
                    onChange={(e) => setOfficialReplyText(e.target.value)}
                    placeholder="اكتب هنا صيغة الرد الرسمي الإداري الذي سيتلقاه المواطن عبر المنصة والرسالة النصية..."
                    className="w-full p-3.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none font-tajawal leading-relaxed"
                  />
                  
                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSaveOfficialReply(false)}
                      disabled={!officialReplyText.trim()}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors"
                    >
                      حفظ كمسودة
                    </button>
                    
                    {/* Supervisor & Wali can approve and close */}
                    {(user?.role === 'supervisor' || user?.role === 'wali' || user?.role === 'chef_cabinet' || user?.role === 'super_admin') && (
                      <button
                        type="button"
                        onClick={() => handleSaveOfficialReply(true)}
                        disabled={!officialReplyText.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#006233] hover:bg-[#004d28] text-white rounded-xl text-xs font-bold disabled:opacity-50 shadow-sm transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>المصادقة على الرد وغلق الملف</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Left Column: Timeline & Internal Notes */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Administrative Assignment Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3.5">
                <h4 className="font-changa font-bold text-sm text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#006233]" />
                  <span>الإسناد والمتابعة الإدارية</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">المصلحة المكلفة:</span>
                    <span className="font-bold text-gray-900">{selectedTicket.assignedDepartment || 'ديوان والي ولاية الوادي'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">المعالج المسؤول:</span>
                    <span className="font-bold text-gray-900">{selectedTicket.assignedToName || 'عمر بن سالم (مسؤول الخلية)'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">الأجل القانوني:</span>
                    <span className="font-bold font-mono text-emerald-600">15 يوماً (ساري)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">البلدية المعنية:</span>
                    <span className="font-bold text-gray-900">{selectedTicket.grievanceMunicipality || selectedTicket.applicantMunicipality || 'الوادي'}</span>
                  </div>
                </div>
              </div>

              {/* Add Investigation Note */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <h4 className="font-changa font-bold text-sm text-gray-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#006233]" />
                  <span>إضافة إجراء أو محضر معاينة</span>
                </h4>
                
                <textarea
                  rows={3}
                  value={newInternalNote}
                  onChange={(e) => setNewInternalNote(e.target.value)}
                  placeholder="سجل هنا تفاصيل المعاينة الميدانية أو الاتصال بالمصالح..."
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none font-tajawal"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isConfidentialNote} 
                      onChange={(e) => setIsConfidentialNote(e.target.checked)} 
                      className="rounded text-[#006233]"
                    />
                    <span>ملاحظة إدارية سرية</span>
                  </label>

                  <button
                    onClick={handleAddInternalNote}
                    disabled={!newInternalNote.trim()}
                    className="px-3.5 py-1.5 bg-[#006233] hover:bg-[#004d28] text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                  >
                    حفظ الإجراء
                  </button>
                </div>
              </div>

              {/* Timeline Flow */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <h4 className="font-changa font-bold text-sm text-gray-900 border-b border-gray-100 pb-2.5">
                  السجل الزمني للتكفل بالملف
                </h4>

                <div className="space-y-4 relative before:absolute before:right-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                  {selectedTicket.timeline && selectedTicket.timeline.map((step, idx) => (
                    <div key={idx} className="relative pr-8 text-xs space-y-1">
                      <div className="absolute right-2 top-1 w-3.5 h-3.5 rounded-full bg-[#006233] border-2 border-white shadow-xs" />
                      
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span className="font-mono">{step.date} {step.time}</span>
                        <span className="font-bold text-gray-600">{step.author}</span>
                      </div>
                      
                      <p className="font-bold text-gray-800">{step.action}</p>
                      
                      {step.note && (
                        <p className="text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-1 leading-relaxed">
                          {step.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODAL: TRANSFER TO DEPARTMENT */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-[#006233] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Forward className="w-5 h-5 text-amber-300" />
                  <h3 className="font-changa font-bold text-base">تحويل الانشغال للمصلحة المختصة</h3>
                </div>
                <button onClick={() => setShowTransferModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">اختر المديرية أو الهيئة المكلفة</label>
                  <select
                    value={transferDept}
                    onChange={(e) => setTransferDept(e.target.value)}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                  >
                    {DIRECTORATES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">تعليمات وملاحظات التحويل</label>
                  <textarea
                    rows={3}
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="اكتب هنا توجيهات التحويل أو سبب الإحالة لهذه المصلحة..."
                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#006233] hover:bg-[#004d28] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    تأكيد التحويل الرسمي
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT STATUS */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-[#006233] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-300" />
                  <h3 className="font-changa font-bold text-base">تحديث حالة الملف الإداري</h3>
                </div>
                <button onClick={() => setShowStatusModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">الحالة الجديدة للملف</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                  >
                    <option value="جديد">جديد (وارد)</option>
                    <option value="قيد المعالجة">قيد المعالجة والتحقيق الميداني</option>
                    <option value="بانتظار المراجعة">بانتظار مراجعة واعتماد المسؤول</option>
                    <option value="تم الحل">تمت التسوية والإغلاق</option>
                    <option value="مرفوض">مرفوض لعدم استيفاء الشروط القانونية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">مبررات تغيير الحالة أو الإجراء المتخذ</label>
                  <textarea
                    rows={3}
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="سجل سبب تعديل الحالة للإشارة إليه في السجل الإداري..."
                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#006233] hover:bg-[#004d28] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    تحديث الحالة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EXECUTIVE DIRECTIVE (Wali / SG) */}
      <AnimatePresence>
        {showDirectiveModal && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-gradient-to-r from-[#04190c] to-[#0a3a1d] text-white p-4 flex items-center justify-between border-b border-amber-400/30">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-300" />
                  <div>
                    <h3 className="font-changa font-bold text-base text-amber-300">إصدار تعليمة ولائية استعجالية</h3>
                    <p className="text-[10px] text-gray-300">السلطة التنفيذية المباشرة — والي ولاية الوادي</p>
                  </div>
                </div>
                <button onClick={() => setShowDirectiveModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDirectiveSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الإرسالية</label>
                    <input
                      type="text"
                      value={directiveRef}
                      onChange={(e) => setDirectiveRef(e.target.value)}
                      className="w-full p-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المهلة الإلزامية</label>
                    <select
                      value={directiveDeadline}
                      onChange={(e) => setDirectiveDeadline(e.target.value)}
                      className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-red-600"
                    >
                      <option value="24 ساعة">24 ساعة (أقصى استعجال)</option>
                      <option value="48 ساعة">48 ساعة</option>
                      <option value="72 ساعة">72 ساعة</option>
                      <option value="5 أيام">5 أيام</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نص التعليمة الولائية الموجهة</label>
                  <textarea
                    rows={4}
                    value={directiveText}
                    onChange={(e) => setDirectiveText(e.target.value)}
                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#006233] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDirectiveModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    توقيع وإصدار التعليمة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SMS NOTIFICATION SIMULATION */}
      <AnimatePresence>
        {showSmsModal && selectedTicket && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-[#006233] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-amber-300" />
                  <h3 className="font-changa font-bold text-base">إرسال إشعار نصي (SMS)</h3>
                </div>
                <button onClick={() => setShowSmsModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 border border-gray-100">
                  <p><span className="font-bold">المستلم:</span> {selectedTicket.fullName}</p>
                  <p><span className="font-bold">رقم الهاتف:</span> <span className="font-mono text-gray-900" dir="ltr">{selectedTicket.phone}</span></p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نص الرسالة القصيرة (SMS)</label>
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-gray-800 font-tajawal leading-relaxed">
                    « ولاية الوادي: تم تسجيل تقدم في معالجة انشغالكم رقم {selectedTicket.id}. يرجى مراجعة بوابتكم الإلكترونية للاطلاع على الرد الرسمي. »
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setShowSmsModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSimulateSms}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#006233] hover:bg-[#004d28] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال الإشعار الآن</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PRINT RECEIPT PREVIEW */}
      <AnimatePresence>
        {showPrintModal && selectedTicket && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col"
            >
              <div className="bg-[#0b2b17] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-amber-300" />
                  <h3 className="font-changa font-bold text-base">معاينة وصل تسجيل الانشغال</h3>
                </div>
                <button onClick={() => setShowPrintModal(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-6 text-right font-tajawal bg-white">
                <div className="text-center border-b pb-4 space-y-1">
                  <p className="font-bold text-xs text-gray-700">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                  <p className="font-bold text-sm text-[#006233]">ولاية الوادي — ديوان الوالي</p>
                  <p className="text-xs text-gray-500">خلية الإصغاء، التكفل بالعرائض ووساطة المواطن</p>
                </div>

                <div className="p-4 bg-gray-50 border rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">رقم الإيداع والتسجيل:</span>
                    <span className="font-mono font-bold text-sm text-[#006233]">{selectedTicket.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">تاريخ وساعة الإيداع:</span>
                    <span className="font-mono">{selectedTicket.createdAt?.split('T')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">اسم ولقب المواطن:</span>
                    <span className="font-bold">{selectedTicket.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">البلدية:</span>
                    <span className="font-bold">{selectedTicket.grievanceMunicipality || selectedTicket.applicantMunicipality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">موضوع العريضة:</span>
                    <span className="font-bold">{selectedTicket.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الحالة الإدارية الحالية:</span>
                    <span className="font-bold text-emerald-700">{selectedTicket.status}</span>
                  </div>
                </div>

                <div className="border-t pt-4 text-[11px] text-gray-500 text-center leading-relaxed">
                  يُعتبر هذا الوصل وثيقة إدارية رسمية تثبت تسجيل الانشغال ومباشرة إجراءات دراسته ومتابعته من طرف مصالح ولاية الوادي.
                </div>
              </div>

              <div className="bg-gray-50 p-4 border-t flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#006233] hover:bg-[#004d28] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الوصل</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: EDIT & SAVE COMPLAINT DETAILS */}
        {showEditComplaintModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full border border-gray-100 shadow-2xl overflow-hidden font-tajawal"
            >
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-800 to-[#006233] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-changa font-bold text-base">تعديل وحفظ بيانات الانشغال</h3>
                    <p className="text-xs text-emerald-100 font-mono">الملف رقم: {selectedTicket.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEditComplaintModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Subject field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    موضوع الشكوى / الانشغال <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] focus:ring-1 focus:ring-[#006233] outline-none transition-all font-bold text-gray-800"
                    placeholder="موضوع العريضة أو الانشغال المودع..."
                  />
                </div>

                {/* Category & Priority in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">القطاع / التصنيف</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none transition-all font-bold text-gray-800"
                    >
                      <option value="سكن وعمران">سكن وعمران</option>
                      <option value="طاقة وكهرباء">طاقة وكهرباء وغاز</option>
                      <option value="ماء وتطهير">موارد مائية وتطهير</option>
                      <option value="أشغال عمومية وطرقات">أشغال عمومية وطرقات</option>
                      <option value="صحة وبيئة">صحة وبيئة</option>
                      <option value="فلاحة وري">فلاحة وتنمية ريفية</option>
                      <option value="نظافة وتهيئة">نظافة وتهيئة حضرية</option>
                      <option value="شؤون اجتماعية">شؤون اجتماعية وتضامن</option>
                      <option value="تربية وتعليم">تربية وتعليم</option>
                      <option value="أخرى">قطاعات ومصالح أخرى</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">درجة الاستعجال</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none transition-all font-bold text-gray-800"
                    >
                      <option value="عادي">عادي</option>
                      <option value="متوسط">متوسط</option>
                      <option value="عاجل">عاجل (أولوية قصوى)</option>
                    </select>
                  </div>
                </div>

                {/* Details Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    نص العريضة وتفاصيل الانشغال <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    className="w-full p-3.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] focus:ring-1 focus:ring-[#006233] outline-none transition-all text-gray-800 font-tajawal"
                    placeholder="التفاصيل الدقيقة لطلب المواطن وموقع الانشغال..."
                  />
                </div>

                {/* Internal Notes Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block flex items-center justify-between">
                    <span>ملاحظات إدارية وتوجيهات ديوانية</span>
                    <span className="text-[10px] text-gray-400">للاستعمال الداخلي</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editInternalNotes}
                    onChange={(e) => setEditInternalNotes(e.target.value)}
                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] outline-none transition-all text-gray-800 font-tajawal"
                    placeholder="إضافة ملاحظة توجيهية أو محضر معاينة..."
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setShowEditComplaintModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveComplaintDetails}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#006233] hover:bg-[#004d28] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>تأكيد وحفظ التعديلات</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: SAVE SEARCH QUERY */}
        {showSaveSearchModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full border border-gray-100 shadow-2xl overflow-hidden font-tajawal"
            >
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-changa font-bold text-base text-gray-900">حفظ استعلام البحث</h3>
                    <p className="text-xs text-gray-500">حفظ التصفية للرجوع السريع في أي وقت</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSaveSearchModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-900">
                  <div className="flex justify-between">
                    <span className="font-bold">نص البحث:</span>
                    <span className="font-mono">{searchTerm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">نوع البحث:</span>
                    <span>{searchMode === 'id' ? 'رقم الطلب' : searchMode === 'name' ? 'اسم المواطن' : searchMode === 'keyword' ? 'كلمات مفتاحية' : 'بحث شامل'}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    اسم البحث المحفوظ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={saveSearchTitle}
                    onChange={(e) => setSaveSearchTitle(e.target.value)}
                    placeholder="مثال: شكاوى السكن - الوادي، ملفات سونلغاز..."
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006233] focus:ring-1 focus:ring-[#006233] outline-none font-tajawal transition-all"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setShowSaveSearchModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveSearchQuery}
                  disabled={!saveSearchTitle.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#006233] hover:bg-[#004d28] text-white rounded-xl text-xs font-bold disabled:opacity-50 shadow-sm transition-all"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>حفظ البحث</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Direct In-App Document Reader Modal */}
      {selectedTicket && (
        <DocumentReaderModal
          isOpen={isDocumentReaderOpen}
          onClose={() => setIsDocumentReaderOpen(false)}
          attachment={readingAttachment}
          allAttachments={getTicketAttachments(selectedTicket)}
          grievance={selectedTicket}
          onSelectAttachment={(newAtt) => setReadingAttachment(newAtt)}
          onViewed={handleAttachmentViewed}
          addToast={addToast}
        />
      )}

    </div>
  );
};
