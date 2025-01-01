<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function createUserPost($postData) {
   global $conn;

   // Fetch the latest post ID
   $stmt = $conn->prepare("SELECT post_id FROM tbl_posts ORDER BY post_date DESC LIMIT 1");
   $stmt->execute();
   $result = $stmt->fetch(PDO::FETCH_ASSOC);

   if ($result) {
      $latestPostId = $result['post_id'];
      $parts = explode('-', $latestPostId);
      $incrementPart = (int)$parts[1] + 1;
   } else {
      $incrementPart = 1;
   }

   $post_id = 'POST-' . str_pad($incrementPart, 7, '0', STR_PAD_LEFT) . '-' . $postData['user_id'] . '-' . date('Y-m-d H:i:s');

   $user_id = $postData['user_id'];
   $content_text = $postData['content_text'];
   $content_picture = $postData['content_picture'];
   $last_street = $postData['last_street'];
   $last_subdivision = $postData['last_subdivision'];
   $last_barangay = $postData['last_barangay'];
   $content_state = $postData['content_state'];
   $post_date = date('Y-m-d H:i:s');
   $updated_at = date('Y-m-d H:i:s');

   $query = "INSERT INTO tbl_posts (post_id, user_id, content_text, content_picture, last_street, last_subdivision, last_barangay, content_state, post_date, updated_at) VALUES (:post_id, :user_id, :content_text, :content_picture, :last_street, :last_subdivision, :last_barangay, :content_state, :post_date, :updated_at)";
   
   $stmt = $conn->prepare($query);
   $stmt->bindParam(':post_id', $post_id);
   $stmt->bindParam(':user_id', $user_id);
   $stmt->bindParam(':content_text', $content_text);
   $stmt->bindParam(':content_picture', $content_picture);
   $stmt->bindParam(':last_street', $last_street);
   $stmt->bindParam(':last_subdivision', $last_subdivision);
   $stmt->bindParam(':last_barangay', $last_barangay);
   $stmt->bindParam(':content_state', $content_state);
   $stmt->bindParam(':post_date', $post_date);
   $stmt->bindParam(':updated_at', $updated_at);

   if ($stmt->execute()) {
      $data = [
         'status' => 201,
         'message' => 'Post Created Successfully!',
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

   $createUserPost = createUserPost($inputData);
   echo $createUserPost;
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>