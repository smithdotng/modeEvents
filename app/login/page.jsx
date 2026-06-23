'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="text-3xl">⬛</Link>
          <h1 className="text-2xl font-extrabold text-[#1c2410] mt-3">Welcome back</h1>
          <p className="text-[#546048] mt-1 text-sm">Log in to your account</p>
        </div>

        <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div>
              <label>Email address</label>
              <input
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-[#546048] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#2a3b19] hover:underline font-semibold">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
