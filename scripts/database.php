<?php
/*

 $$$$$$\                                                              $$$$$$\                  $$\                     
$$  __$$\                                                            $$  __$$\                 $$ |                    
$$ /  \__|$$\   $$\  $$$$$$\   $$$$$$\   $$$$$$\ $$\    $$\ $$$$$$\  $$ /  \__| $$$$$$\   $$$$$$$ | $$$$$$\   $$$$$$$\ 
\$$$$$$\  $$ |  $$ |$$  __$$\  \____$$\ $$  __$$\\$$\  $$  |\____$$\ $$ |      $$  __$$\ $$  __$$ |$$  __$$\ $$  _____|
 \____$$\ $$ |  $$ |$$ /  $$ | $$$$$$$ |$$ |  \__|\$$\$$  / $$$$$$$ |$$ |      $$ /  $$ |$$ /  $$ |$$$$$$$$ |\$$$$$$\  
$$\   $$ |$$ |  $$ |$$ |  $$ |$$  __$$ |$$ |       \$$$  / $$  __$$ |$$ |  $$\ $$ |  $$ |$$ |  $$ |$$   ____| \____$$\ 
\$$$$$$  |\$$$$$$  |$$$$$$$  |\$$$$$$$ |$$ |        \$  /  \$$$$$$$ |\$$$$$$  |\$$$$$$  |\$$$$$$$ |\$$$$$$$\ $$$$$$$  |
 \______/  \______/ $$  ____/  \_______|\__|         \_/    \_______| \______/  \______/  \_______| \_______|\_______/ 
                    $$ |                                                                                               
                    $$ |                                                                                               
                    \__|                                                                                               

*/


session_start();
include "config.php"; // To connect to sql database


//////////////////Creating Data//////////////////////
function insertRoomData($conn, $room_id, $host_name, $is_password, $password, $time_created, $room_subject, $members_count, $members_list, $max_members, $users_ips, $blocked_ips, $room_server_number)
{
    if (empty($room_id) || empty($host_name) || empty($is_password) || empty($time_created) || empty($members_list) || empty($max_members) || empty($users_ips) || empty($blocked_ips) || empty($room_server_number)) {
        return "Error: All fields are required.";
    }

    if ($is_password == "yes") {
        if (empty($password)) {
            return "Error: Password is required.";
        }
    }

    if (empty($room_subject)) {
        $room_subject = "";
    }

    if (!is_numeric($members_count) || !is_numeric($max_members) || !is_numeric($room_server_number)) {
        return "Error: Members count, max members, and room server number must be numeric.";
    }

    if (!is_array(json_decode($members_list, true)) || !is_array(json_decode($users_ips, true)) || !is_array(json_decode($blocked_ips, true))) {
        return "Error: Members list, users IPs, and blocked IPs must be valid JSON.";
    }

    $stmt = $conn->prepare("INSERT INTO GroupCallingRooms (room_id, host_name, is_password, password, time_created, room_subject, members_count, members_list, max_members, users_ips, blocked_ips, room_server_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt === false) {
        return "Error: " . $conn->error;
    }

    $stmt->bind_param("ssssssisissi", $room_id, $host_name, $is_password, $password, $time_created, $room_subject, $members_count, $members_list, $max_members, $users_ips, $blocked_ips, $room_server_number);

    if ($stmt->execute()) {
        $stmt->close();
        return "pass";
    } else {
        $stmt->close();
        return "Error: " . $stmt->error;
    }

    $conn->close();
}




////////////// Getting Data ///////////////
/**
 * Function to get a specific field's data for a given room_id
 * @param mysqli $conn Database connection
 * @param string $room_id Room ID
 * @param string $field Field name to fetch
 * @return string|null JSON data of the specified field, or null if not found
 */
