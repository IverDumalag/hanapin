<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function getMostEngagedPosts() {
   global $conn;

   $query = "
      SELECT 
         p.post_id,
         COUNT(DISTINCT c.comment_id) AS total_comments,
         COUNT(DISTINCT m.message_id) AS total_messages
      FROM 
         tbl_posts p
      LEFT JOIN tbl_comments c ON p.post_id = c.post_id
      LEFT JOIN tbl_conversations conv ON p.user_id IN (conv.participant_one, conv.participant_two)
      LEFT JOIN tbl_messages m ON conv.conversation_id = m.conversation_id
      GROUP BY 
         p.post_id
      ORDER BY 
         (COUNT(DISTINCT c.comment_id) + COUNT(DISTINCT m.message_id)) DESC;
   ";

   $stmt = $conn->prepare($query);
   $stmt->execute();

   if ($stmt->rowCount() > 0) {
      $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data = [
         'status' => 200,
         'posts' => $posts,
      ];
      header("HTTP/1.1 200 OK");
      echo json_encode($data);
   } else {
      $data = [
         'status' => 404,
         'message' => 'No posts found',
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
   getMostEngagedPosts();
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>