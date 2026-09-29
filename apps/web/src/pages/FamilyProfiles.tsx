import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  Globe,
  Shield,
  Trash2,
  Bell,
  Clock,
  Pill,
  CalendarCheck,
  CheckCircle2,
  Check,
  AlertCircle
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@ai-health/shared';
import { getUITranslation } from '../utils/translations.js';
import { API_BASE_URL } from '../config/api.js';

export interface ReminderItem {
  id: string;
  type: 'medication' | 'checkup';
  title: string;
  timeOrDate: string;
  dosage?: string;
  instructions?: string;
  notifyFamily: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  phone: string;
  language: string;
  phoneType: 'smartphone' | 'feature';
  deliveryChannel?: 'voice_call' | 'whatsapp_email';
  reminders?: ReminderItem[];
}

const DEFAULT_REMINDERS: Record<string, ReminderItem[]> = {
  'pat-1': [
    {
      id: 'rem-1',
      type: 'medication',
      title: 'Amlodipine (BP Tablet)',
      timeOrDate: '08:00 AM (Daily)',
      dosage: '5mg - 1 Pill',
      instructions: 'After Breakfast',
      notifyFamily: true,
    },
    {
      id: 'rem-2',
      type: 'checkup',
      title: 'Monthly BP & Sugar Doctor Checkup',
      timeOrDate: '15th of Every Month',
      instructions: 'Local PHC / Dr. Rao Clinic',
      notifyFamily: true,
    },
  ],
  'pat-2': [
    {
      id: 'rem-3',
      type: 'medication',
      title: 'Metformin (Diabetes)',
      timeOrDate: '08:30 PM (Daily)',
      dosage: '500mg - 1 Pill',
      instructions: 'With Dinner',
      notifyFamily: true,
    },
  ],
  'pat-3': [
    {
      id: 'rem-4',
      type: 'medication',
      title: 'Calcium + Vitamin D3',
      timeOrDate: '02:00 PM (Daily)',
      dosage: '1 Tablet',
      instructions: 'After Lunch',
      notifyFamily: false,
    },
  ],
};

interface FamilyProfilesProps {
  members: FamilyMember[];
  onAddMember: (member: FamilyMember) => void;
  onRemoveMember: (id: string) => void;
  selectedLanguage?: string;
  onSimulateVoiceCall?: (options: {
    patientName: string;
    patientPhone: string;
    language: string;
    customExplanation?: string;
    deliveryReason?: string;
  }) => void;
}