function getRoomFieldData($conn, $room_id, $field)
{
    // List of valid fields that can be retrieved
    $valid_fields = ["room_id", "host_name", "is_password", "password", "time_created", "room_subject", "members_count", "members_list", "max_members", "users_ips", "blocked_ips", "room_server_number"];

    // Check if the requested field is valid
    if (!in_array($field, $valid_fields)) {
        return null;
    }

    // Prepare and bind
    $stmt = $conn->prepare("SELECT $field FROM GroupCallingRooms WHERE room_id = ?");
    $stmt->bind_param("s", $room_id);

    // Execute the statement
    $stmt->execute();

    // Bind result variables
    $stmt->bind_result($field_data);

    // Fetch the data
    if ($stmt->fetch()) {
        // Close the statement
        $stmt->close();
        return $field_data;
    } else {
        // Close the statement
        $stmt->close();
        return null;
    }
}


function updateBlockedIPs($conn, $room_id, $new_blocked_ips)
{
    // Check if new_blocked_ips is valid JSON
    if (!is_array(json_decode($new_blocked_ips, true))) {
        return "Error: Invalid JSON data for blocked IPs.";
    }

    // Prepare and bind
    $stmt = $conn->prepare("UPDATE GroupCallingRooms SET blocked_ips = ? WHERE room_id = ?");
    if ($stmt === false) {
        return "Error: " . $conn->error;
    }
    $stmt->bind_param("ss", $new_blocked_ips, $room_id);

    // Execute the statement
    if ($stmt->execute()) {
        $stmt->close();
        return "pass";
    } else {
        $stmt->close();
        return "Error: " . $stmt->error;
    }
}

function updateMembersList($conn, $room_id, $new_members_list)
{
    // Check if new_members_list is valid JSON
    if (!is_array(json_decode($new_members_list, true))) {
        return "Error: Invalid JSON data for members list.";
    }

    // Prepare and bind
    $stmt = $conn->prepare("UPDATE GroupCallingRooms SET members_list = ? WHERE room_id = ?");
    if ($stmt === false) {
        return "Error: " . $conn->error;
    }
    $stmt->bind_param("ss", $new_members_list, $room_id);

    // Execute the statement
    if ($stmt->execute()) {
        $stmt->close();
        return "pass";
    } else {
        $stmt->close();
        return "Error: " . $stmt->error;
    }
}

function updateUsersIPs($conn, $room_id, $new_users_ips)
{
    // Check if new_users_ips is valid JSON
    if (!is_array(json_decode($new_users_ips, true))) {
        return "Error: Invalid JSON data for users IPs.";
    }

    // Prepare and bind
    $stmt = $conn->prepare("UPDATE GroupCallingRooms SET users_ips = ? WHERE room_id = ?");
    if ($stmt === false) {
        return "Error: " . $conn->error;
    }
    $stmt->bind_param("ss", $new_users_ips, $room_id);

    // Execute the statement
    if ($stmt->execute()) {
        $stmt->close();
        return "pass";
    } else {
        $stmt->close();
        return "Error: " . $stmt->error;
    }
}



////////////////Taking Actions of removing or adding blocked IPs////////////////
function addBlockedIP($conn, $room_id, $ip_to_add)
{
    $current_data = getRoomFieldData($conn, $room_id, 'blocked_ips');
    if ($current_data === null) {
        return "Error: Room not found.";
    }

    $blocked_ips = json_decode($current_data, true);
    if (!in_array($ip_to_add, $blocked_ips)) {
        $blocked_ips[] = $ip_to_add;
    }

    return updateBlockedIPs($conn, $room_id, json_encode($blocked_ips));
}

function removeBlockedIP($conn, $room_id, $ip_to_remove)
{
    $current_data = getRoomFieldData($conn, $room_id, 'blocked_ips');
    if ($current_data === null) {
        return "Error: Room not found.";
    }

    $blocked_ips = json_decode($current_data, true);
    if (($key = array_search($ip_to_remove, $blocked_ips)) !== false) {
        unset($blocked_ips[$key]);
    }

    return updateBlockedIPs($conn, $room_id, json_encode(array_values($blocked_ips)));
}




//////////////////Taking Actions of removing or adding members////////////////

