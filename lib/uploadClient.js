'use client';
import { downscaleImageFile, uploadEndpoint, validateUploadEndpoint } from '@/lib/formFields';

/**
 * Browser-side image upload to the shared-hosting receiver.
 *
 * The image is downscaled locally, then POSTed straight to the file host with
 * a short-lived token fetched from our own API. It deliberately does not pass
 * through a Next.js route: platform request body limits (4.5 MB on Vercel)
 * apply to our functions but not to the file host.
 */

let cached = null; // { token, endpoint, expiresAt }
let warned = false;

/**
 * Fail fast on a bad NEXT_PUBLIC_UPLOAD_ENDPOINT rather than POSTing an image
 * at it and waiting for a timeout.
 */
function assertEndpointUsable() {
  const check = validateUploadEndpoint();
  if (!check.ok) {
    if (!warned) { console.error('[upload] ' + check.error); warned = true; }
    throw new Error(check.error || 'Image hosting is not configured.');
  }
  if (check.warning && !warned) { console.warn('[upload] ' + check.warning); warned = true; }
}

async function getToken(code) {
  const now = Math.floor(Date.now() / 1000);
  // Reuse while comfortably valid so picking several images costs one round trip.
  if (cached && cached.expiresAt - now > 30) return cached;

  const res = await fetch('/api/uploads/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Could not authorise the upload.');
  }

  cached = await res.json();
  return cached;
}

/** Force a fresh token — used after a 401 in case the cached one just expired. */
function clearToken() {
  cached = null;
}

/**
 * Downscale then upload one file.
 * @returns {Promise<{name: string, mime: string, url: string}>}
 */
export async function uploadImage(file, code) {
  assertEndpointUsable();

  const scaled = await downscaleImageFile(file);

  // downscaleImageFile hands back a data URL; convert to a Blob to post it as
  // real multipart form data rather than an inflated base64 string.
  const blob = await (await fetch(scaled.dataURL)).blob();

  const send = async () => {
    const { token, endpoint } = await getToken(code);
    const body = new FormData();
    body.append('file', blob, scaled.name);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'X-Upload-Token': token },
      body,
    });
    return res;
  };

  let res = await send();
  if (res.status === 401) {
    clearToken();
    res = await send();
  }

  if (!res.ok) {
    let message = `Upload failed (${res.status}).`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* non-JSON error page from the host — keep the status message */
    }
    throw new Error(message);
  }

  const data = await res.json();
  if (!data?.url) throw new Error('The file host did not return an image URL.');

  return { name: file.name, mime: data.mime || scaled.mime, url: data.url };
}

export { uploadEndpoint };
