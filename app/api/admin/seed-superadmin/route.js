/**
 * POST /api/admin/seed-superadmin
 *
 * One-time bootstrap endpoint: creates (or upgrades) the superadmin user.
 * Protected by a SEED_SECRET env var so it can only be called by someone
 * who has access to your environment variables.
 *
 * Call once after deploying:
 *   curl -X POST https://your-domain/api/admin/seed-superadmin \
 *        -H "Content-Type: application/json" \
 *        -d '{"secret":"<SEED_SECRET>","name":"Hugo","email":"stanleyebosie@gmail.com","password":"YourPassword123!"}'
 *
 * Or simply open this URL in a browser using the form on /admin/setup.
 * After first use, delete or disable this route.
 */
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  const { secret, name, email, password } = await req.json();

  // Guard: require matching SEED_SECRET
  const expected = process.env.SEED_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Invalid or missing seed secret.' }, { status: 403 });
  }

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Email and a password of 8+ characters are required.' }, { status: 400 });
  }

  await connectDB();

  const hash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { name: name || 'Superadmin', password: hash, role: 'superadmin' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({
    ok: true,
    message: 'Superadmin upserted successfully.',
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}
