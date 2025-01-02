<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function updateUserAccount($userInput) {
   global $conn;

   $user_id = $userInput['user_id'];
   $profile_pic = $userInput['profile_pic'];
   $house_number = $userInput['house_number'];
   $street = $userInput['street'];
   $subdivision = $userInput['subdivision'];
   $barangay = $userInput['barangay'];
   $city_municipality = $userInput['city_municipality'];
   $province = $userInput['province'];
   $postal_code = $userInput['postal_code'];
   $updated_at = date('Y-m-d H:i:s');

   if (empty(trim($user_id))) {
      return error422('User ID is required');
   } else if (empty(trim($profile_pic))) {
      return error422('Profile Picture is required');
   } else if (empty(trim($house_number))) {
      return error422('House Number is required');
   } else if (empty(trim($street))) {
      return error422('Street is required');
   } else if (empty(trim($subdivision))) {
      return error422('Subdivision is required');
   } else if (empty(trim($barangay))) {
      return error422('Barangay is required');
   } else if (empty(trim($city_municipality))) {
      return error422('City/Municipality is required');
   } else if (empty(trim($province))) {
      return error422('Province is required');
   } else if (empty(trim($postal_code))) {
      return error422('Postal Code is required');
   } else {
      $query = "UPDATE tbl_accounts SET profile_pic = :profile_pic, house_number = :house_number, street = :street, subdivision = :subdivision, barangay = :barangay, city_municipality = :city_municipality, province = :province, postal_code = :postal_code, updated_at = :updated_at WHERE user_id = :user_id";
      
      $stmt = $conn->prepare($query);
      $stmt->bindParam(':user_id', $user_id);
      $stmt->bindParam(':profile_pic', $profile_pic);
      $stmt->bindParam(':house_number', $house_number);
      $stmt->bindParam(':street', $street);
      $stmt->bindParam(':subdivision', $subdivision);
      $stmt->bindParam(':barangay', $barangay);
      $stmt->bindParam(':city_municipality', $city_municipality);
      $stmt->bindParam(':province', $province);
      $stmt->bindParam(':postal_code', $postal_code);
      $stmt->bindParam(':updated_at', $updated_at);

      if ($stmt->execute()) {
         $data = [
            'status' => 200,
            'message' => 'User Account Updated Successfully!',
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

   $updateUserAccount = updateUserAccount($inputData);
   echo $updateUserAccount;
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>