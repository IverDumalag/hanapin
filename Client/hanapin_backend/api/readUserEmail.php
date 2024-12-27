<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function getUserByEmail($email) {
   global $conn;

   $query = "SELECT * FROM tbl_accounts WHERE email = :email";
   $stmt = $conn->prepare($query);
   $stmt->bindParam(':email', $email);
   $stmt->execute();

   if ($stmt->rowCount() > 0) {
      $user = $stmt->fetch(PDO::FETCH_ASSOC);
      $data = [
         'status' => 200,
         'user' => $user,
      ];
      header("HTTP/1.1 200 OK");
      return json_encode($data);
   } else {
      $data = [
         'status' => 404,
         'message' => 'User Not Found',
      ];
      header("HTTP/1.1 404 Not Found");
      return json_encode($data);
   }
}

$requestMethod = $_SERVER["REQUEST_METHOD"];

if ($requestMethod == "OPTIONS") {
   http_response_code(200);
   exit();
}

if ($requestMethod == "POST") {
   $inputData = json_decode(file_get_contents("php://input"), true);

   if (empty($inputData) || !isset($inputData['email'])) {
      $data = [
         'status' => 400,
         'message' => 'No email provided',
      ];
      header("HTTP/1.1 400 Bad Request");
      echo json_encode($data);
      exit();
   }

   $email = $inputData['email'];
   $getUser = getUserByEmail($email);
   echo $getUser;
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>