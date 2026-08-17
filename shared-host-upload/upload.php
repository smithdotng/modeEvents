<?php
/**
 * modeEvents — image upload receiver for shared hosting.
 *
 * The browser uploads images here directly, which keeps them out of the
 * Next.js request path entirely (Vercel rejects request bodies over 4.5 MB).
 * Only the returned URL is sent on to the app and stored in MongoDB.
 *
 * SECURITY MODEL
 * --------------
 * A publicly reachable upload endpoint is a standard route to remote code
 * execution, so nothing here trusts the client:
 *
 *  1. Every request must carry a short-lived HMAC token minted by the app
 *     (/api/uploads/sign). The shared secret never reaches the browser.
 *  2. The file must actually decode as an image (getimagesize), not merely
 *     claim to be one via extension or Content-Type — both are client-supplied.
 *  3. The stored filename is generated here. The client's filename is used
 *     only as a display label and never touches the filesystem.
 *  4. The extension is forced from a whitelist keyed off the detected image
 *     type, so a .php or .phtml payload cannot be written under any name.
 *  5. uploads/.htaccess disables script execution in the storage directory,
 *     as defence in depth if items 2–4 were ever bypassed.
 *
 * INSTALL: see README.md in this folder.
 */

declare(strict_types=1);

$config = require __DIR__ . '/config.php';

// ── CORS ───────────────────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $config['allowed_origins'], true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Upload-Token');
    header('Access-Control-Max-Age: 86400');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function fail(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Method not allowed.');
}
if ($origin !== '' && !in_array($origin, $config['allowed_origins'], true)) {
    fail(403, 'Origin not allowed.');
}

// ── 1. Verify the signed token ─────────────────────────────────────────────
$token = $_SERVER['HTTP_X_UPLOAD_TOKEN'] ?? '';
if ($token === '') {
    fail(401, 'Missing upload token.');
}

$parts = explode('.', $token);
if (count($parts) !== 2) {
    fail(401, 'Malformed upload token.');
}
[$payloadB64, $signature] = $parts;

$expected = hash_hmac('sha256', $payloadB64, $config['shared_secret']);
// hash_equals is constant-time; a plain === leaks signature bytes via timing.
if (!hash_equals($expected, $signature)) {
    fail(401, 'Invalid upload token.');
}

$payloadJson = base64_decode(strtr($payloadB64, '-_', '+/'), true);
if ($payloadJson === false) {
    fail(401, 'Malformed upload token.');
}
$payload = json_decode($payloadJson, true);
if (!is_array($payload) || !isset($payload['exp'])) {
    fail(401, 'Malformed upload token.');
}
if ((int) $payload['exp'] < time()) {
    fail(401, 'Upload token has expired. Please try again.');
}

// ── 2. Basic upload sanity ─────────────────────────────────────────────────
if (!isset($_FILES['file'])) {
    fail(400, 'No file received.');
}
$file = $_FILES['file'];

if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    $reason = ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE)
        ? 'File is larger than this server accepts.'
        : 'Upload failed.';
    fail(400, $reason);
}
// Guards against a forged $_FILES entry pointing at an arbitrary local path.
if (!is_uploaded_file($file['tmp_name'])) {
    fail(400, 'Invalid upload.');
}
if ($file['size'] > $config['max_bytes']) {
    fail(413, 'Image must be under ' . round($config['max_bytes'] / 1048576, 1) . ' MB.');
}

// ── 3. Prove it is really an image ─────────────────────────────────────────
$info = @getimagesize($file['tmp_name']);
if ($info === false) {
    fail(415, 'That file is not a valid image.');
}

// Extension is derived from the DETECTED type, never from the client filename.
$allowed = [
    IMAGETYPE_JPEG => ['jpg',  'image/jpeg'],
    IMAGETYPE_PNG  => ['png',  'image/png'],
    IMAGETYPE_GIF  => ['gif',  'image/gif'],
    IMAGETYPE_WEBP => ['webp', 'image/webp'],
];
$type = $info[2];
if (!isset($allowed[$type])) {
    fail(415, 'Unsupported image format. Use JPEG, PNG, GIF or WebP.');
}
[$ext, $mime] = $allowed[$type];

// ── 4. Store under a generated name ────────────────────────────────────────
$subdir = date('Y/m');
$dir    = rtrim($config['storage_dir'], '/') . '/' . $subdir;
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
    fail(500, 'Could not create storage directory.');
}

try {
    $name = bin2hex(random_bytes(16)) . '.' . $ext;
} catch (Exception $e) {
    fail(500, 'Server entropy unavailable.');
}
$target = $dir . '/' . $name;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    fail(500, 'Could not store the image.');
}
@chmod($target, 0644);

$url = rtrim($config['public_base_url'], '/') . '/' . $subdir . '/' . $name;

echo json_encode([
    'url'    => $url,
    'name'   => $name,
    'mime'   => $mime,
    'width'  => $info[0],
    'height' => $info[1],
    'bytes'  => $file['size'],
]);
