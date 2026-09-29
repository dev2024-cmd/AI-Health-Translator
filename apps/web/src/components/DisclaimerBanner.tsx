import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { getI18nStrings } from '@ai-health/shared';

interface DisclaimerBannerProps {
  languageCode: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ languageCode }) => {
  const strings = getI18nStrings(languageCode);
  const cleanDisclaimer = (strings?.disclaimer || '')
    .replace(/[⚠️📋🥗🍲⛔💊🎯⚡⏰📞🟢🟡🔴📸📁❤️🩺👨‍⚕️👩‍⚕️🔊✅❌🏥]/g, '')
    .trim();

  return (
    <aside
      role="note"
      className="bg-slate-50 border border-slate-200 border-l-2 border-l-slate-500 p-3.5 rounded-md shadow-xs text-slate-700 text-xs flex items-start gap-2.5 my-3"
    >
      <ShieldCheck className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold uppercase tracking-wider block text-[10px] text-slate-500 mb-0.5">
          Medical Information Notice
        </span>
        <p className="leading-relaxed text-slate-600 font-normal">
          {cleanDisclaimer}
        </p>
      </div>
    </aside>
  );
};
