import type { Member, Event, AttendanceRecord, SentNotification, UserAccount, AttendanceSummary, SectionSummary, LevelPolicy, AttendancePeriod, Ensemble } from '@/types'

export const MOCK_ENSEMBLES: Ensemble[] = [
  { id: 'g1', name: 'Happy Valley Brass Band', description: 'Phoenix, AZ · Est. 1986', est_year: 1986, created_at: '2026-01-01' },
  { id: 'g2', name: 'Mesa Wind Symphony', description: 'Concert band — Mesa, AZ', est_year: 2012, created_at: '2026-01-01' },
]

export const MOCK_MEMBERS: Member[] = [
  { id: 'm1',  first_name: 'Alex',      last_name: 'Rivera',    email: 'alex.rivera@email.com',     phone: '602-555-0101', section: 'Trumpet',    level: 1, role: 'member',         active: true, created_at: '2024-01-10' },
  { id: 'm2',  first_name: 'Jessica',   last_name: 'Park',      email: 'jessica.p@email.com',        phone: '602-555-0102', section: 'Trumpet',    level: 2, role: 'section_leader', active: true, created_at: '2024-01-10' },
  { id: 'm3',  first_name: 'Marcus',    last_name: 'Thompson',  email: 'marcus.t@email.com',         section: 'Trumpet',    level: 2, role: 'member',         active: true, created_at: '2024-02-01' },
  { id: 'm4',  first_name: 'Olivia',    last_name: 'Chen',      email: 'olivia.c@email.com',         section: 'Trumpet',    level: 3, role: 'member',         active: true, created_at: '2024-03-15' },
  { id: 'm5',  first_name: 'Derek',     last_name: 'Walsh',     email: 'derek.w@email.com',          phone: '602-555-0105', section: 'Trombone',   level: 1, role: 'member',         active: true, created_at: '2024-01-10' },
  { id: 'm6',  first_name: 'Amanda',    last_name: 'Foster',    email: 'amanda.f@email.com',         phone: '602-555-0106', section: 'Trombone',   level: 2, role: 'section_leader', active: true, created_at: '2024-01-10' },
  { id: 'm7',  first_name: 'Ryan',      last_name: 'Nguyen',    email: 'ryan.n@email.com',           section: 'Trombone',   level: 2, role: 'member',         active: true, created_at: '2024-02-10' },
  { id: 'm8',  first_name: 'Brittany',  last_name: 'Moore',     email: 'brittany.m@email.com',       section: 'Trombone',   level: 3, role: 'member',         active: true, created_at: '2024-03-01' },
  { id: 'm9',  first_name: 'Steven',    last_name: 'Callahan',  email: 'steven.c@email.com',         phone: '602-555-0109', section: 'Euphonium',  level: 1, role: 'member',         active: true, created_at: '2024-01-10' },
  { id: 'm10', first_name: 'Rachel',    last_name: 'Kim',       email: 'rachel.k@email.com',         phone: '602-555-0110', section: 'Euphonium',  level: 2, role: 'section_leader', active: true, created_at: '2024-01-10' },
  { id: 'm11', first_name: 'Tyler',     last_name: 'Brooks',    email: 'tyler.b@email.com',          section: 'Euphonium',  level: 2, role: 'member',         active: true, created_at: '2024-02-15' },
  { id: 'm12', first_name: 'Vanessa',   last_name: 'Martin',    email: 'vanessa.m@email.com',        phone: '602-555-0112', section: 'Tuba',       level: 1, role: 'member',         active: true, created_at: '2024-01-10' },
  { id: 'm13', first_name: 'Nathan',    last_name: 'Webb',      email: 'nathan.w@email.com',         phone: '602-555-0113', section: 'Tuba',       level: 2, role: 'section_leader', active: true, created_at: '2024-01-10' },
  { id: 'm14', first_name: 'Haley',     last_name: 'Cooper',    email: 'haley.c@email.com',          section: 'Tuba',       level: 3, role: 'member',         active: true, created_at: '2024-04-01' },
  { id: 'm15', first_name: 'Jordan',    last_name: 'Lee',       email: 'jordan.l@email.com',         phone: '602-555-0115', section: 'Percussion', level: 1, role: 'member',         active: true, created_at: '2024-01-10' },
  { id: 'm16', first_name: 'Samantha',  last_name: 'Cruz',      email: 'samantha.c@email.com',       phone: '602-555-0116', section: 'Percussion', level: 2, role: 'section_leader', active: true, created_at: '2024-01-10' },
  { id: 'm17', first_name: 'Chris',     last_name: 'Patel',     email: 'chris.p@email.com',          section: 'Percussion', level: 2, role: 'member',         active: true, created_at: '2024-02-20' },
  { id: 'm18', first_name: 'Destiny',   last_name: 'Flores',    email: 'destiny.f@email.com',        section: 'Percussion', level: 3, role: 'member',         active: true, created_at: '2024-04-10' },
]

