'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FrameZoneSelector from '@/components/FrameZoneSelector';

function ImageUpload({ label, value, onChange, hint }) {
  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { alert('Image must be under 1.5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  }
  return (
    <div>
      <label>{label}</label>
      {hint && <p className="text-xs text-[#546048] mb-2">{hint}</p>}
      <label className="cursor-pointer flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed border-[#c0bfb9] hover:border-[#2a3b19] transition-colors bg-[#e8e7e1] overflow-hidden">
        {value ? (
          <img src={value} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-[#546048] p-4">
            <p className="text-3xl mb-2">🖼</p>
            <p className="text-sm">Click to upload (max 1.5 MB)</p>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      {value && (
        <button type="button" onClick={() => onChange('')} className="mt-1 text-xs text-red-400 hover:underline">
          Remove image
        </button>
      )}
    </div>
  );
}

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=details, 2=avatar setup
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', date: '', endDate: '',
    venue: '', address: '', capacity: '',
    coverImage: '', frameImage: '',
    frameZone: { x: 10, y: 10, w: 30, h: 30, shape: 'rect' },
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target ? e.target.value : e }));

  const handleZoneChange = useCallback(zone => {
    setForm(f => ({ ...f, frameZone: zone }));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.date) { setError('Title and date are required.'); return; }
    setSaving(true); setError('');

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to create event.'); setSaving(false); return; }
    router.push(`/events/${data.event._id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1c2410]">Create Event</h1>
        <p className="text-[#546048] mt-1">Fill in the details and optionally set up the avatar frame.</p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-3 mb-8">
        {['Event Details', 'Avatar Frame'].map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i + 1)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
              step === i + 1
                ? 'bg-[#2a3b19] border-[#2a3b19] text-[#1c2410]'
                : 'bg-[#f2f1eb] border-[#c0bfb9] text-[#546048]'
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Step 1: Event Details ── */}
        {step === 1 && (
          <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-6 space-y-4">
            <div>
              <label>Event title *</label>
              <input placeholder="e.g. Annual Tech Summit 2025" value={form.title} onChange={set('title')} required />
            </div>
            <div>
              <label>Description</label>
              <textarea rows={3} placeholder="Tell attendees what this event is about…" value={form.description} onChange={set('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Start date & time *</label>
                <input type="datetime-local" value={form.date} onChange={set('date')} required />
              </div>
              <div>
                <label>End date & time</label>
                <input type="datetime-local" value={form.endDate} onChange={set('endDate')} />
              </div>
            </div>
            <div>
              <label>Venue name</label>
              <input placeholder="e.g. Eko Hotel, Lagos" value={form.venue} onChange={set('venue')} />
            </div>
            <div>
              <label>Full address</label>
              <input placeholder="Street, City, State" value={form.address} onChange={set('address')} />
            </div>
            <div>
              <label>Capacity (0 = unlimited)</label>
              <input type="number" min="0" placeholder="0" value={form.capacity} onChange={set('capacity')} />
            </div>
            <ImageUpload
              label="Cover image"
              value={form.coverImage}
              onChange={set('coverImage')}
              hint="Banner shown on the public event page (max 1.5 MB)."
            />
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity"
            >
              Next: Avatar Frame →
            </button>
          </div>
        )}

        {/* ── Step 2: Avatar Frame ── */}
        {step === 2 && (
          <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-6 space-y-4">
            <div className="bg-[#e8e7e1] rounded-xl p-4 text-sm text-[#546048] leading-relaxed">
              <strong className="text-[#1c2410]">How it works:</strong> Upload a template/poster image, then drag to mark where attendee photos should appear. When someone RSVPs and uploads their photo, it will be composited into that zone.
            </div>
            <ImageUpload
              label="Frame / template image"
              value={form.frameImage}
              onChange={v => setForm(f => ({ ...f, frameImage: v, frameZone: { x: 10, y: 10, w: 30, h: 30, shape: 'rect' } }))}
              hint="Your event poster or frame (max 1.5 MB). Skip this step if you don't need photo compositing."
            />
            {form.frameImage && (
              <FrameZoneSelector
                imageDataURL={form.frameImage}
                zone={form.frameZone}
                onChange={handleZoneChange}
              />
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-bold border border-[#c0bfb9] text-[#546048] hover:text-[#2a3b19] transition-all"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Creating…' : '🎉 Create Event'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
