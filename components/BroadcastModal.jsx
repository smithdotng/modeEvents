'use client';
import { useState } from 'react';

export default function BroadcastModal({ eventId, eventTitle, attendeeCount, onClose }) {
  const [channel, setChannel] = useState('email');
  const [subject, setSubject] = useState(`Update about ${eventTitle}`);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);   // { sent, errors } or { error }
  const [waLinks, setWaLinks] = useState(null); // [{ name, url }]

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    setWaLinks(null);

    const res = await fetch(`/api/events/${eventId}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, subject, message }),
    });
    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setResult({ error: data.error });
      return;
    }

    if (channel === 'whatsapp') {
      setWaLinks((data.contacts || []).map(c => ({
        name: c.name,
        url: `https://wa.me/${c.phone}?text=${encodeURIComponent(message)}`,
      })));
    } else {
      setResult(data);
    }
  }

  function reset() { setResult(null); setWaLinks(null); setMessage(''); }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#c0bfb9] flex-shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-[#1c2410]">Broadcast Message</h2>
            <p className="text-xs text-[#546048] mt-0.5">To all <strong className="text-[#2a3b19]">{attendeeCount}</strong> attendees</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-[#546048] hover:bg-[#e8e7e1] hover:text-[#1c2410] transition-all text-lg">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">

          {/* WA links result */}
          {waLinks ? (
            <div className="space-y-3">
              {waLinks.length === 0 ? (
                <div className="text-center py-8 text-[#546048]">
                  <p className="text-4xl mb-2">📵</p>
                  <p>No attendees have phone numbers on file.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#546048]">
                    Click each link to open WhatsApp for that attendee. Your message is pre-filled.
                  </p>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {waLinks.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#e8e7e1] border border-[#c0bfb9] hover:border-[#2a3b19] transition-all group"
                      >
                        <span className="text-sm font-semibold text-[#1c2410]">{l.name}</span>
                        <span className="text-xs text-[#7ab648] font-bold group-hover:underline">Open WA ↗</span>
                      </a>
                    ))}
                  </div>
                </>
              )}
              <button onClick={reset} className="w-full py-2.5 rounded-xl text-sm font-bold border border-[#c0bfb9] text-[#546048] hover:border-[#2a3b19] transition-all mt-2">
                ← Compose another
              </button>
            </div>

          ) : result ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-5xl">{result.error ? '❌' : '✅'}</div>
              <p className="font-extrabold text-lg text-[#1c2410]">
                {result.error || `Sent to ${result.sent} attendees`}
              </p>
              {result.errors?.length > 0 && (
                <p className="text-xs text-red-400">{result.errors[0]}</p>
              )}
              <button onClick={reset} className="px-6 py-2.5 rounded-xl text-sm font-bold border border-[#c0bfb9] text-[#546048] hover:border-[#2a3b19] transition-all">
                Send another
              </button>
            </div>

          ) : (
            <div className="space-y-4">
              {/* Channel */}
              <div className="flex gap-2 p-1 bg-[#e8e7e1] rounded-xl border border-[#c0bfb9]">
                {[
                  { id: 'email', label: '✉️ Email' },
                  { id: 'whatsapp', label: '💬 WhatsApp' },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setChannel(c.id)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${channel === c.id ? 'bg-[#2a3b19] text-white shadow-sm' : 'text-[#546048] hover:text-[#1c2410]'}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Subject (email only) */}
              {channel === 'email' && (
                <div>
                  <label className="block text-xs font-bold text-[#546048] uppercase tracking-widest mb-1.5">Subject</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject…" />
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-[#546048] uppercase tracking-widest mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  placeholder={channel === 'whatsapp'
                    ? `Hi! Just a reminder about ${eventTitle}.\n\nLooking forward to seeing you there! 🎉`
                    : `Write your message here…`}
                  className="w-full resize-none"
                />
              </div>

              {channel === 'whatsapp' && (
                <p className="text-xs text-[#546048] bg-[#e8e7e1] rounded-xl px-4 py-3 border border-[#c0bfb9] leading-relaxed">
                  💡 WhatsApp links will open for each attendee who has a phone number. You send each message individually from your WhatsApp.
                </p>
              )}

              <button
                onClick={handleSend}
                disabled={sending || !message.trim() || (channel === 'email' && !subject.trim())}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending…' : channel === 'email' ? `Send to ${attendeeCount} attendees` : `Generate ${attendeeCount} WhatsApp links`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