export const MOCK_EVENTS: Event[] = [
  { id: 'e1', name: 'Weekly Rehearsal',                     date: '2026-05-26', type: 'rehearsal',      notes: 'Ran through the full summer program. Trumpet section sounding great. Work on tuba blend next week.', created_by: 'director', created_at: '2026-05-26' },
  { id: 'e2', name: 'Sunday Morning Service',               date: '2026-05-25', type: 'sunday_service', notes: 'Memorial Sunday. Full ensemble required. Strong attendance — well done everyone.', created_by: 'director', created_at: '2026-05-23' },
  { id: 'e3', name: 'Memorial Day Concert at Veterans Park', date: '2026-05-22', type: 'concert',        notes: 'Full outdoor program. Excellent community turnout. Stage call time was 5:30pm.', created_by: 'director', created_at: '2026-05-20' },
  { id: 'e4', name: 'Weekly Rehearsal',                     date: '2026-05-19', type: 'rehearsal',      notes: 'Memorial Day concert prep — final run-through. Everyone bring full uniform Thursday.', created_by: 'director', created_at: '2026-05-19' },
  { id: 'e5', name: 'Henderson Family Memorial',            date: '2026-05-14', type: 'funeral',        notes: 'Quintet only. Trumpet and euphonium leads. Arrive 30 min early.', created_by: 'director', created_at: '2026-05-13' },
  { id: 'e6', name: 'Spring Concert — Season Finale',       date: '2026-05-10', type: 'concert',        notes: 'Full program. Uniform required. Setup one hour before curtain. Great crowd — best turnout this season.', created_by: 'director', created_at: '2026-05-08' },
]

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1',  event_id: 'e2', member_id: 'm1',  status: 'present', logged_by: 'director', logged_at: '2026-05-25T10:00:00Z' },
  { id: 'a2',  event_id: 'e2', member_id: 'm2',  status: 'present', logged_by: 'director', logged_at: '2026-05-25T10:00:00Z' },
  { id: 'a3',  event_id: 'e2', member_id: 'm3',  status: 'absent',  absence_type: 'unexcused', logged_by: 'director', logged_at: '2026-05-25T10:00:00Z' },
  { id: 'a4',  event_id: 'e2', member_id: 'm4',  status: 'partial', note: 'Arrived 15 min late', logged_by: 'director', logged_at: '2026-05-25T10:00:00Z' },
  { id: 'a5',  event_id: 'e2', member_id: 'm5',  status: 'present', logged_by: 'director', logged_at: '2026-05-25T10:00:00Z' },
  { id: 'a6',  event_id: 'e2', member_id: 'm6',  status: 'excused', absence_type: 'excused', note: 'Medical appointment', logged_by: 'director', logged_at: '2026-05-25T10:00:00Z' },
  { id: 'a7',  event_id: 'e2', member_id: 'm7',  status: 'present', logged_by: 'director', logged_at: '2026-05-25T10:00:00Z' },
  { id: 'a8',  event_id: 'e2', member_id: 'm8',  status: 'present', logged_by: 'director', logged_at: '2026-05-25T10:00:00Z' },
  { id: 'a9',  event_id: 'e2', member_id: 'm9',  status: 'present', logged_by: 'director', logged_at: '2026-05-25T10:00:00Z' },
  { id: 'a10', event_id: 'e2', member_id: 'm10', status: 'present', logged_by: 'director', logged_at: '2026-05-25T10:00:00Z' },
]

