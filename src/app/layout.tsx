import type { Metadata } from 'next'
import { ThemeProvider, themeScript } from '@/lib/theme'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ensemble Trackr | Happy Valley Brass Band',
  description: 'Attendance and member management for Happy Valley Brass Band.',
  authors: [{ name: 'LiveViral Media', url: 'https://liveviralmedia.com' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Runs before React hydration to prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
