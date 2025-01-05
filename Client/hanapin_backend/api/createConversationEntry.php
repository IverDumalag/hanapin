<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function createConversationEntry($conversationData) {
   global $conn;

   $participant_one = $conversationData['participant_one'];
   $participant_two = $conversationData['participant_two'];
   $created_at = date('Y-m-d H:i:s');

   // Check if conversation already exists
   $stmt = $conn->prepare("SELECT * FROM tbl_conversations WHERE (participant_one = :participant_one AND participant_two = :participant_two) OR (participant_one = :participant_two AND participant_two = :participant_one)");
   $stmt->bindParam(':participant_one', $participant_one);
   $stmt->bindParam(':participant_two', $participant_two);
   $stmt->execute();
   $result = $stmt->fetch(PDO::FETCH_ASSOC);

   if ($result) {
      $data = [
         'status' => 409,
         'message' => 'Conversation already exists between these participants',
         'conversation_id' => $result['conversation_id'],
      ];
      header("HTTP/1.1 409 Conflict");
      return json_encode($data);
   }

   // Generate conversation ID
   $stmt = $conn->prepare("SELECT conversation_id FROM tbl_conversations ORDER BY created_at DESC LIMIT 1");
   $stmt->execute();
   $result = $stmt->fetch(PDO::FETCH_ASSOC);

   if ($result) {
      $lastConversationId = $result['conversation_id'];
      $parts = explode('-', $lastConversationId);
      $incrementPart = (int)$parts[1] + 1;
   } else {
      $incrementPart = 1;
   }

   $conversation_id = 'CONVO-' . str_pad($incrementPart, 7, '0', STR_PAD_LEFT) . '-' . $participant_one . '-' . $participant_two . '-' . $created_at;

   $query = "INSERT INTO tbl_conversations (conversation_id, participant_one, participant_two, created_at) VALUES (:conversation_id, :participant_one, :participant_two, :created_at)";
   
   $stmt = $conn->prepare($query);
   $stmt->bindParam(':conversation_id', $conversation_id);
   $stmt->bindParam(':participant_one', $participant_one);
   $stmt->bindParam(':participant_two', $participant_two);
   $stmt->bindParam(':created_at', $created_at);

   if ($stmt->execute()) {
      $data = [
         'status' => 201,
         'message' => 'Conversation Created Successfully!',
      ];
      header("HTTP/1.1 201 Created");
      return json_encode($data);
   } else {
      $data = [
         'status' => 500,
         'message' => 'Internal Server Error: ' . $stmt->errorInfo()[2],
      ];
      header("HTTP/1.1 500 Internal Server Error");
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

   if (empty($inputData)) {
      $data = [
         'status' => 400,
         'message' => 'No data provided',
      ];
      header("HTTP/1.1 400 Bad Request");
      echo json_encode($data);
      exit();
   }

   $createConversationEntry = createConversationEntry($inputData);
   echo $createConversationEntry;
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>