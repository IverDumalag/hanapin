<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function createConversationContent($messageData) {
   global $conn;

   // Fetch the latest message ID
   $stmt = $conn->prepare("SELECT message_id FROM tbl_messages ORDER BY sent_at DESC LIMIT 1");
   $stmt->execute();
   $result = $stmt->fetch(PDO::FETCH_ASSOC);

   if ($result) {
      $latestMessageId = $result['message_id'];
      $parts = explode('-', $latestMessageId);
      $incrementPart = (int)$parts[1] + 1;
   } else {
      $incrementPart = 1;
   }

   $message_id = 'MSG-' . str_pad($incrementPart, 7, '0', STR_PAD_LEFT) . '-' . $messageData['sender_id'] . '-' . date('Y-m-d H:i:s');
   $conversation_id = $messageData['conversation_id'];
   $sender_id = $messageData['sender_id'];
   $message_text = $messageData['message_text'];
   $message_image = $messageData['message_image'];
   $message_status = 'SENT';
   $sent_at = date('Y-m-d H:i:s');

   $query = "INSERT INTO tbl_messages (message_id, conversation_id, sender_id, message_text, message_image, message_status, sent_at) VALUES (:message_id, :conversation_id, :sender_id, :message_text, :message_image, :message_status, :sent_at)";
   
   $stmt = $conn->prepare($query);
   $stmt->bindParam(':message_id', $message_id);
   $stmt->bindParam(':conversation_id', $conversation_id);
   $stmt->bindParam(':sender_id', $sender_id);
   $stmt->bindParam(':message_text', $message_text);
   $stmt->bindParam(':message_image', $message_image);
   $stmt->bindParam(':message_status', $message_status);
   $stmt->bindParam(':sent_at', $sent_at);

   if ($stmt->execute()) {
      $data = [
         'status' => 201,
         'message' => 'Message Sent Successfully!',
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

   $createConversationContent = createConversationContent($inputData);
   echo $createConversationContent;
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>