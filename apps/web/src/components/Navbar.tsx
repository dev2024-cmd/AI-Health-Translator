import React from 'react';
import { ShieldCheck, HeartPulse, Stethoscope, FileLock2, Sun, Moon, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@ai-health/shared';

interface NavbarProps {
  currentView: 'caregiver' | 'health_worker' | 'consent';
  onViewChange: (view: 'caregiver' | 'health_worker' | 'consent') => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  selectedLanguage,
  onLanguageChange,
  highContrast,
  onToggleHighContrast,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  AI Health Report Translator
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> DPDP 2023
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Simple, voice-enabled lab results in 22 scheduled Indian languages
              </p>
            </div>
          </div>

          {/* Navigation Role Tabs */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200 text-sm font-medium">
            <button
              id="tab-caregiver-portal"
              onClick={() => onViewChange('caregiver')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                currentView === 'caregiver'
                  ? 'bg-white text-brand-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-brand-600" />
              Caregiver Portal
            </button>
            <button
              id="tab-health-worker-dashboard"
              onClick={() => onViewChange('health_worker')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                currentView === 'health_worker'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-blue-600" />
              Health Worker Queue
              <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.2 rounded-full font-bold">2</span>
            </button>
            <button
              id="tab-dpdp-consent"
              onClick={() => onViewChange('consent')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                currentView === 'consent'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileLock2 className="w-4 h-4 text-slate-500" />
              Consent Center
            </button>
          </nav>

          {/* Controls: Language Selector & High Contrast Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                id="language-select-dropdown"
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-colors"
                aria-label="Select report explanation language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              id="high-contrast-toggle"
              onClick={onToggleHighContrast}
              title={highContrast ? 'Switch to Standard Theme' : 'Switch to High Contrast Accessibility Mode'}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Toggle High Contrast Mode"
            >
              {highContrast ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => onViewChange('caregiver')}
            className={`py-1 px-2 rounded-md ${currentView === 'caregiver' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600'}`}
          >
            Caregiver
          </button>
          <button
            onClick={() => onViewChange('health_worker')}
            className={`py-1 px-2 rounded-md ${currentView === 'health_worker' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`}
          >
            Health Worker (2)
          </button>
          <button
            onClick={() => onViewChange('consent')}
            className={`py-1 px-2 rounded-md ${currentView === 'consent' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600'}`}
          >
            Consent & Privacy
          </button>
        </div>
      </div>
    </header>
  );
};
