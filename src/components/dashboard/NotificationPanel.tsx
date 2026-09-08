import React from 'react';
import { NotificationItem, SystemUser } from '../../types';
import { 
  AlertCircle, 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  FileCheck2, 
  FileText, 
  Send, 
  ShieldAlert, 
  X 
} from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currentUser: SystemUser;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectGrievance: (id: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectGrievance
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return Send;
      case 'review':
        return FileCheck2;
      case 'overdue':
        return ShieldAlert;
      case 'urgent':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getNotifBg = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-indigo-50 text-indigo-700';
      case 'review':
        return 'bg-orange-50 text-orange-700';
      case 'overdue':
        return 'bg-red-50 text-red-700';
      case 'urgent':
        return 'bg-rose-50 text-rose-700';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col text-right animate-in slide-in-from-left duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006233]/10 text-[#006233] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">مركز الإشعارات والتنبيهات</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {unreadCount > 0 ? `${unreadCount} تنبيهات غير مقروءة` : 'لا توجد تنبيهات جديدة'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mark All Read Action */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">التنبيهات الإدارية:</span>
            <button
              onClick={onMarkAllAsRead}
              className="text-[#006233] hover:underline font-semibold flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>تحديد الكل كمقروء</span>
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>لا توجد تنبيهات مسجلة.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = getNotifIcon(notif.type);
              const bgClass = getNotifBg(notif.type);

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    if (notif.grievanceId) {
                      onSelectGrievance(notif.grievanceId);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl transition-all cursor-pointer my-1 ${
                    notif.read ? 'bg-white hover:bg-slate-50 opacity-75' : 'bg-slate-50/90 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className={`text-xs font-bold truncate ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#006233] shrink-0" />
                        )}
                      </div>

                      <p className="text-[11.5px] text-slate-600 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400 font-mono" dir="ltr">
                        <span>{new Date(notif.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}</span>
                        {notif.grievanceId && (
                          <span className="text-[#006233] font-semibold">ملف: {notif.grievanceId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
