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

?>
