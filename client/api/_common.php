<?php
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const DATA_DIR = __DIR__ . '/data';
const DATA_FILE = DATA_DIR . '/content.json';
const UPLOAD_DIR = __DIR__ . '/../uploads';

/** Contenus publiés sur le site */
const PUBLIC_KEYS = ['at_gallery', 'at_circuits', 'at_destinations', 'at_activities'];

function respond($data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_content(): array
{
    if (!is_file(DATA_FILE)) return [];
    $json = json_decode((string) file_get_contents(DATA_FILE), true);
    return is_array($json) ? $json : [];
}

/** Clé admin acceptée par le backend (résultat positif mis en cache 1 h, sous forme de hash) */
function backend_accepts(string $key): bool
{
    $cache = DATA_DIR . '/admin-key.json';
    $hash = hash('sha256', $key);
    $saved = is_file($cache) ? json_decode((string) file_get_contents($cache), true) : null;
    if (is_array($saved) && ($saved['hash'] ?? '') === $hash && ($saved['until'] ?? 0) > time()) return true;

    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode(['key' => $key]),
        'timeout' => 70,
        'ignore_errors' => true,
    ]]);
    $raw = @file_get_contents(BACKEND_API . '/admin/auth/verify', false, $context);
    $reply = is_string($raw) ? json_decode($raw, true) : null;
    $ok = is_array($reply) && ($reply['valid'] ?? false) === true;
    if ($ok && (is_dir(DATA_DIR) || mkdir(DATA_DIR, 0755, true))) {
        file_put_contents($cache, json_encode(['hash' => $hash, 'until' => time() + 3600]));
    }
    return $ok;
}

function require_admin(): void
{
    $pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
    if (!is_string($pass) || $pass === '') respond(['error' => 'unauthorized'], 401);
    if (backend_accepts($pass)) return;
    respond(['error' => 'unauthorized'], 401);
}

/** Jeton propriétaire valide (vérifié par GET /owner/me, résultat positif mis en cache 10 min) */
function owner_token_valid(string $token): bool
{
    if (!preg_match('/^[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/', $token)) return false;
    $cache = DATA_DIR . '/owner-tokens.json';
    $hash = hash('sha256', $token);
    $saved = is_file($cache) ? json_decode((string) file_get_contents($cache), true) : [];
    if (!is_array($saved)) $saved = [];
    if (($saved[$hash] ?? 0) > time()) return true;

    $context = stream_context_create(['http' => [
        'method' => 'GET',
        'header' => "Authorization: Bearer $token\r\n",
        'timeout' => 70,
        'ignore_errors' => true,
    ]]);
    $raw = @file_get_contents(BACKEND_API . '/owner/me', false, $context);
    $reply = is_string($raw) ? json_decode($raw, true) : null;
    $ok = is_array($reply) && ($reply['success'] ?? false) === true;
    if ($ok && (is_dir(DATA_DIR) || mkdir(DATA_DIR, 0755, true))) {
        $now = time();
        $saved = array_filter($saved, fn ($until) => $until > $now);
        $saved[$hash] = $now + 600;
        file_put_contents($cache, json_encode($saved));
    }
    return $ok;
}

/** Admin (X-Admin-Pass) ou propriétaire connecté (X-Owner-Token) */
function require_admin_or_owner(): void
{
    $token = $_SERVER['HTTP_X_OWNER_TOKEN'] ?? '';
    if (is_string($token) && $token !== '') {
        if (owner_token_valid($token)) return;
        respond(['error' => 'unauthorized'], 401);
    }
    require_admin();
}

function read_json_body(int $maxBytes): array
{
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || strlen($raw) > $maxBytes) respond(['error' => 'too_large'], 413);
    $body = json_decode($raw, true);
    if (!is_array($body)) respond(['error' => 'bad_json'], 400);
    return $body;
}
