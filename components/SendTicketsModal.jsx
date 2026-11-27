'use client';
import { useState } from 'react';

/**
 * Sends attendees their QR entry pass by email or WhatsApp.
 *
 * Email goes straight out from the server. WhatsApp cannot: wa.me links have
 * to be opened from the browser, one chat at a time, and browsers block a
 * burst of popups. So the WhatsApp flow hands back a list and the organiser
 * works down it — each name opens, gets marked done, and the list survives
 * a mis-click because nothing is lost by reopening one.
 */
export default function SendTicketsModal({ eventId, eventTitle, attendees, onClose }) {
  const [channel, setChannel] = useState(null);   // 'email' | 'whatsapp'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);     // email outcome
  const [contacts, setContacts] = useState(null); // whatsapp list
  const [done, setDone] = useState({});           // whatsapp: id -> true

  const ids = attendees.map(a => a._id);
  const withEmail = attendees.filter(a => a.email?.trim()).length;
  const withPhone = attendees.filter(a => a.phone?.trim()).length;
  const many = attendees.length > 1;

  async function send(ch) {
    setBusy(true); setError(''); setChannel(ch);
    try {
      const res = await fetch(`/api/events/${eventId}/send-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: ch, attendeeIds: ids }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setBusy(false); return; }
      if (ch === 'email') setResult(data); else setContacts(data);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  function openChat(c) {
    window.open(c.waUrl, '_blank', 'noopener');
    setDone(d => ({ ...d, [c.id]: true }));
  }

  const remaining = contacts ? contacts.contacts.filter(c => !done[c.id]) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-[#dddcd7] border border-[#c0bfb9] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#1c2410]">🎟 Send entry passes</h2>
              <p className="text-sm text-[#546048] mt-0.5">
                {many ? `${attendees.length} attendees` : attendees[0]?.name} · {eventTitle}
              </p>
            </div>
            <button onClick={onClose} className="text-[#546048] hover:text-[#1c2410] text-xl leading-none">✕</button>
          </div>

          {/* ── Channel choice ── */}
          {!result && !contacts && (
            <>
              <p className="text-sm text-[#546048] leading-relaxed">
                Each person gets their own QR code and a link to their pass. The
                QR is what the scanner reads at the door.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => send('email')}
                  disabled={busy || withEmail === 0}
                  className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-xl p-4 text-left hover:border-[#2a3b19] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="text-2xl mb-2">✉️</div>
                  <p className="font-bold text-[#1c2410]">Email</p>
                  <p className="text-xs text-[#546048] mt-0.5">
                    {withEmail === 0
                      ? 'Nobody here has an email address'
                      : `QR embedded in the message · ${withEmail} of ${attendees.length}`}
                  </p>
                </button>

                <button
                  onClick={() => send('whatsapp')}
                  disabled={busy || withPhone === 0}
                  className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-xl p-4 text-left hover:border-[#2a3b19] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="text-2xl mb-2">💬</div>
                  <p className="font-bold text-[#1c2410]">WhatsApp</p>
                  <p className="text-xs text-[#546048] mt-0.5">
                    {withPhone === 0
                      ? 'Nobody here has a phone number'
                      : `Link to their pass · ${withPhone} of ${attendees.length}`}
                  </p>
                </button>
              </div>

              {withEmail < attendees.length && withPhone > 0 && (
                <p className="text-xs text-[#546048] bg-[#e8e7e1] border border-[#c0bfb9] rounded-xl px-3 py-2 leading-relaxed">
                  {attendees.length - withEmail} of these attendees gave no email
                  address. Send those by WhatsApp.
                </p>
              )}

              {busy && <p className="text-sm text-[#546048]">Sending…</p>}
            </>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* ── Email result ── */}
          {result && (
            <div className="space-y-3">
              <div className="bg-[#7ab648]/10 border border-[#7ab648]/30 rounded-xl px-4 py-3">
                <p className="font-bold text-[#2a3b19]">✓ {result.sent} pass{result.sent === 1 ? '' : 'es'} emailed</p>
                {result.noEmail > 0 && (
                  <p className="text-sm text-[#546048] mt-1">
                    {result.noEmail} skipped — no email address. Send those by WhatsApp.
                  </p>
                )}
              </div>
              {result.errors?.length > 0 && (
                <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 space-y-1">
                  {result.errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
              <div className="flex gap-2">
                {result.noEmail > 0 && (
                  <button
                    onClick={() => { setResult(null); setChannel(null); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-[#c0bfb9] text-[#546048] hover:border-[#2a3b19] hover:text-[#2a3b19] transition-all"
                  >
                    Send the rest by WhatsApp
                  </button>
                )}
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#2a3b19] text-white hover:opacity-90 transition-opacity">
                  Done
                </button>
              </div>
            </div>
          )}

          {/* ── WhatsApp list ── */}
          {contacts && (
            <div className="space-y-3">
              <p className="text-sm text-[#546048] leading-relaxed">
                WhatsApp opens one chat at a time. Tap each name to open it with
                their pass link ready — then press send in WhatsApp.
              </p>

              <div className="flex items-center justify-between text-xs font-bold text-[#546048] uppercase tracking-widest">
                <span>{contacts.contacts.length - remaining.length} of {contacts.contacts.length} opened</span>
                {remaining.length > 0 && (
                  <button
                    onClick={() => openChat(remaining[0])}
                    className="text-[#2a3b19] hover:underline normal-case tracking-normal"
                  >
                    Open next →
                  </button>
                )}
              </div>

              <div className="border border-[#c0bfb9] rounded-xl divide-y divide-[#c0bfb9] max-h-72 overflow-y-auto">
                {contacts.contacts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openChat(c)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                      done[c.id] ? 'bg-[#7ab648]/10' : 'bg-[#f2f1eb] hover:bg-[#e8e7e1]'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#1c2410] truncate">{c.name}</span>
                      <span className="block text-xs text-[#546048]">{c.phone} · {c.ticketCode}</span>
                    </span>
                    <span className={`text-xs font-bold flex-shrink-0 ${done[c.id] ? 'text-[#7ab648]' : 'text-[#2a3b19]'}`}>
                      {done[c.id] ? '✓ opened' : 'Open →'}
                    </span>
                  </button>
                ))}
              </div>

              {contacts.noPhone > 0 && (
                <p className="text-xs text-[#546048]">
                  {contacts.noPhone} skipped — no phone number on file.
                </p>
              )}

              <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#2a3b19] text-white hover:opacity-90 transition-opacity">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
