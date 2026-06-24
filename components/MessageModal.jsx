'use client';
import { useState } from 'react';

export default function MessageModal({ eventId, eventTitle, attendee, onClose }) {
  const hasPhone = !!attendee?.phone?.trim();
  const [channel, setChannel] = useState(hasPhone ? 'whatsapp' : 'email');
  const [subject, setSubject] = useState(`About ${eventTitle}`);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [waUrl, setWaUrl] = useState('');
  const [error, setError] = useState('');

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError('');

    const res = await fetch(`/api/events/${eventId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendeeId: attendee._id, channel, subject, message }),
    });
    const data = await res.json();
    setSending(false);

    if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
    if (data.waUrl) { setWaUrl(data.waUrl); }
    else { setDone(true); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl w-full max-w-md shadow-xl">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#c0bfb9]">
          <div>
            <h2 className="text-lg font-extrabold text-[#1c2410]">Message {attendee.name}</h2>
            <p className="text-xs text-[#546048] mt-0.5">
              {attendee.email}{hasPhone && ` · ${attendee.phone}`}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-[#546048] hover:bg-[#e8e7e1] hover:text-[#1c2410] transition-all text-lg flex-shrink-0">✕</button>
        </div>

        <div className="p-6">
          {done ? (
            <div className="text-center py-6 space-y-3">
              <div className="text-5xl">✅</div>
              <p className="font-extrabold text-lg text-[#1c2410]">Message sent!</p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold border border-[#c0bfb9] text-[#546048] hover:border-[#2a3b19] transition-all">
                Close
              </button>
            </div>

          ) : waUrl ? (
            <div className="text-center py-4 space-y-4">
              <div className="text-4xl">💬</div>
              <p className="text-[#546048] text-sm leading-relaxed">
                Your message is ready. Tap below to open WhatsApp — it will be pre-filled for <strong className="text-[#1c2410]">{attendee.name}</strong>.
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3.5 rounded-xl font-bold text-white bg-[#25D366] hover:opacity-90 transition-opacity text-center"
              >
                Open WhatsApp ↗
              </a>
              <button onClick={() => { setWaUrl(''); setMessage(''); }} className="w-full py-2 rounded-xl text-sm text-[#546048] border border-[#c0bfb9] hover:border-[#2a3b19] transition-all">
                Send another message
              </button>
            </div>

          ) : (
            <div className="space-y-4">
              {/* Channel selector — only if they have a phone */}
              {hasPhone && (
                <div className="flex gap-2 p-1 bg-[#e8e7e1] rounded-xl border border-[#c0bfb9]">
                  {[
                    { id: 'whatsapp', label: '💬 WhatsApp' },
                    { id: 'email', label: '✉️ Email' },
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
              )}

              {channel === 'email' && (
                <div>
                  <label className="block text-xs font-bold text-[#546048] uppercase tracking-widest mb-1.5">Subject</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#546048] uppercase tracking-widest mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  placeholder={`Hi ${attendee.name.split(' ')[0]}, …`}
                  className="w-full resize-none"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleSend}
                disabled={sending || !message.trim() || (channel === 'email' && !subject.trim())}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending…' : channel === 'whatsapp' ? 'Open WhatsApp' : 'Send Email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
