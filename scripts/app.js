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




var CreateCalls = (function () {
    var socket = null;
    var socker_url = 'nodejs-server-url-here';
    var meeting_id = '';
    var user_id = '';
    var user_ip = '';

    // Generating meeting id
    function GetRoomID() {
        length = 38;
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const idArray = [];
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            idArray.push(characters.charAt(randomIndex));
        }
    
        return idArray.join('');
    }



    let RoomID = "";

    function init(uid, mid, ip) {
        user_id = uid;
        meeting_id = mid;
        user_ip = ip;
        RoomID = GetRoomID();
        document.querySelector('#meetingname').textContent = meeting_id;
        document.querySelector(".roomDetails").style.display = "none";
        document.title = user_id;

        SignalServerEventBinding();
        EventBinding();
    }

    function SignalServerEventBinding() {
        const socket = io.connect(socker_url, {
            path: "/group/",
            withCredentials: true,
        });

        var ServerFunction = function (data, to_connid) {
            socket.emit('exchangeSDP', { message: data, to_connid: to_connid });
        };

        socket.on('reset', function () {
            location.reload();
        });

        socket.on('exchangeSDP', async function (data) {
            await SinguixRTC.ExecuteClientFunction(data.message, data.from_connid);
        });

        socket.on('informAboutNewConnection', function (data) {
            AddNewUser(data.other_user_id, data.connId);
            SinguixRTC.CreateNewConnection(data.connId);
        });

        socket.on('informAboutConnectionEnd', function (connId) {
            document.querySelector('#' + connId).remove();
            SinguixRTC.CloseExistingConnection(connId);
        });

        socket.on('connect', function () {
            if (socket.connected) {
                SinguixRTC.init(ServerFunction, RoomID, log=true);
                console.log(user_id);

                if (user_id != "" && meeting_id != "") {
                    socket.emit('userconnect', { displayName: user_id, roomId: RoomID, meetingid: meeting_id, userIP: user_ip });
                }
            }
        });

        socket.on('userconnected', function (other_users) {
            document.querySelectorAll('#divUsers .other').forEach(div => div.remove());

            if (other_users) {
                //console.log(other_users);
                for (var i = 0; i < other_users.length; i++) {
                    if (other_users[i].userIP !== window.UserIP) {
                        AddNewUser(other_users[i].user_id, other_users[i].connectionId);
                        SinguixRTC.CreateNewConnection(other_users[i].connectionId);
                    }
                }
            }
            document.querySelector(".toolbox").style.display = "flex";
            document.querySelector('#divUsers').style.display = "grid";
        });


        // Leaving the room
        document.getElementById("btnLeaveMeeting").onclick = function () {
            alert("Leaving the meeting")
            socket.close();
            document.getElementById("divRoomCon").style.display = "none";
            document.querySelector("nav").style.display = "block";
            document.querySelectorAll(".rm-cr-wx_sg0").forEach(el => el.style.display = "flex");
            window.UserRole = undefined;
            window.RoomConnected = undefined;
            window.UserName = undefined;
        }
    }

    function EventBinding() {
        //document.querySelector('#btnResetMeeting').addEventListener('click', function () {
        //    socket.emit('reset');
        //});

        document.querySelector('#divUsers').addEventListener('dblclick', function (e) {
            if (e.target.tagName === 'VIDEO') {
                e.target.requestFullscreen();
            }
        });
    }

    function AddNewUser(other_user_id, connId) {
        var $newDiv = document.querySelector('#otherTemplate').cloneNode(true);
        $newDiv.setAttribute('id', connId);
        $newDiv.classList.add('other');
        //$newDiv.querySelector('h3').textContent = other_user_id;
        $newDiv.querySelector('video').setAttribute('id', 'v_' + connId);
        $newDiv.querySelector('audio').setAttribute('id', 'a_' + connId);
        $newDiv.style.display = "block";
        document.querySelector('#divUsers').appendChild($newDiv);
    }

    

    document.getElementById("btnMuteUnmute").onclick = function () {
        SinguixRTC.AudioToggle(document.getElementById("btnMuteUnmute"))
    }
    

    return {
        _init: function (uid, mid, ip) {
            init(uid, mid, ip);
        }
    };

    
}());