export const MOCK_NOTIFICATIONS: SentNotification[] = [
  {
    id: 'n1', member_id: 'm3', member_name: 'Marcus Thompson', member_email: 'marcus.t@email.com',
    type: 'warning', subject: 'Attendance Warning — 3 Absences Logged',
    message: 'You have reached 3 unexcused absences this trimester. Per Level 2 policy, a maximum of 5 is allowed. Please reach out to your section leader.',
    sent_at: '2026-05-20T08:00:00Z', delivered: true, triggered_by: 'auto',
  },
  {
    id: 'n2', member_id: 'm14', member_name: 'Haley Cooper', member_email: 'haley.c@email.com',
    type: 'final_notice', subject: 'Final Notice — Absence Limit Reached',
    message: 'You have reached the maximum absence limit (3) for Level 3 members this trimester. Please contact the director to discuss your standing in the ensemble.',
    sent_at: '2026-05-15T08:00:00Z', delivered: true, triggered_by: 'auto',
  },
  {
    id: 'n3', member_id: 'm1', member_name: 'ALL MEMBERS', member_email: 'all',
    type: 'announcement', subject: 'Memorial Day Concert — Final Details',
    message: 'Reminder: Memorial Day Concert at Veterans Park this Thursday. Call time 5:30pm, uniform required. Parking is available on the east side of the park.',
    sent_at: '2026-05-21T09:00:00Z', delivered: true, triggered_by: 'manual',
  },
  {
    id: 'n4', member_id: 'm8', member_name: 'Brittany Moore', member_email: 'brittany.m@email.com',
    type: 'warning', subject: 'Attendance Warning — 2 Absences Logged',
    message: 'You have reached 2 unexcused absences this trimester. Per Level 3 policy, 1 more will trigger a final notice.',
    sent_at: '2026-05-10T08:00:00Z', delivered: true, triggered_by: 'auto',
  },
]

export const MOCK_USERS: UserAccount[] = [
  { id: 'u1', email: 'contact@liveviralmedia.com', name: 'LiveViral Media', role: 'admin', type: 'person', active: true, last_login: '2026-05-26T09:00:00Z', created_at: '2026-01-01' },
  { id: 'u2', email: 'jessica.p@email.com',  name: 'Jessica Park',    role: 'section_leader', type: 'person', active: true, last_login: '2026-05-25T10:15:00Z', created_at: '2026-01-15' },
  { id: 'u3', email: 'amanda.f@email.com',   name: 'Amanda Foster',   role: 'section_leader', type: 'person', active: true, last_login: '2026-05-24T14:00:00Z', created_at: '2026-01-15' },
  { id: 'u4', email: 'rachel.k@email.com',   name: 'Rachel Kim',      role: 'section_leader', type: 'person', active: true, last_login: '2026-05-22T11:00:00Z', created_at: '2026-01-15' },
  { id: 'u5', email: 'noreply@supabase.io',  name: 'Supabase Auth',   role: 'service_account', type: 'service_account', service_name: 'Supabase',  active: true, created_at: '2026-01-01' },
  { id: 'u6', email: 'noreply@resend.com',   name: 'Resend Email',    role: 'service_account', type: 'service_account', service_name: 'Resend',    active: true, created_at: '2026-01-01' },
  { id: 'u7', email: 'system@vercel.com',    name: 'Vercel Hosting',  role: 'service_account', type: 'service_account', service_name: 'Vercel',    active: true, created_at: '2026-01-01' },
]

