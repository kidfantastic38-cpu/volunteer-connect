import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google'
import Script from 'next/script'
import { PrototypeProvider } from '@/components/prototype-store'
import { ToastProvider } from '@/components/toast'
import './globals.css'

const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans', display: 'swap' })
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Volunteer Connect — Sierra Leone',
  description:
    'A record of volunteering, study, and projects for young people in Sierra Leone — used to apply for jobs, internships, scholarships, and training.',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#1c2420" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`bg-background ${sourceSans.variable} ${sourceSerif.variable}`}>
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
