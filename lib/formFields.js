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
  { value: 'images',   label: 'Image upload',      icon: '🖼', hint: 'Guests attach one or more photos' },
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

// ── Image upload limits ────────────────────────────────────────────────────
export const MAX_IMAGES_DEFAULT  = 5;   // per field, host-configurable
export const MAX_IMAGES_LIMIT    = 10;  // hard ceiling the host cannot exceed
export const MAX_IMAGE_MB        = 1;   // per inline image, after downscaling
export const MAX_IMAGE_BYTES     = MAX_IMAGE_MB * 1024 * 1024;
export const MAX_IMAGE_DATAURL   = Math.ceil(MAX_IMAGE_BYTES * 1.4);
export const IMAGE_MAX_DIMENSION = 1600; // px on the longest edge
export const IMAGE_QUALITY       = 0.82;
export const ACCEPTED_IMAGE_MIME = /^data:image\/(png|jpe?g|gif|webp|heic|heif);base64,/i;

/**
 * Total budget for one attendee's answers.
 *
 * The binding constraint is NOT MongoDB's 16 MB document limit — it is the
 * hosting platform's request body limit, which is far tighter. Vercel rejects
 * any request body over 4.5 MB with a 413 before our code ever runs, so this
 * budget sits below that in order to produce a readable error instead.
 * https://vercel.com/docs/functions/limitations#request-body-size
 *
 * When REMOTE uploads are configured (see uploadEndpoint below) images travel
 * straight from the browser to the file host and only their URLs pass through
 * here, so this budget stops being a practical limit.
 */
export const MAX_REQUEST_BYTES   = 4.5 * 1024 * 1024; // platform hard limit
export const MAX_RESPONSES_BYTES = 3.5 * 1024 * 1024; // our budget, with headroom

// ── Remote (shared hosting) image storage ──────────────────────────────────
/** Public URL of the upload receiver, e.g. https://files.example.com/upload.php */
export function uploadEndpoint() {
  return (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_UPLOAD_ENDPOINT) || '';
}

/**
 * Check NEXT_PUBLIC_UPLOAD_ENDPOINT and explain precisely what is wrong.
 *
 * A misconfigured endpoint used to fail in the worst possible way: the browser
 * would POST to whatever was configured — typically a hosting provider's parked
 * page — and the guest saw a timeout or a confusing parse error with nothing
 * pointing at the actual cause. Every failure mode below is now named.
 *
 * @returns {{ ok: boolean, configured: boolean, error: string, warning: string }}
 */
export function validateUploadEndpoint(raw = uploadEndpoint()) {
  const base = { ok: false, configured: false, error: '', warning: '' };

  if (!raw) return base; // not configured at all — images are stored inline

  let u;
  try {
    u = new URL(raw);
  } catch {
    return {
      ...base,
      configured: true,
      error: `NEXT_PUBLIC_UPLOAD_ENDPOINT is not a valid absolute URL (got "${raw}"). ` +
             'Expected something like https://your-host.com/upload.php',
    };
  }

  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname);
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && isLocal)) {
    return {
      ...base,
      configured: true,
      error: `NEXT_PUBLIC_UPLOAD_ENDPOINT must use https:// (got "${u.protocol}//"). ` +
             'Uploads carry a signed token, so they must not travel in the clear.',
    };
  }

  // The common mistake: the bare domain, with no path to the script.
  if (u.pathname === '' || u.pathname === '/') {
    return {
      ...base,
      configured: true,
      error: `NEXT_PUBLIC_UPLOAD_ENDPOINT is missing the path to the upload script. ` +
             `Got "${raw}" — it needs to point at the file itself, e.g. ` +
             `"${raw.replace(/\/+$/, '')}/upload.php".`,
    };
  }

  if (!/\.php$/i.test(u.pathname)) {
    return {
      ok: true,
      configured: true,
      error: '',
      warning: `NEXT_PUBLIC_UPLOAD_ENDPOINT ends in "${u.pathname}" rather than ".php". ` +
               'Check that it points at upload.php.',
    };
  }

  return { ok: true, configured: true, error: '', warning: '' };
}

/**
 * True when images should be pushed to the file host instead of stored inline.
 * A misconfigured endpoint counts as "off" so guests can still complete an RSVP
 * (their images fall back to inline) rather than hitting a dead upload target.
 */
export function remoteUploadsEnabled() {
  return validateUploadEndpoint().ok;
}

/** The configuration problem, if any — surfaced to hosts in the form builder. */
export function uploadEndpointProblem() {
  const v = validateUploadEndpoint();
  return v.error || v.warning || '';
}

/**
 * Only accept image URLs that live on the configured upload host.
 * Without this a crafted RSVP could plant arbitrary third-party URLs — tracking
 * pixels or worse — into a host's attendee list.
 */
export function isAllowedUploadUrl(url) {
  const endpoint = uploadEndpoint();
  // An invalid endpoint must not become a wildcard — refuse everything.
  if (!validateUploadEndpoint(endpoint).ok || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    const base = new URL(endpoint);
    return u.protocol === 'https:' && u.host === base.host;
  } catch {
    return false;
  }
}

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
  return CORE_FIELDS.map(f => ({ ...f, helpText: '', options: [], maxImages: 0 }));
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
    maxImages: type === 'images' ? MAX_IMAGES_DEFAULT : 0,
    core: false,
    locked: false,
  };
}

