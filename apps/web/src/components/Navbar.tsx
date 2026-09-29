import React from 'react';
import {
  ShieldCheck,
  HeartPulse,
  Stethoscope,
  FileLock2,
  Sun,
  Moon,
  Globe,
  KeyRound,
  Home,
  Users,
  Lock,
  LogOut,
  Sparkles
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@ai-health/shared';
import { getUITranslation } from '../utils/translations.js';

interface NavbarProps {
  currentView: 'landing' | 'caregiver' | 'health_worker' | 'consent' | 'admin' | 'dashboard' | 'family';
  onViewChange: (view: any) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onLockSession?: () => void;
  onSignOut?: () => void;
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
  userName?: string;
  onOpenSubscription?: () => void;
  currentPlan?: 'free' | 'family' | 'pro';
  reportsCount?: number;
  maxFreeReports?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  selectedLanguage,
  onLanguageChange,
  highContrast,
  onToggleHighContrast,
  onLockSession,
  onSignOut,
  isAdmin = false,
  onOpenAdminModal,
  userName = 'User',
  onOpenSubscription,
  currentPlan = 'free',
  reportsCount = 0,
  maxFreeReports = 5,
}) => {
  const t = getUITranslation(selectedLanguage);

  // Dynamic Page Title & Category
  const getPageInfo = () => {
    switch (currentView) {
      case 'dashboard':
        return { category: 'Patient Portal', title: t.nav.dashboard };
      case 'caregiver':
        return { category: 'Health Records', title: t.nav.myReports };
      case 'family':
        return { category: 'Family Care', title: t.nav.familyProfiles };
      case 'consent':
        return { category: 'Compliance', title: t.nav.consent };
      case 'admin':
        return { category: 'Central Operations', title: 'Admin Console' };
      case 'health_worker':
        return { category: 'Emergency Services', title: 'Triage Queue' };
      default:
        return { category: 'Patient Portal', title: t.nav.dashboard };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Professional Breadcrumb & DPDP Shield (Stays on dashboard on click) */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onViewChange('dashboard')}
            title="Go to Dashboard"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 transition-colors">
                  {pageInfo.category}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>DPDP 2023 Shield</span>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {pageInfo.title}
              </h2>
            </div>
          </div>

          {/* Center Navigation Tabs: Stays in Authenticated App */}
          <nav className="hidden lg:flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-lg border border-slate-200/70 dark:border-slate-700/60 text-xs font-semibold">
            <button
              id="tab-dashboard"
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.nav.dashboard}</span>
            </button>

            <button
              id="tab-my-reports"
              onClick={() => onViewChange('caregiver')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                currentView === 'caregiver'
                  ? 'bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.nav.myReports}</span>
            </button>

            <button
              id="tab-family-profiles"
              onClick={() => onViewChange('family')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                currentView === 'family'
                  ? 'bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.nav.familyProfiles}</span>
            </button>

            <button
              id="tab-consent"
              onClick={() => onViewChange('consent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                currentView === 'consent'
                  ? 'bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileLock2 className="w-3.5 h-3.5" />
              <span>{t.nav.consent}</span>
            </button>

            {isAdmin && (
              <button
                id="tab-admin-console"
                onClick={() => onViewChange('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  currentView === 'admin'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Right Controls: Single Clean Language Dropdown, Theme Toggle, Staff Key & User Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Unified Language Selector Dropdown */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400 absolute left-2.5 pointer-events-none" />
              <select
                id="language-select-dropdown"
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors"
                aria-label="Select report explanation language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName === lang.name ? lang.name : `${lang.nativeName} (${lang.name})`}
                  </option>
                ))}
              </select>
            </div>

            {/* High Contrast / Dark Mode Toggle */}
            <button
              id="high-contrast-toggle"
              onClick={onToggleHighContrast}
              title={highContrast ? 'Switch to Standard Theme' : 'Switch to High Contrast Mode'}
              className="p-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              aria-label="Toggle theme"
            >
              {highContrast ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
            </button>

            {/* Discrete Staff / Admin Access Gate */}
            {onOpenAdminModal && !isAdmin && (
              <button
                onClick={onOpenAdminModal}
                title="Healthcare Staff / Admin Portal (Unique Passkey Required)"
                className="p-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-400 hover:text-amber-600 transition-colors"
                aria-label="Staff Security Gate"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}

            {/* Subscription & Quota Pill Button (Directly in Profile Region) */}
            {!isAdmin && onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-800 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/60 transition-all shadow-2xs group"
                title="View Subscription, Free Quotas & Telecom Pricing"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span>
                  {currentPlan === 'free' ? `Free Quota: ${reportsCount}/${maxFreeReports || 5}` : currentPlan === 'family' ? 'Parivar Plan' : 'Swasthya Pro'}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-brand-200/70 dark:bg-brand-800/80 rounded text-brand-900 dark:text-brand-100">
                  {currentPlan === 'free' ? 'Upgrade' : 'Active'}
                </span>
              </button>
            )}

            {/* User Avatar & Session Actions */}
            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div
                className={`w-7 h-7 rounded-md text-white font-bold text-xs flex items-center justify-center shadow-xs ${
                  isAdmin ? 'bg-amber-600' : 'bg-sky-700'
                }`}
                title={isAdmin ? 'Chief Medical Administrator' : userName}
              >
                {isAdmin ? 'PR' : userName.slice(0, 2).toUpperCase()}
              </div>

              {onLockSession && (
                <button
                  onClick={onLockSession}
                  title="Lock Session with PIN"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Tabs */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`py-1 px-2.5 rounded-lg ${
              currentView === 'dashboard'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.nav.dashboard}
          </button>
          <button
            onClick={() => onViewChange('caregiver')}
            className={`py-1 px-2.5 rounded-lg ${
              currentView === 'caregiver'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.nav.myReports}
          </button>
          <button
            onClick={() => onViewChange('family')}
            className={`py-1 px-2.5 rounded-lg ${
              currentView === 'family'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.nav.familyProfiles}
          </button>
          <button
            onClick={() => onViewChange('consent')}
            className={`py-1 px-2.5 rounded-lg ${
              currentView === 'consent'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.nav.consent}
          </button>
          {isAdmin && (
            <button
              onClick={() => onViewChange('admin')}
              className={`py-1 px-2.5 rounded-lg ${
                currentView === 'admin'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-black'
                  : 'text-amber-700'
              }`}
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
