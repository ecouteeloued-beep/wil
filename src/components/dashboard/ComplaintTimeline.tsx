import React from 'react';
import { TimelineEvent } from '../../types';
import { Calendar, CheckCircle, Clock, FileText, Send, User, UserCheck } from 'lucide-react';

interface ComplaintTimelineProps {
  events: TimelineEvent[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        لا توجد أحداث مسجلة في السجل الزمني حتى الآن.
      </div>
    );
  }

  const getEventIcon = (action: string) => {
    if (action.includes('تسجيل')) return Calendar;
    if (action.includes('توجيه') || action.includes('إسناد')) return Send;
    if (action.includes('بدأت المعالجة')) return Clock;
    if (action.includes('إعداد الرد') || action.includes('طلب')) return FileText;
    if (action.includes('اعتماد') || action.includes('غلق')) return CheckCircle;
    return UserCheck;
  };

  return (
    <div className="relative pr-4 sm:pr-6 space-y-6 before:absolute before:right-2 sm:before:right-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event, index) => {
        const Icon = getEventIcon(event.action);
        const isLatest = index === events.length - 1;

        return (
          <div key={event.id || index} className="relative group">
            {/* Timeline Dot */}
            <div
              className={`absolute -right-4 sm:-right-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isLatest
                  ? 'bg-[#006233] border-white ring-4 ring-[#006233]/20 text-white'
                  : 'bg-white border-slate-400 text-slate-500'
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
            </div>

            {/* Event Content */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 sm:p-4 text-right hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span>{event.action}</span>
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono" dir="ltr">
                  <span>{event.time}</span>
                  <span>•</span>
                  <span>{event.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-800">{event.author}</span>
                <span className="text-slate-400">({event.authorRole})</span>
              </div>

              {event.note && (
                <div className="mt-2 text-xs text-slate-700 bg-white border border-slate-200/60 rounded p-2.5 leading-relaxed">
                  {event.note}
                </div>
              )}

              {(event.statusFrom || event.statusTo) && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-slate-500">
                  <span>تغيرت الحالة:</span>
                  {event.statusFrom && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                      {event.statusFrom}
                    </span>
                  )}
                  <span>←</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#006233]/10 text-[#006233] font-semibold font-mono">
                    {event.statusTo}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
