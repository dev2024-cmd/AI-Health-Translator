import React, { useEffect, useState } from 'react';
import { Users, Phone, FileText, ChevronRight, CheckCircle2, Volume2, Plus, ShieldCheck, Stethoscope, Clock } from 'lucide-react';
import { WebReport } from '../types/api.js';
import { FamilyMember } from './FamilyProfiles.js';
import { getLocalizedExplanation } from '../utils/reportLocalizer.js';
import { ReportUploader } from '../components/ReportUploader.js';
import { ValueBadge } from '../components/ValueBadge.js';
import { PhoneSimulatorModal } from '../components/PhoneSimulatorModal.js';

interface CaregiverPortalProps {
  reports: WebReport[];
  selectedLanguage: string;
  members: FamilyMember[];
  userName?: string;
  onOpenReport: (report: WebReport) => void;
  onUploadSuccess: (newReport: WebReport) => void;
  onManageFamily: () => void;
  onSimulateVoiceCall?: (options: any) => void;
  onOpenSubscription?: () => void;
  currentPlan?: 'free' | 'family' | 'pro';
  reportsCount?: number;
  maxFreeReports?: number;
}

export const CaregiverPortal: React.FC<CaregiverPortalProps> = ({
  reports,
  selectedLanguage,
  members,
  userName = 'Parvathi Devi K',
  onOpenReport,
  onUploadSuccess,
  onManageFamily,
  onSimulateVoiceCall,
  onOpenSubscription,
  currentPlan = 'free',
  reportsCount = 0,
  maxFreeReports = 5,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('self');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  const primaryAccount = {
    id: 'self',
    name: userName,
    shortName: 'My Personal Vault',
    relation: 'Account Holder',
    age: 48,
    lang: selectedLanguage.toUpperCase(),
    phone: '+91 98765 43210',
    isSelf: true,
  };

  const familyProfiles = members.map((member) => ({
    id: member.id,
    name: member.name,
    shortName: member.name.split(' ')[0],
    relation: member.relation || 'Dependent',
    age: member.age,
    lang: member.language.toUpperCase(),
    phone: member.phone,
    isSelf: false,
  }));

  const allProfiles = [primaryAccount, ...familyProfiles];

  useEffect(() => {
    if (!allProfiles.some((p) => p.id === selectedProfileId)) {
      setSelectedProfileId('self');
    }
  }, [allProfiles, selectedProfileId]);

  const currentProfile = allProfiles.find((p) => p.id === selectedProfileId) || primaryAccount;

  // Filter reports: if viewing self, show patient's own reports; if family, show filtered for that family member
  const patientReports = reports.filter((r) => {
    if (currentProfile.isSelf) {
      if (!r.patient_name || r.patient_name === 'Self') return true;
      const lowerR = r.patient_name.toLowerCase();
      const isFamily = familyProfiles.some((f) => lowerR.includes(f.name.toLowerCase().split(' ')[0]));
      return !isFamily || lowerR.includes(userName.toLowerCase().split(' ')[0]);
    }
    return r.patient_name?.toLowerCase().includes(currentProfile.name.toLowerCase().split(' ')[0]);
  });

  const totalReports = patientReports.length;
  const abnormalCount = patientReports.reduce((acc, r) => {
    return acc + r.extracted_values.filter((v) => v.flag !== 'normal').length;
  }, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner: Profile / Patient Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Medical Records Archive
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  DPDP 2023 SEALED
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Diagnostic Reports & Prescriptions
              </h1>
            </div>
          </div>

          {/* Profile Switcher Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-wrap">
            {allProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProfileId(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedProfileId === p.id
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {p.shortName}
              </button>
            ))}

            <button
              onClick={onManageFamily}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-sky-500 hover:text-sky-600 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Selected Profile Info Summary */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="bg-slate-50/80 dark:bg-slate-950/70 rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">Selected Medical Enclave</span>
            <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{currentProfile.name}</div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {currentProfile.relation} • {currentProfile.age} Yrs • {currentProfile.lang}
            </span>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-950/70 rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">Registered Contact Phone</span>
            <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentProfile.phone}</span>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Encrypted Vault Active
            </span>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-950/70 rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">Accessibility Assistance</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Spoken Dialect IVR</span>
            </div>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Test Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <ReportUploader
        onUploadSuccess={onUploadSuccess}
        selectedPatientId={currentProfile.id}
        patientName={currentProfile.name}
        onOpenSubscription={onOpenSubscription}
        currentPlan={currentPlan}
        reportsCount={reportsCount}
        maxFreeReports={maxFreeReports}
      />

      {/* Reports History */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Archived Reports for {currentProfile.shortName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {totalReports} reports analyzed • {abnormalCount} critical / abnormal parameters monitored
            </p>
          </div>
        </div>

        {patientReports.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              No diagnostic reports uploaded for this profile yet.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Upload a lab test or prescription above to generate plain-language explanations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onOpenReport(report)}
                className="group border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 rounded-lg p-4.5 cursor-pointer transition-all hover:shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{report.date}</span>
                        <span>•</span>
                        <span className="uppercase font-semibold text-slate-500">
                          {report.document_type === 'prescription' ? 'Prescription (Rx)' : 'Lab Report'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors mt-0.5">
                        {report.test_title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded">
                      Verified
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {getLocalizedExplanation(report, selectedLanguage)}
                  </p>

                  {/* Badges preview */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {report.extracted_values.slice(0, 3).map((v) => (
                      <div
                        key={v.id}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded font-medium text-slate-700 dark:text-slate-300"
                      >
                        <span>{v.test_name}:</span>
                        <span className="font-bold">{v.value}</span>
                        <ValueBadge flag={v.flag} showIconOnly={true} />
                      </div>
                    ))}
                    {report.extracted_values.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{report.extracted_values.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-sky-700 dark:text-sky-400">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>View Clinical Explanation</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Phone IVR Simulator Modal */}
      <PhoneSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        reportId={patientReports[0]?.id || 'mock-rep-1'}
        patientName={currentProfile.shortName}
        patientPhone={currentProfile.phone}
        language={selectedLanguage}
        reportTitle={patientReports[0]?.test_title}
        customExplanation={
          patientReports[0]
            ? getLocalizedExplanation(patientReports[0], selectedLanguage)
            : undefined
        }
        deliveryReason="Patient does not use WhatsApp or Email • Automated Outbound Voice Call"
      />
    </div>
  );
};

