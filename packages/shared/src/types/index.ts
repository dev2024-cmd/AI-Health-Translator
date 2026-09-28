export type UserRole = 'patient' | 'caregiver' | 'health_worker' | 'admin';

export type PhoneType = 'smartphone' | 'feature';

export type CaregiverStatus = 'pending' | 'active' | 'revoked';

export type ReportSource = 'app' | 'whatsapp' | 'web' | 'health_worker';

export type ReportStatus =
  | 'uploaded'
  | 'ocr'
  | 'extracting'
  | 'explaining'
  | 'translating'
  | 'audio'
  | 'ready'
  | 'failed';

export type FlagType = 'normal' | 'low' | 'high' | 'critical';

export type EscalationStatus = 'open' | 'assigned' | 'resolved';

export type TelephonyChannel = 'ivr' | 'sms';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  preferred_language: string;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string | null;
  display_name: string;
  preferred_language: string;
  phone_for_ivr: string;
  phone_type: PhoneType;
  created_at: string;
}

export interface CaregiverLink {
  id: string;
  caregiver_id: string;
  patient_id: string;
  status: CaregiverStatus;
  created_at: string;
}

export interface ReportFile {
  id: string;
  report_id: string;
  storage_key: string;
  mime: string;
  page_count: number;
}

export interface ExtractedValue {
  id: string;
  report_id: string;
  test_name: string;
  value: number;
  unit: string;
  ref_low: number | null;
  ref_high: number | null;
  flag: FlagType;
  page: number;
}

export interface Explanation {
  id: string;
  report_id: string;
  language: string;
  text: string;
  audio_key: string | null;
  audio_available: boolean;
  generated_at: string;
}

export interface Report {
  id: string;
  patient_id: string;
  uploaded_by: string;
  source: ReportSource;
  status: ReportStatus;
  original_language: string;
  created_at: string;
  files?: ReportFile[];
  extracted_values?: ExtractedValue[];
  explanation?: Explanation;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  aliases: string[];
  definition_simple: string;
  category?: string;
}

export interface HealthWorker {
  id: string;
  user_id: string;
  region: string;
  languages: string[];
  is_available: boolean;
}

export interface Escalation {
  id: string;
  report_id: string;
  patient_id: string;
  reason: string;
  status: EscalationStatus;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
}

export interface CallLog {
  id: string;
  patient_id: string;
  report_id: string;
  channel: TelephonyChannel;
  provider_sid: string | null;
  status: string;
  keypad_events: Record<string, unknown> | null;
  created_at: string;
}

export interface Consent {
  id: string;
  user_id: string;
  purpose: string;
  granted_at: string;
  revoked_at: string | null;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  created_at: string;
}
