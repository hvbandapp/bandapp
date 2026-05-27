import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppFooter } from '@/components/layout/AppFooter'

export const metadata = { title: 'Terms & Conditions | Ensemble Trackr' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 mb-6"
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Terms &amp; Conditions</h1>
          <p className="text-xs text-slate-400 mb-6">Last Revised: May 8, 2026</p>

          <p className="text-sm text-slate-600 mb-6">
            This document serves as the Mobile Application &amp; Digital Services Terms and Conditions for
            all software, applications, and digital platforms developed, managed, or operated by LiveViral
            Media, a division of Weecks Productions, LLC.
          </p>

          <p className="text-sm text-slate-700 font-semibold mb-4">
            PLEASE READ THIS AGREEMENT CAREFULLY. BY DOWNLOADING, ACCESSING, OR USING ANY APP OR WEBSITE
            DEVELOPED BY LIVEVIRAL MEDIA (COLLECTIVELY, THE &ldquo;SERVICES&rdquo;), YOU AGREE TO BE BOUND BY
            THESE TERMS.
          </p>

          {SECTIONS.map(({ heading, body }) => (
            <div key={heading} className="mb-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">{heading}</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{body}</p>
            </div>
          ))}
        </div>

        <AppFooter className="mt-8" />
      </div>
    </div>
  )
}

const SECTIONS = [
  {
    heading: '1. Acceptance of Terms',
    body: 'These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User") and Weecks Productions, LLC dba LiveViral Media ("Company", "we", "us", or "our"). These Terms incorporate by reference our Universal Terms of Service, Website Services Agreement, and Privacy Policy found at liveviralmedia.com/legal.',
  },
  {
    heading: '2. Data Collection and Usage Consent',
    body: 'By using our Services, you grant express permission to Weecks Productions, LLC, LiveViral Media, and its authorized partners and affiliates to:\n\nAccess, See, and Collect: Any and all information provided through the app or website, including but not limited to Personal Information, Personally Identifiable Information (PII), and User-generated content.\n\nDevice Information: Technical data including unique device identifiers (Device IDs), IP addresses, operating system versions, and hardware specifications.\n\nStorage and Processing: Store, process, and utilize this data for service optimization, marketing, analytics, and third-party partner integrations as outlined in our Privacy Policy.\n\nPartner Sharing: Share this data with partners for the purpose of fulfilling service requirements, improving user experience, or delivering targeted content.',
  },
  {
    heading: '3. User Account and Security',
    body: 'If the Service requires an account, you are responsible for maintaining the confidentiality of your credentials. You are liable for all activities occurring under your account. You agree to notify us immediately of any unauthorized use.',
  },
  {
    heading: '4. Intellectual Property',
    body: 'All content, features, and functionality (including but not limited to software, code, graphics, and logos) are the exclusive property of Weecks Productions, LLC or its licensors. You are granted a limited, non-exclusive, non-transferable license to use the Service for its intended purpose. You may not reverse-engineer, decompile, or attempt to extract the source code of our applications.',
  },
  {
    heading: '5. Prohibited Conduct',
    body: 'You agree not to:\n\n• Use the Services for any illegal or unauthorized purpose.\n• Transmit viruses, malware, or any code of a destructive nature.\n• Attempt to bypass any security measures or rate limits.\n• Collect or harvest PII of other users.',
  },
  {
    heading: '6. Disclaimers and Limitation of Liability',
    body: '"As-Is" Basis: The Services are provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied.\n\nLiability: Weecks Productions, LLC and its agents, heirs, and assigns are not responsible for any damages, misuse, technical failures, or other liability claims resulting from use of this app. Weecks Productions, LLC builds and develops websites, apps, and software, but does not control what clients or users do once those are created.\n\nNo Guarantee: We do not guarantee that the Services will be uninterrupted, secure, or error-free.',
  },
  {
    heading: '7. Indemnification',
    body: 'You agree to indemnify and hold harmless Weecks Productions, LLC, its officers, and employees from any claims, damages, or expenses (including attorneys\' fees) arising from your use of the Services or your violation of these Terms.',
  },
  {
    heading: '8. Termination',
    body: 'We reserve the right to terminate or suspend your access to the Services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests.',
  },
  {
    heading: '9. Governing Law and Jurisdiction',
    body: 'This Agreement is governed by the laws of the State of Arizona. Any disputes shall be resolved exclusively in the state or federal courts located in Maricopa County, Arizona.',
  },
  {
    heading: '10. Contact Information',
    body: 'For legal inquiries or support, please contact:\nWeecks Productions, LLC dba LiveViral Media\nAttn: Legal Department\nPO Box #1702, Sun City, AZ 85372\nEmail: legal@liveviralmedia.com\nPhone: +1 (623) 850-3275',
  },
]
