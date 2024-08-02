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


window.UserIP = undefined;
window.UserName = undefined;
window.UserRole = undefined;
window.RoomConnected = undefined;
window.RoomJoinLink = undefined;
window.onload = async function () {
    try {
        const response = await fetch('https://api.ipify.org/?format=json');
        const data = await response.json();
        window.UserIP = data.ip;
        //console.log("User IP Address:", window.UserIP);
    } catch (error) {
        console.error("Error fetching IP address:", error);
        window.UserIP = undefined;
    }
}
document.addEventListener('DOMContentLoaded', function () {

    //CreateCalls._init(username, meeting_id);
});


//Identifying Tab / Phone ot Desktop
function DetectDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return true;
    }
    if (/android/i.test(userAgent)) {
        return true;
    }
    if (/windows phone/i.test(userAgent)) {
        return true;
    }
    return false;
}

window.IsMobile = DetectDevice(); // Checking Mobile or Desktop

if (window.IsMobile) {  // If Mobile
    document.getElementById("btnStartStopScreenshare").style.display = "none";
    //console.log("Mobile");
} else { // If Desktop
    document.getElementById("btnStartStopScreenshare").style.display = "flex";
    //console.log("Desktop");
}




/////////Buttons Ripple
const WindowButtons = document.querySelectorAll('.button');

