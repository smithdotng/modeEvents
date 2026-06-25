'use client';
import { useEffect, useState, useCallback } from 'react';
import AvatarCompositor from '@/components/AvatarCompositor';
import QRTicket from '@/components/QRTicket';

export default function EventRSVPClient({ code }) {
  const [event, setEvent] = useState(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { ticketCode, attendeeId }
  const [error, setError] = useState('');

  // Post-RSVP avatar state
  const [showAvatarSection, setShowAvatarSection] = useState(false);
  const [photo, setPhoto] = useState('');
  const [composite, setComposite] = useState('');
  const [savingComposite, setSavingComposite] = useState(false);

  useEffect(() => {
    fetch(`/api/public/${code}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setNotFound(true);
        else { setEvent(data.event); setAttendeeCount(data.attendeeCount); }
        setLoading(false);
      });
  }, [code]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setError('');
    const res = await fetch(`/api/public/${code}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok && res.status !== 409) { setError(data.error || 'Something went wrong.'); return; }
    setResult(data);
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { alert('Photo must be under 1.5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  const handleComposite = useCallback(async (dataURL) => {
    setComposite(dataURL);
    // Save to DB in background
    if (result?.ticketCode) {
      setSavingComposite(true);
      await fetch(`/api/public/${code}/rsvp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode: result.ticketCode, compositeImage: dataURL }),
      }).catch(() => {});
      setSavingComposite(false);
    }
  }, [code, result]);

  async function shareCard() {
    if (!composite) return;
    try {
      const blob = await (await fetch(composite)).blob();
      const file = new File([blob], 'my-event-card.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: event.title, text: `I'm going to ${event.title}! 🎟` });
        return;
      }
    } catch { }
    try { await navigator.clipboard.writeText(window.location.href); } catch { }
    alert('Link copied to clipboard!');
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-[#546048] animate-pulse text-lg">Loading event…</div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🎟</p>
        <h1 className="text-2xl font-bold text-[#1c2410] mb-2">Event not found</h1>
        <p className="text-[#546048]">This link may be invalid or the event is no longer active.</p>
      </div>
    </div>
  );

  const eventDate = new Date(event.date);
  // Show avatar section if the host set up a frame image — regardless of avatarsEnabled flag
  // (avatarsEnabled gates the hint on the form; frameImage existence gates the post-RSVP offer)
  const canMakeAvatar = !!(event.frameImage && event.frameZone?.w > 0);

  // ── Success screen ─────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 space-y-6 text-center">
        {/* Header */}
        <div className="space-y-2">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-extrabold text-[#1c2410]">You&apos;re in!</h1>
          <p className="text-[#546048]">
            Your RSVP for <strong className="text-[#1c2410]">{event.title}</strong> is confirmed.
          </p>
        </div>

        {/* Event details */}
        <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-xl p-4 text-sm text-[#546048] space-y-1 text-left">
          <p>📅 {eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          {event.venue && <p>📍 {event.venue}</p>}
          {event.address && <p className="text-xs pl-5">{event.address}</p>}
        </div>

        {/* QR Ticket pass */}
        <div className="text-left space-y-2">
          <p className="text-sm font-semibold text-[#546048] text-center">
            Your entry pass — show this at the door
          </p>
          <QRTicket
            ticketCode={result.ticketCode}
            guestName={form.name}
            eventTitle={event.title}
            eventDate={event.date}
            eventVenue={event.venue}
          />
        </div>

        {/* Avatar card section */}
        {canMakeAvatar && (
          <div className="border-t border-[#c0bfb9] pt-6 space-y-4">
            {!showAvatarSection ? (
              /* Prompt */
              <div className="space-y-3">
                <div className="text-3xl">🖼</div>
                <p className="font-semibold text-[#1c2410]">
                  Want a personalised avatar card?
                </p>
                <p className="text-sm text-[#546048] leading-relaxed">
                  Upload your photo and we&apos;ll place it on the event frame — perfect for sharing on social media.
                </p>
                <button
                  onClick={() => setShowAvatarSection(true)}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity"
                >
                  Create my avatar card
                </button>
              </div>

            ) : composite ? (
              /* Composite ready */
              <div className="space-y-3 text-left">
                <p className="text-sm font-semibold text-[#546048] text-center">
                  Your personalised event card {savingComposite && <span className="text-xs opacity-60">· saving…</span>}
                </p>
                <img
                  src={composite}
                  alt="Your event card"
                  className="w-full rounded-2xl border border-[#c0bfb9] shadow-sm"
                />
                <div className="flex gap-2">
                  <a
                    href={composite}
                    download={`${event.title.replace(/\s+/g, '-')}-card.png`}
                    className="flex-1 text-center py-3 rounded-xl font-bold text-sm text-white bg-[#2a3b19] hover:opacity-90 transition-opacity"
                  >
                    ⬇ Download Card
                  </a>
                  <button
                    onClick={shareCard}
                    className="flex-1 py-3 rounded-xl font-bold text-sm border border-[#2a3b19] text-[#2a3b19] hover:bg-[#2a3b19] hover:text-white transition-all"
                  >
                    ↗ Share
                  </button>
                </div>
              </div>

            ) : (
              /* Photo upload + compositor */
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#1c2410] text-sm">Create your avatar card</p>
                  <button
                    onClick={() => setShowAvatarSection(false)}
                    className="text-xs text-[#546048] hover:text-[#1c2410]"
                  >
                    ✕ Cancel
                  </button>
                </div>

                {/* Photo upload */}
                <label className="cursor-pointer flex items-center gap-3 bg-[#e8e7e1] border border-[#c0bfb9] hover:border-[#2a3b19] rounded-xl px-4 py-3 transition-colors">
                  <span className="text-2xl">📷</span>
                  <div>
                    <span className="text-sm font-semibold text-[#1c2410] block">
                      {photo ? 'Photo selected ✓' : 'Upload your photo'}
                    </span>
                    <span className="text-xs text-[#546048]">Max 1.5 MB · your face should be clearly visible</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>

                {photo && event.frameZone && (
                  <AvatarCompositor
                    frameImage={event.frameImage}
                    frameZone={event.frameZone}
                    attendeePhoto={photo}
                    onComposite={handleComposite}
                    eventDetails={{ title: event.title, date: event.date, venue: event.venue }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── RSVP Form ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Cover */}
      {event.coverImage ? (
        <div className="aspect-square w-full rounded-2xl overflow-hidden mb-6">
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-square w-full rounded-2xl mb-6 bg-gradient-to-br from-[#2a3b19] to-[#3d5a23] flex items-center justify-center">
          <span className="text-[#dddcd7]/30 text-9xl font-extrabold tracking-tighter select-none">
            {event.title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Event info */}
      <div className="mb-8">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-[#1c2410] leading-tight">{event.title}</h1>
            <p className="text-[#546048] mt-2 text-sm">
              <span className="block">
                📅 {eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' '}at {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {event.venue && (
                <span className="block">📍 {event.venue}{event.address ? `, ${event.address}` : ''}</span>
              )}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-extrabold text-[#1c2410]">{attendeeCount}</p>
            <p className="text-xs text-[#546048]">going</p>
          </div>
        </div>
        {event.description && (
          <p className="text-[#546048] mt-4 leading-relaxed">{event.description}</p>
        )}
      </div>

      {/* RSVP form */}
      <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-6">
        <h2 className="text-xl font-extrabold text-[#1c2410] mb-5">✋ I&apos;ll be there!</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Full name *</label>
            <input placeholder="Jane Doe" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label>Email address *</label>
            <input type="email" placeholder="jane@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label>Phone number</label>
            <input type="tel" placeholder="+2348012345678" value={form.phone} onChange={set('phone')} />
          </div>

          {/* Hint if avatar cards are available */}
          {canMakeAvatar && (
            <div className="flex items-start gap-3 bg-[#e8e7e1] border border-[#c0bfb9] rounded-xl px-4 py-3">
              <span className="text-xl flex-shrink-0">🖼</span>
              <p className="text-xs text-[#546048] leading-relaxed">
                After you RSVP, you&apos;ll be able to create a personalised avatar card for this event.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Registering…' : '🎟 Confirm my RSVP'}
          </button>
        </form>
      </div>
    </div>
  );
}
