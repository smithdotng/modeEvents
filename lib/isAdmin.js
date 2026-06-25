/**
 * Returns true if the given session user is a superadmin.
 * Checks the role stored in the JWT (threaded via lib/auth.js).
 * Falls back to ADMIN_EMAIL env var for backwards-compatibility
 * during the transition period.
 */
export function isAdmin(sessionUser) {
  if (!sessionUser) return false;

  // Primary check: role stored in DB and threaded through JWT
  if (sessionUser.role === 'superadmin') return true;

  // Legacy fallback: ADMIN_EMAIL env var (can be removed once
  // all admins have been seeded with role='superadmin')
  const envEmails = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  return envEmails.includes(sessionUser.email?.toLowerCase());
}
