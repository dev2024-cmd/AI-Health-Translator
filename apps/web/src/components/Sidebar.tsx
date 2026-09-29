import React from 'react';
import {
  Home,
  FileText,
  Users,
  Stethoscope,
  ShieldCheck,
  Lock,
  LogOut,
  PlusCircle,
  ArrowLeft,
  Activity,
  Database,
  Sparkles
} from 'lucide-react';
import { getUITranslation } from '../utils/translations.js';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
  userName: string;
  userRole: string;
  onNewReport: () => void;
  onLockSession: () => void;
  onSignOut: () => void;
  escalationCount: number;
  selectedLanguage?: string;
  isAdmin?: boolean;
  onOpenSubscription?: () => void;
  currentPlan?: 'free' | 'family' | 'pro';
  reportsCount?: number;
  maxFreeReports?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  userName,
  userRole,
  onNewReport,
  onLockSession,
  onSignOut,
  escalationCount,
  selectedLanguage = 'en',
  isAdmin = false,
  onOpenSubscription,
  currentPlan = 'free',
  reportsCount = 0,
  maxFreeReports = 5,
}) => {
  const t = getUITranslation(selectedLanguage);
  const isInAdminMode = currentView === 'admin' || (isAdmin && currentView === 'health_worker');

  const patientNavItems: NavItem[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Home },
    { id: 'caregiver', label: t.nav.myReports, icon: FileText },
    { id: 'family', label: t.nav.familyProfiles, icon: Users },
    { id: 'consent', label: t.nav.consent, icon: ShieldCheck },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin', label: 'Admin Console', icon: ShieldCheck },
    {
      id: 'health_worker',
      label: 'Emergency Triage',
      icon: Stethoscope,
      badge: escalationCount > 0 ? escalationCount : undefined,
    },
  ];

  const navItems: NavItem[] = isInAdminMode ? adminNavItems : patientNavItems;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors sticky top-0 h-screen overflow-y-auto z-20">
      <div className="flex flex-col">
        {/* 1. Brand Header */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
          <img
            src="/logo.png"
            alt="Bharat Swasth"
            className="w-8 h-8 rounded-lg object-contain border border-slate-200 dark:border-slate-700 bg-white p-0.5 shadow-xs"
          />
          <div className="overflow-hidden">
            <span
              className={`font-bold text-sm tracking-tight block truncate ${
                isInAdminMode ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {isInAdminMode ? 'Admin Console' : 'Bharat Swasth'}
            </span>
            <span className="block text-[10px] font-medium text-slate-400 truncate">
              {isInAdminMode ? 'Central Operations' : 'Healthcare Health Platform'}
            </span>
          </div>
        </div>

        {/* 2. User Profile, Lock & Sign Out at the TOP (as requested) */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs ${
                isInAdminMode ? 'bg-amber-600' : 'bg-sky-700'
              }`}
            >
              {isInAdminMode ? 'PR' : userName.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {isInAdminMode ? 'Dr. Parvathi Rao, MD' : userName}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>{isInAdminMode ? 'Chief Medical Administrator' : (userRole === 'user' ? 'Verified Patient' : userRole)}</span>
              </p>
            </div>
          </div>

          {/* Quick Session Controls: Lock & Sign Out */}
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <button
              onClick={onLockSession}
              title="Lock Session with PIN"
              className="flex-1 py-1.5 px-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Lock</span>
            </button>
            <button
              onClick={onSignOut}
              title={t.nav.signOut}
              className="flex-1 py-1.5 px-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-900 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <LogOut className="w-3 h-3 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Subscription Quota & Pricing Badge (Directly in Profile Region) */}
          {!isInAdminMode && onOpenSubscription && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <div
                onClick={onOpenSubscription}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-600 transition-all cursor-pointer group shadow-2xs"
                title="View Subscription & Transparent Unit Costs"
              >
                <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                  <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold">
                    <Sparkles className="w-3 h-3 text-brand-600" />
                    <span>{currentPlan === 'free' ? 'Ayush Free Tier' : currentPlan === 'family' ? 'Parivar Plan' : 'Swasthya Pro'}</span>
                  </span>
                  <span className="text-[10px] font-bold text-brand-700 dark:text-brand-400 group-hover:underline">
                    {currentPlan === 'free' ? 'Pricing & Upgrade' : 'Manage'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      reportsCount >= (maxFreeReports || 5) && currentPlan === 'free'
                        ? 'bg-rose-500'
                        : 'bg-brand-600'
                    }`}
                    style={{
                      width: `${
                        currentPlan === 'free'
                          ? Math.min(100, (reportsCount / (maxFreeReports || 5)) * 100)
                          : 100
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>
                    {currentPlan === 'free'
                      ? `${reportsCount}/${maxFreeReports || 5} free reports`
                      : 'Unlimited reports active'}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {currentPlan === 'free' ? '₹0/mo' : currentPlan === 'family' ? '₹199/mo' : '₹499/mo'}
                  </span>
                </div>

                {/* Direct Unit Cost Breakdown (Requested by User) */}
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] font-medium text-slate-500 dark:text-slate-400">
                  <span title="Vernacular SMS Delivery">SMS ₹0.25</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span title="2G Outbound Spoken Voice Call">IVR ₹0.75/m</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span title="Neural Document OCR">OCR ₹0.50</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span title="Clinical LLM Simplification">LLM ₹0.60</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Primary Action Button */}
        <div className="p-3">
          {isInAdminMode ? (
            <button
              onClick={() => onViewChange('dashboard')}
              className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Patient App</span>
            </button>
          ) : (
            <button
              onClick={onNewReport}
              className="w-full py-2.5 px-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.uploadNewReport}</span>
            </button>
          )}
        </div>

        {/* 4. Navigation Links below user profile & action button */}
        <div className="px-3 pb-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
            Portal Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? isInAdminMode
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold border border-amber-200/60 dark:border-amber-900/60'
                        : 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-900/60'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? isInAdminMode
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-sky-700 dark:text-sky-300'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};
