/**
 * Migrate the Attendee indexes for optional-email RSVPs.
 *
 * Run ONCE, from the project root, before accepting RSVPs on a form where
 * email is not required:
 *
 *   node scripts/migrate-attendee-indexes.mjs
 *
 * WHY THIS IS NEEDED
 * ------------------
 * The collection has a plain unique index on { eventId, email } from when
 * email was mandatory. A plain unique index treats every attendee without an
 * email as the *same* person, so the first phone-only RSVP would succeed and
 * every one after it would be rejected with a duplicate-key error.
 *
 * Mongoose creates new indexes automatically but never drops old ones, so the
 * old index has to be removed explicitly — that is this script's job.
 *
 * It replaces it with two PARTIAL unique indexes that skip blank values:
 *   { eventId, phoneKey } where phoneKey > ''   ← primary identity
 *   { eventId, email }    where email    > ''   ← still blocks dup emails
 *
 * It also backfills `phoneKey` for existing attendees.
 *
 * Safe to re-run: every step checks the current state first.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// ── Load .env.local without needing dotenv ────────────────────────────────
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

// Same normalisation as lib/formFields.js — kept inline so this script has no
// build-time import aliases to resolve.
function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length < 7) return '';
  return digits.slice(-10);
}

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(DRY_RUN ? '🔍  DRY RUN — no changes will be written\n' : '');
  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('✅  Connected.\n');

  const col = mongoose.connection.db.collection('attendees');

  // ── 1. Report what exists now ───────────────────────────────────────────
  const before = await col.indexes();
  console.log('Current indexes:');
  before.forEach(i => {
    const partial = i.partialFilterExpression ? ' [partial]' : '';
    console.log(`   ${i.name}  keys=${JSON.stringify(i.key)}${i.unique ? ' UNIQUE' : ''}${partial}`);
  });
  console.log('');

  const total = await col.countDocuments();
  const noEmail = await col.countDocuments({ $or: [{ email: '' }, { email: null }, { email: { $exists: false } }] });
  console.log(`Attendees: ${total} total, ${noEmail} without an email\n`);

  // ── 2. Backfill phoneKey ────────────────────────────────────────────────
  const needKey = await col.find(
    { $or: [{ phoneKey: { $exists: false } }, { phoneKey: '' }], phone: { $gt: '' } },
    { projection: { phone: 1 } }
  ).toArray();

  if (needKey.length === 0) {
    console.log('✅  phoneKey already populated (or no attendees have phones).');
  } else if (DRY_RUN) {
    console.log(`→  Would backfill phoneKey for ${needKey.length} attendee(s).`);
  } else {
    const ops = needKey
      .map(d => ({ d, key: normalizePhone(d.phone) }))
      .filter(x => x.key)
      .map(x => ({ updateOne: { filter: { _id: x.d._id }, update: { $set: { phoneKey: x.key } } } }));
    if (ops.length) {
      const r = await col.bulkWrite(ops);
      console.log(`✅  Backfilled phoneKey for ${r.modifiedCount} attendee(s).`);
    } else {
      console.log('✅  No phone numbers long enough to key.');
    }
  }

  // ── 3. Warn about duplicates that would block the new index ─────────────
  for (const [field, label] of [['phoneKey', 'phone number'], ['email', 'email']]) {
    const dupes = await col.aggregate([
      { $match: { [field]: { $gt: '' } } },
      { $group: { _id: { eventId: '$eventId', v: `$${field}` }, n: { $sum: 1 }, names: { $push: '$name' } } },
      { $match: { n: { $gt: 1 } } },
    ]).toArray();
    if (dupes.length) {
      console.log(`\n⚠️   ${dupes.length} duplicate ${label}(s) already in the data:`);
      dupes.slice(0, 10).forEach(d => console.log(`     ${d._id.v} × ${d.n}  (${d.names.join(', ')})`));
      console.log(`     The unique index cannot be built until these are resolved.`);
    }
  }

  // ── 4. Drop the old index ───────────────────────────────────────────────
  const old = before.find(i =>
    JSON.stringify(i.key) === JSON.stringify({ eventId: 1, email: 1 }) &&
    i.unique && !i.partialFilterExpression
  );
  if (!old) {
    console.log('\n✅  Old non-partial unique email index is already gone.');
  } else if (DRY_RUN) {
    console.log(`\n→  Would drop index "${old.name}".`);
  } else {
    await col.dropIndex(old.name);
    console.log(`\n✅  Dropped old index "${old.name}".`);
  }

  // ── 5. Create the partial indexes ───────────────────────────────────────
  const wanted = [
    { key: { eventId: 1, phoneKey: 1 }, filter: { phoneKey: { $gt: '' } }, name: 'eventId_1_phoneKey_1' },
    { key: { eventId: 1, email: 1 },    filter: { email:    { $gt: '' } }, name: 'eventId_1_email_1_partial' },
  ];

  for (const w of wanted) {
    const exists = (await col.indexes()).some(i => i.name === w.name);
    if (exists) { console.log(`✅  Index ${w.name} already present.`); continue; }
    if (DRY_RUN) { console.log(`→  Would create ${w.name}.`); continue; }
    try {
      await col.createIndex(w.key, { unique: true, partialFilterExpression: w.filter, name: w.name });
      console.log(`✅  Created ${w.name}.`);
    } catch (e) {
      console.error(`❌  Could not create ${w.name}: ${e.message}`);
      console.error('    Resolve the duplicates listed above, then re-run.');
    }
  }

  console.log('\nFinal indexes:');
  (await col.indexes()).forEach(i => {
    const partial = i.partialFilterExpression ? ` [partial: ${JSON.stringify(i.partialFilterExpression)}]` : '';
    console.log(`   ${i.name}  keys=${JSON.stringify(i.key)}${i.unique ? ' UNIQUE' : ''}${partial}`);
  });

  await mongoose.disconnect();
  console.log(DRY_RUN ? '\n🔍  Dry run complete — nothing was changed.' : '\n🎉  Migration complete.');
  process.exit(0);
}

main().catch(err => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});
