<?php
/**
 * Copy this file to config.php on your shared host and fill in the values.
 * Do NOT commit config.php to git — it holds the shared secret.
 */

return [
    // Must match UPLOAD_SHARED_SECRET in your Vercel environment variables.
    // Generate with:  openssl rand -hex 32
    'shared_secret' => 'PASTE_THE_SAME_SECRET_AS_VERCEL',

    // Browser origins allowed to upload. Include your production domain and,
    // if you want to test locally, http://localhost:3000
    'allowed_origins' => [
        'https://mode-events.vercel.app',
        'http://localhost:3000',
    ],

    // Absolute path on the server where images are written.
    // Best practice is a directory that is web-readable but has script
    // execution disabled — the bundled uploads/.htaccess does that.
    'storage_dir' => __DIR__ . '/uploads',

    // Public URL that maps to storage_dir above.
    'public_base_url' => 'https://files.example.com/uploads',

    // Largest accepted image. Keep at or below your php.ini upload_max_filesize
    // and post_max_size, otherwise PHP rejects the request before this runs.
    'max_bytes' => 3 * 1024 * 1024,
];
