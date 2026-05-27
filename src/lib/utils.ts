import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AttendanceStatus, MemberLevel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getAttendanceClasses(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'bg-green-500 text-white border-green-600'
    case 'partial':  return 'bg-yellow-400 text-white border-yellow-500'
    case 'absent':   return 'bg-red-500 text-white border-red-600'
    case 'excused':  return 'bg-blue-400 text-white border-blue-500'
    default:         return 'bg-red-500 text-white border-red-600'
  }
}

export function getAttendanceDotColor(status: AttendanceStatus | 'unmarked'): string {
  switch (status) {
    case 'present': return 'bg-green-500'
    case 'partial':  return 'bg-yellow-400'
    case 'absent':   return 'bg-red-500'
    case 'excused':  return 'bg-blue-400'
    default:         return 'bg-red-500'
  }
}

export function getLevelBadgeClasses(level: MemberLevel): string {
  switch (level) {
    case 1: return 'bg-purple-100 text-purple-800 border-purple-200'
    case 2: return 'bg-blue-100 text-blue-800 border-blue-200'
    case 3: return 'bg-orange-100 text-orange-800 border-orange-200'
  }
}

export function getLevelLabel(level: MemberLevel): string {
  switch (level) {
    case 1: return 'L1 — Elite'
    case 2: return 'L2 — Standard'
    case 3: return 'L3 — Developmental'
  }
}

export function getThresholdStatusClasses(status: string): string {
  switch (status) {
    case 'ok':           return 'text-green-700 bg-green-50 border-green-200'
    case 'warning':      return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'final_notice': return 'text-orange-700 bg-orange-50 border-orange-200'
    case 'exceeded':     return 'text-red-700 bg-red-50 border-red-200'
    default:             return 'text-slate-600 bg-slate-50 border-slate-200'
  }
}

export function getThresholdStatusLabel(status: string): string {
  switch (status) {
    case 'ok':           return 'Good Standing'
    case 'warning':      return 'Warning'
    case 'final_notice': return 'Final Notice'
    case 'exceeded':     return 'Exceeded'
    default:             return '—'
  }
}

export function calcAttendancePct(present: number, partial: number, total: number): number {
  if (total === 0) return 0
  return Math.round(((present + partial * 0.5) / total) * 100)
}

export function currentYear(): number {
  return new Date().getFullYear()
}
