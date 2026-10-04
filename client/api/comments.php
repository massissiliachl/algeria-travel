<?php
/**
 * GET  /api/comments.php                          → commentaires visibles (page Galerie, public)
 * GET  /api/comments.php?all=1                    → tous les commentaires, masqués compris (admin, en-tête X-Admin-Pass)
 * POST /api/comments.php {src,name,text}          → nouveau commentaire sur une photo (public)
 * POST /api/comments.php {action:"hide"|"show"|"delete",id} → modération (admin)
 */
require __DIR__ . '/_common.php';

const COMMENTS_FILE = DATA_DIR . '/comments.json';
const MAX_COMMENTS = 10000;
const RATE_LIMIT = 5;
const RATE_WINDOW = 600;

function read_comments(): array
{
    if (!is_file(COMMENTS_FILE)) return [];
    $json = json_decode((string) file_get_contents(COMMENTS_FILE), true);
    return is_array($json) ? $json : [];
}

function with_comments(callable $fn): void
{
    if (!is_dir(DATA_DIR) && !mkdir(DATA_DIR, 0755, true)) respond(['error' => 'storage'], 500);
    $lock = fopen(DATA_DIR . '/.comments.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) respond(['error' => 'storage'], 500);

    $list = $fn(read_comments());
    $tmp = COMMENTS_FILE . '.tmp';
    $ok = file_put_contents($tmp, json_encode(array_values($list), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) !== false
        && rename($tmp, COMMENTS_FILE);

    flock($lock, LOCK_UN);
    fclose($lock);
    if (!$ok) respond(['error' => 'storage'], 500);
}

function clean_text($value, int $max): string
{
    $text = trim(preg_replace('/\s+/u', ' ', is_scalar($value) ? (string) $value : '') ?? '');
    return function_exists('mb_substr') ? mb_substr($text, 0, $max) : substr($text, 0, $max);
}

/** Version publique : sans l’empreinte IP */
function public_comment(array $c): array
{
    return array_intersect_key($c, array_flip(['id', 'src', 'name', 'text', 'createdAt', 'hidden']));
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $list = read_comments();
    if (!empty($_GET['all'])) {
        require_admin();
    } else {
        $list = array_values(array_filter($list, fn ($c) => empty($c['hidden'])));
    }
    respond(['comments' => array_map('public_comment', $list)]);
}

if ($method !== 'POST') respond(['error' => 'method'], 405);

$body = read_json_body(16 * 1024);
$action = $body['action'] ?? 'create';

if ($action === 'create') {
    $src = is_string($body['src'] ?? null) ? trim($body['src']) : '';
    $text = clean_text($body['text'] ?? '', 1000);
    $name = clean_text($body['name'] ?? '', 60) ?: 'Voyageur';
    if ($src === '' || strlen($src) > 500 || strncmp($src, 'data:', 5) === 0) respond(['error' => 'bad_src'], 400);
    if ($text === '') respond(['error' => 'empty'], 400);

    $ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . ADMIN_PASSWORD);
    $comment = [
        'id' => 'cm_' . base_convert((string) time(), 10, 36) . bin2hex(random_bytes(4)),
        'src' => $src,
        'name' => $name,
        'text' => $text,
        'createdAt' => gmdate('c'),
        'hidden' => false,
        'ip' => $ipHash,
    ];

    $limited = false;
    with_comments(function (array $list) use ($comment, $ipHash, &$limited) {
        $since = time() - RATE_WINDOW;
        $recent = array_filter($list, fn ($c) => ($c['ip'] ?? '') === $ipHash && strtotime($c['createdAt'] ?? '') > $since);
        if (count($recent) >= RATE_LIMIT) {
            $limited = true;
            return $list;
        }
        array_unshift($list, $comment);
        return array_slice($list, 0, MAX_COMMENTS);
    });
    if ($limited) respond(['error' => 'too_many'], 429);
    respond(['ok' => true, 'comment' => public_comment($comment)]);
}

require_admin();
$id = $body['id'] ?? '';
if (!is_string($id) || $id === '') respond(['error' => 'bad_id'], 400);

if ($action === 'hide' || $action === 'show') {
    with_comments(function (array $list) use ($id, $action) {
        foreach ($list as &$c) {
            if (($c['id'] ?? '') === $id) $c['hidden'] = $action === 'hide';
        }
        return $list;
    });
    respond(['ok' => true]);
}

if ($action === 'delete') {
    with_comments(fn (array $list) => array_filter($list, fn ($c) => ($c['id'] ?? '') !== $id));
    respond(['ok' => true]);
}

respond(['error' => 'bad_action'], 400);
