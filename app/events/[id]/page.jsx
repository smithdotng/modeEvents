'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import BroadcastModal from '@/components/BroadcastModal';
import MessageModal from '@/components/MessageModal';

// Dynamically import scanner (uses camera/jsQR — no SSR needed)
const QRScanner = dynamic(() => import('@/components/QRScanner'), { ssr: false });

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'attendees', label: 'Attendees' },
  { id: 'scan',      label: '📷 Scanner' },
  { id: 'message',   label: '✉️ Message' },
  { id: 'avatars',   label: 'Cards' },
];

export default function ManageEventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');

  // Modals
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [messageTarget, setMessageTarget] = useState(null); // attendee object

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

  // Called by QRScanner when a ticket is successfully checked in
  function handleScanCheckin(updatedAttendee) {
    setAttendees(prev => prev.map(a =>
      a._id === updatedAttendee._id ? { ...a, checkedIn: true } : a
    ));
  }

  function downloadCSV() {
    const rows = [['Name', 'Email', 'Phone', 'Ticket Code', 'Checked In', 'Registered']];
    attendees.forEach(a => rows.push([
      a.name, a.email, a.phone || '', a.ticketCode,
      a.checkedIn ? 'Yes' : 'No',
      new Date(a.createdAt).toLocaleString(),
    ]));
    const blob = new Blob([rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `attendees-${event?.uniqueCode}.csv`; link.click();
    URL.revokeObjectURL(url);
  }

  const publicURL = typeof window !== 'undefined' ? `${window.location.origin}/e/${event?.uniqueCode}` : '';
  const filtered = attendees.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.ticketCode.toLowerCase().includes(search.toLowerCase())
  );
  const checkedIn = attendees.filter(a => a.checkedIn).length;

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <div className="h-8 w-64 bg-[#f2f1eb] rounded-xl animate-pulse" />
      <div className="h-48 bg-[#f2f1eb] rounded-2xl animate-pulse" />
    </div>
  );

  if (!event) return <div className="text-center py-20 text-[#546048]">Event not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <Link href="/events" className="text-sm text-[#546048] hover:text-[#2a3b19] mb-2 inline-flex items-center gap-1">
            ← My Events
          </Link>
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
        <p className="text-xs font-bold text-[#546048] uppercase tracking-widest mb-3">Invite link</p>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-0 flex items-center gap-2 bg-[#e8e7e1] rounded-xl px-4 py-2 border border-[#c0bfb9]">
            <span className="text-sm font-mono text-[#2a3b19] font-bold flex-shrink-0">{event.uniqueCode}</span>
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
          { label: 'Total RSVPs', value: attendees.length, color: 'text-[#1c2410]' },
          { label: 'Checked in', value: checkedIn, color: 'text-[#7ab648]' },
          { label: 'Remaining', value: attendees.length - checkedIn, color: 'text-[#546048]' },
          { label: 'With photos', value: attendees.filter(a => a.photo).length, color: 'text-[#2a3b19]' },
        ].map(s => (
          <div key={s.label} className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-xl p-4">
            <p className="text-xs text-[#546048] mb-1">{s.label}</p>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === t.id
                ? 'bg-[#2a3b19] text-white'
                : 'bg-[#f2f1eb] border border-[#c0bfb9] text-[#546048] hover:text-[#2a3b19] hover:border-[#2a3b19]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-6 space-y-5">
          {event.description && <p className="text-[#546048] leading-relaxed">{event.description}</p>}
          {event.address && <p className="text-sm text-[#546048]">📍 {event.address}</p>}
          {event.coverImage && (
            <div>
              <p className="text-xs font-bold text-[#546048] uppercase tracking-widest mb-2">Cover</p>
              <img src={event.coverImage} alt="cover" className="w-full rounded-xl object-cover aspect-square max-w-sm" />
            </div>
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
          <div className="flex gap-3 flex-wrap">
            <input
              placeholder="Search name, email or ticket…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-48"
            />
            <button
              onClick={downloadCSV}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-[#c0bfb9] text-[#546048] hover:text-[#2a3b19] hover:border-[#2a3b19] transition-all whitespace-nowrap"
            >
              ⬇ Export CSV
            </button>
            <button
              onClick={() => setShowBroadcast(true)}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-[#2a3b19] text-white hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              📣 Broadcast
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#546048]">
              {attendees.length === 0 ? 'No RSVPs yet.' : 'No results found.'}
            </div>
          ) : (
            <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl overflow-hidden">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#c0bfb9] bg-[#e8e7e1]">
                      {['Name', 'Email', 'Phone', 'Ticket', 'Reg.', 'Check-in', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#546048] uppercase tracking-widest first:pl-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a._id} className="border-b border-[#c0bfb9] last:border-0 hover:bg-[#e8e7e1] transition-colors">
                        <td className="px-4 py-3 font-semibold text-[#1c2410] pl-5 whitespace-nowrap">{a.name}</td>
                        <td className="px-4 py-3 text-[#546048] max-w-[200px] truncate">{a.email}</td>
                        <td className="px-4 py-3 text-[#546048] whitespace-nowrap">{a.phone || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#2a3b19] whitespace-nowrap">{a.ticketCode}</td>
                        <td className="px-4 py-3 text-xs text-[#546048] whitespace-nowrap">
                          {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleCheckin(a._id, a.checkedIn)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                              a.checkedIn
                                ? 'bg-[#7ab648]/20 text-[#7ab648] border border-[#7ab648]/30'
                                : 'bg-[#e8e7e1] text-[#546048] border border-[#c0bfb9] hover:border-[#7ab648]/50'
                            }`}
                          >
                            {a.checkedIn ? '✓ Checked in' : 'Mark in'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setMessageTarget(a)}
                            title="Send message"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#c0bfb9] text-[#546048] hover:text-[#2a3b19] hover:border-[#2a3b19] transition-all whitespace-nowrap"
                          >
                            ✉️ Message
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[#c0bfb9]">
                {filtered.map(a => (
                  <div key={a._id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1c2410] truncate">{a.name}</p>
                        <p className="text-xs text-[#546048] truncate">{a.email}</p>
                        {a.phone && <p className="text-xs text-[#546048]">{a.phone}</p>}
                      </div>
                      <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-bold ${
                        a.checkedIn ? 'bg-[#7ab648]/20 text-[#7ab648]' : 'bg-[#e8e7e1] text-[#546048]'
                      }`}>
                        {a.checkedIn ? '✓ In' : 'Pending'}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-[#2a3b19]">{a.ticketCode}</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => toggleCheckin(a._id, a.checkedIn)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold border border-[#c0bfb9] text-[#546048] hover:border-[#7ab648] transition-all"
                      >
                        {a.checkedIn ? 'Undo check-in' : 'Check in'}
                      </button>
                      <button
                        onClick={() => setMessageTarget(a)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold border border-[#c0bfb9] text-[#546048] hover:border-[#2a3b19] transition-all"
                      >
                        ✉️ Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-[#546048] text-right">
            {filtered.length} of {attendees.length} attendees
          </p>
        </div>
      )}

      {/* ── QR Scanner ── */}
      {tab === 'scan' && (
        <div className="space-y-4">
          <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-5">
            <h2 className="font-extrabold text-[#1c2410] mb-1">QR Check-in Scanner</h2>
            <p className="text-sm text-[#546048]">
              Scan attendees&apos; QR tickets to check them in. The guest list updates automatically.
            </p>
          </div>
          <QRScanner eventId={id} onCheckin={handleScanCheckin} />

          {/* Recent check-ins */}
          {attendees.filter(a => a.checkedIn).length > 0 && (
            <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl overflow-hidden mt-6">
              <div className="px-5 py-3 border-b border-[#c0bfb9] bg-[#e8e7e1]">
                <p className="text-xs font-bold text-[#546048] uppercase tracking-widest">
                  Checked in · {checkedIn} of {attendees.length}
                </p>
              </div>
              <div className="divide-y divide-[#c0bfb9] max-h-72 overflow-y-auto">
                {attendees.filter(a => a.checkedIn).map(a => (
                  <div key={a._id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1c2410]">{a.name}</p>
                      <p className="text-xs font-mono text-[#546048]">{a.ticketCode}</p>
                    </div>
                    <span className="text-[#7ab648] text-lg">✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Message / Broadcast ── */}
      {tab === 'message' && (
        <div className="space-y-4">
          <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-5">
            <h2 className="font-extrabold text-[#1c2410] mb-1">Message Attendees</h2>
            <p className="text-sm text-[#546048]">
              Send an email or WhatsApp message to all {attendees.length} attendees, or pick someone specific from the Attendees tab.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Broadcast card */}
            <button
              onClick={() => setShowBroadcast(true)}
              disabled={attendees.length === 0}
              className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-6 text-left hover:border-[#2a3b19] transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <div className="text-3xl mb-3">📣</div>
              <h3 className="font-extrabold text-[#1c2410] mb-1 group-hover:text-[#2a3b19] transition-colors">Broadcast to all</h3>
              <p className="text-sm text-[#546048]">
                Send an email or WhatsApp to all {attendees.length} attendees at once.
              </p>
            </button>

            {/* Individual — nudge to Attendees tab */}
            <button
              onClick={() => setTab('attendees')}
              className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-6 text-left hover:border-[#2a3b19] transition-all group"
            >
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-extrabold text-[#1c2410] mb-1 group-hover:text-[#2a3b19] transition-colors">Individual message</h3>
              <p className="text-sm text-[#546048]">
                Go to the Attendees tab and click ✉️ Message next to any guest.
              </p>
            </button>
          </div>

          {attendees.length === 0 && (
            <p className="text-center text-sm text-[#546048] py-4">No attendees yet — share your event link to get RSVPs.</p>
          )}
        </div>
      )}

      {/* ── Avatars / Cards ── */}
      {tab === 'avatars' && (
        <div>
          {attendees.filter(a => a.compositeImage).length === 0 ? (
            <div className="text-center py-16 text-[#546048]">
              <p className="text-4xl mb-3">🖼</p>
              <p>No avatar cards yet. They appear here once guests upload photos during RSVP.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {attendees.filter(a => a.compositeImage).map(a => (
                <div key={a._id} className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-xl overflow-hidden hover:border-[#2a3b19] transition-all">
                  <img src={a.compositeImage} alt={a.name} className="w-full object-cover aspect-square" />
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-semibold text-[#1c2410] truncate">{a.name}</p>
                    <div className="flex gap-2">
                      <a
                        href={a.compositeImage}
                        download={`${a.name.replace(/\s+/g, '-')}-card.png`}
                        className="text-xs text-[#2a3b19] font-semibold hover:underline"
                      >
                        ⬇ Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showBroadcast && (
        <BroadcastModal
          eventId={id}
          eventTitle={event.title}
          attendeeCount={attendees.length}
          onClose={() => setShowBroadcast(false)}
        />
      )}
      {messageTarget && (
        <MessageModal
          eventId={id}
          eventTitle={event.title}
          attendee={messageTarget}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  );
}
