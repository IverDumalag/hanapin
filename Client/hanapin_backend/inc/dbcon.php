<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "db_hanapin";

//http://localhost/hanapin/Client/hanapin_backend/inc/dbcon.php

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Connected to localhost!";
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// errors
function error422($message) {
    $data = [
        'status' => 422,
        'message' => $message,
    ];
    header("HTTP/1.1 422 Unprocessable Entity");
    echo json_encode($data);
    exit;
 }

?>