export const MOCK_SUMMARIES: AttendanceSummary[] = [
  { member_id: 'm1',  member_name: 'Alex Rivera',      section: 'Trumpet',    level: 1, total_events: 12, present: 12, partial: 0, absent_unexcused: 0, absent_excused: 0, attendance_pct: 100, threshold_status: 'ok' },
  { member_id: 'm2',  member_name: 'Jessica Park',     section: 'Trumpet',    level: 2, total_events: 12, present: 11, partial: 1, absent_unexcused: 0, absent_excused: 0, attendance_pct: 96,  threshold_status: 'ok' },
  { member_id: 'm3',  member_name: 'Marcus Thompson',  section: 'Trumpet',    level: 2, total_events: 12, present: 7,  partial: 2, absent_unexcused: 3, absent_excused: 0, attendance_pct: 67,  threshold_status: 'warning' },
  { member_id: 'm4',  member_name: 'Olivia Chen',      section: 'Trumpet',    level: 3, total_events: 12, present: 9,  partial: 1, absent_unexcused: 2, absent_excused: 0, attendance_pct: 79,  threshold_status: 'warning' },
  { member_id: 'm5',  member_name: 'Derek Walsh',      section: 'Trombone',   level: 1, total_events: 12, present: 11, partial: 1, absent_unexcused: 0, absent_excused: 0, attendance_pct: 96,  threshold_status: 'ok' },
  { member_id: 'm6',  member_name: 'Amanda Foster',    section: 'Trombone',   level: 2, total_events: 12, present: 10, partial: 0, absent_unexcused: 1, absent_excused: 1, attendance_pct: 83,  threshold_status: 'ok' },
  { member_id: 'm7',  member_name: 'Ryan Nguyen',      section: 'Trombone',   level: 2, total_events: 12, present: 10, partial: 2, absent_unexcused: 0, absent_excused: 0, attendance_pct: 92,  threshold_status: 'ok' },
  { member_id: 'm8',  member_name: 'Brittany Moore',   section: 'Trombone',   level: 3, total_events: 12, present: 8,  partial: 2, absent_unexcused: 2, absent_excused: 0, attendance_pct: 75,  threshold_status: 'warning' },
  { member_id: 'm9',  member_name: 'Steven Callahan',  section: 'Euphonium',  level: 1, total_events: 12, present: 12, partial: 0, absent_unexcused: 0, absent_excused: 0, attendance_pct: 100, threshold_status: 'ok' },
  { member_id: 'm10', member_name: 'Rachel Kim',       section: 'Euphonium',  level: 2, total_events: 12, present: 11, partial: 1, absent_unexcused: 0, absent_excused: 0, attendance_pct: 96,  threshold_status: 'ok' },
  { member_id: 'm11', member_name: 'Tyler Brooks',     section: 'Euphonium',  level: 2, total_events: 12, present: 10, partial: 1, absent_unexcused: 1, absent_excused: 0, attendance_pct: 88,  threshold_status: 'ok' },
  { member_id: 'm14', member_name: 'Haley Cooper',     section: 'Tuba',       level: 3, total_events: 12, present: 7,  partial: 2, absent_unexcused: 3, absent_excused: 0, attendance_pct: 67,  threshold_status: 'exceeded' },
  { member_id: 'm15', member_name: 'Jordan Lee',       section: 'Percussion', level: 1, total_events: 12, present: 12, partial: 0, absent_unexcused: 0, absent_excused: 0, attendance_pct: 100, threshold_status: 'ok' },
  { member_id: 'm16', member_name: 'Samantha Cruz',    section: 'Percussion', level: 2, total_events: 12, present: 11, partial: 0, absent_unexcused: 1, absent_excused: 0, attendance_pct: 92,  threshold_status: 'ok' },
]

export const MOCK_SECTION_SUMMARIES: SectionSummary[] = [
  { section: 'Trumpet',    total_members: 4, avg_attendance_pct: 86, total_absences: 5 },
  { section: 'Trombone',   total_members: 4, avg_attendance_pct: 87, total_absences: 3 },
  { section: 'Euphonium',  total_members: 3, avg_attendance_pct: 95, total_absences: 1 },
  { section: 'Tuba',       total_members: 3, avg_attendance_pct: 81, total_absences: 5 },
  { section: 'Percussion', total_members: 4, avg_attendance_pct: 91, total_absences: 2 },
]

export const MOCK_PERIOD: AttendancePeriod = {
  id: 'p1',
  label: 'Spring Trimester 2026',
  start_date: '2026-02-01',
  end_date:   '2026-05-31',
  active: true,
}

export const MOCK_LEVEL_POLICIES: LevelPolicy[] = [
  { level: 1, label: 'Level 1 — Elite',         description: 'Highly committed / advanced players. No formal absence limit.', max_absences: null, warning_threshold: null, final_notice_threshold: null },
  { level: 2, label: 'Level 2 — Standard',       description: 'Standard ensemble members with regular attendance expectations.', max_absences: 5, warning_threshold: 3, final_notice_threshold: 5 },
  { level: 3, label: 'Level 3 — Developmental',  description: 'Developmental or younger players with structured accountability.', max_absences: 3, warning_threshold: 2, final_notice_threshold: 3 },
]
