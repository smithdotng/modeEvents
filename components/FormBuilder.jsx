'use client';
import { useState } from 'react';
import FormFieldInput from '@/components/FormFieldInput';
import {
  FIELD_TYPES,
  OPTION_TYPES,
  PLACEHOLDER_TYPES,
  MAX_FIELDS,
  MAX_OPTIONS,
  MAX_IMAGES_LIMIT,
  MAX_IMAGES_DEFAULT,
  makeField,
  defaultFormFields,
  blankAnswers,
  remoteUploadsEnabled,
} from '@/lib/formFields';

const typeMeta = t => FIELD_TYPES.find(f => f.value === t) || FIELD_TYPES[0];

/* ── Options editor (module scope so its inputs never remount) ───────────── */
function OptionsEditor({ options, onChange }) {
  return (
    <div>
      <label>Choices</label>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={opt}
              placeholder={`Option ${i + 1}`}
              onChange={e => onChange(options.map((o, j) => (j === i ? e.target.value : o)))}
            />
            <button
              type="button"
              onClick={() => onChange(options.filter((_, j) => j !== i))}
              disabled={options.length <= 1}
              title="Remove choice"
              className="px-3 rounded-xl border border-[#c0bfb9] text-[#546048] hover:text-red-500 hover:border-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...options, ''])}
        disabled={options.length >= MAX_OPTIONS}
        className="mt-2 text-xs font-bold text-[#2a3b19] hover:underline disabled:opacity-40 disabled:no-underline"
      >
        + Add choice
      </button>
    </div>
  );
}

