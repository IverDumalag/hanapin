<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function getPostComments($post_id) {
   global $conn;

   $query = "SELECT c.*, a.first_name, a.last_name, a.profile_pic 
             FROM tbl_comments c 
             JOIN tbl_accounts a ON c.user_id = a.user_id 
             WHERE c.post_id = :post_id 
             ORDER BY c.comment_date ASC";
   $stmt = $conn->prepare($query);
   $stmt->bindParam(':post_id', $post_id);
   $stmt->execute();

   if ($stmt->rowCount() > 0) {
      $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data = [
         'status' => 200,
         'comments' => $comments,
      ];
      header("HTTP/1.1 200 OK");
      return json_encode($data);
   } else {
      $data = [
         'status' => 404,
         'message' => 'No comments found for the given post ID',
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
   $input = json_decode(file_get_contents("php://input"), true);
   if (isset($input['post_id'])) {
      $post_id = $input['post_id'];
      echo getPostComments($post_id);
   } else {
      $data = [
         'status' => 400,
         'message' => 'No post ID provided',
      ];
      header("HTTP/1.1 400 Bad Request");
      echo json_encode($data);
   }
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>