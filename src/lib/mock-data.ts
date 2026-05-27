import type { Member, Event, AttendanceRecord, SentNotification, UserAccount, AttendanceSummary, SectionSummary, LevelPolicy, AttendancePeriod, Ensemble } from '@/types'

export const MOCK_ENSEMBLES: Ensemble[] = [
  { id: 'g1', name: 'Happy Valley Brass Band', description: 'Phoenix, AZ · Est. 1986', est_year: 1986, created_at: '2026-01-01' },
  { id: 'g2', name: 'Phoenix Concert Band', description: 'Community concert band', est_year: 2010, created_at: '2026-01-01' },
]

export const MOCK_MEMBERS: Member[] = [
  { id: 'm1', first_name: 'James', last_name: 'Carter', email: 'james.carter@email.com', phone: '623-555-0101', section: 'Trumpet', level: 1, role: 'member', active: true, created_at: '2024-01-10' },
  { id: 'm2', first_name: 'Sarah', last_name: 'Mitchell', email: 'sarah.m@email.com', phone: '623-555-0102', section: 'Trumpet', level: 2, role: 'section_leader', active: true, created_at: '2024-01-10' },
  { id: 'm3', first_name: 'David', last_name: 'Nguyen', email: 'david.n@email.com', section: 'Trumpet', level: 2, role: 'member', active: true, created_at: '2024-02-01' },
  { id: 'm4', first_name: 'Maria', last_name: 'Rodriguez', email: 'maria.r@email.com', section: 'Trumpet', level: 3, role: 'member', active: true, created_at: '2024-03-15' },
  { id: 'm5', first_name: 'Kevin', last_name: 'Walsh', email: 'kevin.w@email.com', section: 'Trombone', level: 1, role: 'member', active: true, created_at: '2024-01-10' },
  { id: 'm6', first_name: 'Angela', last_name: 'Brooks', email: 'angela.b@email.com', section: 'Trombone', level: 2, role: 'section_leader', active: true, created_at: '2024-01-10' },
  { id: 'm7', first_name: 'Thomas', last_name: 'Patel', email: 'thomas.p@email.com', section: 'Trombone', level: 2, role: 'member', active: true, created_at: '2024-02-10' },
  { id: 'm8', first_name: 'Lisa', last_name: 'Chen', email: 'lisa.c@email.com', section: 'Trombone', level: 3, role: 'member', active: true, created_at: '2024-03-01' },
  { id: 'm9', first_name: 'Robert', last_name: 'Harrison', email: 'robert.h@email.com', section: 'Euphonium', level: 1, role: 'member', active: true, created_at: '2024-01-10' },
  { id: 'm10', first_name: 'Patricia', last_name: 'Kim', email: 'patricia.k@email.com', section: 'Euphonium', level: 2, role: 'section_leader', active: true, created_at: '2024-01-10' },
  { id: 'm11', first_name: 'Michael', last_name: 'Torres', email: 'michael.t@email.com', section: 'Euphonium', level: 2, role: 'member', active: true, created_at: '2024-02-15' },
  { id: 'm12', first_name: 'Jennifer', last_name: 'Adams', email: 'jennifer.a@email.com', section: 'Tuba', level: 1, role: 'member', active: true, created_at: '2024-01-10' },
  { id: 'm13', first_name: 'Christopher', last_name: 'White', email: 'chris.w@email.com', section: 'Tuba', level: 2, role: 'section_leader', active: true, created_at: '2024-01-10' },
  { id: 'm14', first_name: 'Amanda', last_name: 'Johnson', email: 'amanda.j@email.com', section: 'Tuba', level: 3, role: 'member', active: true, created_at: '2024-04-01' },
  { id: 'm15', first_name: 'Daniel', last_name: 'Martinez', email: 'daniel.m@email.com', section: 'Percussion', level: 1, role: 'member', active: true, created_at: '2024-01-10' },
  { id: 'm16', first_name: 'Stephanie', last_name: 'Lee', email: 'steph.l@email.com', section: 'Percussion', level: 2, role: 'section_leader', active: true, created_at: '2024-01-10' },
  { id: 'm17', first_name: 'Andrew', last_name: 'Thompson', email: 'andrew.t@email.com', section: 'Percussion', level: 2, role: 'member', active: true, created_at: '2024-02-20' },
  { id: 'm18', first_name: 'Jessica', last_name: 'Garcia', email: 'jessica.g@email.com', section: 'Percussion', level: 3, role: 'member', active: true, created_at: '2024-04-10' },
]

