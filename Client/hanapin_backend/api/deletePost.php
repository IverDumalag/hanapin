<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function deletePostAndComments($post_id) {
   global $conn;

   try {
      // Begin transaction
      $conn->beginTransaction();

      // Delete comments related to the post
      $deleteCommentsQuery = "DELETE FROM tbl_comments WHERE post_id = :post_id";
      $stmt = $conn->prepare($deleteCommentsQuery);
      $stmt->bindParam(':post_id', $post_id);
      $stmt->execute();

      // Delete the post
      $deletePostQuery = "DELETE FROM tbl_posts WHERE post_id = :post_id";
      $stmt = $conn->prepare($deletePostQuery);
      $stmt->bindParam(':post_id', $post_id);
      $stmt->execute();

      // Commit transaction
      $conn->commit();

      $data = [
         'status' => 200,
         'message' => 'Post and related comments deleted successfully',
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

   if (empty($inputData) || !isset($inputData['post_id'])) {
      $data = [
         'status' => 400,
         'message' => 'No post ID provided',
      ];
      header("HTTP/1.1 400 Bad Request");
      echo json_encode($data);
      exit();
   }

   $post_id = $inputData['post_id'];
   echo deletePostAndComments($post_id);
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>