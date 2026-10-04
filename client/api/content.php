<?php
/**
 * GET  /api/content.php            → contenus publiés (lu par toutes les pages du site)
 * POST /api/content.php {key,value} → enregistre un contenu (admin, en-tête X-Admin-Pass)
 */
require __DIR__ . '/_common.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $content = read_content();
    respond(['content' => (object) array_intersect_key($content, array_flip(PUBLIC_KEYS))]);
}

if ($method !== 'POST') respond(['error' => 'method'], 405);

require_admin();
$body = read_json_body(4 * 1024 * 1024);
$key = $body['key'] ?? '';
if (!is_string($key) || !in_array($key, PUBLIC_KEYS, true)) respond(['error' => 'bad_key'], 400);
if (!array_key_exists('value', $body) || !is_array($body['value'])) respond(['error' => 'bad_value'], 400);

if (!is_dir(DATA_DIR) && !mkdir(DATA_DIR, 0755, true)) respond(['error' => 'storage'], 500);

$lock = fopen(DATA_DIR . '/.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX)) respond(['error' => 'storage'], 500);

$content = read_content();
$content[$key] = $body['value'];
$tmp = DATA_FILE . '.tmp';
$ok = file_put_contents($tmp, json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) !== false
    && rename($tmp, DATA_FILE);

flock($lock, LOCK_UN);
fclose($lock);

if (!$ok) respond(['error' => 'storage'], 500);
respond(['ok' => true]);
