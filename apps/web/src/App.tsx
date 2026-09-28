import React, { useState } from 'react';
import { Navbar } from './components/Navbar.js';
import { CaregiverPortal } from './pages/CaregiverPortal.js';
import { HealthWorkerDashboard } from './pages/HealthWorkerDashboard.js';
import { ConsentCenter } from './pages/ConsentCenter.js';
import { ReportDetailModal } from './components/ReportDetailModal.js';
import { INITIAL_REPORTS, INITIAL_ESCALATIONS, WebReport, EscalationTicket } from './types/api.js';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'caregiver' | 'health_worker' | 'consent'>('caregiver');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('te'); // Default to Telugu as per sample family
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reports, setReports] = useState<WebReport[]>(INITIAL_REPORTS);
  const [escalations, setEscalations] = useState<EscalationTicket[]>(INITIAL_ESCALATIONS);
  const [activeReport, setActiveReport] = useState<WebReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUploadSuccess = (newReport: WebReport) => {
    setReports((prev) => [newReport, ...prev]);
    setActiveReport(newReport);
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

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${highContrast ? 'high-contrast' : ''}`}>
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'caregiver' && (
          <CaregiverPortal
            reports={reports}
            selectedLanguage={selectedLanguage}
            onOpenReport={setActiveReport}
            onUploadSuccess={handleUploadSuccess}
          />
        )}

        {currentView === 'health_worker' && (
          <HealthWorkerDashboard
            escalations={escalations}
            onUpdateTicket={handleUpdateTicket}
          />
        )}

        {currentView === 'consent' && <ConsentCenter />}
      </main>

      {/* Global Interactive Report Detail Modal */}
      <ReportDetailModal
        report={activeReport}
        selectedLanguage={selectedLanguage}
        onClose={() => setActiveReport(null)}
        onEscalate={handleEscalateFromReport}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold border border-slate-700 animate-slide-up">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">
            AI Health Report Translator • Accessible Healthcare Communication Monorepo
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Designed for elderly, low-literacy, and rural users across India. Built in compliance with India’s Digital Personal Data Protection (DPDP) Act 2023.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
