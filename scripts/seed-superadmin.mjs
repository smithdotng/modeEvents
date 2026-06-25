/**
 * Seed / upsert the superadmin user.
 *
 * Usage (run once from the project root):
 *   node scripts/seed-superadmin.mjs
 *
 * It reads MONGODB_URI from .env.local automatically via --env-file,
 * or you can pass it inline:
 *   MONGODB_URI="mongodb+srv://..." node scripts/seed-superadmin.mjs
 *
 * The script is idempotent — re-running it updates the password if
 * the user already exists, and always ensures role='superadmin'.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Manually parse .env.local so we don't need dotenv ─────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, '..', '.env.local');
try {
  readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    });
} catch { /* .env.local not found, rely on env already being set */ }

// ── Config — edit these before running ─────────────────────────────────────
const SUPERADMIN = {
  name:     'Hugo (Superadmin)',
  email:    'stanleyebosie@gmail.com',   // ← your email
  password: 'ChangeMe123!',              // ← choose a strong password
};
// ───────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌  MONGODB_URI is not set. Check your .env.local file.');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name:     String,
  email:    { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  role:     { type: String, enum: ['user', 'superadmin'], default: 'user' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('✅  Connected.');

  const hash = await bcrypt.hash(SUPERADMIN.password, 12);

  const result = await User.findOneAndUpdate(
    { email: SUPERADMIN.email.toLowerCase() },
    {
      $set: {
        name:     SUPERADMIN.name,
        password: hash,
        role:     'superadmin',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`\n🎉  Superadmin upserted successfully!`);
  console.log(`   ID    : ${result._id}`);
  console.log(`   Name  : ${result.name}`);
  console.log(`   Email : ${result.email}`);
  console.log(`   Role  : ${result.role}`);
  console.log(`\n⚠️   Remember to change the password after first login.`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
