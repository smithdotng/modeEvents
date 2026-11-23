/**
 * Create the HEZP Strategic Group Leadership Summit event.
 *
 *   node scripts/create-summit-event.mjs                 # create or update
 *   node scripts/create-summit-event.mjs --dry-run       # show, change nothing
 *   node scripts/create-summit-event.mjs owner@email.com # pick the host account
 *
 * RUN scripts/migrate-attendee-indexes.mjs FIRST — this form makes email
 * optional, which the old unique email index does not allow.
 *
 * Idempotent: matches on title + date, so re-running updates that event
 * rather than creating a second one. The shareable code is never regenerated
 * once it exists, so a link already shared keeps working.
 *
 * Times are written as absolute UTC instants computed from Lagos wall-clock
 * (WAT, UTC+1, no daylight saving). This deliberately avoids the create page,
 * which sends a bare local string the server misreads in its own timezone.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ───────────────────────────────────────────────────────
try {
  readFileSync(resolve(__dir, '..', '.env.local'), 'utf8')
    .split('\n')
    .forEach(line => {
      const t = line.trim();
      if (!t || t.startsWith('#')) return;
      const eq = t.indexOf('=');
      if (eq === -1) return;
      const k = t.slice(0, eq).trim();
      if (!process.env[k]) process.env[k] = t.slice(eq + 1).trim();
    });
} catch { /* rely on the environment */ }

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌  MONGODB_URI is not set. Check .env.local.');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');
const ownerArg = process.argv.slice(2).find(a => a.includes('@'));
const OWNER_EMAIL = (ownerArg || process.env.ADMIN_EMAIL || '').split(',')[0].trim().toLowerCase();

// ── The 14 HEZP Strategic Group churches ──────────────────────────────────
const CHURCHES = [
  'CE JIWA',
  'CE KUDURU',
  'CE SUBURBAN',
  'CE DAWAKI 3',
  'CE LIFE CAMP',
  'CE ASOKORO',
  'CE PAIPE',
  'CE KAGINI 3',
  'CE KUBWA 2',
  'CE LIGHTWAY GIRI',
  'CE DEI DEI 3',
  'CE CBD 2',
  'CE KADO',
  'CE FULLNESS',
];

const POSITIONS = [
  'Pastor',
  'PCF Leader',
  'Outreach Coordinator',
  'Cell Leader',
  'Bible Study Class Teacher',
  'Cell Executive',
  'Service Unit Head',
  'Service Unit Executive',
];

// ── Registration form ─────────────────────────────────────────────────────
// Key order here is the order guests see. `name` is locked (always required);
// email is optional; phone is required and is the duplicate-RSVP key.
const FORM_FIELDS = [
  { key: 'name',  type: 'text',  label: 'Full name',     placeholder: 'Jane Doe',
    helpText: '', required: true,  options: [], maxImages: 0, core: true, locked: true },

  { key: 'email', type: 'email', label: 'Email address', placeholder: 'jane@example.com',
    helpText: 'Optional — leave blank if you prefer.', required: false, options: [], maxImages: 0, core: true, locked: false },

  { key: 'phone', type: 'phone', label: 'Phone number',  placeholder: '+234 803 123 4567',
    helpText: 'Used to confirm your registration.', required: true, options: [], maxImages: 0, core: true, locked: false },

  { key: 'church', type: 'select', label: 'Church', placeholder: '',
    helpText: '', required: true, options: CHURCHES, maxImages: 0, core: false, locked: false },

  { key: 'position', type: 'checkbox', label: 'Position', placeholder: '',
    helpText: 'Select all that apply.', required: true, options: POSITIONS, maxImages: 0, core: false, locked: false },
];

// ── Event details ─────────────────────────────────────────────────────────
// Saturday 28 November 2026, 09:00–15:00 Lagos time (WAT = UTC+1).
const EVENT = {
  title: 'The Kingdom and Prevailing Prayers',
  description:
    'A post-IPPC 2026 HEZP Strategic Group Leadership Summit with Esteemed Pastor Terfa Terfa, ' +
    'Group Pastor, The HEZP Strategic Group.',
  date: new Date('2026-11-28T08:00:00Z'),    // 09:00 WAT
  endDate: new Date('2026-11-28T14:00:00Z'), // 15:00 WAT
  venue: 'CHRIST EMBASSY KADO',
  address: 'NO 54 BALA KONE STREET, KADO, ABUJA FCT',
  capacity: 200,
  status: 'published',
  avatarsEnabled: false,
  formFields: FORM_FIELDS,
};

