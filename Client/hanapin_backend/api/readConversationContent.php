<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function getConversationContent($conversation_id) {
   global $conn;

   $query = "SELECT * FROM tbl_messages WHERE conversation_id = :conversation_id ORDER BY sent_at ASC";
   $stmt = $conn->prepare($query);
   $stmt->bindParam(':conversation_id', $conversation_id);
   $stmt->execute();

   if ($stmt->rowCount() > 0) {
      $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data = [
         'status' => 200,
         'messages' => $messages,
      ];
      header("HTTP/1.1 200 OK");
      return json_encode($data);
   } else {
      $data = [
         'status' => 404,
         'message' => 'No messages found for the given conversation ID',
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

   if (empty($inputData) || !isset($inputData['conversation_id'])) {
      $data = [
         'status' => 400,
         'message' => 'No conversation ID provided',
      ];
      header("HTTP/1.1 400 Bad Request");
      echo json_encode($data);
      exit();
   }

   $conversation_id = $inputData['conversation_id'];
   echo getConversationContent($conversation_id);
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>