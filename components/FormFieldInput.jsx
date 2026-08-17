'use client';
import { useState } from 'react';
import {
  MAX_FILE_MB,
  MAX_FILE_BYTES,
  MAX_IMAGES_DEFAULT,
  downscaleImageFile,
  remoteUploadsEnabled,
} from '@/lib/formFields';
import { uploadImage } from '@/lib/uploadClient';

/**
 * Renders a single host-designed form field.
 * Shared by the public RSVP form and the form builder's live preview
 * (`disabled` mode), so the host sees exactly what guests will see.
 */
export default function FormFieldInput({
  field,
  value,
  onChange,
  disabled = false,
  idPrefix = 'f',
  eventCode = '',
}) {
  const id = `${idPrefix}-${field.key}`;
  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState('');
  const common = {
    id,
    disabled,
    placeholder: field.placeholder || undefined,
    'aria-required': field.required || undefined,
  };

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) { onChange(null); return; }
    if (file.size > MAX_FILE_BYTES) {
      alert(`File must be under ${MAX_FILE_MB} MB.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => onChange({ name: file.name, mime: file.type, dataURL: ev.target.result });
    reader.readAsDataURL(file);
  }

  const images = Array.isArray(value) ? value : [];
  const maxImages = field.maxImages || MAX_IMAGES_DEFAULT;
  const imagesLeft = maxImages - images.length;

  async function handleImages(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = ''; // let the guest re-pick the same file after removing it
    if (!picked.length) return;

    setImgError('');
    if (picked.length > imagesLeft) {
      setImgError(
        imagesLeft === 0
          ? `You already have ${maxImages} image${maxImages > 1 ? 's' : ''}. Remove one to add another.`
          : `Only ${imagesLeft} more image${imagesLeft > 1 ? 's' : ''} can be added.`
      );
      return;
    }

    // With a file host configured, images go straight there and we keep only a
    // URL. Otherwise they are downscaled and carried inline as base64.
    const useRemote = remoteUploadsEnabled() && !!eventCode;

    setImgBusy(true);
    const accepted = [];
    const failed = [];
    for (const file of picked) {
      if (!file.type.startsWith('image/')) { failed.push(`${file.name} is not an image`); continue; }
      try {
        accepted.push(useRemote ? await uploadImage(file, eventCode) : await downscaleImageFile(file));
      } catch (err) {
        failed.push(err.message);
      }
    }
    setImgBusy(false);
    if (accepted.length) onChange([...images, ...accepted]);
    if (failed.length) setImgError(failed.join(' · '));
  }

  function removeImage(i) {
    setImgError('');
    onChange(images.filter((_, j) => j !== i));
  }

  function toggleChoice(opt) {
    const current = Array.isArray(value) ? value : [];
    onChange(current.includes(opt) ? current.filter(v => v !== opt) : [...current, opt]);
  }

  // Consent renders its own inline label, so it skips the shared header.
  if (field.type === 'consent') {
    return (
      <div>
        <label
          htmlFor={id}
          className="flex items-start gap-3 cursor-pointer"
          style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: '0.9rem', fontWeight: 500 }}
        >
          <input
            type="checkbox"
            id={id}
            disabled={disabled}
            checked={value === true}
            onChange={e => onChange(e.target.checked)}
            className="mt-0.5 flex-shrink-0"
          />
          <span className="text-[#1c2410]">
            {field.label}{field.required && <span className="text-red-500"> *</span>}
          </span>
        </label>
        {field.helpText && <p className="text-xs text-[#546048] mt-1 pl-7">{field.helpText}</p>}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id}>
        {field.label}{field.required && <span className="text-red-500"> *</span>}
      </label>
      {field.helpText && <p className="text-xs text-[#546048] mb-2 normal-case">{field.helpText}</p>}

      {field.type === 'textarea' && (
        <textarea {...common} rows={4} value={value || ''} onChange={e => onChange(e.target.value)} />
      )}

      {['text', 'email', 'phone', 'number', 'date'].includes(field.type) && (
        <input
          {...common}
          type={{ text: 'text', email: 'email', phone: 'tel', number: 'number', date: 'date' }[field.type]}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
        />
      )}

      {field.type === 'select' && (
        <select {...common} value={value || ''} onChange={e => onChange(e.target.value)}>
          <option value="">Select an option…</option>
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {field.type === 'radio' && (
        <div className="space-y-2">
          {field.options.map(o => (
            <label
              key={o}
              className="flex items-center gap-3 cursor-pointer bg-[#e8e7e1] border border-[#c0bfb9] rounded-xl px-4 py-2.5 hover:border-[#2a3b19] transition-colors"
              style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: '0.9rem', fontWeight: 500, marginBottom: 0 }}
            >
              <input
                type="radio"
                name={id}
                disabled={disabled}
                checked={value === o}
                onChange={() => onChange(o)}
                className="!w-auto"
                style={{ accentColor: '#2a3b19' }}
              />
              <span className="text-[#1c2410]">{o}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && (
        <div className="space-y-2">
          {field.options.map(o => (
            <label
              key={o}
              className="flex items-center gap-3 cursor-pointer bg-[#e8e7e1] border border-[#c0bfb9] rounded-xl px-4 py-2.5 hover:border-[#2a3b19] transition-colors"
              style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: '0.9rem', fontWeight: 500, marginBottom: 0 }}
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={Array.isArray(value) && value.includes(o)}
                onChange={() => toggleChoice(o)}
              />
              <span className="text-[#1c2410]">{o}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === 'images' && (
        <div className="space-y-3">
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img.url || img.dataURL}
                    alt={img.name || `Image ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-xl border border-[#c0bfb9]"
                  />
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      title="Remove this image"
                      aria-label={`Remove ${img.name || `image ${i + 1}`}`}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#1c2410] text-white text-xs font-bold shadow hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <label
            className={`flex items-center gap-3 bg-[#e8e7e1] border border-[#c0bfb9] rounded-xl px-4 py-3 transition-colors ${
              disabled || imgBusy || imagesLeft <= 0
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer hover:border-[#2a3b19]'
            }`}
          >
            <span className="text-2xl flex-shrink-0">🖼</span>
            <span className="min-w-0">
              <span className="text-sm font-semibold text-[#1c2410] block">
                {imgBusy
                  ? 'Uploading images…'
                  : imagesLeft <= 0
                    ? `Maximum of ${maxImages} reached`
                    : images.length
                      ? `Add more (${imagesLeft} left)`
                      : `Choose image${maxImages > 1 ? 's' : ''}`}
              </span>
              <span className="text-xs text-[#546048]">
                Up to {maxImages} · large photos are resized automatically
              </span>
            </span>
            <input
              type="file"
              id={id}
              accept="image/*"
              multiple={maxImages > 1}
              disabled={disabled || imgBusy || imagesLeft <= 0}
              className="hidden"
              onChange={handleImages}
            />
          </label>

          {imgError && (
            <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {imgError}
            </p>
          )}
        </div>
      )}

      {field.type === 'file' && (
        <label className={`flex items-center gap-3 bg-[#e8e7e1] border border-[#c0bfb9] rounded-xl px-4 py-3 transition-colors ${disabled ? 'opacity-60' : 'cursor-pointer hover:border-[#2a3b19]'}`}>
          <span className="text-2xl flex-shrink-0">📎</span>
          <span className="min-w-0">
            <span className="text-sm font-semibold text-[#1c2410] block truncate">
              {value?.name ? `${value.name} ✓` : 'Choose a file'}
            </span>
            <span className="text-xs text-[#546048]">Max {MAX_FILE_MB} MB</span>
          </span>
          <input type="file" id={id} disabled={disabled} className="hidden" onChange={handleFile} />
        </label>
      )}
    </div>
  );
}