const clampInt = (v, lo, hi, fallback) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
};

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
      maxImages: type === 'images'
        ? clampInt(raw.maxImages, 1, MAX_IMAGES_LIMIT, MAX_IMAGES_DEFAULT)
        : 0,
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
      cleaned.unshift({ ...def, helpText: '', options: [], maxImages: 0 });
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
  if (field.type === 'images') return [];
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
  if (field.type === 'images') return !Array.isArray(value) || value.length === 0;
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
    case 'images': {
      const list = Array.isArray(raw) ? raw : [];
      const max = field.maxImages || MAX_IMAGES_DEFAULT;
      if (list.length > max) {
        return { error: `${field.label}: you can attach at most ${max} image${max > 1 ? 's' : ''}.` };
      }
      const out = [];
      for (const img of list) {
        if (!img || typeof img !== 'object') {
          return { error: `${field.label}: only image files can be attached.` };
        }
        const base = { name: str(img.name, 200), mime: str(img.mime, 100) };

        // Preferred shape: the image already lives on the file host.
        if (img.url) {
          if (!isAllowedUploadUrl(img.url)) {
            return { error: `${field.label}: that image link is not from an allowed location.` };
          }
          out.push({ ...base, url: str(img.url, 600) });
          continue;
        }

        // Fallback shape: inline base64, used when no file host is configured.
        const dataURL = img.dataURL;
        if (typeof dataURL !== 'string' || !ACCEPTED_IMAGE_MIME.test(dataURL)) {
          return { error: `${field.label}: only image files can be attached.` };
        }
        if (dataURL.length > MAX_IMAGE_DATAURL) {
          return { error: `${field.label}: each image must be under ${MAX_IMAGE_MB} MB.` };
        }
        out.push({ ...base, dataURL });
      }
      return { value: out };
    }
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

  // Attachments live inside the attendee document, so the whole answer set has
  // to stay clear of MongoDB's 16 MB per-document limit. Fail with a message
  // the guest can act on rather than letting the insert blow up.
  if (!errors.length) {
    const bytes = JSON.stringify(responses).length;
    if (bytes > MAX_RESPONSES_BYTES) {
      errors.push(
        `Your attachments total about ${(bytes / 1024 / 1024).toFixed(1)} MB, which is over the ` +
        `${(MAX_RESPONSES_BYTES / 1024 / 1024).toFixed(0)} MB limit. Please upload fewer or smaller images.`
      );
    }
  }

  return { errors, core, responses };
}

/**
 * Approximate the request body a submission will produce, so the browser can
 * refuse oversized RSVPs with a useful message instead of letting the platform
 * return a bare 413.
 */
export function estimateSubmissionBytes(fields, answers = {}) {
  const payload = {};
  for (const f of fields) {
    const v = answers?.[f.key];
    if (v !== undefined && v !== null) payload[f.key] = v;
  }
  try {
    return JSON.stringify(payload).length;
  } catch {
    return 0;
  }
}

/** Human-readable size, for error messages. */
export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Render an answer as plain text — used by the attendee table and CSV export. */
export function formatAnswer(response) {
  if (!response) return '';
  const { type, value } = response;
  if (value === null || value === undefined) return '';
  if (type === 'checkbox') return Array.isArray(value) ? value.join(', ') : String(value);
  if (type === 'consent') return value ? 'Yes' : 'No';
  if (type === 'file') return value?.name || 'File attached';
  if (type === 'images') {
    if (!Array.isArray(value) || value.length === 0) return '';
    return `${value.length} image${value.length > 1 ? 's' : ''}: ` +
      value.map((v, i) => v?.name || `image-${i + 1}`).join(', ');
  }
  return String(value);
}

/**
 * Downscale an image file in the browser and return a data URL.
 * Phone photos are 4–12 MB straight off the camera; re-encoding to a bounded
 * JPEG keeps attendee documents small enough to store inline.
 * Lives here so the size rules sit next to the limits they enforce.
 */
export function downscaleImageFile(file, {
  maxDimension = IMAGE_MAX_DIMENSION,
  quality = IMAGE_QUALITY,
} = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        // JPEG has no alpha channel — paint white first so transparent PNGs
        // don't come out with black backgrounds.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        let dataURL = canvas.toDataURL('image/jpeg', quality);
        // Very detailed images can still exceed the cap; step the quality down.
        let q = quality;
        while (dataURL.length > MAX_IMAGE_DATAURL && q > 0.4) {
          q -= 0.15;
          dataURL = canvas.toDataURL('image/jpeg', q);
        }
        if (dataURL.length > MAX_IMAGE_DATAURL) {
          reject(new Error(`"${file.name}" is too large even after compression.`));
          return;
        }
        resolve({
          name: file.name.replace(/\.[^.]+$/, '') + '.jpg',
          mime: 'image/jpeg',
          dataURL,
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
