'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Registration failed.');
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="text-3xl">⬛</Link>
          <h1 className="text-2xl font-extrabold text-[#1c2410] mt-3">Create your account</h1>
          <p className="text-[#546048] mt-1 text-sm">Free forever. No credit card needed.</p>
        </div>

        <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div>
              <label>Full name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={set('name')}
                required
                autoComplete="name"
              />
            </div>

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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label>Confirm password</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={set('confirm')}
                required
                autoComplete="new-password"
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#546048] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2a3b19] hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