export const MOCK_EVENTS: Event[] = [
  { id: 'e1', name: 'Weekly Rehearsal', date: '2026-05-19', type: 'rehearsal', notes: 'Worked on Hymn #142 and opening march. Good run on the processional.', created_by: 'director', created_at: '2026-05-19' },
  { id: 'e2', name: 'Sunday Morning Service', date: '2026-05-18', type: 'sunday_service', notes: 'Memorial Sunday program. Full ensemble required.', created_by: 'director', created_at: '2026-05-16' },
  { id: 'e3', name: 'Memorial Service — Reynolds Family', date: '2026-05-14', type: 'funeral', notes: 'Quartet only. Trumpet and trombone leads.', created_by: 'director', created_at: '2026-05-13' },
  { id: 'e4', name: 'Spring Concert', date: '2026-05-10', type: 'concert', notes: 'Full program. Stage setup 1 hour before. Uniform required.', created_by: 'director', created_at: '2026-05-08' },
  { id: 'e5', name: 'Weekly Rehearsal', date: '2026-05-12', type: 'rehearsal', notes: 'Concert prep run-through.', created_by: 'director', created_at: '2026-05-12' },
  { id: 'e6', name: 'Weekly Rehearsal', date: '2026-05-05', type: 'rehearsal', notes: 'Sectionals for first half. Full ensemble second half.', created_by: 'director', created_at: '2026-05-05' },
]

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', event_id: 'e2', member_id: 'm1', status: 'present', logged_by: 'director', logged_at: '2026-05-18T10:00:00Z' },
  { id: 'a2', event_id: 'e2', member_id: 'm2', status: 'present', logged_by: 'director', logged_at: '2026-05-18T10:00:00Z' },
  { id: 'a3', event_id: 'e2', member_id: 'm3', status: 'absent', absence_type: 'unexcused', logged_by: 'director', logged_at: '2026-05-18T10:00:00Z' },
  { id: 'a4', event_id: 'e2', member_id: 'm4', status: 'partial', note: 'Arrived 20 min late', logged_by: 'director', logged_at: '2026-05-18T10:00:00Z' },
  { id: 'a5', event_id: 'e2', member_id: 'm5', status: 'present', logged_by: 'director', logged_at: '2026-05-18T10:00:00Z' },
  { id: 'a6', event_id: 'e2', member_id: 'm6', status: 'absent', absence_type: 'excused', note: 'Family emergency', logged_by: 'director', logged_at: '2026-05-18T10:00:00Z' },
]

export const MOCK_NOTIFICATIONS: SentNotification[] = [
  { id: 'n1', member_id: 'm3', member_name: 'David Nguyen', member_email: 'david.n@email.com', type: 'warning', subject: 'Attendance Warning — 3 Absences Logged', message: 'You have reached 3 unexcused absences this trimester. Per Level 2 policy, a maximum of 5 is allowed. Please reach out to your section leader.', sent_at: '2026-05-14T08:00:00Z', delivered: true, triggered_by: 'auto' },
  { id: 'n2', member_id: 'm8', member_name: 'Lisa Chen', member_email: 'lisa.c@email.com', type: 'warning', subject: 'Attendance Warning — 2 Absences Logged', message: 'You have reached 2 unexcused absences this trimester. Per Level 3 policy, a maximum of 3 is allowed. One more absence will trigger a final notice.', sent_at: '2026-05-10T08:00:00Z', delivered: true, triggered_by: 'auto' },
  { id: 'n3', member_id: 'm14', member_name: 'Amanda Johnson', member_email: 'amanda.j@email.com', type: 'final_notice', subject: 'Final Notice — Absence Limit Reached', message: 'You have reached the maximum absence limit (3) for Level 3 members this trimester. Please contact the director to discuss your standing.', sent_at: '2026-05-08T08:00:00Z', delivered: true, triggered_by: 'auto' },
  { id: 'n4', member_id: 'm1', member_name: 'ALL MEMBERS', member_email: 'all', type: 'announcement', subject: 'Spring Concert — Final Rehearsal Reminder', message: 'Reminder: Full ensemble Spring Concert is this Saturday at 7pm. Uniform required. Call time is 6pm. Please confirm attendance to your section leader.', sent_at: '2026-05-09T09:00:00Z', delivered: true, triggered_by: 'manual' },
]

