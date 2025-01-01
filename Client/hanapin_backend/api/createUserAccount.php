<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

require ('../inc/dbcon.php');

function registerUser($userInput) {
   global $conn;

   // Generate user ID
   $stmt = $conn->prepare("SELECT user_id FROM tbl_accounts ORDER BY user_id DESC LIMIT 1");
   $stmt->execute();
   $result = $stmt->fetch(PDO::FETCH_ASSOC);
   
   if ($result) {
      $lastUserId = $result['user_id'];
      $lastUserIdNumber = (int)substr($lastUserId, 3);
      $newUserIdNumber = $lastUserIdNumber + 1;
   } else {
      $newUserIdNumber = 1;
   }
   
   $user_id = 'US-' . str_pad($newUserIdNumber, 7, '0', STR_PAD_LEFT);

   $first_name = $userInput['first_name'];
   $middle_name = $userInput['middle_name'];
   $last_name = $userInput['last_name'];
   $extension = $userInput['extension'];
   $email = $userInput['email'];
   $profile_pic = $userInput['profile_pic'];
   $password = $userInput['password'];
   $role = $userInput['role'];
   $date_of_birth = $userInput['date_of_birth'];
   $sex = $userInput['sex'];
   $house_number = $userInput['house_number'];
   $street = $userInput['street'];
   $subdivision = $userInput['subdivision'];
   $barangay = $userInput['barangay'];
   $city_municipality = $userInput['city_municipality'];
   $province = $userInput['province'];
   $postal_code = $userInput['postal_code'];
   $created_at = date('Y-m-d H:i:s');
   $updated_at = date('Y-m-d H:i:s');

   if (empty(trim($first_name))) {
      return error422('Enter First Name');
   } else if (empty(trim($last_name))) {
      return error422('Enter Last Name');
   } else if (empty(trim($email))) {
      return error422('Enter Email');
   } else if (empty(trim($password))) {
      return error422('Enter Password');
   } else if (empty(trim($role))) {
      return error422('Enter Role');
   } else if (empty(trim($date_of_birth))) {
      return error422('Enter Date of Birth');
   } else if (empty(trim($sex))) {
      return error422('Enter Sex');
   } else if (empty(trim($house_number))) {
      return error422('Enter House Number');
   } else if (empty(trim($street))) {
      return error422('Enter Street');
   } else if (empty(trim($subdivision))) {
      return error422('Enter Subdivision');
   } else if (empty(trim($barangay))) {
      return error422('Enter Barangay');
   } else if (empty(trim($city_municipality))) {
      return error422('Enter City/Municipality');
   } else if (empty(trim($province))) {
      return error422('Enter Province');
   } else if (empty(trim($postal_code))) {
      return error422('Enter Postal Code');
   } else {
      $hashed_password = password_hash($password, PASSWORD_DEFAULT);

      $query = "INSERT INTO tbl_accounts (user_id, first_name, middle_name, last_name, extension, email, profile_pic, password, role, date_of_birth, sex, house_number, street, subdivision, barangay, city_municipality, province, postal_code, created_at, updated_at) VALUES (:user_id, :first_name, :middle_name, :last_name, :extension, :email, :profile_pic, :password, :role, :date_of_birth, :sex, :house_number, :street, :subdivision, :barangay, :city_municipality, :province, :postal_code, :created_at, :updated_at)";
      
      $stmt = $conn->prepare($query);
      $stmt->bindParam(':user_id', $user_id);
      $stmt->bindParam(':first_name', $first_name);
      $stmt->bindParam(':middle_name', $middle_name);
      $stmt->bindParam(':last_name', $last_name);
      $stmt->bindParam(':extension', $extension);
      $stmt->bindParam(':email', $email);
      $stmt->bindParam(':profile_pic', $profile_pic);
      $stmt->bindParam(':password', $hashed_password);
      $stmt->bindParam(':role', $role);
      $stmt->bindParam(':date_of_birth', $date_of_birth);
      $stmt->bindParam(':sex', $sex);
      $stmt->bindParam(':house_number', $house_number);
      $stmt->bindParam(':street', $street);
      $stmt->bindParam(':subdivision', $subdivision);
      $stmt->bindParam(':barangay', $barangay);
      $stmt->bindParam(':city_municipality', $city_municipality);
      $stmt->bindParam(':province', $province);
      $stmt->bindParam(':postal_code', $postal_code);
      $stmt->bindParam(':created_at', $created_at);
      $stmt->bindParam(':updated_at', $updated_at);

      if ($stmt->execute()) {
         $data = [
            'status' => 201,
            'message' => 'User Created Successfully!',
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

   error_log('Received data: ' . print_r($inputData, true)); // Log received data

   $registerUser = registerUser($inputData);
   echo $registerUser;
} else {
   $data = [
      'status' => 405,
      'message' => $requestMethod . ' Method Not Allowed',
   ];
   header("HTTP/1.1 405 Method Not Allowed");
   echo json_encode($data);
}
?>