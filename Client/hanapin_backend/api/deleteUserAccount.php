<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function deleteUserAccount($user_id) {
   global $conn;

   try {
      // Begin transaction
      $conn->beginTransaction();

      // Delete comments related to the user's posts
      $deleteCommentsFromPostsQuery = "DELETE FROM tbl_comments WHERE post_id IN (SELECT post_id FROM tbl_posts WHERE user_id = :user_id)";
      $stmt = $conn->prepare($deleteCommentsFromPostsQuery);
      $stmt->bindParam(':user_id', $user_id);
      $stmt->execute();

      // Delete comments related to the user
      $deleteCommentsQuery = "DELETE FROM tbl_comments WHERE user_id = :user_id";
      $stmt = $conn->prepare($deleteCommentsQuery);
      $stmt->bindParam(':user_id', $user_id);
      $stmt->execute();

      // Delete posts related to the user
      $deletePostsQuery = "DELETE FROM tbl_posts WHERE user_id = :user_id";
      $stmt = $conn->prepare($deletePostsQuery);
      $stmt->bindParam(':user_id', $user_id);
      $stmt->execute();

      // Delete conversation content related to the user
      $deleteConversationContentQuery = "DELETE FROM tbl_messages WHERE sender_id = :user_id";
      $stmt = $conn->prepare($deleteConversationContentQuery);
      $stmt->bindParam(':user_id', $user_id);
      $stmt->execute();

      // Delete conversation entries related to the user
      $deleteConversationEntriesQuery = "DELETE FROM tbl_conversations WHERE participant_one = :user_id OR participant_two = :user_id";
      $stmt = $conn->prepare($deleteConversationEntriesQuery);
      $stmt->bindParam(':user_id', $user_id);
      $stmt->execute();

      // Delete the user account
      $deleteUserQuery = "DELETE FROM tbl_accounts WHERE user_id = :user_id";
      $stmt = $conn->prepare($deleteUserQuery);
      $stmt->bindParam(':user_id', $user_id);
      $stmt->execute();

      // Commit transaction
      $conn->commit();

      $data = [
         'status' => 200,
         'message' => 'User account and related data deleted successfully',
      ];
      header("HTTP/1.1 200 OK");
      return json_encode($data);
   } catch (Exception $e) {
      // Rollback transaction in case of error
      $conn->rollBack();

      $data = [
         'status' => 500,
         'message' => 'Internal Server Error: ' . $e->getMessage(),
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
   echo deleteUserAccount($user_id);
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>