<?php
/**
 * POST /api/bookings.php {booking}                 → nouvelle réservation (formulaires du site, public)
 * GET  /api/bookings.php                           → liste des réservations (admin, en-tête X-Admin-Pass)
 * POST /api/bookings.php {action:"update",id,patch} → modifie une réservation (admin)
 * POST /api/bookings.php {action:"delete",id}      → supprime une réservation (admin)
 */
require __DIR__ . '/_common.php';

const BOOKINGS_FILE = DATA_DIR . '/bookings.json';
const BOOKING_FIELDS = ['name', 'email', 'phone', 'date', 'travelers', 'stay', 'destination', 'message', 'source'];
const MAX_BOOKINGS = 5000;

function read_bookings(): array
{
    if (!is_file(BOOKINGS_FILE)) return [];
    $json = json_decode((string) file_get_contents(BOOKINGS_FILE), true);
    return is_array($json) ? $json : [];
}

/** Lit, modifie et réécrit la liste sous verrou exclusif */
function with_bookings(callable $fn): array
{
    if (!is_dir(DATA_DIR) && !mkdir(DATA_DIR, 0755, true)) respond(['error' => 'storage'], 500);
    $lock = fopen(DATA_DIR . '/.bookings.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) respond(['error' => 'storage'], 500);

    $list = $fn(read_bookings());
    $tmp = BOOKINGS_FILE . '.tmp';
    $ok = file_put_contents($tmp, json_encode(array_values($list), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) !== false
        && rename($tmp, BOOKINGS_FILE);

    flock($lock, LOCK_UN);
    fclose($lock);
    if (!$ok) respond(['error' => 'storage'], 500);
    return $list;
}

function clean_text($value, int $max): string
{
    $text = trim(is_scalar($value) ? (string) $value : '');
    return function_exists('mb_substr') ? mb_substr($text, 0, $max) : substr($text, 0, $max);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    require_admin();
    respond(['bookings' => read_bookings()]);
}

if ($method !== 'POST') respond(['error' => 'method'], 405);

$body = read_json_body(64 * 1024);
$action = $body['action'] ?? 'create';

if ($action === 'create') {
    $input = is_array($body['booking'] ?? null) ? $body['booking'] : [];
    $givenId = is_string($input['id'] ?? null) && preg_match('/^bk_[a-z0-9]{6,32}$/', $input['id']) ? $input['id'] : '';
    $booking = [
        'id' => $givenId ?: 'bk_' . base_convert((string) time(), 10, 36) . bin2hex(random_bytes(3)),
        'status' => 'new',
        'notes' => '',
        'createdAt' => gmdate('c'),
    ];
    foreach (BOOKING_FIELDS as $field) {
        $booking[$field] = clean_text($input[$field] ?? '', $field === 'message' ? 3000 : 200);
    }
    if ($booking['name'] === '' || ($booking['email'] === '' && $booking['phone'] === '')) {
        respond(['error' => 'missing_fields'], 400);
    }
    with_bookings(function (array $list) use ($booking) {
        foreach ($list as $b) {
            if (($b['id'] ?? '') === $booking['id']) return $list;
        }
        array_unshift($list, $booking);
        return array_slice($list, 0, MAX_BOOKINGS);
    });
    respond(['ok' => true, 'id' => $booking['id']]);
}

require_admin();
$id = $body['id'] ?? '';
if (!is_string($id) || $id === '') respond(['error' => 'bad_id'], 400);

if ($action === 'update') {
    $patch = is_array($body['patch'] ?? null) ? $body['patch'] : [];
    $allowed = array_merge(BOOKING_FIELDS, ['status', 'notes']);
    with_bookings(function (array $list) use ($id, $patch, $allowed) {
        foreach ($list as &$b) {
            if (($b['id'] ?? '') !== $id) continue;
            foreach ($allowed as $field) {
                if (array_key_exists($field, $patch)) $b[$field] = clean_text($patch[$field], 3000);
            }
        }
        return $list;
    });
    respond(['ok' => true]);
}

if ($action === 'delete') {
    with_bookings(fn (array $list) => array_filter($list, fn ($b) => ($b['id'] ?? '') !== $id));
    respond(['ok' => true]);
}

respond(['error' => 'bad_action'], 400);
