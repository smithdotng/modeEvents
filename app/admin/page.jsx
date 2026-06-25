'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function isSuperadmin(session) {
  if (!session?.user) return false;
  // Primary: role stored in DB/JWT
  if (session.user.role === 'superadmin') return true;
  // Legacy fallback: NEXT_PUBLIC_ADMIN_EMAIL env var
  const envEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return envEmails.includes(session.user.email?.toLowerCase());
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | featured | published | draft

  // Redirect if not superadmin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.replace('/login'); return; }
    if (!isSuperadmin(session)) router.replace('/dashboard');
  }, [session, status, router]);

  useEffect(() => {
    if (!session) return;
    fetch('/api/admin/events')
      .then(r => r.json())
      .then(d => { setEvents(d.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  async function toggleFeatured(eventId, current) {
    const res = await fetch(`/api/admin/events/${eventId}/feature`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !current }),
    });
    if (res.ok) {
      setEvents(evs => evs.map(ev =>
        ev._id === eventId ? { ...ev, featured: !current } : ev
      ));
    }
  }

  const filtered = events.filter(ev => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || ev.title?.toLowerCase().includes(q)
      || ev.host?.name?.toLowerCase().includes(q)
      || ev.host?.email?.toLowerCase().includes(q);
    const matchFilter =
      filter === 'all'
      || (filter === 'featured' && ev.featured)
      || (filter === 'published' && ev.status === 'published')
      || (filter === 'draft' && ev.status === 'draft');
    return matchSearch && matchFilter;
  });

  const stats = {
    total: events.length,
    featured: events.filter(e => e.featured).length,
    published: events.filter(e => e.status === 'published').length,
    totalAttendees: events.reduce((s, e) => s + (e.attendeeCount || 0), 0),
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#546048] animate-pulse">Loading admin panel…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dddcd7]">

      {/* Admin header bar */}
      <div className="bg-[#1c2410] text-[#dddcd7] px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7a9268]">Superadmin</p>
              <span className="bg-[#2a3b19] text-[#7ab648] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                ★ Control Centre
              </span>
            </div>
            <h1 className="text-xl font-extrabold">Mode Events</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#7a9268]">
            Signed in as <span className="text-[#dddcd7] font-semibold">{session?.user?.name?.split(' ')[0]}</span>
          </span>
          <Link href="/dashboard" className="text-sm text-[#7a9268] hover:text-[#dddcd7] transition-colors border border-[#2a3b19] px-3 py-1.5 rounded-lg hover:border-[#546048]">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: stats.total, icon: '📅' },
            { label: 'Featured', value: stats.featured, icon: '⭐' },
            { label: 'Published', value: stats.published, icon: '✅' },
            { label: 'Total RSVPs', value: stats.totalAttendees, icon: '👥' },
          ].map(s => (
            <div key={s.label} className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl font-extrabold text-[#1c2410]">{s.value}</div>
              <div className="text-xs text-[#546048] font-semibold uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {['all', 'featured', 'published', 'draft'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                  filter === f
                    ? 'bg-[#2a3b19] text-white'
                    : 'border border-[#c0bfb9] text-[#546048] hover:border-[#2a3b19] hover:text-[#2a3b19]'
                }`}
              >
                {f === 'all' ? `All (${stats.total})` : f === 'featured' ? `⭐ Featured (${stats.featured})` : f}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events or hosts…"
            className="w-full sm:w-64"
          />
        </div>

        {/* Events table */}
        <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#c0bfb9] flex items-center justify-between">
            <h2 className="font-extrabold text-[#1c2410]">All Events ({filtered.length})</h2>
            <p className="text-xs text-[#546048]">⭐ = featured on landing page</p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#c0bfb9] bg-[#e8e7e1]">
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#546048] uppercase tracking-wider">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#546048] uppercase tracking-wider">Host</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#546048] uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#546048] uppercase tracking-wider">RSVPs</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#546048] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#546048] uppercase tracking-wider">Featured</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#546048] uppercase tracking-wider">View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) => (
                  <tr key={ev._id} className={`border-b border-[#c0bfb9] transition-colors hover:bg-[#e8e7e1] ${i % 2 === 0 ? '' : 'bg-[#f8f7f3]'}`}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#1c2410] leading-tight">{ev.title}</div>
                      <div className="text-xs text-[#546048] mt-0.5">{ev.uniqueCode}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[#1c2410]">{ev.host?.name || '—'}</div>
                      <div className="text-xs text-[#546048]">{ev.host?.email || ''}</div>
                    </td>
                    <td className="px-4 py-4 text-[#546048] whitespace-nowrap">
                      {ev.date ? new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-[#1c2410]">{ev.attendeeCount || 0}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        ev.status === 'published' ? 'bg-green-100 text-green-700'
                        : ev.status === 'cancelled' ? 'bg-red-100 text-red-600'
                        : 'bg-[#e8e7e1] text-[#546048]'
                      }`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleFeatured(ev._id, ev.featured)}
                        title={ev.featured ? 'Remove from featured' : 'Add to featured'}
                        className={`text-2xl transition-transform hover:scale-110 ${ev.featured ? 'opacity-100' : 'opacity-25 hover:opacity-60'}`}
                      >
                        ⭐
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link
                        href={`/events/${ev._id}`}
                        className="text-xs font-semibold text-[#2a3b19] hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-[#546048]">
                      No events match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[#c0bfb9]">
            {filtered.map(ev => (
              <div key={ev._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#1c2410] leading-tight">{ev.title}</p>
                    <p className="text-xs text-[#546048]">{ev.uniqueCode}</p>
                  </div>
                  <button
                    onClick={() => toggleFeatured(ev._id, ev.featured)}
                    className={`text-2xl flex-shrink-0 transition-transform hover:scale-110 ${ev.featured ? 'opacity-100' : 'opacity-25'}`}
                  >
                    ⭐
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#546048]">
                  <span>👤 {ev.host?.name || '—'}</span>
                  <span>👥 {ev.attendeeCount || 0} RSVPs</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    ev.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-[#e8e7e1] text-[#546048]'
                  }`}>{ev.status}</span>
                </div>
                <Link href={`/events/${ev._id}`} className="text-xs font-semibold text-[#2a3b19] hover:underline">
                  Manage event →
                </Link>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-[#546048]">No events match your search.</div>
            )}
          </div>
        </div>

        <p className="text-xs text-center text-[#546048]">
          Admin access is controlled via the <code className="bg-[#e8e7e1] px-1 rounded">ADMIN_EMAIL</code> environment variable.
        </p>
      </div>
    </div>
  );
}