WindowButtons.forEach(button => {
    button.addEventListener('click', function (e) {
        const existingRipple = button.querySelector('.ripple-btn');
        if (existingRipple) {
            existingRipple.remove();
        }

        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-btn';

        // Calculate the position of the ripple
        const x = e.clientX - rect.left - ripple.offsetWidth / 2;
        const y = e.clientY - rect.top - ripple.offsetHeight / 2;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        // Remove the ripple after the animation completes (adjust timing as needed)
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});






// Message Box
function showMessageBox(message, iconClass, iconColor) {
    /*
    Correct 
    showMessageBox("SUCCESS", "fas fa-check-circle", "#50f263");


    Error
    showMessageBox("ERROR", "fas fa-exclamation-circle", "#ff0000");
    */
    const messageBox = document.getElementById("messageBox");
    const messageText = document.getElementById("messageText");
    const messageIcon = document.querySelector(".message-icon");

    messageText.textContent = message;

    if (iconClass && iconColor) {
        messageIcon.className = `message-icon ${iconClass}`;
        messageIcon.style.color = iconColor;
    } else {
        messageIcon.className = "message-icon";
        messageIcon.style.color = ""; // Reset icon color
    }

    messageBox.style.bottom = "20px"; // Adjust this value to control the initial position

    setTimeout(() => {
        messageBox.style.bottom = "-100px"; // Hide the message box after 3 seconds
    }, 3000);
}

function closeMessageBox() {
    const messageBox = document.getElementById("messageBox");
    messageBox.style.bottom = "-100px";
}



const createRoomButtons = document.querySelectorAll('.rm-cr-wx_sg0');

createRoomButtons.forEach(button => {
    button.addEventListener('click', function (e) {
        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        // Calculate the position of the ripple
        const x = e.clientX - rect.left - ripple.offsetWidth / 2;
        const y = e.clientY - rect.top - ripple.offsetHeight / 2;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        // Remove the ripple after the animation completes (adjust timing as needed)
        setTimeout(() => {
            ripple.remove();
        }, 600);

        // Show overlay after a slight delay (adjust timing as needed)
        if (button.id === "createRoomFormButton") {
            setTimeout(() => {
                document.querySelector(".overlay_win").style.display = "block";
            }, 400);
        } else if (button.id === "joinRoomFormButton") {
            setTimeout(() => {
                document.querySelector(".overlay_win-join").style.display = "block";
            }, 400);
        }
    });
});


document.getElementById("checkbox-create-rm").onclick = function () {
    if (document.getElementById("checkbox-create-rm").checked === true) {
        document.getElementById("PasswordField-cr").style.display = "block";
    } else {
        document.getElementById("PasswordField-cr").style.display = "none";
    }
}

document.getElementById("checkbox-join-rm").onclick = function () {
    if (document.getElementById("checkbox-join-rm").checked === true) {
        document.getElementById("PasswordField-jn").style.display = "block";
    } else {
        document.getElementById("PasswordField-jn").style.display = "none";
    }
}

const selectWrapper = document.querySelector('.custom-select-wrapper');
const select = document.querySelector('.custom-select');
const selectItems = document.querySelector('.select-items');
const options = document.querySelectorAll('.select-item');

let selectedValue = null; // Variable to store selected option

select.addEventListener('click', function () {
    select.classList.toggle('open');
    selectItems.classList.toggle('open');
});

options.forEach(option => {
    option.addEventListener('click', function () {
        if (option.ariaLabel === 'disabled') {
            return;
        }
        selectedValue = this.textContent; // Update selected value
        select.textContent = selectedValue; // Update select box text
        select.classList.remove('open');
        selectItems.classList.remove('open');
    });
});

document.addEventListener('click', function (e) {
    if (!selectWrapper.contains(e.target)) {
        select.classList.remove('open');
        selectItems.classList.remove('open');
    }
});





// Creating Room
const CreateRoomButtonProceed = document.querySelector('.createRoomButton');
const UserNameFieldCreate = document.querySelector('#UserNameFieldCreate');
const RoomSubjectFieldCreate = document.querySelector('#RoomSubjectFieldCreate');
const RoomPasswordFieldCreate = document.querySelector('#RoomPasswordFieldCreate');
const PasswordCheckCreate = document.querySelector('#checkbox-create-rm');

document.querySelector(".cancelRoomCreateBTN").onclick = function () {
    document.querySelector(".overlay_win").style.display = "none";
}

function generateRandomId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

CreateRoomButtonProceed.addEventListener('click', async function (e) {
    const RoomID = generateRandomId();
    if (!UserNameFieldCreate.value.trim()) {
        showMessageBox("Your name is required!", "fas fa-exclamation-circle", "#ff0000");
        return;
    }
    if (PasswordCheckCreate.checked === true && !RoomPasswordFieldCreate.value.trim()) {
        showMessageBox("Password is required!", "fas fa-exclamation-circle", "#ff0000");
        return;
    }
    if (selectedValue === null) {
        showMessageBox("Maximum Participants is required!", "fas fa-exclamation-circle", "#ff0000");
        return;
    }

    // Preparing data to send
    let RoomPasswordToSendToCreate = RoomPasswordFieldCreate.value;
    let RoomPasswordRequired = "no";
    let RoomSubjectData = "";
    let MaxMembers = "";
    let HostIP = window.UserIP;
    if (PasswordCheckCreate.checked === true) {
        RoomPasswordToSendToCreate = RoomPasswordFieldCreate.value;
        document.querySelector("#RoomDetails-Password").innerText = RoomPasswordToSendToCreate;
        RoomPasswordRequired = "yes";
    } else {
        RoomPasswordToSendToCreate = "null";
        RoomPasswordRequired = "no";
        document.querySelector("#RoomDetails-Password").innerText = "No Password Required";
    }
    if (!RoomSubjectFieldCreate.value.trim()) {
        RoomSubjectData = "";
    } else {
        RoomSubjectData = RoomSubjectFieldCreate.value;
    }
    if (selectedValue === "Four (4)") {
        MaxMembers = 4;
    }
    if (window.UserIP === undefined) {
        showMessageBox("An client error occured, please refresh the page and try again!", "fas fa-exclamation-circle", "#ff0000");
        return;
    }


    //showLoader();
    try {
        const CreateRoomRequest = await fetch("scripts/database.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "create_room=true&room_id=" + RoomID + "&room_subject=" + RoomSubjectData + "&password=" + RoomPasswordToSendToCreate + "&max_members=" + MaxMembers + "&host_name=" + UserNameFieldCreate.value + "&is_password=" + RoomPasswordRequired + "&host_ip=" + HostIP,
        });

        if (CreateRoomRequest.ok) {
            const data = await CreateRoomRequest.text();
            if (data === "pass") {
                if (PasswordCheckCreate.checked === true) {
                    window.RoomJoinLink = window.location.href + "?rid=" + RoomID + "&pass=" + RoomPasswordFieldCreate.value;
                } else {
                    window.RoomJoinLink = window.location.href + "?rid=" + RoomID;
                }
                document.querySelector("#RoomDetails-RoomID").innerText = RoomID;
                showMessageBox("Room created!", "fas fa-check-circle", "#50f263");
                document.querySelector("nav").style.display = "none";
                document.querySelector(".overlay_win").style.display = "none";
                document.querySelectorAll(".rm-cr-wx_sg0").forEach(el => el.style.display = "none");
                document.querySelector("#divUsers").style.display = "block";
                CreateCalls._init(UserNameFieldCreate.value, RoomID, window.UserIP);
                window.UserRole = "host";
                window.RoomConnected = RoomID;
                window.UserName = UserNameFieldCreate.value;
                document.getElementById("meetinJoinURLCon").href = window.RoomJoinLink;
                document.getElementById("meetinJoinURLCon").innerHTML = window.RoomJoinLink;
                document.getElementById("btnStartStopCam").click();
                //setFullscreen(document.getElementById('divRoomCon'));
            } else {
                showMessageBox(data, "fas fa-exclamation-circle", "#ff0000");
            }
        } else {
            console.error("Network request failed");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        //hideLoader();
    }
});



// Joining Room
const JoinRoomButtonProceed = document.querySelector('.joinRoomButton');
const UserNameFieldJoin = document.querySelector('#UserNameFieldJoin');
const RoomIdFieldJoin = document.querySelector('#RoomIdFieldJoin');
const RoomPasswordFieldJoin = document.querySelector('#RoomPasswordFieldJoin');
const PasswordCheckJoin = document.querySelector('#checkbox-join-rm');

document.querySelector(".cancelRoomJoinBTN").onclick = function () {
    document.querySelector(".overlay_win-join").style.display = "none";
}

JoinRoomButtonProceed.addEventListener('click', async function (e) {
    if (!UserNameFieldJoin.value.trim()) {
        showMessageBox("Your name is required!", "fas fa-exclamation-circle", "#ff0000");
        return;
    }
    if (!RoomIdFieldJoin.value.trim()) {
        showMessageBox("Room ID is required!", "fas fa-exclamation-circle", "#ff0000");
        return;
    }
    if (PasswordCheckJoin.checked === true && !RoomPasswordFieldJoin.value.trim()) {
        showMessageBox("Password is required!", "fas fa-exclamation-circle", "#ff0000");
        return;
    }
    let RoomID = RoomIdFieldJoin.value;


    // Preparing data to send
    let RoomPasswordToSendToCreate = RoomPasswordFieldJoin.value;
    let RoomPasswordRequired = "no";
    let HostIP = window.UserIP;
    if (PasswordCheckJoin.checked === true) {
        RoomPasswordToSendToCreate = RoomPasswordFieldJoin.value;
        document.querySelector("#RoomDetails-Password").innerText = RoomPasswordToSendToCreate;
        RoomPasswordRequired = "yes";
    } else {
        RoomPasswordToSendToCreate = "null";
        RoomPasswordRequired = "no";
        document.querySelector("#RoomDetails-Password").innerText = "No Password Required";
    }
    if (window.UserIP === undefined) {
        showMessageBox("An client error occured, please refresh the page and try again!", "fas fa-exclamation-circle", "#ff0000");
        return;
    }


    try {
        const JoinRoomRequest = await fetch("scripts/database.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "join_room=true&room_id=" + RoomID + "&password=" + RoomPasswordToSendToCreate + "&username=" + UserNameFieldJoin.value + "&is_password=" + RoomPasswordRequired + "&user_ip=" + HostIP,
        });

        if (JoinRoomRequest.ok) {
            const data = await JoinRoomRequest.text();
            if (data === "pass") {
                if (PasswordCheckJoin.checked === true) {
                    window.RoomJoinLink = window.location.href + "?rid=" + RoomIdFieldJoin.value + "&pass=" + RoomPasswordFieldJoin.value;
                } else {
                    window.RoomJoinLink = window.location.href + "?rid=" + RoomIdFieldJoin.value;
                }
                document.querySelector("#RoomDetails-RoomID").innerText = RoomIdFieldJoin.value;
                showMessageBox("Room joined!", "fas fa-check-circle", "#50f263");
                document.querySelector("nav").style.display = "none";
                document.querySelector(".overlay_win-join").style.display = "none";
                document.querySelectorAll(".rm-cr-wx_sg0").forEach(el => el.style.display = "none");
                document.querySelector("#divUsers").style.display = "block";
                CreateCalls._init(UserNameFieldJoin.value, RoomIdFieldJoin.value, window.UserIP);
                window.UserRole = "participant";
                window.RoomConnected = RoomIdFieldJoin.value;
                window.UserName = UserNameFieldJoin.value;
                document.getElementById("meetinJoinURLCon").href = window.RoomJoinLink;
                document.getElementById("meetinJoinURLCon").innerHTML = window.RoomJoinLink;
                document.getElementById("btnStartStopCam").click();
                //setFullscreen(document.getElementById('divRoomCon'));
            } else {
                showMessageBox(data, "fas fa-exclamation-circle", "#ff0000");
            }
        } else {
            console.error("Network request failed");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        //hideLoader();
    }
});

const urlParams = new URLSearchParams(window.location.search);
var ParamRoomID = urlParams.get('rid');
var ParamPassword = urlParams.get('pass');


if (ParamRoomID !== null) {
    document.querySelector("#RoomIdFieldJoin").value = ParamRoomID;
    if (ParamPassword !== null) {
        document.querySelector("#checkbox-join-rm").checked = true;
        document.querySelector("#PasswordField-jn").style.display = "block";
        document.querySelector("#RoomPasswordFieldJoin").value = ParamPassword;
    }
    document.querySelector(".overlay_win-join").style.display = "block";
    document.querySelector('#UserNameFieldJoin').focus();
}


// Fullscreen
function setFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
    }
}

