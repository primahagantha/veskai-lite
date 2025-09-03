<?php
// api.php - proxy to fetch staff list
header('Content-Type: application/json');

// prevent abuse
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$url = 'http://bilge.caligo.asia:40005/api/staff-list';

// use curl for better error handling
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // 10 second timeout
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch remote API', 'details' => $error]);
    exit;
}

if ($httpcode >= 400) {
    http_response_code($httpcode);
    echo $response; // forward the error response
    exit;
}

// forward the successful response
echo $response;
?>
