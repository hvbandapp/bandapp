import type { Member, Event, AttendanceRecord, SentNotification, UserAccount, AttendanceSummary, SectionSummary, LevelPolicy, AttendancePeriod, Ensemble } from '@/types'

export const MOCK_ENSEMBLES: Ensemble[] = [
  { id: 'g1', name: 'Happy Valley Brass Band', description: 'Phoenix, AZ · Est. 1986', est_year: 1986, created_at: '2026-01-01' },
]

export const MOCK_MEMBERS: Member[] = []

export const MOCK_EVENTS: Event[] = []

export const MOCK_ATTENDANCE: AttendanceRecord[] = []

export const MOCK_NOTIFICATIONS: SentNotification[] = []

export const MOCK_USERS: UserAccount[] = [
  { id: 'u1', email: 'bgiurgiu7@gmail.com', name: 'Brandon Giurgiu', role: 'admin', type: 'person', active: true, created_at: '2026-01-01' },
]

export const MOCK_SUMMARIES: AttendanceSummary[] = []

export const MOCK_SECTION_SUMMARIES: SectionSummary[] = []

export const MOCK_PERIOD: AttendancePeriod = {
  id:         'p1',
  label:      'Current Period',
  start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
  end_date:   new Date(new Date().getFullYear(), new Date().getMonth() + 3, 0).toISOString().slice(0, 10),
  active:     true,
}

export const MOCK_LEVEL_POLICIES: LevelPolicy[] = [
  { level: 1, label: 'Level 1 — Elite',        description: 'Highly committed / advanced players. No formal absence limit.', max_absences: null, warning_threshold: null, final_notice_threshold: null },
  { level: 2, label: 'Level 2 — Standard',      description: 'Standard ensemble members with regular attendance expectations.', max_absences: 5, warning_threshold: 3, final_notice_threshold: 5 },
  { level: 3, label: 'Level 3 — Developmental', description: 'Developmental or younger players with structured accountability.', max_absences: 3, warning_threshold: 2, final_notice_threshold: 3 },
]
