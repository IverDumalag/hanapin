<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function getPosts() {
   global $conn;

   $query = "SELECT * FROM tbl_posts";
   $stmt = $conn->prepare($query);
   $stmt->execute();

   if ($stmt->rowCount() > 0) {
      $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data = [
         'status' => 200,
         'posts' => $posts,
      ];
      header("HTTP/1.1 200 OK");
      return json_encode($data);
   } else {
      $data = [
         'status' => 404,
         'message' => 'No posts found',
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

if ($requestMethod == "GET") {
   echo getPosts();
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>