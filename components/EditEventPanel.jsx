'use client';
import { useState } from 'react';
import FrameZoneSelector from '@/components/FrameZoneSelector';

export default function EditEventPanel({ event, onSave, onCancel }) {
  const [description, setDescription] = useState(event.description || '');
  const [frameImage, setFrameImage] = useState(event.frameImage || '');
  const [frameZone, setFrameZone]   = useState(event.frameZone  || null);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  function handleFrameUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Frame image must be under 3 MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      setFrameImage(ev.target.result);
      setFrameZone(null); // reset zone when new image is chosen
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    const res = await fetch(`/api/events/${event._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, frameImage, frameZone }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Save failed.'); return; }
    onSave(data.event);
  }

  return (
    <div className="space-y-6">

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-[#546048] uppercase tracking-widest mb-2">
          Event Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          placeholder="Tell guests what to expect…"
          className="w-full resize-none"
        />
      </div>

      {/* Avatar frame */}
      <div>
        <label className="block text-xs font-bold text-[#546048] uppercase tracking-widest mb-2">
          Avatar Frame Image
        </label>
        <p className="text-xs text-[#546048] mb-3 leading-relaxed">
          Upload a PNG frame (with transparency) and drag to set where attendee photos appear.
          Guests who RSVP can upload their photo to get a personalised event card.
        </p>

        <label className="cursor-pointer flex items-center gap-3 bg-[#e8e7e1] border border-[#c0bfb9] hover:border-[#2a3b19] rounded-xl px-4 py-3 transition-colors w-fit">
          <span className="text-xl">🖼</span>
          <span className="text-sm text-[#546048]">
            {frameImage ? 'Change frame image…' : 'Upload frame image…'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFrameUpload} />
        </label>

        {frameImage && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-semibold text-[#546048]">
              Drag on the frame below to set the zone where attendee photos will appear:
            </p>
            <FrameZoneSelector
              imageDataURL={frameImage}
              zone={frameZone}
              onChange={setFrameZone}
            />
          </div>
        )}

        {frameImage && (
          <button
            type="button"
            onClick={() => { setFrameImage(''); setFrameZone(null); }}
            className="mt-3 text-xs text-red-500 hover:underline font-semibold"
          >
            ✕ Remove frame image
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-3 rounded-xl font-bold text-[#546048] border border-[#c0bfb9] hover:border-[#2a3b19] hover:text-[#2a3b19] transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
