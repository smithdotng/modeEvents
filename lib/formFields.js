/**
 * Shared definition of the host-designed RSVP form.
 *
 * A form is an ordered array of field descriptors stored on the Event
 * (`event.formFields`). Three of them are "core" fields whose answers map onto
 * real Attendee columns (name / email / phone) because ticketing, the
 * one-RSVP-per-email rule, broadcasts and CSV export all depend on them.
 * Everything else is a custom field whose answer lands in `attendee.responses`.
 *
 * This module is imported by both client components and API routes, so it must
 * stay free of any React / Node-only imports.
 */

// ── Field types ────────────────────────────────────────────────────────────
export const FIELD_TYPES = [
  { value: 'text',     label: 'Short text',        icon: '🔤', hint: 'A single line of text' },
  { value: 'textarea', label: 'Long text',         icon: '📝', hint: 'A multi-line answer' },
  { value: 'email',     label: 'Email',            icon: '✉️', hint: 'Validated email address' },
  { value: 'phone',    label: 'Phone',             icon: '📞', hint: 'Phone number' },
  { value: 'number',   label: 'Number',            icon: '🔢', hint: 'Numbers only' },
  { value: 'date',     label: 'Date',              icon: '📅', hint: 'Date picker' },
  { value: 'select',   label: 'Dropdown',          icon: '🔽', hint: 'Pick one from a list' },
  { value: 'radio',    label: 'Single choice',     icon: '🔘', hint: 'Radio buttons — pick one' },
  { value: 'checkbox', label: 'Multiple choice',   icon: '☑️', hint: 'Checkboxes — pick any' },
  { value: 'consent',  label: 'Consent checkbox',  icon: '✅', hint: 'A single tick box to agree' },
  { value: 'file',     label: 'File upload',       icon: '📎', hint: 'Guests attach a file or image' },
];

export const FIELD_TYPE_VALUES = FIELD_TYPES.map(t => t.value);

/** Types that need a list of choices. */
export const OPTION_TYPES = ['select', 'radio', 'checkbox'];

/** Types that support a placeholder. */
export const PLACEHOLDER_TYPES = ['text', 'textarea', 'email', 'phone', 'number'];

// ── Limits ─────────────────────────────────────────────────────────────────
export const MAX_FIELDS       = 30;
export const MAX_OPTIONS      = 30;
export const MAX_LABEL_LEN    = 120;
export const MAX_TEXT_LEN     = 2000;
export const MAX_FILE_MB      = 2;
export const MAX_FILE_BYTES   = MAX_FILE_MB * 1024 * 1024;
// base64 inflates by ~4/3; allow a little headroom for the data-URL prefix
export const MAX_FILE_DATAURL = Math.ceil(MAX_FILE_BYTES * 1.4);

// ── Core fields ────────────────────────────────────────────────────────────
/**
 * `locked: true` → cannot be deleted, retyped, reordered or made optional.
 * Hosts may still change the label, placeholder and help text.
 * `phone` is core (it maps to the phone column that WhatsApp broadcasts use)
 * but hosts can remove it or make it required.
 */
export const CORE_FIELDS = [
  { key: 'name',  type: 'text',  label: 'Full name',     placeholder: 'Jane Doe',          required: true,  core: true, locked: true },
  { key: 'email', type: 'email', label: 'Email address', placeholder: 'jane@example.com',  required: true,  core: true, locked: true },
  { key: 'phone', type: 'phone', label: 'Phone number',  placeholder: '+2348012345678',    required: false, core: true, locked: false },
];

export const CORE_KEYS = CORE_FIELDS.map(f => f.key);

/** A fresh copy of the default form — used for new events and legacy events. */
export function defaultFormFields() {
  return CORE_FIELDS.map(f => ({ ...f, helpText: '', options: [] }));
}

