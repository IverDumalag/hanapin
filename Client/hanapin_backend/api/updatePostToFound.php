<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function updatePostToFound($post_id) {
   global $conn;

   $query = "UPDATE tbl_posts SET content_state = 'FOUND', updated_at = :updated_at WHERE post_id = :post_id";
   $stmt = $conn->prepare($query);
   $updated_at = date('Y-m-d H:i:s');
   $stmt->bindParam(':post_id', $post_id);
   $stmt->bindParam(':updated_at', $updated_at);

   if ($stmt->execute()) {
      $data = [
         'status' => 200,
         'message' => 'Post updated to FOUND successfully!',
      ];
      header("HTTP/1.1 200 OK");
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
   echo updatePostToFound($post_id);
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>