function addMember($conn, $room_id, $member_to_add)
{
    $current_data = getRoomFieldData($conn, $room_id, 'members_list');
    if ($current_data === null) {
        return "Error: Room not found.";
    }

    $members_list = json_decode($current_data, true);
    if (!in_array($member_to_add, $members_list)) {
        $members_list[] = $member_to_add;
    }

    return updateMembersList($conn, $room_id, json_encode($members_list));
}

function removeMember($conn, $room_id, $member_to_remove)
{
    $current_data = getRoomFieldData($conn, $room_id, 'members_list');
    if ($current_data === null) {
        return "Error: Room not found.";
    }

    $members_list = json_decode($current_data, true);
    if (($key = array_search($member_to_remove, $members_list)) !== false) {
        unset($members_list[$key]);
    }

    return updateMembersList($conn, $room_id, json_encode(array_values($members_list)));
}

//////////////////Taking Actions of removing or adding users IPs////////////////

function addUserIP($conn, $room_id, $ip_to_add)
{
    $current_data = getRoomFieldData($conn, $room_id, 'users_ips');
    if ($current_data === null) {
        return "Error: Room not found.";
    }

    $users_ips = json_decode($current_data, true);
    if (!in_array($ip_to_add, $users_ips)) {
        $users_ips[] = $ip_to_add;
    }

    return updateUsersIPs($conn, $room_id, json_encode($users_ips));
}

function removeUserIP($conn, $room_id, $ip_to_remove)
{
    $current_data = getRoomFieldData($conn, $room_id, 'users_ips');
    if ($current_data === null) {
        return "Error: Room not found.";
    }

    $users_ips = json_decode($current_data, true);
    if (($key = array_search($ip_to_remove, $users_ips)) !== false) {
        unset($users_ips[$key]);
    }

    return updateUsersIPs($conn, $room_id, json_encode(array_values($users_ips)));
}


/////////////Joining Users to Rooms
function AddUserToRoom($conn, $room_id, $user_ip, $username, $room_password, $is_password)
{
    if ($is_password == "yes") {
        if (empty($room_password)) {
            return "Error: Password is required.";
        }
    }
    // Checking for room
    $CHECK_DB_FOR_ROOM = mysqli_query($conn, "SELECT * FROM GroupCallingRooms WHERE room_id = '$room_id'");
    $MEMEBRS_IN_ROOM = mysqli_fetch_assoc($CHECK_DB_FOR_ROOM);
    if (mysqli_num_rows($CHECK_DB_FOR_ROOM) == 0 || $MEMEBRS_IN_ROOM["members_count"] == 0) {
        return "Room not found!!";
    }
    // Checking current room settings and datas
    $is_room_locked = getRoomFieldData($conn, $room_id, 'is_password');
    if ($is_room_locked == "yes") {
        if ($is_password == "no") {
            return "Room is password protected.";
        }
        $ROOM_PASSWORD = getRoomFieldData($conn, $room_id, 'password');
        if ($ROOM_PASSWORD != $room_password) {
            return "Wrong password.";
        }
    }
    // Checking for IPs/User blacklist of room
    $blocked_ips = getRoomFieldData($conn, $room_id, 'blocked_ips');
    if ($blocked_ips === null) {
        return "An server error occured.";
    }
    $BLOCKED_IPS_ARRAY = json_decode($blocked_ips, true);
    if (in_array($user_ip, $BLOCKED_IPS_ARRAY)) {
        return "You are blocked by the room owner. Please contact the room owner to unblock you.";
    }
    // User passed the checks, now adding the user
    $members_count = getRoomFieldData($conn, $room_id, 'members_count');
    $max_members = getRoomFieldData($conn, $room_id, 'max_members');
    if ($members_count == $max_members) {
        return "Maximum members reached!!";
    } else {
        return "pass";
    }
    //$UPDATED_MEMEBERS_COUNT = $members_count + 1;
    //$UPDATE_MEMBERS_COUNT = mysqli_query($conn, "UPDATE GroupCallingRooms SET members_count = $UPDATED_MEMEBERS_COUNT WHERE room_id = '$room_id'");
    //if ($UPDATE_MEMBERS_COUNT) {
    //addMember($conn, $room_id, $username);
    //addUserIP($conn, $room_id, $user_ip);

    //} else {
    //return "Error: Failed to reach the server.";
    //}
}



