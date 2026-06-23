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
        pathname === href ? 'text-white' : 'text-[#9090b0] hover:text-white'
      }`}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2e2e4a] bg-[#1a1a2e]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">⬛</span>
          <span className="grad-text">QR & Barcode</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLink('/', 'Home')}
          {session && navLink('/dashboard', 'Dashboard')}
          {session && navLink('/generate', 'Generate')}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <span className="text-sm text-[#9090b0]">
                Hi, <span className="text-white font-semibold">{session.user.name.split(' ')[0]}</span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-semibold px-4 py-2 rounded-lg border border-[#2e2e4a] text-[#9090b0] hover:text-white hover:border-[#6c63ff] transition-all"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-[#9090b0] hover:text-white transition-colors">
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-[#6c63ff] to-[#574fd6] text-white hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#9090b0] hover:text-white"
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
        <div className="md:hidden border-t border-[#2e2e4a] bg-[#1a1a2e] px-4 py-4 flex flex-col gap-4">
          {navLink('/', 'Home')}
          {session && navLink('/dashboard', 'Dashboard')}
          {session && navLink('/generate', 'Generate')}
          <div className="pt-2 border-t border-[#2e2e4a] flex flex-col gap-2">
            {session ? (
              <button
                onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false); }}
                className="text-sm font-semibold text-[#9090b0] hover:text-white text-left"
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
