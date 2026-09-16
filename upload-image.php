<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Metodo no permitido']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'No se recibio ninguna imagen']);
    exit;
}

$file = $_FILES['image'];
$maxBytes = 8 * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    http_response_code(413);
    echo json_encode(['ok' => false, 'error' => 'La imagen supera el limite de 8 MB']);
    exit;
}

$imageInfo = @getimagesize($file['tmp_name']);
$allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
if (!$imageInfo || !in_array($imageInfo['mime'], $allowedMime, true)) {
    http_response_code(415);
    echo json_encode(['ok' => false, 'error' => 'Formato no permitido. Usa JPG, PNG o WEBP']);
    exit;
}

$directory = __DIR__ . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'imagenes';
if (!is_dir($directory) && !mkdir($directory, 0755, true)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo crear la carpeta de imagenes']);
    exit;
}

$extension = $imageInfo['mime'] === 'image/png' ? 'png' : ($imageInfo['mime'] === 'image/webp' ? 'webp' : 'jpg');
$productId = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['productId'] ?? 'producto');
$productId = substr($productId ?: 'producto', 0, 60);
$fileName = $productId . '-' . bin2hex(random_bytes(8)) . '.' . $extension;
$destination = $directory . DIRECTORY_SEPARATOR . $fileName;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo guardar la imagen en el hosting']);
    exit;
}

$url = 'assets/imagenes/' . rawurlencode($fileName);
echo json_encode(['ok' => true, 'url' => $url], JSON_UNESCAPED_SLASHES);
