'use client';
import { MAX_FILE_MB, MAX_FILE_BYTES } from '@/lib/formFields';

/**
 * Renders a single host-designed form field.
 * Shared by the public RSVP form and the form builder's live preview
 * (`disabled` mode), so the host sees exactly what guests will see.
 */
export default function FormFieldInput({ field, value, onChange, disabled = false, idPrefix = 'f' }) {
  const id = `${idPrefix}-${field.key}`;
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
