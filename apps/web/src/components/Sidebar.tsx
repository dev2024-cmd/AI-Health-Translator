import React from 'react';
import {
  Home,
  FileText,
  Users,
  Stethoscope,
  ShieldCheck,
  Lock,
  LogOut,
  HeartPulse,
  PlusCircle
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
}) => {
  const t = getUITranslation(selectedLanguage);

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Home },
    { id: 'caregiver', label: t.nav.myReports, icon: FileText },
    { id: 'family', label: t.nav.familyProfiles, icon: Users },
    {
      id: 'health_worker',
      label: t.nav.healthWorker,
      icon: Stethoscope,
      badge: escalationCount > 0 ? escalationCount : undefined,
    },
    { id: 'consent', label: t.nav.consent, icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-colors">
      <div>
        {/* Brand */}
        <div className="h-20 px-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
          <img
            src="/logo.png"
            alt="Bharat Swasth"
            className="w-10 h-10 rounded-2xl object-contain shadow-sm border border-emerald-500/20 bg-white p-0.5"
          />
          <div>
            <span className="font-black text-base text-emerald-600 dark:text-emerald-400 tracking-tight">Bharat Swasth</span>
            <span className="block text-[10px] font-bold text-slate-400">Your Health, Simplified.</span>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <button
            onClick={onNewReport}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.nav.uploadNewReport}</span>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* User Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{userName}</h4>
            <p className="text-[10px] text-slate-400 capitalize">{userRole}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onLockSession}
            title="Lock Session with PIN"
            className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Lock</span>
          </button>
          <button
            onClick={onSignOut}
            title={t.nav.signOut}
            className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>{t.nav.signOut}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
