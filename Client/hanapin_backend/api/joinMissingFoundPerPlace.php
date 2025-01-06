<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function getMissingFoundPerPlace() {
   global $conn;

   $query = "
      SELECT 
         p.last_barangay,
         p.last_subdivision,
         p.last_street,
         p.content_state,
         COUNT(p.post_id) AS post_count
      FROM 
         tbl_posts p
      WHERE 
         p.content_state IN ('MISSING', 'FOUND')
      GROUP BY 
         p.last_barangay, p.last_subdivision, p.last_street, p.content_state
      ORDER BY 
         p.last_barangay, p.content_state;
   ";

   $stmt = $conn->prepare($query);
   $stmt->execute();

   if ($stmt->rowCount() > 0) {
      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data = [
         'status' => 200,
         'results' => $results,
      ];
      header("HTTP/1.1 200 OK");
      echo json_encode($data);
   } else {
      $data = [
         'status' => 404,
         'message' => 'No records found',
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
   getMissingFoundPerPlace();
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>