if (isset($_POST["create_room"])) {
    if ($_POST["create_room"] == "true") {
        $room_id = $_POST["room_id"];
        $host_name = $_POST["host_name"];
        $is_password = $_POST["is_password"];
        $password = $_POST["password"];
        $time_created = date("d-F-Y, h:i:s A");
        $room_subject = $_POST["room_subject"];
        $members_count = 0;
        $members_list = json_encode([]);
        $max_members = $_POST["max_members"];
        $user_ips = json_encode([]);
        $blocked_ips = json_encode([]);
        $room_server_number = random_int(100, 999);
        $result = insertRoomData($conn, $room_id, $host_name, $is_password, $password, $time_created, $room_subject, $members_count, $members_list, $max_members, $user_ips, $blocked_ips, $room_server_number);
        echo $result;
    }
}


if (isset($_POST["join_room"])) {
    if ($_POST["join_room"] == "true") {
        $room_id = $_POST["room_id"];
        $username = $_POST["username"];
        $is_password = $_POST["is_password"];
        $password = $_POST["password"];
        $user_ips = $_POST["user_ip"];
        $result = AddUserToRoom($conn, $room_id, $user_ips, $username, $password, $is_password);
        echo $result;
    }
}

if (isset($_POST["del_room"])) {
    if ($_POST["del_room"] == "true") {
        $room_id = $_POST["room_id"];
        $DELETE_ROOM = mysqli_query($conn, "DELETE FROM GroupCallingRooms WHERE room_id = '$room_id'");
        if ($DELETE_ROOM) {
            echo "pass";
        } else {
            echo "Error: Failed to reach the server.";
        }
    }
}

// Checking that is current room exists or not
if (isset($_POST["check_room"])) {
    // Maintaining room memebrs count as number of members list in database 
    $room_id = $_POST["room_id"];
    $json_memebrs_list = getRoomFieldData($conn, $room_id, 'users_ips');
    if ($json_memebrs_list === null) {
        echo "!!found";
        //return "Error: Room not found.";
    }
    $memebrs_list = json_decode($json_memebrs_list, true);
    $members_count = count($memebrs_list);
    $UPDATE_MEMBERS_COUNT = mysqli_query($conn, "UPDATE GroupCallingRooms SET members_count = $members_count WHERE room_id = '$room_id'");
    if ($_POST["check_room"] == "host") {
        $room_id = $_POST["room_id"];
        $username = $_POST["username"];
        $user_ip = $_POST["user_ip"];
        $CHECK_DB_FOR_ROOM = mysqli_query($conn, "SELECT * FROM GroupCallingRooms WHERE room_id = '$room_id'");
        if ($CHECK_DB_FOR_ROOM) {
            if (mysqli_num_rows($CHECK_DB_FOR_ROOM) == 0) {
                echo "!!found";
            } else {
                $DB_DATA = mysqli_fetch_assoc($CHECK_DB_FOR_ROOM);
                if ($DB_DATA["members_count"] == 0) {
                    addMember($conn, $room_id, $username);
                    addUserIP($conn, $room_id, $user_ip);
                    mysqli_query($conn, "UPDATE GroupCallingRooms SET members_count = members_count + 1 WHERE room_id = '$room_id'");
                    echo "found";
                } else {
                    echo "found";
                }
            }
        }
    } else {
        $room_id = $_POST["room_id"];
        $CHECK_DB_FOR_ROOM = mysqli_query($conn, "SELECT * FROM GroupCallingRooms WHERE room_id = '$room_id'");
        if ($CHECK_DB_FOR_ROOM) {
            if (mysqli_num_rows($CHECK_DB_FOR_ROOM) == 0) {
                echo "!!found";
            } else {
                $DB_DATA = mysqli_fetch_assoc($CHECK_DB_FOR_ROOM);
                if ($DB_DATA["members_count"] == 0) {
                    echo "!!found";
                } else {
                    echo "found";
                }
            }
        }
    }
}