/* ── One field card ──────────────────────────────────────────────────────── */
function FieldCard({ field, index, total, lockedCount, open, onToggle, onPatch, onMove, onRemove }) {
  const meta = typeMeta(field.type);
  const canMoveUp = !field.locked && index > lockedCount;
  const canMoveDown = !field.locked && index < total - 1;

  return (
    <div className={`rounded-xl border transition-colors ${open ? 'border-[#2a3b19] bg-[#e8e7e1]' : 'border-[#c0bfb9] bg-[#e8e7e1]/60'}`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3">
        <span className="text-lg flex-shrink-0" title={meta.label}>{meta.icon}</span>

        <button type="button" onClick={onToggle} className="flex-1 min-w-0 text-left">
          <span className="block text-sm font-bold text-[#1c2410] truncate">
            {field.label || <span className="italic text-[#546048]">Untitled question</span>}
            {field.required && <span className="text-red-500"> *</span>}
          </span>
          <span className="block text-xs text-[#546048]">
            {meta.label}
            {field.core && ' · built-in'}
            {field.locked && ' · always asked'}
          </span>
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button" onClick={() => onMove(-1)} disabled={!canMoveUp} title="Move up"
            className="w-7 h-7 rounded-lg text-[#546048] hover:bg-[#dddcd7] disabled:opacity-25 disabled:hover:bg-transparent"
          >↑</button>
          <button
            type="button" onClick={() => onMove(1)} disabled={!canMoveDown} title="Move down"
            className="w-7 h-7 rounded-lg text-[#546048] hover:bg-[#dddcd7] disabled:opacity-25 disabled:hover:bg-transparent"
          >↓</button>
          <button
            type="button" onClick={onToggle} title={open ? 'Collapse' : 'Edit'}
            className="w-7 h-7 rounded-lg text-[#546048] hover:bg-[#dddcd7]"
          >{open ? '▲' : '✏️'}</button>
          <button
            type="button" onClick={onRemove} disabled={field.locked}
            title={field.locked ? 'This question is required for ticketing' : 'Remove question'}
            className="w-7 h-7 rounded-lg text-[#546048] hover:text-red-500 hover:bg-[#dddcd7] disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-[#546048]"
          >✕</button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="px-3 pb-4 pt-1 space-y-3 border-t border-[#c0bfb9]">
          {!field.core && (
            <div>
              <label>Input type</label>
              <select
                value={field.type}
                onChange={e => {
                  const type = e.target.value;
                  onPatch({
                    type,
                    options: OPTION_TYPES.includes(type)
                      ? (field.options?.length ? field.options : ['Option 1', 'Option 2'])
                      : [],
                    maxImages: type === 'images' ? (field.maxImages || MAX_IMAGES_DEFAULT) : 0,
                    placeholder: PLACEHOLDER_TYPES.includes(type) ? field.placeholder : '',
                  });
                }}
              >
                {FIELD_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon}  {t.label} — {t.hint}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label>Question label</label>
            <input
              value={field.label}
              placeholder="e.g. What's your t-shirt size?"
              onChange={e => onPatch({ label: e.target.value })}
            />
          </div>

          {PLACEHOLDER_TYPES.includes(field.type) && (
            <div>
              <label>Placeholder</label>
              <input
                value={field.placeholder || ''}
                placeholder="Hint text shown inside the box"
                onChange={e => onPatch({ placeholder: e.target.value })}
              />
            </div>
          )}

          <div>
            <label>Help text (optional)</label>
            <input
              value={field.helpText || ''}
              placeholder="Extra guidance shown under the label"
              onChange={e => onPatch({ helpText: e.target.value })}
            />
          </div>

          {OPTION_TYPES.includes(field.type) && (
            <OptionsEditor options={field.options || []} onChange={options => onPatch({ options })} />
          )}

          {field.type === 'images' && (
            <div>
              <label htmlFor={`max-img-${field.key}`}>Maximum images per guest</label>
              <select
                id={`max-img-${field.key}`}
                value={field.maxImages || MAX_IMAGES_DEFAULT}
                onChange={e => onPatch({ maxImages: Number(e.target.value) })}
              >
                {Array.from({ length: MAX_IMAGES_LIMIT }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} image{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <p className="text-xs text-[#546048] mt-1 normal-case">
                {remoteUploadsEnabled()
                  ? 'Photos are resized in the guest’s browser, then stored on your file host.'
                  : 'Photos are resized in the guest’s browser and stored with each attendee record. Keep this low if you expect a lot of RSVPs.'}
              </p>
            </div>
          )}

          <label
            className="flex items-center gap-3 cursor-pointer"
            style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: '0.9rem', marginBottom: 0 }}
          >
            <input
              type="checkbox"
              checked={field.required}
              disabled={field.locked}
              onChange={e => onPatch({ required: e.target.checked })}
            />
            <span className={field.locked ? 'text-[#546048]' : 'text-[#1c2410]'}>
              Required{field.locked && ' — always required for ticketing'}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

/* ── Builder ─────────────────────────────────────────────────────────────── */
export default function FormBuilder({ value, onChange }) {
  const fields = Array.isArray(value) && value.length ? value : defaultFormFields();
  const [openKey, setOpenKey] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState({});

  const lockedCount = fields.filter(f => f.locked).length;

  function patch(key, changes) {
    onChange(fields.map(f => (f.key === key ? { ...f, ...changes } : f)));
  }

  function move(index, dir) {
    const target = index + dir;
    if (target < lockedCount || target > fields.length - 1) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(key) {
    onChange(fields.filter(f => f.key !== key));
    if (openKey === key) setOpenKey(null);
  }

  function add(type) {
    if (fields.length >= MAX_FIELDS) return;
    const field = makeField(type);
    onChange([...fields, field]);
    setOpenKey(field.key);
  }

  function resetToDefault() {
    onChange(defaultFormFields());
    setOpenKey(null);
  }

  const unlabelled = fields.filter(f => !f.label.trim()).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-bold text-[#1c2410]">Registration form</p>
          <p className="text-xs text-[#546048] leading-relaxed max-w-md">
            Choose what guests are asked when they RSVP. Name and email are always
            collected — tickets and the one-RSVP-per-email check depend on them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowPreview(v => !v); setPreviewAnswers(blankAnswers(fields)); }}
          className="px-4 py-2 rounded-xl text-xs font-bold border border-[#c0bfb9] text-[#546048] hover:text-[#2a3b19] hover:border-[#2a3b19] transition-all whitespace-nowrap"
        >
          {showPreview ? '✎ Back to editing' : '👁 Preview form'}
        </button>
      </div>

      {showPreview ? (
        <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-5 space-y-4">
          <p className="text-xs font-bold text-[#546048] uppercase tracking-widest">
            What guests will see
          </p>
          {fields.map(f => (
            <FormFieldInput
              key={f.key}
              field={f}
              idPrefix="preview"
              value={previewAnswers[f.key]}
              onChange={v => setPreviewAnswers(a => ({ ...a, [f.key]: v }))}
            />
          ))}
          <button
            type="button"
            disabled
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] opacity-70 cursor-not-allowed"
          >
            🎟 Confirm my RSVP
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {fields.map((f, i) => (
              <FieldCard
                key={f.key}
                field={f}
                index={i}
                total={fields.length}
                lockedCount={lockedCount}
                open={openKey === f.key}
                onToggle={() => setOpenKey(k => (k === f.key ? null : f.key))}
                onPatch={changes => patch(f.key, changes)}
                onMove={dir => move(i, dir)}
                onRemove={() => remove(f.key)}
              />
            ))}
          </div>

          {unlabelled > 0 && (
            <p className="text-xs text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
              {unlabelled} question{unlabelled > 1 ? 's need' : ' needs'} a label before you save.
            </p>
          )}

          <div>
            <p className="text-xs font-bold text-[#546048] uppercase tracking-widest mb-2">
              Add a question {fields.length >= MAX_FIELDS && `· limit ${MAX_FIELDS} reached`}
            </p>
            <div className="flex flex-wrap gap-2">
              {FIELD_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => add(t.value)}
                  disabled={fields.length >= MAX_FIELDS}
                  title={t.hint}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border border-[#c0bfb9] text-[#546048] hover:border-[#2a3b19] hover:text-[#2a3b19] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={resetToDefault}
            className="text-xs text-[#546048] hover:text-[#2a3b19] underline"
          >
            Reset to the default form
          </button>
        </>
      )}
    </div>
  );
}
