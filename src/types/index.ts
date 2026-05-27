export interface Ensemble {
  id: string
  name: string
  description?: string
  est_year?: number
  created_at: string
}

export type Role = 'director' | 'section_leader' | 'member'
export type AdminRole = 'admin'
export type MemberLevel = 1 | 2 | 3
export type AttendanceStatus = 'present' | 'partial' | 'absent' | 'excused'
export type EventType = 'rehearsal' | 'sunday_service' | 'funeral' | 'concert' | 'custom'
export type AbsenceType = 'unexcused' | 'excused'

export interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  section: string
  level: MemberLevel
  role: Role
  active: boolean
  created_at: string
}

export interface Event {
  id: string
  name: string
  date: string
  type: EventType
  custom_type?: string
  notes?: string
  created_by: string
  created_at: string
}

export interface AttendanceRecord {
  id: string
  event_id: string
  member_id: string
  member?: Member
  status: AttendanceStatus
  note?: string
  absence_type?: AbsenceType
  logged_by: string
  logged_at: string
  updated_at?: string
}

export interface LevelPolicy {
  level: MemberLevel
  label: string
  description: string
  max_absences: number | null
  warning_threshold: number | null
  final_notice_threshold: number | null
}

export interface AttendancePeriod {
  id: string
  label: string
  start_date: string
  end_date: string
  active: boolean
}

export interface SentNotification {
  id: string
  member_id: string
  member_name: string
  member_email: string
  type: 'warning' | 'final_notice' | 'announcement' | 'event_reminder'
  subject: string
  message: string
  sent_at: string
  delivered: boolean
  triggered_by: 'auto' | 'manual'
}

export interface UserAccount {
  id: string
  email: string
  name: string
  role: Role | AdminRole | 'service_account'
  type: 'person' | 'service_account'
  service_name?: string
  active: boolean
  last_login?: string
  created_at: string
}

export interface AttendanceSummary {
  member_id: string
  member_name: string
  section: string
  level: MemberLevel
  total_events: number
  present: number
  partial: number
  absent_unexcused: number
  absent_excused: number
  attendance_pct: number
  threshold_status: 'ok' | 'warning' | 'final_notice' | 'exceeded'
}

export interface SectionSummary {
  section: string
  total_members: number
  avg_attendance_pct: number
  total_absences: number
}

export const DEFAULT_SECTIONS = [
  'Trumpet',
  'Trombone',
  'Euphonium',
  'Tuba',
  'Percussion',
] as const

export const DEFAULT_LEVEL_POLICIES: LevelPolicy[] = [
  {
    level: 1,
    label: 'Level 1 — Elite',
    description: 'Highly committed / advanced players. No formal absence limit.',
    max_absences: null,
    warning_threshold: null,
    final_notice_threshold: null,
  },
  {
    level: 2,
    label: 'Level 2 — Standard',
    description: 'Standard ensemble members with regular attendance expectations.',
    max_absences: 5,
    warning_threshold: 3,
    final_notice_threshold: 5,
  },
  {
    level: 3,
    label: 'Level 3 — Developmental',
    description: 'Developmental or younger players with structured accountability.',
    max_absences: 3,
    warning_threshold: 2,
    final_notice_threshold: 3,
  },
]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  rehearsal: 'Rehearsal',
  sunday_service: 'Sunday Service',
  funeral: 'Funeral',
  concert: 'Concert',
  custom: 'Custom',
}

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  partial: 'Partial',
  absent: 'Absent',
  excused: 'Excused',
}