// Cover banner, pre-encoded beside this script.
let coverImage = '';
try {
  coverImage = readFileSync(resolve(__dir, 'assets', 'summit-cover.dataurl.txt'), 'utf8').trim();
} catch {
  console.warn('⚠️   assets/summit-cover.dataurl.txt not found — creating without a cover image.');
}
if (coverImage) EVENT.coverImage = coverImage;

// ── Minimal schemas (this script runs outside Next, so no "@/" aliases) ───
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: String, email: String, role: String,
}, { strict: false, collection: 'users' }));

const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({},
  { strict: false, collection: 'events', timestamps: true }));

async function main() {
  if (DRY_RUN) console.log('🔍  DRY RUN — nothing will be written\n');
  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('✅  Connected.\n');

  // ── Find the host account ───────────────────────────────────────────────
  let owner = null;
  if (OWNER_EMAIL) owner = await User.findOne({ email: OWNER_EMAIL }).lean();
  if (!owner) {
    const users = await User.find({}, { email: 1, name: 1, role: 1 }).limit(25).lean();
    console.error(OWNER_EMAIL
      ? `❌  No user found with email "${OWNER_EMAIL}".`
      : '❌  No owner email given (pass one as an argument, or set ADMIN_EMAIL).');
    console.error('\n    Accounts in this database:');
    users.forEach(u => console.error(`      ${u.email}   ${u.role || 'user'}`));
    console.error('\n    Re-run with:  node scripts/create-summit-event.mjs <email>');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`👤  Host: ${owner.name || '(no name)'} <${owner.email}>`);

  // ── Create or update ────────────────────────────────────────────────────
  const existing = await Event.findOne({ title: EVENT.title, date: EVENT.date });

  const fmt = d => new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos',
  }).format(d);

  console.log('');
  console.log(`   Title    : ${EVENT.title}`);
  console.log(`   Starts   : ${fmt(EVENT.date)} (Lagos)`);
  console.log(`   Ends     : ${fmt(EVENT.endDate)} (Lagos)`);
  console.log(`   Venue    : ${EVENT.venue}`);
  console.log(`   Address  : ${EVENT.address}`);
  console.log(`   Capacity : ${EVENT.capacity}`);
  console.log(`   Cover    : ${coverImage ? `${(coverImage.length / 1024).toFixed(0)} KB` : 'none'}`);
  console.log(`   Form     : ${FORM_FIELDS.map(f => f.label + (f.required ? '*' : '')).join(', ')}`);
  console.log(`   Churches : ${CHURCHES.length}`);
  console.log(`   Positions: ${POSITIONS.length}`);
  console.log('');

  if (DRY_RUN) {
    console.log(existing
      ? `→  Would UPDATE existing event ${existing._id} (code ${existing.uniqueCode}).`
      : '→  Would CREATE a new event.');
    await mongoose.disconnect();
    process.exit(0);
  }

  let saved;
  if (existing) {
    Object.assign(existing, EVENT);          // keeps uniqueCode and _id
    saved = await existing.save();
    console.log(`♻️   Updated existing event (shareable code unchanged).`);
  } else {
    saved = await Event.create({
      ...EVENT,
      userId: owner._id,
      uniqueCode: 'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      featured: false,
      frameImage: '',
      frameZone: { x: 10, y: 10, w: 30, h: 30, shape: 'rect' },
    });
    console.log('🎉  Event created.');
  }

  const base = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  console.log(`\n   ID         : ${saved._id}`);
  console.log(`   Code       : ${saved.uniqueCode}`);
  console.log(`   Public link: ${base}/e/${saved.uniqueCode}`);
  console.log(`   Manage     : ${base}/events/${saved._id}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌  Failed:', err.message);
  process.exit(1);
});
