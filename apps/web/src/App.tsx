import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { LandingPage } from './pages/LandingPage.js';
import { Dashboard } from './pages/Dashboard.js';
import { CaregiverPortal } from './pages/CaregiverPortal.js';
import { FamilyProfiles } from './pages/FamilyProfiles.js';
import { HealthWorkerDashboard } from './pages/HealthWorkerDashboard.js';
import { ConsentCenter } from './pages/ConsentCenter.js';
import { ReportDetailModal } from './components/ReportDetailModal.js';
import { ReportUploader } from './components/ReportUploader.js';
import { CameraCaptureModal } from './components/CameraCaptureModal.js';
import { AuthModal } from './components/AuthModal.js';
import { IdleLockModal } from './components/IdleLockModal.js';
import { INITIAL_REPORTS, INITIAL_ESCALATIONS, WebReport, EscalationTicket } from './types/api.js';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'landing' | 'dashboard' | 'caregiver' | 'family' | 'health_worker' | 'consent'
  >('landing');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('te'); // Default to Telugu as per sample family
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isIdleLocked, setIsIdleLocked] = useState<boolean>(false);

  const [reports, setReports] = useState<WebReport[]>(INITIAL_REPORTS);
  const [escalations, setEscalations] = useState<EscalationTicket[]>(INITIAL_ESCALATIONS);
  const [activeReport, setActiveReport] = useState<WebReport | null>(null);
  const [uploaderOpen, setUploaderOpen] = useState<boolean>(false);
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [cameraDocType, setCameraDocType] = useState<'lab_report' | 'prescription'>('lab_report');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 10-Minute Idle Timer Ref (600,000 ms)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (currentUser && currentView !== 'landing' && !isIdleLocked) {
      idleTimerRef.current = setTimeout(() => {
        setIsIdleLocked(true);
      }, IDLE_TIMEOUT_MS);
    }
  };

  // 1. Session Restoration on App Launch: If user has saved credentials, restore and require PIN unlock
  useEffect(() => {
    const token = localStorage.getItem('swasthya_access_token');
    const storedUser = localStorage.getItem('swasthya_current_user');
    if (token && storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
        setCurrentView('dashboard');
        // Always require PIN unlock on app open/return to protect patient privacy
        setIsIdleLocked(true);
      } catch {
        // fallback
      }
    }
  }, []);

  // 2. Strict Auth Guard: Prevent accessing dashboard without signing in
  useEffect(() => {
    if (currentView !== 'landing' && !currentUser) {
      setAuthMode('signin');
      setAuthModalOpen(true);
      setCurrentView('landing');
      showToast('Please sign in or enter PIN to access medical records.');
    }
  }, [currentView, currentUser]);

  // 3. Auto-Lock on App Switch / Tab Switch / Swiping away to another app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentUser && !isIdleLocked) {
        setIsIdleLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, isIdleLocked]);

  // 4. Intercept Browser Back / Swipe Navigation (PopState): Lock screen instead of bypassing or closing
  useEffect(() => {
    window.history.pushState({ app: 'bharat-swasth' }, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // Re-pin location so browser history does not exit the app
      window.history.pushState({ app: 'bharat-swasth' }, '', window.location.href);

      if (currentUser) {
        setIsIdleLocked(true);
        showToast('🔒 Session locked for your privacy. Enter PIN to resume.');
      } else {
        setAuthMode('signin');
        setAuthModalOpen(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // 5. Inactivity Idle Timer (10 Minutes)
  useEffect(() => {
    const activityEvents = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleActivity = () => resetIdleTimer();

    activityEvents.forEach((evt) => window.addEventListener(evt, handleActivity));
    resetIdleTimer();

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [currentUser, currentView, isIdleLocked]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUploadSuccess = (newReport: WebReport) => {
    setReports((prev) => [newReport, ...prev]);
    setActiveReport(newReport);
    setUploaderOpen(false);
    showToast(`Report "${newReport.test_title}" successfully analyzed and ready!`);
  };

  const handleEscalateFromReport = (report: WebReport) => {
    const newTicket: EscalationTicket = {
      id: 'esc-' + Date.now(),
      report_id: report.id,
      patient_name: report.patient_name,
      patient_phone: '+91 96666 66666',
      caregiver_phone: '+91 97777 77777',
      preferred_language: selectedLanguage,
      region: 'South Region (Warangal)',
      reason: `Caregiver escalated report: ${report.test_title}. Flagged abnormal values need review.`,
      critical_values: report.extracted_values
        .filter((v) => v.flag !== 'normal')
        .map((v) => `${v.test_name}: ${v.value} ${v.unit}`),
      status: 'open',
      assigned_worker: null,
      notes: null,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setEscalations((prev) => [newTicket, ...prev]);
    showToast(`Escalation ticket submitted to Health Worker queue for ${report.patient_name}!`);
  };

  const handleUpdateTicket = (updated: EscalationTicket) => {
    setEscalations((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast(`Escalation ticket #${updated.id} status updated to ${updated.status.toUpperCase()}.`);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('swasthya_current_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    if (user.preferred_language) {
      setSelectedLanguage(user.preferred_language);
    }
    setCurrentView('dashboard');
    setIsIdleLocked(false);
    showToast(`Welcome back, ${user.name || 'User'}!`);
  };

  const handleSignOut = () => {
    localStorage.removeItem('swasthya_access_token');
    localStorage.removeItem('swasthya_refresh_token');
    localStorage.removeItem('swasthya_current_user');
    setCurrentUser(null);
    setCurrentView('landing');
    setIsIdleLocked(false);
    showToast('Signed out successfully.');
  };

  const activeEscalationsCount = escalations.filter((e) => e.status !== 'resolved').length;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        highContrast ? 'high-contrast' : ''
      } ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
    >
      {/* If viewing public landing page */}
      {currentView === 'landing' ? (
        <LandingPage
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          onGetStarted={() => {
            setAuthMode('signup');
            setAuthModalOpen(true);
          }}
          onSignIn={() => {
            setAuthMode('signin');
            setAuthModalOpen(true);
          }}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      ) : (
        <div className="min-h-screen flex flex-row">
          {/* Left Sidebar Navigation */}
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            userName={currentUser?.name || 'Sita Ramulu'}
            userRole={currentUser?.role || 'Patient / Family Caregiver'}
            onNewReport={() => {
              setCameraDocType('lab_report');
              setCameraModalOpen(true);
            }}
            onLockSession={() => setIsIdleLocked(true)}
            onSignOut={handleSignOut}
            escalationCount={activeEscalationsCount}
            selectedLanguage={selectedLanguage}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Navbar */}
            <Navbar
              currentView={currentView as any}
              onViewChange={setCurrentView as any}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              highContrast={highContrast}
              onToggleHighContrast={() => setHighContrast(!highContrast)}
              onLockSession={() => setIsIdleLocked(true)}
              onSignOut={handleSignOut}
            />

            {/* View Switching */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {currentView === 'dashboard' && (
                <Dashboard
                  userName={currentUser?.name || 'Sita Ramulu'}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  reports={reports}
                  escalations={escalations}
                  onOpenReport={setActiveReport}
                  onScanReport={() => {
                    setCameraDocType('lab_report');
                    setCameraModalOpen(true);
                  }}
                  onUploadReport={() => {
                    setCameraDocType('prescription');
                    setCameraModalOpen(true);
                  }}
                />
              )}

              {currentView === 'caregiver' && (
                <CaregiverPortal
                  reports={reports}
                  selectedLanguage={selectedLanguage}
                  onOpenReport={setActiveReport}
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {currentView === 'family' && <FamilyProfiles />}

              {currentView === 'health_worker' && (
                <HealthWorkerDashboard
                  escalations={escalations}
                  onUpdateTicket={handleUpdateTicket}
                />
              )}

              {currentView === 'consent' && <ConsentCenter />}
            </main>

            {/* Portal Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  AI Health Report Translator • Accessible Healthcare Communication Monorepo
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Designed for elderly, low-literacy, and rural users across India. Built in compliance with India’s
                  Digital Personal Data Protection (DPDP) Act 2023.
                </p>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Global Report Detail Modal */}
      <ReportDetailModal
        report={activeReport}
        selectedLanguage={selectedLanguage}
        onClose={() => setActiveReport(null)}
        onEscalate={handleEscalateFromReport}
      />

      {/* Quick Upload Modal */}
      {uploaderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setUploaderOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">
              Add Medical Report / Prescription
            </h2>
            <ReportUploader
              selectedPatientId="pat-1"
              patientName={currentUser?.name || 'Sita Ramulu'}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      )}

      {/* Multi-Page Camera Capture & Document Scanner Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onComplete={handleUploadSuccess}
        selectedPatientId="pat-1"
        patientName={currentUser?.name || 'Sita Ramulu'}
        initialDocType={cameraDocType}
      />

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        selectedLanguage={selectedLanguage}
      />

      {/* Privacy & Inactivity Lock Screen */}
      <IdleLockModal
        isLocked={isIdleLocked}
        onUnlocked={() => {
          setIsIdleLocked(false);
          resetIdleTimer();
          showToast('Session unlocked successfully.');
        }}
        onSignOut={handleSignOut}
        userName={currentUser?.name || 'Sita Ramulu'}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold border border-slate-700 animate-slide-up">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
