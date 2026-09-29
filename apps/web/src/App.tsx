import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { LandingPage } from './pages/LandingPage.js';
import { Dashboard } from './pages/Dashboard.js';
import { CaregiverPortal } from './pages/CaregiverPortal.js';
import { FamilyProfiles } from './pages/FamilyProfiles.js';
import { FamilyMember } from './pages/FamilyProfiles.js';
import { HealthWorkerDashboard } from './pages/HealthWorkerDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { ConsentCenter } from './pages/ConsentCenter.js';
import { ReportDetailModal } from './components/ReportDetailModal.js';
import { ReportUploader } from './components/ReportUploader.js';
import { CameraCaptureModal } from './components/CameraCaptureModal.js';
import { AuthModal } from './components/AuthModal.js';
import { IdleLockModal } from './components/IdleLockModal.js';
import { AdminAccessModal } from './components/AdminAccessModal.js';
import { PhoneSimulatorModal } from './components/PhoneSimulatorModal.js';
import { SubscriptionModal } from './components/SubscriptionModal.js';
import { WebReport, EscalationTicket, INITIAL_REPORTS, INITIAL_ESCALATIONS } from './types/api.js';
import { hydrateAllReports, hydrateReportTranslations, getLocalizedExplanation } from './utils/reportLocalizer.js';
import { parseMedicalOcrText } from './utils/medicalOcrParser.js';

// Dedicated Official Administrator Identity (Completely separate from Patient accounts)
export const DEFAULT_ADMIN_ACCOUNT = {
  id: 'admin-chief-01',
  name: 'Dr. Parvathi Rao, MD',
  role: 'admin',
  designation: 'Chief Medical Administrator',
  phone: '+91 1800-ADMIN-GOV',
  email: 'chief.medical.officer@bharatswasth.gov.in',
  preferred_language: 'en',
};

