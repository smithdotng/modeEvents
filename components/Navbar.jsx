'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function userIsAdmin(session) {
  if (!session?.user) return false;
  // Role stored in JWT (DB-backed)
  if (session.user.role === 'superadmin') return true;
  // Legacy env-var fallback
  const envEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return envEmails.includes(session.user.email?.toLowerCase());
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // On the landing page use the dark-glass variant; elsewhere use the warm variant
  const isHome = pathname === '/';
  const navBg = isHome
    ? 'bg-[#1c2410]/80 border-[#2a3b19]'
    : 'bg-[#f2f1eb]/90 border-[#c0bfb9]';
  // mix-blend-lighten: on dark bg the logo's dark-green square vanishes,
  // leaving only the warm-grey emblem visible. No filter needed on light bg.
  const logoFilter = isHome ? 'mix-blend-lighten' : '';
  const textBase = isHome ? 'text-[#7a9268] hover:text-[#dddcd7]' : 'text-[#546048] hover:text-[#2a3b19]';
  const textActive = isHome ? 'text-[#dddcd7]' : 'text-[#1c2410]';

  const admin = userIsAdmin(session);

  const navLink = (href, label) => (
    <Link
      href={href}
      className={`text-sm font-semibold transition-colors ${
        pathname === href ? textActive : textBase
      }`}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <nav className={`sticky top-0 z-50 border-b ${navBg} backdrop-blur-md transition-colors`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <img
            src="/logo.png"
            alt="Mode Events"
            className={`h-9 w-auto transition-all ${logoFilter}`}
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {!session && navLink('/', 'Home')}
          {session && navLink('/dashboard', 'Dashboard')}
          {session && navLink('/events', 'Events')}
          {session && navLink('/generate', 'Generate')}
          {admin && navLink('/admin', '⚙ Admin')}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <span className={`text-sm ${isHome ? 'text-[#7a9268]' : 'text-[#546048]'}`}>
                Hi,{' '}
                <span className={`font-semibold ${isHome ? 'text-[#dddcd7]' : 'text-[#1c2410]'}`}>
                  {session.user.name.split(' ')[0]}
                </span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-all ${
                  isHome
                    ? 'border-[#3d5a23] text-[#7a9268] hover:border-[#dddcd7] hover:text-[#dddcd7]'
                    : 'border-[#c0bfb9] text-[#546048] hover:text-[#2a3b19] hover:border-[#2a3b19]'
                }`}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-semibold transition-colors ${textBase}`}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                  isHome
                    ? 'bg-[#dddcd7] text-[#1c2410] hover:bg-white'
                    : 'bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] text-white hover:opacity-90'
                }`}
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden ${isHome ? 'text-[#7a9268] hover:text-[#dddcd7]' : 'text-[#546048] hover:text-[#2a3b19]'}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`md:hidden border-t ${isHome ? 'border-[#2a3b19] bg-[#1c2410]' : 'border-[#c0bfb9] bg-[#f2f1eb]'} px-4 py-4 flex flex-col gap-4`}>
          {!session && navLink('/', 'Home')}
          {session && navLink('/dashboard', 'Dashboard')}
          {session && navLink('/events', 'Events')}
          {session && navLink('/generate', 'Generate')}
          {admin && navLink('/admin', '⚙ Admin')}
          <div className={`pt-2 border-t ${isHome ? 'border-[#2a3b19]' : 'border-[#c0bfb9]'} flex flex-col gap-2`}>
            {session ? (
              <button
                onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false); }}
                className={`text-sm font-semibold text-left ${textBase}`}
              >
                Sign out
              </button>
            ) : (
              <>
                {navLink('/login', 'Log in')}
                {navLink('/register', 'Get started free')}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