window.addEventListener('beforeunload', function (e) {
    if (window.RoomConnected !== undefined) {
        // Show the confirmation dialog
        var confirmationMessage = 'You have a pending task. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = confirmationMessage;
        return confirmationMessage;
    }
});



/////////////// Making invite ////////////////
function InviteUsers() {
    if (window.RoomJoinLink !== undefined) {
        if (navigator.share) {
            navigator.share({
                title: 'Hey, I am in the group call room. Wanna to join me.',
                text: window.RoomJoinLink
            })
                .then(() => {
                    console.log('Thanks for sharing!');
                })
                .catch(console.error);
        } else {
            navigator.clipboard.writeText(window.RoomJoinLink)
                .then(() => {
                    console.log('Text copied to clipboard');
                    showMessageBox("Link copied!", "fas fa-check-circle", "#50f263");
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                });
        }
    } else {
        showMessageBox("An error occurred!", "fas fa-exclamation-circle", "#ff0000");
    }
}


document.getElementById("InviteUserBTN").onclick = function () {
    InviteUsers();
}

document.getElementById("RoomDetailsBTN").onclick = function () {
    ShowWindow();
}


function ShowWindow() {
    document.querySelector(".WebWindowOverlay").style.display = "block";
    document.querySelector("#back-web-view").addEventListener("click", HideWindow);
}

