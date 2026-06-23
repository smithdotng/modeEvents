'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ManageEventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${id}`).then(r => r.json()),
      fetch(`/api/events/${id}/attendees`).then(r => r.json()),
    ]).then(([ev, att]) => {
      setEvent(ev.event);
      setAttendees(att.attendees || []);
      setLoading(false);
    });
  }, [id]);

  async function toggleCheckin(attendeeId, current) {
    const res = await fetch(`/api/events/${id}/attendees`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendeeId, checkedIn: !current }),
    });
    const { attendee } = await res.json();
    setAttendees(prev => prev.map(a => a._id === attendeeId ? { ...a, checkedIn: attendee.checkedIn } : a));
  }

  function downloadCSV() {
    const rows = [['Name', 'Email', 'Phone', 'Ticket Code', 'Checked In', 'Registered']];
    attendees.forEach(a => rows.push([a.name, a.email, a.phone, a.ticketCode, a.checkedIn ? 'Yes' : 'No', new Date(a.createdAt).toLocaleString()]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${event?.uniqueCode}.csv`;
    a.click();
  }

  const publicURL = typeof window !== 'undefined' ? `${window.location.origin}/e/${event?.uniqueCode}` : '';
  const filtered = attendees.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );
  const checkedIn = attendees.filter(a => a.checkedIn).length;

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="h-8 w-64 bg-[#f2f1eb] rounded-xl animate-pulse mb-4" />
      <div className="h-48 bg-[#f2f1eb] rounded-2xl animate-pulse" />
    </div>
  );

  if (!event) return <div className="text-center py-20 text-[#546048]">Event not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <Link href="/events" className="text-sm text-[#546048] hover:text-[#2a3b19] mb-2 inline-block">← My Events</Link>
          <h1 className="text-2xl font-extrabold text-[#1c2410]">{event.title}</h1>
          <p className="text-[#546048] text-sm mt-1">
            {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {event.venue && ` · ${event.venue}`}
          </p>
        </div>
        <Link
          href={`/e/${event.uniqueCode}`}
          target="_blank"
          className="px-5 py-2.5 rounded-xl font-bold text-sm border border-[#2a3b19] text-[#2a3b19] hover:bg-[#2a3b19] hover:text-white transition-all whitespace-nowrap"
        >
          View public page ↗
        </Link>
      </div>

      {/* Share box */}
      <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-5 mb-6">
        <p className="text-xs font-bold text-[#546048] uppercase tracking-widest mb-3">Share this event</p>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-0 flex items-center gap-2 bg-[#e8e7e1] rounded-xl px-4 py-2 border border-[#c0bfb9]">
            <span className="text-sm font-mono text-[#2a3b19] font-bold">{event.uniqueCode}</span>
            <span className="text-[#546048] text-xs truncate hidden sm:block">{publicURL}</span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(publicURL)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-[#2a3b19] text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Copy link
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'RSVPs', value: attendees.length, color: 'text-white' },
          { label: 'Checked in', value: checkedIn, color: 'text-green-400' },
          { label: 'Capacity', value: event.capacity || '∞', color: 'text-[#546048]' },
          { label: 'With photos', value: attendees.filter(a => a.photo).length, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-xl p-4">
            <p className="text-xs text-[#546048] mb-1">{s.label}</p>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['overview', 'attendees', 'avatars'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === t ? 'bg-[#2a3b19] text-[#1c2410]' : 'bg-[#f2f1eb] border border-[#c0bfb9] text-[#546048] hover:text-white'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-6 space-y-4">
          {event.description && <p className="text-[#546048]">{event.description}</p>}
          {event.address && <p className="text-sm text-[#546048]">📍 {event.address}</p>}
          {event.coverImage && (
            <img src={event.coverImage} alt="cover" className="w-full rounded-xl object-cover max-h-64" />
          )}
          {event.frameImage && (
            <div>
              <p className="text-xs font-bold text-[#546048] uppercase tracking-widest mb-2">Avatar frame</p>
              <img src={event.frameImage} alt="frame" className="w-48 rounded-xl" />
            </div>
          )}
        </div>
      )}

      {/* ── Attendees ── */}
      {tab === 'attendees' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1"
            />
            <button
              onClick={downloadCSV}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-[#c0bfb9] text-[#546048] hover:text-[#2a3b19] hover:border-[#2a3b19] transition-all whitespace-nowrap"
            >
              ⬇ CSV
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#546048]">No attendees yet.</div>
          ) : (
            <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#c0bfb9]">
                    {['Name', 'Email', 'Phone', 'Ticket', 'Check-in'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#546048] uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a._id} className="border-b border-[#c0bfb9] last:border-0 hover:bg-[#e8e7e1] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#1c2410]">{a.name}</td>
                      <td className="px-4 py-3 text-[#546048]">{a.email}</td>
                      <td className="px-4 py-3 text-[#546048]">{a.phone || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#2a3b19]">{a.ticketCode}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleCheckin(a._id, a.checkedIn)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            a.checkedIn
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-[#e8e7e1] text-[#546048] border border-[#c0bfb9] hover:border-green-500/30'
                          }`}
                        >
                          {a.checkedIn ? '✓ In' : 'Mark in'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Avatars ── */}
      {tab === 'avatars' && (
        <div>
          {attendees.filter(a => a.compositeImage).length === 0 ? (
            <div className="text-center py-12 text-[#546048]">No avatar cards generated yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {attendees.filter(a => a.compositeImage).map(a => (
                <div key={a._id} className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-xl overflow-hidden">
                  <img src={a.compositeImage} alt={a.name} className="w-full object-cover" />
                  <div className="p-2">
                    <p className="text-xs font-semibold text-[#1c2410] truncate">{a.name}</p>
                    <a
                      href={a.compositeImage}
                      download={`${a.name}-card.png`}
                      className="text-xs text-[#2a3b19] hover:underline"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
