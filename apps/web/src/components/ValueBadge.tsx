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
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
          title="Normal: Value is within reference limits"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
          {!showIconOnly && <span>Normal</span>}
        </span>
      );

    case 'low':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
          title="Low: Below normal reference limits"
        >
          <ArrowDownCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
          {!showIconOnly && <span>Low</span>}
        </span>
      );

    case 'high':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-800 border border-orange-200"
          title="High: Above normal reference limits"
        >
          <ArrowUpCircle className="w-3 h-3 text-orange-600 flex-shrink-0" />
          {!showIconOnly && <span>High</span>}
        </span>
      );

    case 'critical':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-800 border border-red-200"
          title="Critical: Clinical attention recommended"
        >
          <AlertOctagon className="w-3 h-3 text-red-600 flex-shrink-0" />
          {!showIconOnly && <span>Doctor Review</span>}
        </span>
      );

    default:
      return null;
  }
};
