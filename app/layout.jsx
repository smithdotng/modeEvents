import './globals.css';
import Script from 'next/script';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import GSAPInit from '@/components/GSAPInit';
import CustomCursor from '@/components/CustomCursor';

const SITE_URL = 'https://www.mode-events.space';

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || SITE_URL),
  title: {
    default: 'Mode Events',
    template: '%s | Mode Events',
  },
  description: 'Create events, collect RSVPs, generate QR codes and personalised avatar cards.',
  openGraph: {
    siteName: 'Mode Events',
    type: 'website',
    url: SITE_URL,
    images: [{
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
      alt: 'Mode Events',
    }],
  },
  twitter: {
    card: 'summary',
    site: '@modeevents',
    images: [`${SITE_URL}/logo.png`],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* ── GSAP core + plugins (served from /public/js) ── */}
        {/*
          afterInteractive = scripts load after React hydrates.
          This prevents GSAP touching window/body before hydration
          and causing the "Extra attributes from server: style" warning.
          GSAPInit waits for window.gsap via a retry loop so the
          later load time is handled gracefully.
        */}
        <Script src="/js/gsap.min.js"          strategy="afterInteractive" />
        <Script src="/js/ScrollTrigger.min.js" strategy="afterInteractive" />
        <Script src="/js/ScrollTo.min.js"      strategy="afterInteractive" />

        {/* ── Scroll progress track (right-edge bar, matches SAFacilities) ── */}
        <div className="me-progress-track" aria-hidden="true">
          <div className="me-progress" />
        </div>

        {/* ── Custom cursor ── */}
        <CustomCursor />

        <Providers>
          {/* ── GSAP animation initialiser (re-fires on every route change) ── */}
          <GSAPInit />
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
