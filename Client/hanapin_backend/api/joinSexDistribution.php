<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function getSexDistribution() {
   global $conn;

   $query = "
      SELECT 
         a.sex,
         COUNT(DISTINCT a.user_id) AS active_users
      FROM 
         tbl_accounts a
      LEFT JOIN tbl_posts p ON a.user_id = p.user_id
      LEFT JOIN tbl_comments c ON a.user_id = c.user_id
      LEFT JOIN tbl_messages m ON a.user_id = m.sender_id
      WHERE 
         p.post_id IS NOT NULL OR c.comment_id IS NOT NULL OR m.message_id IS NOT NULL
      GROUP BY 
         a.sex;
   ";

   $stmt = $conn->prepare($query);
   $stmt->execute();

   if ($stmt->rowCount() > 0) {
      $distribution = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data = [
         'status' => 200,
         'distribution' => $distribution,
      ];
      header("HTTP/1.1 200 OK");
      echo json_encode($data);
   } else {
      $data = [
         'status' => 404,
         'message' => 'No active users found',
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
   getSexDistribution();
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>