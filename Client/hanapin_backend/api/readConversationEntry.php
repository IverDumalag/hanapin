<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function getConversationEntry($user_id) {
   global $conn;

   $query = "SELECT * FROM tbl_conversations WHERE participant_one = :user_id OR participant_two = :user_id";
   $stmt = $conn->prepare($query);
   $stmt->bindParam(':user_id', $user_id);
   $stmt->execute();

   if ($stmt->rowCount() > 0) {
      $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data = [
         'status' => 200,
         'conversations' => $conversations,
      ];
      header("HTTP/1.1 200 OK");
      return json_encode($data);
   } else {
      $data = [
         'status' => 404,
         'message' => 'Conversations Not Found',
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

   if (empty($inputData) || !isset($inputData['user_id'])) {
      $data = [
         'status' => 400,
         'message' => 'No user ID provided',
      ];
      header("HTTP/1.1 400 Bad Request");
      echo json_encode($data);
      exit();
   }

   $user_id = $inputData['user_id'];
   echo getConversationEntry($user_id);
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>