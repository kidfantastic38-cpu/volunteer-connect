import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import { PrototypeProvider } from '@/components/prototype-store'
import { ToastProvider } from '@/components/toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VOLUNTEER CONNECT — Turn your experience into opportunity',
  description:
    'A career-readiness platform that transforms volunteering, internships, projects and achievements into structured skills, professional CVs, digital portfolios, and matched opportunities.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`bg-background ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <Script id="vc-theme" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("vc-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})();`}
        </Script>
        <PrototypeProvider>
          <ToastProvider>{children}</ToastProvider>
        </PrototypeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