// Helper: Ensure any registered patient is recorded in the Admin's Central Patient Registry
const ensureUserInAdminDb = (patient: any, reportCount: number = 0) => {
  if (!patient || patient.role === 'admin') return;
  try {
    const raw = localStorage.getItem('swasthya_admin_patients_db_v2');
    let list = raw ? JSON.parse(raw) : null;
    if (!list || !Array.isArray(list) || list.length === 0) {
      list = [
        {
          id: 'pat-101',
          name: 'Sita Ramulu',
          phone: '+91 96666 66666',
          language: 'Telugu (తెలుగు)',
          totalReports: 4,
          criticalCount: 1,
          status: 'escalated',
          registeredDate: '12 Sep 2026',
          assignedAsha: 'Sunita Rao (ASHA #42)',
        },
        {
          id: 'pat-102',
          name: 'Lakshmi Devi',
          phone: '+91 96555 44332',
          language: 'Telugu (తెలుగు)',
          totalReports: 2,
          criticalCount: 0,
          status: 'active',
          registeredDate: '18 Sep 2026',
          assignedAsha: 'Sunita Rao (ASHA #42)',
        },
        {
          id: 'pat-103',
          name: 'Ramesh Patel',
          phone: '+91 98888 11111',
          language: 'Hindi (हिन्दी)',
          totalReports: 3,
          criticalCount: 1,
          status: 'under_review',
          registeredDate: '21 Sep 2026',
          assignedAsha: 'Pooja Verma (ANM #12)',
        },
        {
          id: 'pat-104',
          name: 'Kavitha Sundaram',
          phone: '+91 98401 22334',
          language: 'Tamil (தமிழ்)',
          totalReports: 5,
          criticalCount: 0,
          status: 'active',
          registeredDate: '24 Sep 2026',
          assignedAsha: 'Meenakshi N (ASHA #19)',
        },
      ];
    }

    const existing = list.find(
      (p: any) =>
        p.id === patient.id ||
        p.phone === patient.phone ||
        (patient.name && p.name.toLowerCase() === patient.name.toLowerCase())
    );

    if (!existing) {
      list.push({
        id: patient.id || `pat-${Date.now().toString().slice(-4)}`,
        name: patient.name || 'Registered Patient',
        phone: patient.phone || '+91 98765 43210',
        language:
          patient.preferred_language === 'ta'
            ? 'Tamil (தமிழ்)'
            : patient.preferred_language === 'te'
            ? 'Telugu (తెలుగు)'
            : patient.preferred_language === 'hi'
            ? 'Hindi (हिन्दी)'
            : 'English',
        totalReports: reportCount,
        criticalCount: 0,
        status: 'active',
        registeredDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        assignedAsha: 'Unassigned',
      });
      localStorage.setItem('swasthya_admin_patients_db_v2', JSON.stringify(list));
    }
  } catch {}
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'landing' | 'dashboard' | 'caregiver' | 'family' | 'health_worker' | 'admin' | 'consent'
  >('landing');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en'); // Clean English default
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  // Preserved patient user state when viewing admin mode
  const [patientUser, setPatientUser] = useState<any>(null);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authRole, setAuthRole] = useState<'patient' | 'admin'>('patient');
  const [isIdleLocked, setIsIdleLocked] = useState<boolean>(false);

  // User-scoped storage keys for strict medical data isolation (DPDP Act 2023)
  const getUserReportsKey = (userId?: string) => `swasthya_usr_${userId || 'guest'}_reports`;
  const getUserFamilyKey = (userId?: string) => `swasthya_usr_${userId || 'guest'}_family`;

  // Patient's personal reports state
  const [reports, setReports] = useState<WebReport[]>([]);
  // Central admin triage escalations
  const [escalations, setEscalations] = useState<EscalationTicket[]>(() => {
    try {
      const saved = localStorage.getItem('swasthya_admin_escalations_db_v2');
      return saved ? JSON.parse(saved) : INITIAL_ESCALATIONS;
    } catch {
      return INITIAL_ESCALATIONS;
    }
  });
  // Patient's personal family members
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const [activeReport, setActiveReport] = useState<WebReport | null>(null);
  const [uploaderOpen, setUploaderOpen] = useState<boolean>(false);
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [cameraDocType, setCameraDocType] = useState<'lab_report' | 'prescription'>('lab_report');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Subscription & Free Quota State ('free' | 'family' | 'pro')
  const [userPlan, setUserPlan] = useState<'free' | 'family' | 'pro'>(() => {
    try {
      const saved = localStorage.getItem('swasthya_user_plan');
      return saved === 'family' || saved === 'pro' || saved === 'free' ? saved : 'free';
    } catch {
      return 'free';
    }
  });
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState<boolean>(false);
  const MAX_FREE_REPORTS = 5;
  const MAX_FREE_STORAGE_MB = 25;

  const handleUpgradePlan = (plan: 'free' | 'family' | 'pro') => {
    setUserPlan(plan);
    try {
      localStorage.setItem('swasthya_user_plan', plan);
    } catch {}
    showToast(
      plan === 'free'
        ? 'Active Plan: Ayush Free Tier.'
        : `Upgraded to ${plan === 'family' ? 'Swasthya Parivar (₹199/mo)' : 'Swasthya Pro (₹499/mo)'}! Quotas updated.`
    );
  };

  const handleTriggerNewReport = (docType: 'lab_report' | 'prescription' = 'lab_report') => {
    if (userPlan === 'free' && reports.length >= MAX_FREE_REPORTS) {
      showToast(`Free quota limit reached (${reports.length}/${MAX_FREE_REPORTS} reports). Opening subscription plans.`);
      setSubscriptionModalOpen(true);
      return;
    }
    setCameraDocType(docType);
    setCameraModalOpen(true);
  };

  // Automated Voice Call Simulator State (For patients without WhatsApp or Email)
  const [simulatorState, setSimulatorState] = useState<{
    isOpen: boolean;
    reportId?: string;
    patientName: string;
    patientPhone: string;
    language: string;
    reportTitle?: string;
    customExplanation?: string;
    deliveryReason?: string;
  }>({
    isOpen: false,
    patientName: '',
    patientPhone: '',
    language: 'en',
  });

  const handleSimulateVoiceCall = (options: {
    reportId?: string;
    patientName: string;
    patientPhone: string;
    language: string;
    reportTitle?: string;
    customExplanation?: string;
    deliveryReason?: string;
  }) => {
    setSimulatorState({
      isOpen: true,
      reportId: options.reportId || 'rep-call-01',
      patientName: options.patientName || currentUser?.name || 'Patient',
      patientPhone: options.patientPhone || currentUser?.phone || '+91 96666 66666',
      language: options.language || selectedLanguage || 'en',
      reportTitle: options.reportTitle,
      customExplanation: options.customExplanation,
      deliveryReason: options.deliveryReason || 'Patient does not use WhatsApp or Email • Automated Outbound Voice Call',
    });
  };

  const handleSimulateReportVoiceCall = (report: WebReport, lang?: string) => {
    const activeLang = lang || selectedLanguage;
    const explanation = getLocalizedExplanation(report, activeLang);
    handleSimulateVoiceCall({
      reportId: report.id,
      patientName: report.patient_name,
      patientPhone: '+91 96666 66666',
      language: activeLang,
      reportTitle: report.test_title,
      customExplanation: explanation,
      deliveryReason: `${report.patient_name} does not use WhatsApp or Email • Automated Voice Call Delivery Active`,
    });
  };

  // 15-Minute Inactivity Idle Timer Ref
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (currentUser && currentView !== 'landing' && !isIdleLocked) {
      idleTimerRef.current = setTimeout(() => {
        setIsIdleLocked(true);
      }, IDLE_TIMEOUT_MS);
    }
  };

  // 1. Session Restoration on App Launch: Restore saved credentials smoothly
  useEffect(() => {
    const token = localStorage.getItem('swasthya_access_token');
    const storedUser = localStorage.getItem('swasthya_current_user');
    if (token && storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role === 'admin') {
          setCurrentUser(DEFAULT_ADMIN_ACCOUNT);
          setCurrentView('admin');
        } else {
          setCurrentUser(u);
          setPatientUser(u);
          setCurrentView('dashboard');
        }
        setIsIdleLocked(false);
      } catch {
        // fallback
      }
    }
  }, []);

  // 2. Strict Per-User Database Scoping: Load patient's personal data whenever currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setReports([]);
      setFamilyMembers([]);
      return;
    }

    if (currentUser.role === 'admin') {
      // The Administrator operates directly on the separate Admin Database (swasthya_admin_patients_db_v2)
      return;
    }

    const uReportsKey = getUserReportsKey(currentUser.id);
    const uFamilyKey = getUserFamilyKey(currentUser.id);

    try {
      const savedReports = localStorage.getItem(uReportsKey);
      if (savedReports) {
        const rawList = JSON.parse(savedReports);
        const upgraded = rawList.map((r: WebReport) => {
          const isStaleSharmaDemo =
            (r.test_title?.toLowerCase().includes('sharma') ||
             r.file_name?.toLowerCase().includes('prescription') ||
             r.document_type === 'prescription') &&
            r.extracted_values?.some((v) => v.test_name.toLowerCase().includes('metformin'));

          if (isStaleSharmaDemo) {
            const p = parseMedicalOcrText('demo medicine 1 2 3 4', r.file_name, r.patient_name, 'prescription');
            return {
              ...r,
              test_title: 'Doctor Prescription (Dr. R. K. Sharma)',
              doctor_name: 'Dr. R. K. Sharma (M.B.B.S, M.D., M.S.)',
              doctor_clinic: 'Clinic Station, Pune',
              doctor_advice: 'AVOID OILY AND SPICY FOOD',
              follow_up_date: '12-05-2020',
              extracted_values: p.extractedValues,
              plain_explanation: p.plainExplanation,
            };
          }
          return r;
        });
        const hydrated = hydrateAllReports(upgraded);
        setReports(hydrated);
        localStorage.setItem(uReportsKey, JSON.stringify(hydrated));
      } else if (
        currentUser.id === 'demo-patient-id' ||
        currentUser.id === '9a6f5201-9831-4e00-8812-7177e57dda54' ||
        currentUser.phone === '9876543210' ||
        currentUser.phone === '+919876543210'
      ) {
        // Seed initial demo reports only for the built-in quick demo account
        const seeded = hydrateAllReports(INITIAL_REPORTS);
        setReports(seeded);
        localStorage.setItem(uReportsKey, JSON.stringify(seeded));
      } else {
        // Any newly registered patient has an isolated, private, clean database
        setReports([]);
      }

      const savedFamily = localStorage.getItem(uFamilyKey);
      if (savedFamily) {
        setFamilyMembers(JSON.parse(savedFamily));
      } else {
        setFamilyMembers([]);
      }

      // Sync with backend API for this authenticated user
      const token = localStorage.getItem('swasthya_access_token');
      if (token && currentUser.id !== 'demo-patient-id') {
        fetch('http://localhost:8000/v1/reports', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : []))
          .then((apiReports: any[]) => {
            if (Array.isArray(apiReports) && apiReports.length > 0) {
              setReports((existing) => {
                const existingIds = new Set(existing.map((r) => r.id));
                const newReports: WebReport[] = apiReports
                  .filter((ar: any) => !existingIds.has(ar.id))
                  .map((ar: any) => {
                    const plainExp: Record<string, string> = {};
                    if (ar.explanations && Array.isArray(ar.explanations)) {
                      ar.explanations.forEach((ex: any) => {
                        plainExp[ex.language] = ex.text;
                      });
                    }
                    return {
                      id: ar.id,
                      patient_name: currentUser.name || 'Patient',
                      patient_id: ar.patient_id,
                      patient_age: currentUser.age || 50,
                      patient_gender: 'Unknown',
                      test_title: ar.document_type === 'prescription' ? 'Doctor Prescription' : 'Medical Report',
                      date: ar.created_at ? ar.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                      source: ar.source || 'web',
                      status: ar.status === 'processed' ? 'ready' : ar.status,
                      original_language: ar.original_language || 'en',
                      audio_available: false,
                      plain_explanation: plainExp,
                      extracted_values: ar.extracted_values || [],
                      file_name: ar.files?.[0]?.storage_key || 'report_file.pdf',
                      file_type: ar.files?.[0]?.mime || 'application/pdf',
                      document_type: ar.document_type || 'lab_report',
                    };
                  });
                if (newReports.length > 0) {
                  const merged = [...existing, ...hydrateAllReports(newReports)];
                  localStorage.setItem(uReportsKey, JSON.stringify(merged));
                  return merged;
                }
                return existing;
              });
            }
          })
          .catch(() => {});
      }
    } catch {
      setReports([]);
      setFamilyMembers([]);
    }
  }, [currentUser?.id, currentUser?.role]);

  // 3. Persist patient's private reports to their own isolated database partition
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && currentUser.id) {
      try {
        localStorage.setItem(getUserReportsKey(currentUser.id), JSON.stringify(reports));

        // Sync report count into the central Administrative Registry without leaking reports
        const dbRaw = localStorage.getItem('swasthya_admin_patients_db_v2');
        if (dbRaw) {
          const db = JSON.parse(dbRaw);
          const p = db.find((item: any) => item.id === currentUser.id || item.phone === currentUser.phone);
          if (p) {
            p.totalReports = reports.length;
            p.criticalCount = reports.filter((r) => r.extracted_values.some((v) => v.flag === 'critical')).length;
            localStorage.setItem('swasthya_admin_patients_db_v2', JSON.stringify(db));
          }
        }
      } catch {}
    }
  }, [reports, currentUser]);

  // 4. Persist patient's family members to their own isolated database partition
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && currentUser.id) {
      try {
        localStorage.setItem(getUserFamilyKey(currentUser.id), JSON.stringify(familyMembers));
      } catch {}
    }
  }, [familyMembers, currentUser]);

  // 5. Persist central admin escalations queue
  useEffect(() => {
    try {
      localStorage.setItem('swasthya_admin_escalations_db_v2', JSON.stringify(escalations));
    } catch {}
  }, [escalations]);

  // 6. Auth Guard: Show sign in if accessing dashboard without user
  useEffect(() => {
    if (currentView !== 'landing' && !currentUser) {
      setAuthMode('signin');
      setAuthModalOpen(true);
      setCurrentView('landing');
      showToast('Please sign in or use Quick Demo to access your health portal.');
    }
  }, [currentView, currentUser]);

  // 7. Gentle Inactivity Idle Timer (15 Minutes)
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

  // Global staff gateway shortcut: Ctrl+Shift+A or Alt+A opens Admin Passkey Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setAdminModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUploadSuccess = (newReport: WebReport) => {
    const hydrated = hydrateReportTranslations(newReport);
    setReports((prev) => [hydrated, ...prev]);
    setActiveReport(hydrated);
    setUploaderOpen(false);
    showToast(`Report "${hydrated.test_title}" successfully analyzed and saved to your private database!`);
  };

  const handleEscalateFromReport = (report: WebReport) => {
    const newTicket: EscalationTicket = {
      id: 'esc-' + Date.now().toString().slice(-4),
      report_id: report.id,
      patient_name: report.patient_name,
      patient_phone: currentUser?.phone || '+91 96666 66666',
      caregiver_phone: '+91 97777 77777',
      preferred_language: selectedLanguage,
      region: 'South Region (District Central)',
      reason: `Patient escalated report: ${report.test_title}. Flagged abnormal values need review.`,
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
    if (user.role === 'admin') {
      setCurrentUser(DEFAULT_ADMIN_ACCOUNT);
      setCurrentView('admin');
      showToast('Authenticated as Dr. Parvathi Rao, MD (Chief Medical Administrator).');
    } else {
      setCurrentUser(user);
      setPatientUser(user);
      ensureUserInAdminDb(user);
      try {
        localStorage.setItem('swasthya_current_user', JSON.stringify(user));
      } catch {}
      if (user.preferred_language) {
        setSelectedLanguage(user.preferred_language);
      }
      setCurrentView('dashboard');
      showToast(`Welcome back, ${user.name || 'User'}!`);
    }
    setIsIdleLocked(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('swasthya_access_token');
    localStorage.removeItem('swasthya_refresh_token');
    localStorage.removeItem('swasthya_current_user');
    localStorage.removeItem('swasthya_web_device_id');
    setCurrentUser(null);
    setPatientUser(null);
    setReports([]);
    setFamilyMembers([]);
    setCurrentView('landing');
    setIsIdleLocked(false);
    showToast('Signed out successfully.');
  };

  // Administrator Access: Unlocks official Admin Identity and Central Operations Database
  const handleAdminAuthorized = () => {
    if (currentUser && currentUser.role !== 'admin') {
      setPatientUser(currentUser);
    }
    setCurrentUser(DEFAULT_ADMIN_ACCOUNT);
    setCurrentView('admin');
    showToast('🔓 Administrator access unlocked. Dr. Parvathi Rao, MD active on Central Database.');
  };

  // Return to Patient View: Seamlessly switch back to the patient account and its private database
  const handleReturnToPatientView = () => {
    if (patientUser) {
      setCurrentUser(patientUser);
      try {
        localStorage.setItem('swasthya_current_user', JSON.stringify(patientUser));
      } catch {}
    } else {
      const fallbackPatient = {
        id: 'pat-default',
        name: 'Patient Account',
        phone: '+91 98765 43210',
        role: 'patient',
        preferred_language: selectedLanguage,
      };
      setCurrentUser(fallbackPatient);
      setPatientUser(fallbackPatient);
      try {
        localStorage.setItem('swasthya_current_user', JSON.stringify(fallbackPatient));
      } catch {}
    }
    setCurrentView('dashboard');
    showToast(`Returned to Patient Portal for ${patientUser?.name || 'Patient'}.`);
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
            setAuthRole('patient');
            setAuthMode('signup');
            setAuthModalOpen(true);
          }}
          onSignIn={() => {
            setAuthRole('patient');
            setAuthMode('signin');
            setAuthModalOpen(true);
          }}
          onAdminSignIn={() => {
            setAuthRole('admin');
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
            onViewChange={(view) => {
              if (currentView === 'admin' && view !== 'admin' && view !== 'health_worker') {
                handleReturnToPatientView();
              } else {
                setCurrentView(view);
              }
            }}
            userName={currentUser?.name || 'Your account'}
            userRole={currentUser?.role || 'user'}
            onNewReport={() => handleTriggerNewReport('lab_report')}
            onLockSession={() => setIsIdleLocked(true)}
            onSignOut={handleSignOut}
            escalationCount={activeEscalationsCount}
            selectedLanguage={selectedLanguage}
            isAdmin={currentUser?.role === 'admin'}
            onOpenSubscription={() => setSubscriptionModalOpen(true)}
            currentPlan={userPlan}
            reportsCount={reports.length}
            maxFreeReports={MAX_FREE_REPORTS}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Navbar */}
            <Navbar
              currentView={currentView as any}
              onViewChange={(view) => {
                if (currentView === 'admin' && view !== 'admin' && view !== 'health_worker') {
                  handleReturnToPatientView();
                } else {
                  setCurrentView(view as any);
                }
              }}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              highContrast={highContrast}
              onToggleHighContrast={() => setHighContrast(!highContrast)}
              onLockSession={() => setIsIdleLocked(true)}
              onSignOut={handleSignOut}
              isAdmin={currentUser?.role === 'admin'}
              onOpenAdminModal={() => setAdminModalOpen(true)}
              userName={currentUser?.name || 'User'}
              onOpenSubscription={() => setSubscriptionModalOpen(true)}
              currentPlan={userPlan}
              reportsCount={reports.length}
              maxFreeReports={MAX_FREE_REPORTS}
            />

            {/* View Switching */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {currentView === 'dashboard' && (
                <Dashboard
                  userName={currentUser?.name || 'Your account'}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  reports={reports}
                  escalations={escalations}
                  onOpenReport={setActiveReport}
                  onScanReport={() => handleTriggerNewReport('lab_report')}
                  onUploadReport={() => handleTriggerNewReport('prescription')}
                  familyMembers={familyMembers}
                  onSimulateVoiceCall={handleSimulateReportVoiceCall}
                  onNavigateTab={(view) => setCurrentView(view as any)}
                  onOpenSubscription={() => setSubscriptionModalOpen(true)}
                  currentPlan={userPlan}
                  maxFreeReports={MAX_FREE_REPORTS}
                />
              )}

              {currentView === 'caregiver' && (
                <CaregiverPortal
                  reports={reports}
                  selectedLanguage={selectedLanguage}
                  members={familyMembers}
                  userName={currentUser?.name || 'Parvathi Devi K'}
                  onOpenReport={setActiveReport}
                  onUploadSuccess={handleUploadSuccess}
                  onManageFamily={() => setCurrentView('family')}
                  onSimulateVoiceCall={handleSimulateReportVoiceCall}
                  onOpenSubscription={() => setSubscriptionModalOpen(true)}
                  currentPlan={userPlan}
                  reportsCount={reports.length}
                  maxFreeReports={MAX_FREE_REPORTS}
                />
              )}

              {currentView === 'family' && (
                <FamilyProfiles
                  members={familyMembers}
                  onAddMember={(member) => setFamilyMembers((current) => [...current, member])}
                  onRemoveMember={(id) => setFamilyMembers((current) => current.filter((member) => member.id !== id))}
                  selectedLanguage={selectedLanguage}
                  onSimulateVoiceCall={handleSimulateVoiceCall}
                />
              )}

              {currentView === 'health_worker' && (
                <HealthWorkerDashboard
                  escalations={escalations}
                  onUpdateTicket={handleUpdateTicket}
                />
              )}

              {currentView === 'admin' && (
                <AdminDashboard
                  onReturnToPatientView={handleReturnToPatientView}
                  patientUserName={patientUser?.name || 'Patient'}
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
                <p className="mt-2 text-[11px] text-slate-400 flex items-center justify-center gap-2">
                  <span>Authorized staff?</span>
                  <button
                    onClick={() => setAdminModalOpen(true)}
                    className="font-bold text-slate-500 hover:text-amber-500 underline transition-colors"
                  >
                    Staff Gateway 🔒
                  </button>
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
        onLanguageChange={setSelectedLanguage}
        onClose={() => setActiveReport(null)}
        onEscalate={handleEscalateFromReport}
        onSimulateVoiceCall={handleSimulateReportVoiceCall}
      />

      {/* Quick Upload Modal */}
      {uploaderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
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
              selectedPatientId="pat-self"
              patientName={currentUser?.name || 'New patient'}
              onUploadSuccess={handleUploadSuccess}
              onOpenSubscription={() => setSubscriptionModalOpen(true)}
              currentPlan={userPlan}
              reportsCount={reports.length}
              maxFreeReports={MAX_FREE_REPORTS}
            />
          </div>
        </div>
      )}

      {/* Multi-Page Camera Capture & Document Scanner Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onComplete={handleUploadSuccess}
        selectedPatientId="pat-self"
        patientName={currentUser?.name || 'New patient'}
        initialDocType={cameraDocType}
        onOpenSubscription={() => setSubscriptionModalOpen(true)}
        currentPlan={userPlan}
        reportsCount={reports.length}
        maxFreeReports={MAX_FREE_REPORTS}
      />

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        selectedLanguage={selectedLanguage}
        requestedRole={authRole}
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
        userName={currentUser?.name || 'Your account'}
      />

      {/* Admin Protected Passkey Access Modal */}
      <AdminAccessModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onAuthorized={handleAdminAuthorized}
        selectedLanguage={selectedLanguage}
      />

      {/* Global Automated Voice Call Simulator Modal (No WhatsApp / Email Fallback) */}
      <PhoneSimulatorModal
        isOpen={simulatorState.isOpen}
        onClose={() => setSimulatorState((prev) => ({ ...prev, isOpen: false }))}
        reportId={simulatorState.reportId}
        patientName={simulatorState.patientName}
        patientPhone={simulatorState.patientPhone}
        language={simulatorState.language}
        reportTitle={simulatorState.reportTitle}
        customExplanation={simulatorState.customExplanation}
        deliveryReason={simulatorState.deliveryReason}
      />

      {/* Bharat Swasth Subscriptions & Transparent Unit Cost Pricing Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        currentPlan={userPlan}
        onUpgradePlan={handleUpgradePlan}
        reportsCount={reports.length}
        maxFreeReports={MAX_FREE_REPORTS}
        storageUsedMB={Math.round((reports.length * 3.8 + 1.2) * 10) / 10}
        maxFreeStorageMB={MAX_FREE_STORAGE_MB}
        userName={currentUser?.name}
        userPhone={currentUser?.phone}
        userEmail={currentUser?.email}
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
