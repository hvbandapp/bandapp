import { currentYear } from '@/lib/utils'

export function AppFooter({ className = '' }: { className?: string }) {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev'
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
      <span className="block mt-0.5 text-[10px] opacity-50 tracking-wide">{version}</span>
    </footer>
  )
}
