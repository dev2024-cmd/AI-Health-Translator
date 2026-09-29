import React, { useState } from 'react';
import { Stethoscope, AlertTriangle, Phone, CheckCircle2, Clock, Filter, MessageSquare, ChevronRight, Check } from 'lucide-react';
import { EscalationTicket } from '../types/api.js';

interface HealthWorkerDashboardProps {
  escalations: EscalationTicket[];
  onUpdateTicket: (updated: EscalationTicket) => void;
}

export const HealthWorkerDashboard: React.FC<HealthWorkerDashboardProps> = ({
  escalations,
  onUpdateTicket,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'assigned' | 'resolved'>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string>(escalations[0]?.id || '');
  const [noteInput, setNoteInput] = useState<string>('');

  const filteredTickets = escalations.filter((ticket) => {
    if (statusFilter === 'all') return true;
    return ticket.status === statusFilter;
  });

  const activeTicket = escalations.find((t) => t.id === selectedTicketId) || escalations[0];

  const handleAssignToMe = () => {
    if (!activeTicket) return;
    const updated: EscalationTicket = {
      ...activeTicket,
      status: 'assigned',
      assigned_worker: 'Dr. Sunita Rao (Primary Health Worker)',
    };
    onUpdateTicket(updated);
  };

  const handleResolve = () => {
    if (!activeTicket) return;
    const updated: EscalationTicket = {
      ...activeTicket,
      status: 'resolved',
      notes: noteInput ? (activeTicket.notes ? `${activeTicket.notes} | Note: ${noteInput}` : noteInput) : activeTicket.notes,
    };
    onUpdateTicket(updated);
    setNoteInput('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Primary Health Worker Queue
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Clinical Triage & Telephonic Escalations
            </h1>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          {(['all', 'open', 'assigned', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets Queue List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
            Escalation Tickets ({filteredTickets.length})
          </div>

          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
              <p className="text-sm font-semibold">No tickets in this category.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = ticket.id === activeTicket?.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{ticket.patient_name}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        ticket.status === 'open'
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : ticket.status === 'assigned'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                    {ticket.reason}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                    <span>{ticket.region.split('(')[0]}</span>
                    <span>{ticket.created_at}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Triage & Action Panel (7 cols) */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Ticket Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 font-mono">{activeTicket.id}</span>
                  <h3 className="text-xl font-extrabold text-slate-900">{activeTicket.patient_name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>Region: {activeTicket.region}</span> •
                    <span>Language: {activeTicket.preferred_language.toUpperCase()}</span>
                  </div>
                </div>

                <a
                  href={`tel:${activeTicket.patient_phone}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Patient ({activeTicket.patient_phone})
                </a>
              </div>

              {/* Escalation Reason & Critical Findings */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Clinical Concern & Flagged Values
                </h4>
                <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 text-xs text-red-900 space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{activeTicket.reason}</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    {activeTicket.critical_values.map((val, idx) => (
                      <div key={idx} className="font-mono font-semibold">
                        • {val}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Triage Notes History */}
              {activeTicket.notes && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Triage Notes History
                  </h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium">
                    {activeTicket.notes}
                  </div>
                </div>
              )}

              {/* Add Clinical Note Textarea */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Add Outreach & Clinical Notes
                </h4>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Record patient interaction, recommended diet, or clinic visit referral..."
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {activeTicket.status !== 'assigned' && activeTicket.status !== 'resolved' && (
                  <button
                    onClick={handleAssignToMe}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                  >
                    Assign to Me
                  </button>
                )}

                {activeTicket.status !== 'resolved' && (
                  <button
                    onClick={handleResolve}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Mark Resolved & Close
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
              Select an escalation ticket to review details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
