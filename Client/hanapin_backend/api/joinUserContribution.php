<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function getUserContributions() {
   global $conn;

   $query = "
      SELECT 
         a.user_id,
         a.first_name,
         a.last_name,
         COUNT(DISTINCT p.post_id) AS total_posts,
         COUNT(DISTINCT c.comment_id) AS total_comments
      FROM 
         tbl_accounts a
      LEFT JOIN tbl_posts p ON a.user_id = p.user_id
      LEFT JOIN tbl_comments c ON a.user_id = c.user_id
      GROUP BY 
         a.user_id, a.first_name, a.last_name
   ";

   $stmt = $conn->prepare($query);
   $stmt->execute();

   if ($stmt->rowCount() > 0) {
      $contributions = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data = [
         'status' => 200,
         'contributions' => $contributions,
      ];
      header("HTTP/1.1 200 OK");
      echo json_encode($data);
   } else {
      $data = [
         'status' => 404,
         'message' => 'No contributions found',
      ];
      header("HTTP/1.1 404 Not Found");
      echo json_encode($data);
   }
}

$requestMethod = $_SERVER["REQUEST_METHOD"];

if ($requestMethod == "OPTIONS") {
   http_response_code(200);
   exit();
}

if ($requestMethod == "GET") {
   getUserContributions();
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>