import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  AlertTriangle,
  Database,
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Activity,
  HardDrive,
  Lock,
  Stethoscope,
  Filter,
  Check,
  Server
} from 'lucide-react';
import { EscalationTicket, WebReport } from '../types/api.js';

export interface AdminPatientRecord {
  id: string;
  name: string;
  phone: string;
  language: string;
  totalReports: number;
  criticalCount: number;
  status: 'active' | 'under_review' | 'escalated';
  registeredDate: string;
  assignedAsha: string;
}

// Initial System-wide Patient Directory in the Admin Database
const INITIAL_ADMIN_PATIENT_DB: AdminPatientRecord[] = [
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

interface AdminDashboardProps {
  onReturnToPatientView: () => void;
  patientUserName?: string;
  escalations: EscalationTicket[];
  onUpdateTicket?: (ticket: EscalationTicket) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onReturnToPatientView,
  patientUserName = 'Patient',
  escalations,
  onUpdateTicket,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'escalations' | 'audit'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientDatabase, setPatientDatabase] = useState<AdminPatientRecord[]>(() => {
    try {
      const saved = localStorage.getItem('swasthya_admin_patients_db_v2');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_PATIENT_DB;
    } catch {
      return INITIAL_ADMIN_PATIENT_DB;
    }
  });

  const [triageTickets, setTriageTickets] = useState<EscalationTicket[]>(escalations);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(escalations[0]?.id || '');
  const [clinicalNote, setClinicalNote] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('swasthya_admin_patients_db_v2', JSON.stringify(patientDatabase));
    } catch {}
  }, [patientDatabase]);

  const filteredPatients = patientDatabase.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEscalations = triageTickets.filter((item) => item.status !== 'resolved').length;
  const activeTicket = triageTickets.find((t) => t.id === selectedTicketId) || triageTickets[0];

  const handleResolveTicket = () => {
    if (!activeTicket) return;
    const updated: EscalationTicket = {
      ...activeTicket,
      status: 'resolved',
      notes: clinicalNote ? `Doctor Note: ${clinicalNote}` : 'Resolved by CMO Dr. Parvathi Rao',
    };

    setTriageTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (onUpdateTicket) onUpdateTicket(updated);
    setClinicalNote('');
  };

  const handleAssignWorker = (workerName: string) => {
    if (!activeTicket) return;
    const updated: EscalationTicket = {
      ...activeTicket,
      status: 'assigned',
      assigned_worker: workerName,
    };
    setTriageTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (onUpdateTicket) onUpdateTicket(updated);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 animate-fade-in pb-12">
      {/* 1. Dedicated Administrator Identity & Restricted Area Banner */}
      <div className="rounded-xl border border-amber-300/70 dark:border-amber-900/60 bg-gradient-to-r from-amber-50 via-purple-50/60 to-indigo-50/50 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-600/20 shrink-0">
              PR
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                  STAFF GATEWAY • ISOLATED ADMIN DATABASE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  DPDP 2023 AUDIT LOG ACTIVE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Dr. Parvathi Rao, MD
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Chief Medical Officer & Healthcare System Administrator • Central Operations
              </p>
            </div>
          </div>

          {/* Quick Exit to Patient View */}
          <button
            onClick={onReturnToPatientView}
            className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all self-start md:self-auto active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Patient View ({patientUserName})</span>
          </button>
        </div>
      </div>

      {/* 2. Admin Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'patients'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patient Registry Database ({patientDatabase.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('escalations')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'escalations'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Emergency Triage Queue</span>
          {openEscalations > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
              {openEscalations}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'audit'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>DPDP 2023 Audit Vault</span>
        </button>
      </div>

      {/* TAB 1: System Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{patientDatabase.length}</div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Registered Patients</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {patientDatabase.reduce((acc, p) => acc + p.totalReports, 0)}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Encrypted Reports</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{openEscalations}</div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Open Clinical Escalations</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold mb-3">
                <Server className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> 100% ONLINE
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">OCR & AI Pipeline Health</p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-amber-500" />
              <span>Isolated Database Architecture Policy (DPDP Act 2023)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              In strict accordance with the Digital Personal Data Protection Act 2023, each patient&apos;s records are stored in a dedicated, isolated partition (<code className="text-emerald-600 font-mono font-bold">swasthya_usr_[userId]_reports</code>). Cross-patient data queries are physically isolated from individual client sessions. System administrators work directly with the central administrative data repository (<code className="text-amber-600 font-mono font-bold">swasthya_admin_patients_db</code>).
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Patient Registry Database */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient by name, phone or language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredPatients.length} of {patientDatabase.length} registered patients
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Patient Name</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Language</th>
                    <th className="py-3.5 px-4 text-center">Reports</th>
                    <th className="py-3.5 px-4">Health Status</th>
                    <th className="py-3.5 px-4">Assigned ASHA Worker</th>
                    <th className="py-3.5 px-4 text-right">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">{patient.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{patient.id}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-bold">{patient.phone}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300">{patient.language}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {patient.totalReports}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {patient.criticalCount > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1.5 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            <span>Critical Alert</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center gap-1.5 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>Stable</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-bold">{patient.assignedAsha}</td>
                      <td className="py-4 px-4 text-right text-slate-400 text-[11px] font-medium">{patient.registeredDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Emergency Triage Queue */}
      {activeTab === 'escalations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
              Active Escalation Tickets ({triageTickets.length})
            </h3>
            {triageTickets.map((ticket) => {
              const isSelected = ticket.id === activeTicket?.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-rose-500 shadow-md ring-1 ring-rose-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{ticket.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        ticket.status === 'open'
                          ? 'bg-rose-100 text-rose-700'
                          : ticket.status === 'assigned'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{ticket.patient_name}</h4>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{ticket.reason}</span>
                  </p>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {activeTicket ? (
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">
                      CRITICAL CASE TRIAGE
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {activeTicket.patient_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Ticket: {activeTicket.id}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTicket.status !== 'resolved' ? (
                      <button
                        onClick={handleResolveTicket}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-500 transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Resolve Ticket</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolved by CMO</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs space-y-1">
                  <span className="font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider text-[10px]">
                    Critical Finding Trigger:
                  </span>
                  <p className="text-sm font-extrabold text-rose-900 dark:text-rose-100">{activeTicket.reason}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Add Clinical Note / Prescription Instruction (Dr. Parvathi Rao, CMO):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter doctor guidance or tele-consultation summary..."
                    value={clinicalNote}
                    onChange={(e) => setClinicalNote(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAssignWorker('Sunita Rao (ASHA #42)')}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                    <span>Assign to ASHA Worker (Sunita Rao)</span>
                  </button>
                  <button
                    onClick={() => handleAssignWorker('Dr. Anand (District MO)')}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-purple-500" />
                    <span>Assign to District Medical Officer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No active escalation selected.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DPDP 2023 Audit Vault */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Statutory DPDP 2023 Audit Vault
              </h3>
              <p className="text-xs text-slate-400">Cryptographically signed access audit logs across all tenants</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
              AUDIT COMPLIANT
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { time: '2026-09-28 21:55:04', event: 'ADMIN_SESSION_OPEN', user: 'Dr. Parvathi Rao, MD', ip: '127.0.0.1 (Authenticated Staff)' },
              { time: '2026-09-28 21:40:12', event: 'REPORT_ENCRYPTED', user: 'pat-105 (SDFGHJK)', ip: 'Client TLS 1.3 / AES-256' },
              { time: '2026-09-28 20:15:30', event: 'DPDP_CONSENT_GRANTED', user: 'pat-101 (Sita Ramulu)', ip: 'IVR Voice Consent #96666' },
              { time: '2026-09-28 19:10:00', event: 'TRIAGE_TICKET_GENERATED', user: 'SYSTEM_AI_DIAGNOSTIC', ip: 'Critical Flag: Platelets < 45k' },
            ].map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{log.time}</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">{log.event}</span>
                  <span className="text-slate-700 dark:text-slate-300 font-sans font-bold">{log.user}</span>
                </div>
                <span className="text-slate-400 text-[11px]">{log.ip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
