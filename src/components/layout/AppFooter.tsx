import { currentYear } from '@/lib/utils'

export function AppFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`text-center text-xs text-slate-400 py-4 ${className}`}>
      App Created by{' '}
      <a
        href="https://liveviralmedia.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-400 hover:text-teal-300 transition-colors"
      >
        LiveViral Media
      </a>{' '}
      &copy; {currentYear()}
    </footer>
  )
}
