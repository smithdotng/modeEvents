import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Mode Events',
    template: '%s | Mode Events',
  },
  description: 'Create events, collect RSVPs, generate QR codes and personalised avatar cards.',
  openGraph: {
    siteName: 'Mode Events',
    type: 'website',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Mode Events' }],
  },
  twitter: {
    card: 'summary',
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