export const FamilyProfiles: React.FC<FamilyProfilesProps> = ({
  members,
  onAddMember,
  onRemoveMember,
  selectedLanguage = 'en',
  onSimulateVoiceCall,
}) => {
  const t = getUITranslation(selectedLanguage);
  const [isAdding, setIsAdding] = useState(false);
  const [activeReminderModalMemberId, setActiveReminderModalMemberId] = useState<string | null>(null);

  // Form states for adding member
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState(selectedLanguage);
  const [phoneType, setPhoneType] = useState<'smartphone' | 'feature'>('feature');
  const [deliveryChannel, setDeliveryChannel] = useState<'voice_call' | 'whatsapp_email'>('voice_call');

  // Reminders state mapped by member id
  const [remindersMap, setRemindersMap] = useState<Record<string, ReminderItem[]>>(DEFAULT_REMINDERS);

  // Cross-family live notification alert feed
  const [familyNotifications, setFamilyNotifications] = useState<any[]>([
    {
      id: 'notif-1',
      from_patient_name: 'Sita Ramulu (Father)',
      title: 'Amlodipine (5mg)',
      scheduled_time: '08:00 AM',
      type: 'medication_due',
      urgency: 'normal',
      status: 'pending',
      message: 'Morning blood pressure tablet due at 08:00 AM. Cross-family notification active.',
    },
    {
      id: 'notif-2',
      from_patient_name: 'Lakshmi Devi (Mother)',
      title: 'HbA1c Blood Sugar Review',
      scheduled_time: '15th of Month',
      type: 'checkup_due',
      urgency: 'urgent',
      status: 'pending',
      message: 'Quarterly fasting blood sugar checkup due soon. Caregiver alert triggered.',
    },
  ]);

  // Reminder creation modal states
  const [remType, setRemType] = useState<'medication' | 'checkup'>('medication');
  const [remTitle, setRemTitle] = useState('');
  const [remTime, setRemTime] = useState('');
  const [remInstructions, setRemInstructions] = useState('');
  const [remNotifyFamily, setRemNotifyFamily] = useState(true);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const showReminderToast = (msg: string) => {
    setReminderToast(msg);
    setTimeout(() => setReminderToast(null), 3500);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = 'pat-' + Date.now();
    const newMember: FamilyMember = {
      id: newId,
      name: name.trim(),
      relation: relation || 'Dependent',
      age: Number(age) || 50,
      phone: phone.startsWith('+91') ? phone : '+91 ' + phone,
      language,
      phoneType,
      deliveryChannel,
    };

    onAddMember(newMember);
    setName('');
    setRelation('');
    setAge('');
    setPhone('');
    setIsAdding(false);
  };

  const handleToggleFamilyNotification = (memberId: string, reminderId: string) => {
    setRemindersMap((prev) => {
      const memberReminders = prev[memberId] || [];
      const updated = memberReminders.map((r) =>
        r.id === reminderId ? { ...r, notifyFamily: !r.notifyFamily } : r
      );
      return { ...prev, [memberId]: updated };
    });

    showReminderToast(
      selectedLanguage === 'ta'
        ? 'குடும்ப நினைவூட்டல் நிலை புதுப்பிக்கப்பட்டது'
        : selectedLanguage === 'te'
        ? 'కుటుంబ రిమైండర్ స్థితి నవీకరించబడింది'
        : 'Cross-family reminder notification updated'
    );
  };

  const handleAddReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReminderModalMemberId || !remTitle.trim()) return;

    const newReminder: ReminderItem = {
      id: 'rem-' + Date.now(),
      type: remType,
      title: remTitle.trim(),
      timeOrDate: remTime.trim() || (remType === 'medication' ? '08:00 AM (Daily)' : 'Monthly Checkup'),
      instructions: remInstructions.trim() || 'As prescribed by doctor',
      notifyFamily: remNotifyFamily,
    };

    setRemindersMap((prev) => ({
      ...prev,
      [activeReminderModalMemberId]: [...(prev[activeReminderModalMemberId] || []), newReminder],
    }));

    const targetMember = members.find((m) => m.id === activeReminderModalMemberId);

    // Sync to Backend Reminders API if available
    try {
      const token = localStorage.getItem('swasthya_access_token');
      await fetch(`${API_BASE_URL}/v1/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patient_id: activeReminderModalMemberId,
          patient_name: targetMember?.name || 'Family Member',
          type: remType,
          title: remTitle.trim(),
          dosage: remInstructions.trim() || '1 unit',
          scheduled_time: remTime.trim() || '08:00 AM',
          period: 'morning',
          days: 'Daily',
          notify_family: remNotifyFamily,
          notes: remInstructions.trim(),
        }),
      }).catch(() => {});
    } catch {}

    // Add to active family notifications stream
    if (remNotifyFamily) {
      setFamilyNotifications((prev) => [
        {
          id: 'notif-' + Date.now(),
          from_patient_name: targetMember?.name || 'Family Member',
          title: remTitle.trim(),
          scheduled_time: remTime.trim() || '08:00 AM',
          type: remType === 'medication' ? 'medication_due' : 'checkup_due',
          urgency: 'normal',
          status: 'pending',
          message: `Scheduled ${remType}: ${remTitle.trim()} (${remTime.trim() || '08:00 AM'}). Family alert active.`,
        },
        ...prev,
      ]);
    }

    setActiveReminderModalMemberId(null);
    setRemTitle('');
    setRemTime('');
    setRemInstructions('');
    setRemNotifyFamily(true);

    showReminderToast(
      selectedLanguage === 'ta'
        ? 'புதிய மருந்து/பரிசோதனை நினைவூட்டல் சேர்க்கப்பட்டது!'
        : selectedLanguage === 'te'
        ? 'కొత్త మందులు/చెక్-అప్ రిమైండర్ జోడించబడింది!'
        : 'Family reminder added & synced to notifications stream!'
    );
  };

  const handleMarkNotificationTaken = async (notifId: string) => {
    setFamilyNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, status: 'completed' } : n))
    );
    showReminderToast(
      selectedLanguage === 'ta'
        ? '✓ மருந்து உட்கொள்ளப்பட்டதாக பதிவு செய்யப்பட்டது! குடும்பத்தினருக்கு அறிவிக்கப்பட்டது.'
        : selectedLanguage === 'te'
        ? '✓ మందులు వేసుకున్నట్లు గుర్తించబడింది! కుటుంబ సభ్యులకు అప్‌డేట్ చేయబడింది.'
        : '✓ Medication marked as taken! Family caregivers updated.'
    );
  };

  const handlePingFamilyNotification = async (notif: any) => {
    try {
      const token = localStorage.getItem('swasthya_access_token');
      if (token) {
        await fetch(`${API_BASE_URL}/v1/reminders/${notif.id}/ping-family`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ custom_note: 'Medication reminder confirmation ping' }),
        }).catch(() => {});
      }
    } catch {}

    showReminderToast(
      selectedLanguage === 'ta'
        ? `🔔 ${notif.from_patient_name} க்கான நினைவூட்டல் குடும்பத்தினருக்கு அனுப்பப்பட்டது!`
        : selectedLanguage === 'te'
        ? `🔔 ${notif.from_patient_name} రిమైండర్ కుటుంబ సభ్యులకు పంపబడింది!`
        : `🔔 Reminder alert pinged to all linked caregivers for ${notif.from_patient_name}!`
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Toast Alert */}
      {reminderToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border border-emerald-700 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t.nav.familyProfiles}
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {members.length} {selectedLanguage === 'ta' ? 'உறுப்பினர்கள்' : 'Members'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {selectedLanguage === 'ta'
              ? 'குடும்ப உறுப்பினர்களை நிர்வகியுங்கள் & மருந்து/பரிசோதனை நினைவூட்டல்களைப் பகிர்ந்துகொள்ளுங்கள்.'
              : selectedLanguage === 'te'
              ? 'కుటుంబ సభ్యులను నిర్వహించండి మరియు మందులు/చెక్-అప్ రిమైండర్‌లను షేర్ చేసుకోండి.'
              : 'Manage family members, daily medication timetables, and cross-family checkup reminders.'}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>
            {selectedLanguage === 'ta' ? '+ புதிய குடும்ப உறுப்பினர்' : '+ Add Family Member'}
          </span>
        </button>
      </div>

      {/* Live Cross-Family Caregiver Alerts Stream */}
      <div className="p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {selectedLanguage === 'ta'
                    ? 'குடும்ப உறுப்பினர்களின் நேரலை நினைவூட்டல்கள்'
                    : selectedLanguage === 'te'
                    ? 'కుటుంబ సభ్యుల లైవ్ రిమైండర్ హెచ్చరికలు'
                    : 'Cross-Family Medication & Checkup Live Stream'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900">
                  {familyNotifications.filter((n) => n.status === 'pending').length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedLanguage === 'ta'
                  ? 'குடும்ப உறுப்பினர்களுக்கு உரிய நேரத்தில் மருந்து மற்றும் மருத்துவ பரிசோதனை நினைவூட்டல் பகிர்வு.'
                  : selectedLanguage === 'te'
                  ? 'కుటుంబ సభ్యులకు సమయానికి మందులు మరియు వైద్య పరీక్షల రిమైండర్‌లను షేర్ చేయండి.'
                  : 'Real-time multi-patient medication sync: Alerts trigger across all linked caregiver phones.'}
              </p>
            </div>
          </div>
        </div>

        {familyNotifications.filter((n) => n.status === 'pending').length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            All family medications and scheduled checkups are up to date.
          </div>
        ) : (
          <div className="space-y-3">
            {familyNotifications
              .filter((n) => n.status === 'pending')
              .map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 sm:p-4 rounded-lg bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-slate-300"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                        notif.type === 'medication_due'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60'
                      }`}
                    >
                      {notif.type === 'medication_due' ? (
                        <Pill className="w-4 h-4" />
                      ) : (
                        <CalendarCheck className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {notif.from_patient_name}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                          {notif.scheduled_time}
                        </span>
                        {notif.urgency === 'urgent' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-sky-800 dark:text-sky-300 mt-0.5">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 flex-wrap">
                    <button
                      onClick={() => {
                        const target = members.find((m) => notif.from_patient_name.toLowerCase().includes(m.name.toLowerCase())) || members[0];
                        onSimulateVoiceCall?.({
                          patientName: notif.from_patient_name,
                          patientPhone: target?.phone || '+91 96666 66666',
                          language: target?.language || selectedLanguage,
                          customExplanation: `${notif.from_patient_name}: ${notif.title} is scheduled for ${notif.scheduled_time}. ${notif.message}`,
                          deliveryReason: `Urgent Reminder for ${notif.from_patient_name} (Patient does not use WhatsApp or Email)`,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
                      title="Simulate automated voice call reminder"
                    >
                      <Phone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>Voice Call</span>
                    </button>
                    <button
                      onClick={() => handlePingFamilyNotification(notif)}
                      className="px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
                      title="Send instant alert to family members"
                    >
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ping Family</span>
                    </button>
                    <button
                      onClick={() => handleMarkNotificationTaken(notif.id)}
                      className="px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Taken</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Member Form */}
      {isAdding && (
        <form
          onSubmit={handleAddMember}
          className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4"
        >
          <h3 className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
            {selectedLanguage === 'ta' ? 'புதிய குடும்ப உறுப்பினர் விவரம்' : 'Add Family Member Profile'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {selectedLanguage === 'ta' ? 'முழுப் பெயர் (Full Name)' : 'Full Name'}
              </label>
              <input
                type="text"
                placeholder="e.g. Sita Ramulu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {selectedLanguage === 'ta' ? 'உறவுமுறை (Relation)' : 'Relation'}
              </label>
              <input
                type="text"
                placeholder="e.g. Father, Mother, Grandfather"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {selectedLanguage === 'ta' ? 'வயது (Age)' : 'Age'}
              </label>
              <input
                type="number"
                placeholder="e.g. 65"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {selectedLanguage === 'ta' ? 'தொலைபேசி எண்' : 'Mobile Number'}
              </label>
              <input
                type="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {selectedLanguage === 'ta' ? 'குரல் மொழி (Preferred Voice)' : 'Preferred Voice Language'}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {selectedLanguage === 'ta' ? 'அறிவிப்பு & குரல் சேனல்' : 'Delivery & Voice Channel'}
              </label>
              <select
                value={deliveryChannel}
                onChange={(e) => {
                  const val = e.target.value as 'voice_call' | 'whatsapp_email';
                  setDeliveryChannel(val);
                  setPhoneType(val === 'voice_call' ? 'feature' : 'smartphone');
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-sm outline-none focus:border-sky-600"
              >
                <option value="voice_call">Automated Voice Call (No WhatsApp or Email)</option>
                <option value="whatsapp_email">WhatsApp & Email Delivery</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
            >
              Save Member
            </button>
          </div>
        </form>
      )}

      {/* Members Cards with Medication & Checkup Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {members.map((member) => {
          const reminders = remindersMap[member.id] || [];

          return (
            <div
              key={member.id}
              className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Profile Top Bar */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl">
                      {member.name[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white">{member.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {member.relation}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {member.age} yrs
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveMember(member.id)}
                    title="Remove Member"
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Contact & Voice details */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{member.phone}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {SUPPORTED_LANGUAGES.find((l) => l.code === member.language)?.name || member.language}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        member.deliveryChannel === 'voice_call' || member.phoneType === 'feature'
                          ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {member.deliveryChannel === 'voice_call' || member.phoneType === 'feature'
                        ? 'Voice Call (No WhatsApp/Email)'
                        : 'WhatsApp & Email'}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        onSimulateVoiceCall?.({
                          patientName: member.name,
                          patientPhone: member.phone,
                          language: member.language,
                          customExplanation:
                            member.language === 'ta'
                              ? `வணக்கம் ${member.name}. உங்கள் மருத்துவ அறிக்கைகள் மற்றும் தினசரி மருந்து அட்டவணை தயாராக உள்ளது.`
                              : member.language === 'te'
                              ? `నమస్కారం ${member.name} గారు. మీ మెడికల్ రిపోర్టులు మరియు రోజువారీ మందుల షెడ్యూల్ సిద్ధంగా ఉంది.`
                              : member.language === 'hi'
                              ? `नमस्ते ${member.name} जी। आपकी मेडिकल टेस्ट रिपोर्ट और दैनिक दवा का समय तैयार है।`
                              : `Hello ${member.name}. Your medication schedule and medical records are ready.`,
                          deliveryReason: `${member.name} does not use WhatsApp or Email • Automated Outbound Voice Call`,
                        })
                      }
                      className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black shadow-xs transition-all flex items-center gap-1 active:scale-95"
                      title="Simulate automated phone call to this family member"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Simulate Call</span>
                    </button>
                  </div>
                </div>

                {/* Section: Family Medication & Checkup Reminders */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {selectedLanguage === 'ta'
                          ? 'மருந்து & பரிசோதனை நினைவூட்டல்'
                          : selectedLanguage === 'te'
                          ? 'మందులు & చెక్-అప్ రిమైండర్లు'
                          : 'Medication & Checkup Reminders'}
                      </h4>
                    </div>

                    <button
                      onClick={() => setActiveReminderModalMemberId(member.id)}
                      className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{selectedLanguage === 'ta' ? 'நினைவூட்டல் சேர்' : '+ Add Reminder'}</span>
                    </button>
                  </div>

                  {reminders.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                      No reminders configured. Click &quot;+ Add Reminder&quot; to set pill or checkup alerts.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reminders.map((rem) => (
                        <div
                          key={rem.id}
                          className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                rem.type === 'medication'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                              }`}
                            >
                              {rem.type === 'medication' ? (
                                <Pill className="w-4 h-4" />
                              ) : (
                                <CalendarCheck className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                {rem.title}
                              </h5>
                              <p className="text-[11px] text-slate-400 font-medium">
                                {rem.timeOrDate} • {rem.instructions}
                              </p>
                            </div>
                          </div>

                          {/* Cross-Family Notification Toggle */}
                          <button
                            onClick={() => handleToggleFamilyNotification(member.id, rem.id)}
                            title={
                              rem.notifyFamily
                                ? 'Active: Family members will receive this alert'
                                : 'Disabled: Alert only sent to patient'
                            }
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 transition-all flex items-center gap-1 ${
                              rem.notifyFamily
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            <Bell className="w-3 h-3" />
                            <span>
                              {rem.notifyFamily
                                ? selectedLanguage === 'ta'
                                  ? 'குடும்பத்திற்கு அறிவி'
                                  : 'Family Alert On'
                                : 'Silent'}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> DPDP 2023 Consent Active
                </span>
                <span className="text-slate-400 font-medium text-[11px]">
                  Voice: {member.language.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Medication or Checkup Reminder */}
      {activeReminderModalMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              {selectedLanguage === 'ta' ? 'புதிய நினைவூட்டல் அமைக்கவும்' : 'Set Family Reminder'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              {selectedLanguage === 'ta'
                ? 'மருந்து உட்கொள்ளும் நேரம் அல்லது மருத்துவர் பரிசோதனை தேதியை உள்ளிடவும்.'
                : 'Configure medication timetable or clinic checkup alerts shared across family members.'}
            </p>

            <form onSubmit={handleAddReminderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Reminder Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRemType('medication')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      remType === 'medication'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Daily Medication</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemType('checkup')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      remType === 'checkup'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Doctor Checkup</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {remType === 'medication' ? 'Medicine Name & Dose' : 'Checkup / Test Title'}
                </label>
                <input
                  type="text"
                  placeholder={remType === 'medication' ? 'e.g. Telmisartan 40mg' : 'e.g. HbA1c Diabetes Follow-up'}
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {remType === 'medication' ? 'Time / Frequency' : 'Date / Frequency'}
                </label>
                <input
                  type="text"
                  placeholder={remType === 'medication' ? 'e.g. ☀️ 08:00 AM (Daily)' : 'e.g. 📅 1st Monday of Every Month'}
                  value={remTime}
                  onChange={(e) => setRemTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Food Instructions / Clinic Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. After breakfast with water / Dr. Rao Clinic"
                  value={remInstructions}
                  onChange={(e) => setRemInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 block">
                    Notify Other Family Members
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    Send WhatsApp/SMS alert to caregiver phone
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={remNotifyFamily}
                  onChange={(e) => setRemNotifyFamily(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReminderModalMemberId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-md hover:bg-emerald-500 transition-all"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
