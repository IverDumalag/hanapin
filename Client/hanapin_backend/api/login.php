<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function loginUser($userInput) {
   global $conn;

   $email = $userInput['email'];
   $password = $userInput['password'];

   if (empty(trim($email))) {
      return error422('Enter Email');
   } else if (empty(trim($password))) {
      return error422('Enter Password');
   } else {
      $query = "SELECT * FROM tbl_accounts WHERE email = :email";
      $stmt = $conn->prepare($query);
      $stmt->bindParam(':email', $email);
      $stmt->execute();
      $user = $stmt->fetch(PDO::FETCH_ASSOC);

      if ($user && password_verify($password, $user['password'])) {
         $data = [
            'status' => 200,
            'message' => 'Login Successful',
            'user' => [
               'user_id' => $user['user_id'],
               'first_name' => $user['first_name'],
               'middle_name' => $user['middle_name'],
               'last_name' => $user['last_name'],
               'extension' => $user['extension'],
               'profile_pic' => $user['profile_pic'],
               'email' => $user['email'],
               'role' => $user['role'],
               'date_of_birth' => $user['date_of_birth'],
               'sex' => $user['sex'],
               'house_number' => $user['house_number'],
               'street' => $user['street'],
               'subdivision' => $user['subdivision'],
               'barangay' => $user['barangay'], 
               'city_municipality' => $user['city_municipality'],
               'province' => $user['province'],
               'postal_code' => $user['postal_code'],
               'created_at' => $user['created_at'],
               'updated_at' => $user['updated_at']   
            ],
         ];
         header("HTTP/1.1 200 OK");
         return json_encode($data);
      } else {
         return error401('Invalid Email or Password');
      }
   }
}

function error401($message) {
   $data = [
      'status' => 401,
      'message' => $message,
   ];
   header("HTTP/1.1 401 Unauthorized");
   echo json_encode($data);
   exit();
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

   $loginUser = loginUser($inputData);
   echo $loginUser;
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>