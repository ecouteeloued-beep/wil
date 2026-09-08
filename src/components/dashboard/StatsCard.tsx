import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'neutral' | 'urgent' | 'success' | 'warning' | 'info';
  };
  onClick?: () => void;
  isActive?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  sublabel,
  icon: Icon,
  badge,
  onClick,
  isActive
}) => {
  const badgeColors = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    urgent: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl border bg-white transition-all text-right ${
        onClick ? 'cursor-pointer hover:border-[#C67D2A]/50 hover:shadow-sm' : ''
      } ${
        isActive
          ? 'border-[#006233] ring-2 ring-[#006233]/15'
          : 'border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#F4EBDA] border border-[#C67D2A]/20 flex items-center justify-center text-[#1C2B33] shrink-0">
          <Icon className="w-5 h-5 text-[#C67D2A]" />
        </div>
        {badge && (
          <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium whitespace-nowrap ${badgeColors[badge.variant]}`}>
            {badge.text}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 block leading-tight">
          {title}
        </span>
        <div className="text-2xl sm:text-3xl font-bold font-['Changa'] text-[#1C2B33] tracking-tight">
          {value}
        </div>
        {sublabel && (
          <p className="text-[12px] text-slate-500 font-normal leading-relaxed pt-1">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
};
