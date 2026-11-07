<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// ==========================================
// PROKERALA API CREDENTIALS
// Replace these with your actual keys
// ==========================================
$clientId = 'fb370088-d00b-44cb-8360-613e01dc2908';
$clientSecret = 'T7sQpGAUeKOh5bVOnZ9GGAps7aObPmoxQ6YLNCbD';
// ==========================================

$action = $_GET['action'] ?? 'panchang';
$datetime = $_GET['datetime'] ?? gmdate("Y-m-d\TH:i:s\Z");
$coordinates = $_GET['coordinates'] ?? '28.6139,77.2090';
$ayanamsa = $_GET['ayanamsa'] ?? '1';

if ($clientId === 'YOUR_CLIENT_ID_HERE') {
    http_response_code(500);
    echo json_encode(['error' => 'Please configure your Prokerala Client ID and Secret in astrology-api.php']);
    exit;
}

// 1. Get OAuth Token
$ch = curl_init('https://api.prokerala.com/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'client_credentials',
    'client_id' => $clientId,
    'client_secret' => $clientSecret
]));
$tokenResponse = curl_exec($ch);
curl_close($ch);

$tokenData = json_decode($tokenResponse, true);
if (!isset($tokenData['access_token'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to authenticate with Prokerala']);
    exit;
}

$accessToken = $tokenData['access_token'];

// 2. Fetch Data from Prokerala
$endpoint = $action;
$url = "https://api.prokerala.com/v2/astrology/{$endpoint}?datetime=" . urlencode($datetime) . "&coordinates=" . urlencode($coordinates) . "&ayanamsa={$ayanamsa}";

$ch2 = curl_init($url);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$accessToken}"
]);
$dataResponse = curl_exec($ch2);
$httpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
curl_close($ch2);

http_response_code($httpCode);
echo $dataResponse;
?>