export const MOCK_USERS: UserAccount[] = [
  { id: 'u1', email: 'bgiurgiu7@gmail.com', name: 'Brandon Giurgiu', role: 'admin', type: 'person', active: true, last_login: '2026-05-19T09:00:00Z', created_at: '2026-01-01' },
  { id: 'u2', email: 'sarah.m@email.com', name: 'Sarah Mitchell', role: 'section_leader', type: 'person', active: true, last_login: '2026-05-18T10:15:00Z', created_at: '2026-01-15' },
  { id: 'u3', email: 'angela.b@email.com', name: 'Angela Brooks', role: 'section_leader', type: 'person', active: true, last_login: '2026-05-17T14:00:00Z', created_at: '2026-01-15' },
  { id: 'u4', email: 'patricia.k@email.com', name: 'Patricia Kim', role: 'section_leader', type: 'person', active: true, last_login: '2026-05-15T11:00:00Z', created_at: '2026-01-15' },
  { id: 'u5', email: 'noreply@supabase.io', name: 'Supabase Auth', role: 'service_account', type: 'service_account', service_name: 'Supabase', active: true, created_at: '2026-01-01' },
  { id: 'u6', email: 'noreply@resend.com', name: 'Resend Email', role: 'service_account', type: 'service_account', service_name: 'Resend', active: true, created_at: '2026-01-01' },
  { id: 'u7', email: 'system@vercel.com', name: 'Vercel Hosting', role: 'service_account', type: 'service_account', service_name: 'Vercel', active: true, created_at: '2026-01-01' },
]

export const MOCK_SUMMARIES: AttendanceSummary[] = [
  { member_id: 'm1', member_name: 'James Carter', section: 'Trumpet', level: 1, total_events: 12, present: 12, partial: 0, absent_unexcused: 0, absent_excused: 0, attendance_pct: 100, threshold_status: 'ok' },
  { member_id: 'm2', member_name: 'Sarah Mitchell', section: 'Trumpet', level: 2, total_events: 12, present: 11, partial: 1, absent_unexcused: 0, absent_excused: 0, attendance_pct: 96, threshold_status: 'ok' },
  { member_id: 'm3', member_name: 'David Nguyen', section: 'Trumpet', level: 2, total_events: 12, present: 7, partial: 2, absent_unexcused: 3, absent_excused: 0, attendance_pct: 67, threshold_status: 'warning' },
  { member_id: 'm4', member_name: 'Maria Rodriguez', section: 'Trumpet', level: 3, total_events: 12, present: 9, partial: 1, absent_unexcused: 2, absent_excused: 0, attendance_pct: 79, threshold_status: 'warning' },
  { member_id: 'm5', member_name: 'Kevin Walsh', section: 'Trombone', level: 1, total_events: 12, present: 11, partial: 1, absent_unexcused: 0, absent_excused: 0, attendance_pct: 96, threshold_status: 'ok' },
  { member_id: 'm6', member_name: 'Angela Brooks', section: 'Trombone', level: 2, total_events: 12, present: 10, partial: 0, absent_unexcused: 1, absent_excused: 1, attendance_pct: 83, threshold_status: 'ok' },
  { member_id: 'm7', member_name: 'Thomas Patel', section: 'Trombone', level: 2, total_events: 12, present: 10, partial: 2, absent_unexcused: 0, absent_excused: 0, attendance_pct: 92, threshold_status: 'ok' },
  { member_id: 'm8', member_name: 'Lisa Chen', section: 'Trombone', level: 3, total_events: 12, present: 8, partial: 2, absent_unexcused: 2, absent_excused: 0, attendance_pct: 75, threshold_status: 'warning' },
  { member_id: 'm14', member_name: 'Amanda Johnson', section: 'Tuba', level: 3, total_events: 12, present: 7, partial: 2, absent_unexcused: 3, absent_excused: 0, attendance_pct: 67, threshold_status: 'exceeded' },
]

export const MOCK_SECTION_SUMMARIES: SectionSummary[] = [
  { section: 'Trumpet', total_members: 4, avg_attendance_pct: 85, total_absences: 5 },
  { section: 'Trombone', total_members: 4, avg_attendance_pct: 87, total_absences: 3 },
  { section: 'Euphonium', total_members: 3, avg_attendance_pct: 91, total_absences: 2 },
  { section: 'Tuba', total_members: 3, avg_attendance_pct: 78, total_absences: 6 },
  { section: 'Percussion', total_members: 4, avg_attendance_pct: 88, total_absences: 4 },
]

export const MOCK_PERIOD: AttendancePeriod = {
  id: 'p1',
  label: 'Spring Trimester 2026',
  start_date: '2026-02-01',
  end_date: '2026-05-31',
  active: true,
}

export const MOCK_LEVEL_POLICIES: LevelPolicy[] = [
  { level: 1, label: 'Level 1 — Elite', description: 'Highly committed / advanced players. No formal absence limit.', max_absences: null, warning_threshold: null, final_notice_threshold: null },
  { level: 2, label: 'Level 2 — Standard', description: 'Standard ensemble members with regular attendance expectations.', max_absences: 5, warning_threshold: 3, final_notice_threshold: 5 },
  { level: 3, label: 'Level 3 — Developmental', description: 'Developmental or younger players with structured accountability.', max_absences: 3, warning_threshold: 2, final_notice_threshold: 3 },
]
