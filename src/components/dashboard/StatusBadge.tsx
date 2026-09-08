import React from 'react';
import { GrievanceStatus, GrievancePriority } from '../../types';
import { AlertCircle, CheckCircle2, Clock, FileEdit, HelpCircle, Inbox, Send } from 'lucide-react';

interface StatusBadgeProps {
  status: GrievanceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const getStyle = () => {
    switch (status) {
      case 'جديد':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: Inbox,
          dot: 'bg-sky-500'
        };
      case 'تم الإسناد':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: Send,
          dot: 'bg-indigo-500'
        };
      case 'قيد المعالجة':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          icon: Clock,
          dot: 'bg-amber-500'
        };
      case 'بانتظار معلومات':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: HelpCircle,
          dot: 'bg-purple-500'
        };
      case 'بانتظار المراجعة':
        return {
          bg: 'bg-orange-50 text-orange-900 border-orange-200',
          icon: FileEdit,
          dot: 'bg-orange-500'
        };
      case 'تمت المعالجة':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          icon: CheckCircle2,
          dot: 'bg-teal-500'
        };
      case 'مغلق':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          dot: 'bg-emerald-600'
        };
      default:
        return {
          bg: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          dot: 'bg-gray-400'
        };
    }
  };

  const { bg, icon: Icon, dot } = getStyle();

  return (
    <span className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap ${bg} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
      <span>{status}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: GrievancePriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[10.5px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5'
  };

  const getStyle = () => {
    switch (priority) {
      case 'قصوى':
        return 'bg-red-100 text-red-800 border-red-200 font-bold';
      case 'عاجل':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'متوسط':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'عادي':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border whitespace-nowrap ${getStyle()} ${sizeClasses[size]}`}>
      {(priority === 'عاجل' || priority === 'قصوى') && (
        <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
      )}
      <span>{priority}</span>
    </span>
  );
};
