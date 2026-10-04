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

function require_admin(): void
{
    $pass = $_SERVER['HTTP_X_ADMIN_PASS'] ?? '';
    if (!is_string($pass) || !hash_equals(ADMIN_PASSWORD, $pass)) {
        respond(['error' => 'unauthorized'], 401);
    }
}

function read_json_body(int $maxBytes): array
{
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || strlen($raw) > $maxBytes) respond(['error' => 'too_large'], 413);
    $body = json_decode($raw, true);
    if (!is_array($body)) respond(['error' => 'bad_json'], 400);
    return $body;
}