function HideWindow() {
    document.querySelector(".WebWindowOverlay").style.display = "none";
    document.querySelector("#back-web-view").removeEventListener("click", HideWindow);
}


// Copy function 
function CopySpan(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        navigator.clipboard.writeText(element.innerText)
            .then(() => {
                console.log('Text copied to clipboard');
                showMessageBox("Copied!", "fas fa-check-circle", "#50f263");
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    }
}

// Concurantly checking room is exists or not if user is host or participant
setInterval(() => {
    if (window.RoomConnected !== undefined) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "scripts/database.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = xhr.responseText;
                // Handle the response
                if (response === "!!found") {
                    document.getElementById("divRoomCon").style.display = "none";
                    document.querySelector("nav").style.display = "block";
                    document.querySelectorAll(".rm-cr-wx_sg0").forEach(el => el.style.display = "flex");
                    window.UserRole = undefined;
                    window.RoomConnected = undefined;
                    window.UserName = undefined;
                    showMessageBox("Disconnected from room!!", "fas fa-exclamation-circle", "#ff0000");
                }
            } else if (xhr.readyState === 4) {
                // Handle error
                console.error('Error:', xhr.status);
            }
        };
        var data = "check_room="+window.UserRole+"&user_ip="+window.UserIP+"&username="+window.UserName+"&room_id="+window.RoomConnected;
        xhr.send(data);
    }
}, 600);

