'use client';
import { useState } from 'react';
import FrameZoneSelector from '@/components/FrameZoneSelector';
import FormBuilder from '@/components/FormBuilder';
import { getFormFields, downscaleImageFile, formatBytes, MAX_REQUEST_BYTES } from '@/lib/formFields';

/**
 * Everything on this panel is sent as one JSON PUT, and images are inline
 * base64. The hosting platform rejects request bodies over MAX_REQUEST_BYTES
 * with a bare 413, so the save is checked against a slightly lower budget in
 * order to fail with a message that says which image is the problem.
 */
const MAX_SAVE_BYTES = 3.5 * 1024 * 1024;

/**
 * Format a stored date for a <input type="datetime-local">.
 *
 * The input expects LOCAL wall-clock time as "YYYY-MM-DDTHH:mm", while Mongo
 * returns UTC ISO strings. Using toISOString().slice(0, 16) here is the classic
 * trap: it shows UTC in the box, so an event would visibly shift by the user's
 * offset every time the panel is opened and saved. Building the string from the
 * local getters keeps it correct in any timezone.
 */
function toLocalInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
         `T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Convert the input's local wall-clock string back to an absolute instant.
 *
 * Sent as a full ISO string rather than the raw "YYYY-MM-DDTHH:mm", because the
 * server would otherwise parse that bare form in ITS timezone (UTC on most
 * hosts) rather than the host's — putting the event hours off. Resolving it to
 * UTC here, where the browser knows the real offset, removes the ambiguity.
 */
function toISO(localValue) {
  if (!localValue) return '';
  const d = new Date(localValue);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

export default function EditEventPanel({ event, onSave, onCancel }) {
  const [description, setDescription]     = useState(event.description || '');
  const [date, setDate]                   = useState(() => toLocalInput(event.date));
  const [endDate, setEndDate]             = useState(() => toLocalInput(event.endDate));
  const [formFields, setFormFields]       = useState(() => getFormFields(event));
  const [coverImage, setCoverImage]       = useState(event.coverImage || '');
  const [coverBusy, setCoverBusy]         = useState(false);
  const [avatarsEnabled, setAvatarsEnabled] = useState(!!event.avatarsEnabled);
  const [frameImage, setFrameImage]       = useState(event.frameImage || '');
  const [frameZone, setFrameZone]         = useState(event.frameZone  || null);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');

  const dateChanged =
    date !== toLocalInput(event.date) || endDate !== toLocalInput(event.endDate);

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file after a removal
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Cover image must be an image file.'); return; }

    setError('');
    setCoverBusy(true);
    try {
      // Resized in the browser rather than size-capped, so a straight-from-phone
      // photo is accepted instead of being rejected for being too large.
      const { dataURL } = await downscaleImageFile(file);
      setCoverImage(dataURL);
    } catch (err) {
      setError(err.message || 'Could not read that image.');
    } finally {
      setCoverBusy(false);
    }
  }

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
    if (formFields.some(f => !f.label.trim())) {
      setError('Every question on the registration form needs a label.');
      return;
    }
    if (!date) {
      setError('An event needs a start date and time.');
      return;
    }
    if (endDate && new Date(endDate) < new Date(date)) {
      setError('The end time cannot be before the start time.');
      return;
    }

    // Only send images that actually changed. The PUT route ignores keys it
    // doesn't receive, so omitting them leaves the stored value untouched —
    // and it keeps a description-only edit from re-uploading megabytes of
    // base64 that would push the request over the platform's size limit.
    const payload = { description, formFields, avatarsEnabled, frameZone };
    if (coverImage !== (event.coverImage || '')) payload.coverImage = coverImage;
    if (frameImage !== (event.frameImage || '')) payload.frameImage = frameImage;

    // Compare in the input's own format so an unchanged date is never resent
    // (and so a re-save can't drift the stored instant).
    if (date !== toLocalInput(event.date)) payload.date = toISO(date);
    if (endDate !== toLocalInput(event.endDate)) payload.endDate = toISO(endDate) || null;

    const body = JSON.stringify(payload);

    // Catch an oversized save here — the platform would otherwise return a
    // bare 413 that we cannot turn into anything actionable.
    if (body.length > MAX_SAVE_BYTES) {
      const parts = [
        { label: 'cover image', size: payload.coverImage?.length || 0 },
        { label: 'avatar frame image', size: payload.frameImage?.length || 0 },
      ].sort((a, b) => b.size - a.size);
      const biggest = parts[0];
      setError(
        `This save comes to ${formatBytes(body.length)}, over the ${formatBytes(MAX_SAVE_BYTES)} limit. ` +
        (biggest.size > 0
          ? `The ${biggest.label} is the largest part at ${formatBytes(biggest.size)} — replace it with a smaller one.`
          : 'Try shortening the description or removing some form questions.')
      );
      return;
    }

    setSaving(true);
    setError('');
    const res = await fetch(`/api/events/${event._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Save failed.'); return; }
    onSave(data.event);
  }

  return (
    <div className="space-y-6">

      {/* Cover image */}
      <div>
        <label className="block text-xs font-bold text-[#546048] uppercase tracking-widest mb-2">
          Cover Image
        </label>
        <p className="text-xs text-[#546048] mb-3 leading-relaxed">
          Shown at the top of your public event page. Large photos are resized automatically.
        </p>

        {coverImage ? (
          <div className="space-y-3">
            <img
              src={coverImage}
              alt="Event cover"
              className="w-full max-w-sm rounded-xl object-cover aspect-square border border-[#c0bfb9]"
            />
            <div className="flex gap-3 items-center flex-wrap">
              <label className={`flex items-center gap-2 bg-[#e8e7e1] border border-[#c0bfb9] rounded-xl px-4 py-2.5 transition-colors ${
                coverBusy ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#2a3b19]'
              }`}>
                <span className="text-lg">🖼</span>
                <span className="text-sm text-[#546048]">
                  {coverBusy ? 'Processing…' : 'Replace cover image…'}
                </span>
                <input type="file" accept="image/*" className="hidden" disabled={coverBusy} onChange={handleCoverUpload} />
              </label>
              <button
                type="button"
                onClick={() => setCoverImage('')}
                disabled={coverBusy}
                className="text-xs text-red-500 hover:underline font-semibold disabled:opacity-40 disabled:no-underline"
              >
                ✕ Remove cover image
              </button>
            </div>
          </div>
        ) : (
          <label className={`flex flex-col items-center justify-center h-36 max-w-sm rounded-xl border-2 border-dashed border-[#c0bfb9] transition-colors bg-[#e8e7e1] ${
            coverBusy ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#2a3b19]'
          }`}>
            <div className="text-center text-[#546048] p-4">
              <p className="text-3xl mb-2">🖼</p>
              <p className="text-sm">{coverBusy ? 'Processing…' : 'Click to upload a cover image'}</p>
            </div>
            <input type="file" accept="image/*" className="hidden" disabled={coverBusy} onChange={handleCoverUpload} />
          </label>
        )}
      </div>

      {/* Date & time */}
      <div className="border-t border-[#c0bfb9] pt-6">
        <label className="block text-xs font-bold text-[#546048] uppercase tracking-widest mb-2">
          Date &amp; Time
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-date">Starts *</label>
            <input
              id="edit-date"
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="edit-end-date">Ends</label>
            <input
              id="edit-end-date"
              type="datetime-local"
              value={endDate}
              min={date || undefined}
              onChange={e => setEndDate(e.target.value)}
            />
            {endDate && (
              <button
                type="button"
                onClick={() => setEndDate('')}
                className="mt-1 text-xs text-[#546048] hover:text-[#2a3b19] underline"
              >
                Clear end time
              </button>
            )}
          </div>
        </div>

        {dateChanged && (
          <p className="text-xs text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 mt-3 leading-relaxed">
            You&apos;re changing when this event happens. Guests who already RSVPed are
            <strong> not</strong> notified automatically — use Broadcast on the Attendees tab
            to tell them, and note their existing tickets stay valid.
          </p>
        )}
      </div>

      {/* Description */}
      <div className="border-t border-[#c0bfb9] pt-6">
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

      {/* Registration form builder */}
      <div className="border-t border-[#c0bfb9] pt-6">
        <FormBuilder value={formFields} onChange={setFormFields} />
        <p className="text-xs text-[#546048] mt-3 leading-relaxed">
          Changing the form only affects future RSVPs — answers already collected stay as they were.
        </p>
      </div>

      {/* Avatar toggle */}
      <div className="bg-[#e8e7e1] border border-[#c0bfb9] rounded-xl p-4 flex items-start gap-4">
        <button
          type="button"
          onClick={() => setAvatarsEnabled(v => !v)}
          className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${avatarsEnabled ? 'bg-[#2a3b19]' : 'bg-[#c0bfb9]'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${avatarsEnabled ? 'translate-x-5' : ''}`} />
        </button>
        <div>
          <p className="text-sm font-bold text-[#1c2410]">Avatar cards for guests</p>
          <p className="text-xs text-[#546048] mt-0.5 leading-relaxed">
            When enabled, guests can upload their photo after RSVPing and receive a personalised event card.
          </p>
        </div>
      </div>

      {/* Avatar frame — only shown when avatars are enabled */}
      {avatarsEnabled && <div>
        <label className="block text-xs font-bold text-[#546048] uppercase tracking-widest mb-2">
          Avatar Frame Image
        </label>
        <p className="text-xs text-[#546048] mb-3 leading-relaxed">
          Upload a PNG frame (with transparency) and drag to set where attendee photos appear.
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
      </div>}

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
