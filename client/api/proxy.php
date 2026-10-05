<?php
/**
 * Relais vers le backend Node (Render) quand le navigateur ne peut pas l’appeler directement (CORS).
 * GET|POST|PUT|PATCH|DELETE /api/proxy.php?p=/comments?item_type=gallery&item_id=3
 */
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$path = $_GET['p'] ?? '';
if (!is_string($path) || !preg_match('#^/[A-Za-z0-9/_\-.?=&%,:]*$#', $path) || strpos($path, '..') !== false || strpos($path, '//') !== false) {
    http_response_code(400);
    echo json_encode(['error' => 'Chemin invalide.']);
    exit;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if (!in_array($method, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], true)) {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée.']);
    exit;
}

$headers = ['Accept: application/json'];
$forward = [
    'HTTP_X_FAVORITE_CLIENT' => 'x-favorite-client',
    'HTTP_X_ADMIN_KEY' => 'x-admin-key',
    'HTTP_AUTHORIZATION' => 'Authorization',
    'CONTENT_TYPE' => 'Content-Type',
];
if (empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $all = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ($all['authorization'] ?? '');
}
foreach ($forward as $server => $name) {
    $value = $_SERVER[$server] ?? '';
    if (is_string($value) && $value !== '' && strlen($value) < 2000) $headers[] = $name . ': ' . $value;
}

$body = in_array($method, ['POST', 'PUT', 'PATCH'], true)
    ? (string) file_get_contents('php://input', false, null, 0, 1024 * 1024)
    : null;

$ch = curl_init(BACKEND_API . $path);
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 75,
    CURLOPT_CONNECTTIMEOUT => 70,
]);
if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($response === false || $status === 0) {
    http_response_code(502);
    echo json_encode(['error' => 'Backend injoignable.']);
    exit;
}
http_response_code($status);
echo $response;