let counter = 0;
/** Stable, collision-resistant key for a new custom field. */
export function makeFieldKey() {
  counter += 1;
  return `f_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** A blank custom field of the given type. */
export function makeField(type = 'text') {
  return {
    key: makeFieldKey(),
    type: FIELD_TYPE_VALUES.includes(type) ? type : 'text',
    label: '',
    placeholder: '',
    helpText: '',
    required: false,
    options: OPTION_TYPES.includes(type) ? ['Option 1', 'Option 2'] : [],
    core: false,
    locked: false,
  };
}

const str = (v, max = MAX_LABEL_LEN) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * Sanitise an arbitrary array into a valid form definition.
 * Always returns core name + email first, in that order, required and locked.
 * Safe to run on untrusted request bodies.
 */
export function normalizeFormFields(input) {
  if (!Array.isArray(input) || input.length === 0) return defaultFormFields();

  const seen = new Set();
  const cleaned = [];

  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    if (cleaned.length >= MAX_FIELDS) break;

    const key = str(raw.key, 64);
    if (!key || seen.has(key)) continue;

    const coreDef = CORE_FIELDS.find(c => c.key === key);
    const type = coreDef
      ? coreDef.type
      : (FIELD_TYPE_VALUES.includes(raw.type) ? raw.type : 'text');

    const label = str(raw.label) || coreDef?.label || 'Untitled question';

    let options = [];
    if (OPTION_TYPES.includes(type)) {
      // De-duplicate before capping — duplicate choices make answers ambiguous,
      // and slicing first would leave fewer than MAX_OPTIONS usable choices.
      options = [...new Set(
        (Array.isArray(raw.options) ? raw.options : []).map(o => str(o)).filter(Boolean)
      )].slice(0, MAX_OPTIONS);
      if (options.length === 0) options = ['Option 1'];
    }

    seen.add(key);
    cleaned.push({
      key,
      type,
      label,
      placeholder: PLACEHOLDER_TYPES.includes(type) ? str(raw.placeholder) : '',
      helpText: str(raw.helpText, 240),
      required: coreDef?.locked ? true : !!raw.required,
      options,
      core: !!coreDef,
      locked: !!coreDef?.locked,
    });
  }

  // Guarantee the locked core fields exist and lead the form.
  const locked = CORE_FIELDS.filter(c => c.locked);
  for (const def of [...locked].reverse()) {
    const existing = cleaned.find(f => f.key === def.key);
    if (existing) {
      cleaned.splice(cleaned.indexOf(existing), 1);
      cleaned.unshift(existing);
    } else {
      cleaned.unshift({ ...def, helpText: '', options: [] });
    }
  }

  // Cap after the core fields are prepended so the total never exceeds the limit.
  return cleaned.slice(0, MAX_FIELDS);
}

/** Read an event's form, falling back to the default for events created before this feature. */
export function getFormFields(event) {
  const fields = event?.formFields;
  if (!Array.isArray(fields) || fields.length === 0) return defaultFormFields();
  return normalizeFormFields(fields);
}

/** The empty answer for a field — used to seed client form state. */
export function emptyValue(field) {
  if (field.type === 'checkbox') return [];
  if (field.type === 'consent') return false;
  if (field.type === 'file') return null;
  return '';
}

export function blankAnswers(fields) {
  const out = {};
  for (const f of fields) out[f.key] = emptyValue(f);
  return out;
}

/** True when an answer counts as "not filled in". */
export function isEmptyAnswer(field, value) {
  if (field.type === 'checkbox') return !Array.isArray(value) || value.length === 0;
  if (field.type === 'consent') return value !== true;
  if (field.type === 'file') return !value || !value.dataURL;
  if (value === null || value === undefined) return true;
  return String(value).trim() === '';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate one answer and return the value to persist.
 * @returns {{ error?: string, value?: any }}
 */
export function coerceAnswer(field, raw) {
  if (isEmptyAnswer(field, raw)) {
    if (field.required) return { error: `${field.label} is required.` };
    return { value: emptyValue(field) };
  }

  switch (field.type) {
    case 'email': {
      const v = String(raw).trim();
      if (!EMAIL_RE.test(v)) return { error: `${field.label} must be a valid email address.` };
      return { value: v };
    }
    case 'number': {
      const n = Number(raw);
      if (!Number.isFinite(n)) return { error: `${field.label} must be a number.` };
      return { value: n };
    }
    case 'date': {
      const v = String(raw).trim();
      if (Number.isNaN(new Date(v).getTime())) return { error: `${field.label} must be a valid date.` };
      return { value: v };
    }
    case 'select':
    case 'radio': {
      const v = String(raw).trim();
      if (!field.options.includes(v)) return { error: `${field.label}: "${v}" is not one of the choices.` };
      return { value: v };
    }
    case 'checkbox': {
      const picked = [...new Set(raw.map(v => String(v).trim()))];
      const bad = picked.find(v => !field.options.includes(v));
      if (bad) return { error: `${field.label}: "${bad}" is not one of the choices.` };
      return { value: picked };
    }
    case 'consent':
      return { value: true };
    case 'file': {
      const { dataURL, name, mime } = raw;
      if (typeof dataURL !== 'string' || !dataURL.startsWith('data:')) {
        return { error: `${field.label}: unsupported file.` };
      }
      if (dataURL.length > MAX_FILE_DATAURL) {
        return { error: `${field.label}: file must be under ${MAX_FILE_MB} MB.` };
      }
      return { value: { name: str(name, 200), mime: str(mime, 100), dataURL } };
    }
    default:
      return { value: String(raw).trim().slice(0, MAX_TEXT_LEN) };
  }
}

/**
 * Validate a whole submission.
 * @param {Array} fields  normalised form definition
 * @param {Object} answers  { [fieldKey]: value }
 * @returns {{ errors: string[], core: {name,email,phone}, responses: Array }}
 */
export function collectSubmission(fields, answers = {}) {
  const errors = [];
  const core = { name: '', email: '', phone: '' };
  const responses = [];

  for (const field of fields) {
    const { error, value } = coerceAnswer(field, answers?.[field.key]);
    if (error) { errors.push(error); continue; }

    if (CORE_KEYS.includes(field.key)) {
      core[field.key] = typeof value === 'string' ? value : '';
      continue;
    }
    // Skip blank optional answers so the attendee record stays tidy.
    if (isEmptyAnswer(field, value)) continue;

    responses.push({ fieldKey: field.key, label: field.label, type: field.type, value });
  }

  return { errors, core, responses };
}

/** Render an answer as plain text — used by the attendee table and CSV export. */
export function formatAnswer(response) {
  if (!response) return '';
  const { type, value } = response;
  if (value === null || value === undefined) return '';
  if (type === 'checkbox') return Array.isArray(value) ? value.join(', ') : String(value);
  if (type === 'consent') return value ? 'Yes' : 'No';
  if (type === 'file') return value?.name || 'File attached';
  return String(value);
}
