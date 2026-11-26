/**
 * Bulk-register delegates for the Summit.
 *
 *   node scripts/register-delegates.mjs --dry-run     # show what would happen
 *   node scripts/register-delegates.mjs               # register them
 *
 * Run AFTER scripts/create-summit-event.mjs (the event must exist) and after
 * scripts/migrate-attendee-indexes.mjs (these delegates have no email address,
 * which the old unique email index does not allow).
 *
 * Idempotent: anyone whose phone number is already registered for this event
 * is skipped, so re-running after adding names to the list is safe. Phone
 * numbers are matched on their last 10 digits, so 0803… and +234803… are
 * recognised as the same person.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dir = dirname(fileURLToPath(import.meta.url));

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
const EVENT_TITLE = 'The Kingdom and Prevailing Prayers';

// ── The delegates ─────────────────────────────────────────────────────────
// Every one of these is registered as a Cell Leader.
// Titles come from how each name was submitted; the three marked below were
// not given a title and are noted in the run summary.
const DELEGATES = [
  // ── CE LIFE CAMP ────────────────────────────────────────────────────────
  { church: 'CE LIFE CAMP', name: 'Brother Domnic',    phone: '+234 703 720 7042' },
  { church: 'CE LIFE CAMP', name: 'Sister Promise',    phone: '09127203183' },
  { church: 'CE LIFE CAMP', name: 'Brother Danjuma',   phone: '09130674041', titleInferred: true },
  { church: 'CE LIFE CAMP', name: 'Sister Mercy',      phone: '08032357282' },
  { church: 'CE LIFE CAMP', name: 'Brother Jacob',     phone: '08068710397' },
  { church: 'CE LIFE CAMP', name: 'Brother Frank',     phone: '+234 810 362 7405' },
  { church: 'CE LIFE CAMP', name: 'Brother Benjamin',  phone: '09162205650' },
  { church: 'CE LIFE CAMP', name: 'Brother Phelimon',  phone: '09071206776', titleInferred: true },
  { church: 'CE LIFE CAMP', name: 'Brother Solomon',   phone: '09126094700' },
  { church: 'CE LIFE CAMP', name: 'Brother Stephen',   phone: '08108207449' },

  // ── CE KUBWA 2 ──────────────────────────────────────────────────────────
  { church: 'CE KUBWA 2', name: 'Sister Ann Igiri',              phone: '08038876846' },
  { church: 'CE KUBWA 2', name: 'Sister Deborah Otun',           phone: '09041201059' },
  { church: 'CE KUBWA 2', name: 'Brother Ifranyi Obi',           phone: '07018153934' },
  { church: 'CE KUBWA 2', name: 'Brother Kika Michel',           phone: '08106615237' },
  { church: 'CE KUBWA 2', name: 'Sister Chika Nghada',           phone: '08065745964' },
  { church: 'CE KUBWA 2', name: 'Sister Peace Edward',           phone: '08060032221' },
  { church: 'CE KUBWA 2', name: 'Sister Prescious Akinfaderin',  phone: '08136896112' },
  { church: 'CE KUBWA 2', name: 'Sister Angel Iheanacho',        phone: '08023789878' },
  { church: 'CE KUBWA 2', name: 'Brother Samuel',                phone: '08110301306' },
  { church: 'CE KUBWA 2', name: 'Abbey Bobby',                   phone: '08062471436', titleMissing: true },
  { church: 'CE KUBWA 2', name: 'Brother Friday Joseph',         phone: '08065603814' },
  { church: 'CE KUBWA 2', name: 'Sister Dorothy Ugwu',           phone: '08165525890' },
  { church: 'CE KUBWA 2', name: 'Brother Hanson Philip',         phone: '08055526716' },
  { church: 'CE KUBWA 2', name: 'Sister Newness',                phone: '07043949066' },
  { church: 'CE KUBWA 2', name: 'Sister Bernardine Awuzubike',   phone: '08130467085' },
  { church: 'CE KUBWA 2', name: 'Brother Emmanuel Okolocha',     phone: '08162693019' },
  { church: 'CE KUBWA 2', name: 'Brother Ewuzie Onywka',         phone: '08033259344' },
  { church: 'CE KUBWA 2', name: 'Brother Godfrey Ehimwenma',     phone: '08055244389' },
  { church: 'CE KUBWA 2', name: 'Brother Chucks Okoro',          phone: '07066697280' },
  { church: 'CE KUBWA 2', name: 'Sister Abigail Emmanuel',       phone: '08033062236' },
  { church: 'CE KUBWA 2', name: 'Brother Emmanuel Ogbono',       phone: '07068791348' },
  { church: 'CE KUBWA 2', name: 'Sister Catherine Tanko',        phone: '08149604828' },
];

const POSITION = 'Cell Leader';

// Same rule as lib/formFields.js — inlined so this script needs no build aliases.
function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length < 7) return '';
  return digits.slice(-10);
}

const Event = mongoose.models.Event || mongoose.model('Event',
  new mongoose.Schema({}, { strict: false, collection: 'events', timestamps: true }));
const Attendee = mongoose.models.Attendee || mongoose.model('Attendee',
  new mongoose.Schema({}, { strict: false, collection: 'attendees', timestamps: true }));

function ticketCode() {
  return 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function main() {
  if (DRY_RUN) console.log('🔍  DRY RUN — nothing will be written\n');
  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('✅  Connected.\n');

  // ── Find the event ──────────────────────────────────────────────────────
  const codeArg = process.argv.find(a => /^EVT-/i.test(a));
  const event = codeArg
    ? await Event.findOne({ uniqueCode: codeArg.toUpperCase() })
    : await Event.findOne({ title: EVENT_TITLE });

  if (!event) {
    console.error(`❌  Event not found${codeArg ? ` for code ${codeArg}` : `: "${EVENT_TITLE}"`}.`);
    console.error('    Run  node scripts/create-summit-event.mjs <your-email>  first.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`🎟  Event: ${event.title}  (${event.uniqueCode})`);

  // ── Validate churches and the position against the event's own form ─────
  const fields = Array.isArray(event.formFields) ? event.formFields : [];
  const churchField = fields.find(f => f.key === 'church');
  const positionField = fields.find(f => f.key === 'position');

  if (churchField?.options?.length) {
    const unknown = [...new Set(DELEGATES.map(d => d.church))]
      .filter(c => !churchField.options.includes(c));
    if (unknown.length) {
      console.error(`❌  These churches are not options on the form: ${unknown.join(', ')}`);
      console.error(`    Form offers: ${churchField.options.join(', ')}`);
      await mongoose.disconnect();
      process.exit(1);
    }
  }
  if (positionField?.options?.length && !positionField.options.includes(POSITION)) {
    console.error(`❌  "${POSITION}" is not an option on the form.`);
    console.error(`    Form offers: ${positionField.options.join(', ')}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log('✅  Churches and position match the registration form.\n');

  // ── Work out who is new ─────────────────────────────────────────────────
  const existing = await Attendee.find({ eventId: event._id }, { phoneKey: 1, name: 1 }).lean();
  const taken = new Map(existing.filter(a => a.phoneKey).map(a => [a.phoneKey, a.name]));

  const toAdd = [];
  const skipped = [];
  for (const d of DELEGATES) {
    const key = normalizePhone(d.phone);
    if (!key) { skipped.push([d.name, 'unusable phone number']); continue; }
    if (taken.has(key)) { skipped.push([d.name, `already registered as "${taken.get(key)}"`]); continue; }
    taken.set(key, d.name); // guards against duplicates inside this list too
    toAdd.push({ ...d, phoneKey: key });
  }

  // ── Capacity ────────────────────────────────────────────────────────────
  const current = existing.length;
  const capacity = Number(event.capacity) || 0;
  console.log(`   Already registered : ${current}`);
  console.log(`   New in this list   : ${toAdd.length}`);
  console.log(`   Skipped            : ${skipped.length}`);
  if (capacity > 0) {
    console.log(`   Capacity           : ${current + toAdd.length} of ${capacity} after this run`);
    if (current + toAdd.length > capacity) {
      console.error(`\n❌  That would exceed the ${capacity}-place capacity. Raise it on the event first.`);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  const byChurch = {};
  toAdd.forEach(d => { byChurch[d.church] = (byChurch[d.church] || 0) + 1; });
  console.log(`   By church          : ${Object.entries(byChurch).map(([c, n]) => `${c} ${n}`).join(', ')}`);

  if (skipped.length) {
    console.log('\n   Skipped:');
    skipped.forEach(([n, why]) => console.log(`     ${n} — ${why}`));
  }

  const unsure = DELEGATES.filter(d => d.titleInferred || d.titleMissing);
  if (unsure.length) {
    console.log('\n⚠️   Titles worth checking before you publish an attendance list:');
    unsure.forEach(d => console.log(
      `     ${d.name}${d.titleMissing ? '  ← no Brother/Sister given' : '  ← title inferred from the name'}`));
  }

  if (DRY_RUN) {
    console.log('\n   Would register:');
    toAdd.forEach(d => console.log(`     ${d.church.padEnd(14)} ${d.name.padEnd(30)} ${d.phone}`));
    await mongoose.disconnect();
    console.log('\n🔍  Dry run complete — nothing was written.');
    process.exit(0);
  }

  if (!toAdd.length) {
    console.log('\n✅  Nothing to do — everyone on this list is already registered.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Insert ──────────────────────────────────────────────────────────────
  const docs = toAdd.map(d => ({
    eventId: event._id,
    name: d.name,
    email: '',
    phone: d.phone.trim(),
    phoneKey: d.phoneKey,
    responses: [
      { fieldKey: 'church',   label: 'Church',   type: 'select',   value: d.church },
      { fieldKey: 'position', label: 'Position', type: 'checkbox', value: [POSITION] },
    ],
    photo: '',
    compositeImage: '',
    ticketCode: ticketCode(),
    checkedIn: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // ordered:false so one bad row cannot abort the rest
  let inserted = 0;
  try {
    const res = await Attendee.collection.insertMany(docs, { ordered: false });
    inserted = res.insertedCount;
  } catch (err) {
    inserted = err?.result?.nInserted ?? err?.insertedCount ?? 0;
    const dupes = (err.writeErrors || []).filter(e => e.err?.code === 11000);
    const others = (err.writeErrors || []).filter(e => e.err?.code !== 11000);
    if (dupes.length) console.log(`\n   ${dupes.length} rejected as duplicates by the database.`);
    others.forEach(e => console.error(`   ❌ ${e.err?.errmsg || e.errmsg}`));
  }

  console.log(`\n🎉  Registered ${inserted} delegate(s).`);

  const total = await Attendee.countDocuments({ eventId: event._id });
  console.log(`   Total registered for this event: ${total}${capacity ? ` of ${capacity}` : ''}`);

  const base = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  console.log(`   Attendee list: ${base}/events/${event._id}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌  Failed:', err.message);
  process.exit(1);
});
