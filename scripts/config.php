<?php
  $hostname = "0.0.0.0"; // Replace your SQL Host
  $username = "username"; // Replace your username
  $password = "password"; // Replace your password of user
  $dbname = "db"; // Replace your db name 
  $port = 3306; // Default sql port is 3306 but you can change if your one is different

  $conn = mysqli_connect($hostname, $username, $password, $dbname, $port);
  if(!$conn){
    echo "Database connection error".mysqli_connect_error();
  }
?>
