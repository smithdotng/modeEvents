# Image uploads on shared hosting

Images are uploaded **from the guest's browser straight to your shared host**,
never through the Next.js app. Only the resulting URL reaches the app and gets
stored in MongoDB.

That routing is deliberate. Vercel rejects any request body over **4.5 MB** with
a `413`, and MongoDB documents are capped at 16 MB — sending images through the
app would run into both. Going direct sidesteps them entirely.

```
browser  ──1── POST /api/uploads/sign          (Vercel)  → short-lived HMAC token
         ──2── POST upload.php + token         (your host) → { url }
         ──3── POST /api/public/<code>/rsvp    (Vercel)  → stores the URL only
```

The shared secret lives on the server and in your host's `config.php`. It is
never sent to the browser — the browser only ever holds a token that expires in
five minutes and is scoped to one published event.

---

## 1. Upload the files

Copy this folder's contents to your host, for example into
`public_html/files/`:

```
public_html/files/upload.php
public_html/files/config.php          <- you create this, from the sample
public_html/files/uploads/.htaccess
```

Create the `uploads` directory and make it writable by PHP:

```
mkdir -p public_html/files/uploads
chmod 755 public_html/files/uploads
```

`.htaccess` must be inside `uploads/`, not next to `upload.php`. It is what
stops anything in that directory from ever executing.

## 2. Generate the shared secret

```
openssl rand -hex 32
```

Use the same value in both places below.

## 3. Configure the host

Copy `config.sample.php` to `config.php` and edit it:

| Setting | Value |
|---|---|
| `shared_secret` | The value from step 2 |
| `allowed_origins` | Your app's origins, e.g. `https://mode-events.vercel.app` |
| `storage_dir` | Absolute path to the `uploads` directory |
| `public_base_url` | The public URL that serves that directory |
| `max_bytes` | At or below your PHP `upload_max_filesize` |

**Do not commit `config.php` to git.** It holds the secret.

## 4. Configure the app

Add to Vercel (Settings → Environment Variables) and to your local
`.env.local`:

```
UPLOAD_SHARED_SECRET=<the value from step 2>
NEXT_PUBLIC_UPLOAD_ENDPOINT=https://yourdomain.com/files/upload.php
```

`UPLOAD_SHARED_SECRET` must **not** be prefixed with `NEXT_PUBLIC_` — that
prefix would inline it into the JavaScript bundle and publish it.

Redeploy. With both variables set the app switches to hosted uploads
automatically; with either missing it falls back to storing images inline, so
nothing breaks if you set this up later.

## 5. Check your PHP limits

Shared hosts often default `upload_max_filesize` to 2 MB. In cPanel look under
**Select PHP Version → Options**, or add to `.htaccess` beside `upload.php`:

```
php_value upload_max_filesize 4M
php_value post_max_size 5M
```

`post_max_size` must exceed `upload_max_filesize`, or PHP discards the request
before `upload.php` runs.

---

## Verifying it works

Uploaded files should be unreachable as code. After your first upload, try
fetching a stored image with `.php` appended to its name — you should get a
403 or a plain-text response, never execution.

To confirm the `.htaccess` is active at all, put a file containing
`<?php echo "EXECUTED"; ?>` in `uploads/test.php` and request it. You should
see the source text or an error, **not** the word `EXECUTED`. Delete it after
testing.

## What is validated on upload

| Check | Why |
|---|---|
| HMAC token + expiry | Endpoint is not an open upload for anyone who finds it |
| `getimagesize()` | The file genuinely decodes as an image; extension and `Content-Type` are client-supplied and worthless |
| Extension whitelist from the *detected* type | A `.php` payload cannot be written under any filename |
| Random 32-hex filename | No path traversal, no overwriting, no guessable URLs |
| `is_uploaded_file()` | Blocks a forged `$_FILES` entry pointing at a local path |
| `hash_equals()` | Constant-time signature comparison; `===` leaks bytes via timing |
| Size limit | Rejects oversized files before they are written |

## Housekeeping

Deleting an event removes its attendees from MongoDB but **not** their uploaded
images — those stay on your host. If that matters, either add a cleanup step to
the delete route or periodically remove files older than your retention window:

```
find public_html/files/uploads -type f -mtime +365 -delete
```

## Backups

These images are not in your database backups. Include
`public_html/files/uploads` in whatever backup your host provides.
