<?php
/**
 * POST /api/upload.php {data: "data:image/...;base64,..."} → {url: "/uploads/xxx.jpg"}
 * Réservé à l’admin (en-tête X-Admin-Pass) et aux propriétaires connectés (en-tête X-Owner-Token).
 */
require __DIR__ . '/_common.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond(['error' => 'method'], 405);
require_admin_or_owner();

$body = read_json_body(12 * 1024 * 1024);
$data = $body['data'] ?? '';
if (!is_string($data) || !preg_match('#^data:image/[a-z+.-]+;base64,#i', $data)) respond(['error' => 'bad_image'], 400);

$bytes = base64_decode(substr($data, strpos($data, ',') + 1), true);
if ($bytes === false || strlen($bytes) > 8 * 1024 * 1024) respond(['error' => 'bad_image'], 400);

$mime = (new finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
$extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
if (!isset($extensions[$mime])) respond(['error' => 'bad_type'], 400);

if (!is_dir(UPLOAD_DIR) && !mkdir(UPLOAD_DIR, 0755, true)) respond(['error' => 'storage'], 500);

$name = date('Ymd-His') . '-' . bin2hex(random_bytes(6)) . '.' . $extensions[$mime];
if (file_put_contents(UPLOAD_DIR . '/' . $name, $bytes) === false) respond(['error' => 'storage'], 500);

respond(['url' => '/uploads/' . $name]);
