'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (href, label) => (
    <Link
      href={href}
      className={`text-sm font-semibold transition-colors ${
        pathname === href ? 'text-[#1c2410]' : 'text-[#546048] hover:text-[#2a3b19]'
      }`}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-[#c0bfb9] bg-[#f2f1eb]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Mode Events" className="h-9 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLink('/', 'Home')}
          {session && navLink('/dashboard', 'Dashboard')}
          {session && navLink('/generate', 'Generate')}
          {session && navLink('/events', 'Events')}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <span className="text-sm text-[#546048]">
                Hi, <span className="text-[#1c2410] font-semibold">{session.user.name.split(' ')[0]}</span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-semibold px-4 py-2 rounded-lg border border-[#c0bfb9] text-[#546048] hover:text-[#2a3b19] hover:border-[#2a3b19] transition-all"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-[#546048] hover:text-[#2a3b19] transition-colors">
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] text-white hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#546048] hover:text-[#2a3b19]"
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
        <div className="md:hidden border-t border-[#c0bfb9] bg-[#f2f1eb] px-4 py-4 flex flex-col gap-4">
          {navLink('/', 'Home')}
          {session && navLink('/dashboard', 'Dashboard')}
          {session && navLink('/generate', 'Generate')}
          {session && navLink('/events', 'Events')}
          <div className="pt-2 border-t border-[#c0bfb9] flex flex-col gap-2">
            {session ? (
              <button
                onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false); }}
                className="text-sm font-semibold text-[#546048] hover:text-[#2a3b19] text-left"
              >
                Sign out
              </button>
            ) : (
              <>
                {navLink('/login', 'Log in')}
                {navLink('/register', 'Get started')}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
