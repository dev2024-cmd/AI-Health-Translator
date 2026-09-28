import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { getI18nStrings } from '@ai-health/shared';

interface DisclaimerBannerProps {
  languageCode: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ languageCode }) => {
  const strings = getI18nStrings(languageCode);

  return (
    <aside
      role="note"
      className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm text-amber-900 text-xs sm:text-sm flex items-start gap-3 my-4"
    >
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <strong className="font-bold uppercase tracking-wider block text-[11px] text-amber-800 mb-0.5">
          Important Medical Notice
        </strong>
        <p className="leading-relaxed">
          {strings.disclaimer}
        </p>
      </div>
    </aside>
  );
};
