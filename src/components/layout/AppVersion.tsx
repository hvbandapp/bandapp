export function AppVersion({ className = '' }: { className?: string }) {
  const v = process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev'
  return (
    <p className={`text-[10px] text-center tracking-wide select-none pointer-events-none opacity-30 ${className}`}>
      {v}
    </p>
  )
}
