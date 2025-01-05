<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function createPostComment($commentData) {
   global $conn;

   // Fetch the latest comment ID
   $stmt = $conn->prepare("SELECT comment_id FROM tbl_comments ORDER BY comment_date DESC LIMIT 1");
   $stmt->execute();
   $result = $stmt->fetch(PDO::FETCH_ASSOC);

   if ($result) {
      $latestCommentId = $result['comment_id'];
      $parts = explode('-', $latestCommentId);
      $incrementPart = (int)$parts[1] + 1;
   } else {
      $incrementPart = 1;
   }

   $comment_id = 'COM-' . str_pad($incrementPart, 7, '0', STR_PAD_LEFT) . '-' . $commentData['user_id'] . '-' . date('Y-m-d H:i:s');
   $post_id = $commentData['post_id'];
   $user_id = $commentData['user_id'];
   $comment = $commentData['comment'];
   $comment_image = $commentData['comment_image'];
   $comment_date = date('Y-m-d H:i:s');

   $query = "INSERT INTO tbl_comments (comment_id, post_id, user_id, comment, comment_image, comment_date) VALUES (:comment_id, :post_id, :user_id, :comment, :comment_image, :comment_date)";
   
   $stmt = $conn->prepare($query);
   $stmt->bindParam(':comment_id', $comment_id);
   $stmt->bindParam(':post_id', $post_id);
   $stmt->bindParam(':user_id', $user_id);
   $stmt->bindParam(':comment', $comment);
   $stmt->bindParam(':comment_image', $comment_image);
   $stmt->bindParam(':comment_date', $comment_date);

   if ($stmt->execute()) {
      $data = [
         'status' => 201,
         'message' => 'Comment Created Successfully!',
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

   $createPostComment = createPostComment($inputData);
   echo $createPostComment;
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>