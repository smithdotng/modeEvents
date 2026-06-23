import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Mode Events',
  description: 'Create events, collect RSVPs, generate QR codes and personalised avatar cards.',
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
