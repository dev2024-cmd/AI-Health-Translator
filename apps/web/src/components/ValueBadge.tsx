import React from 'react';
import { CheckCircle2, ArrowDownCircle, ArrowUpCircle, AlertOctagon } from 'lucide-react';
import { FlagType } from '../types/api.js';

interface ValueBadgeProps {
  flag: FlagType;
  showIconOnly?: boolean;
}

export const ValueBadge: React.FC<ValueBadgeProps> = ({ flag, showIconOnly = false }) => {
  switch (flag) {
    case 'normal':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
          title="Normal: Value is within the healthy reference range"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          {!showIconOnly && <span>Normal</span>}
        </span>
      );

    case 'low':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300"
          title="Low: Value is below normal limits. Discuss with your doctor."
        >
          <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          {!showIconOnly && <span>Low</span>}
        </span>
      );

    case 'high':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300"
          title="High: Value is above normal limits. Discuss with your doctor."
        >
          <ArrowUpCircle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
          {!showIconOnly && <span>High</span>}
        </span>
      );

    case 'critical':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-400 animate-pulse"
          title="See Doctor: Prompt medical consultation required"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          {!showIconOnly && <span>Consult Doctor</span>}
        </span>
      );

    default:
      return null;
  }
};
