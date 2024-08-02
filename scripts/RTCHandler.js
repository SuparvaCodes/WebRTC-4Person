// All Rights Reserved (c) Singuix LLC
// This code handles the WebRTC thread structure to allow multiple connections of users and create mutliple sessions.
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
var SinguixRTC = (function () {
    const iceConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
        ],
        googCpuOveruseDetection: true,
        googCpuOveruseEncodeUsage: true,
    };
    var Log = false;
    var _AudioTrack;
    var PeerConnections = [];
    var PeerConnectionIDS = [];
    var _RemoteVideoStreams = [];
    var _RemoteAudioStreams = [];
    var _LocalVideoPlayer;
    var _RTPVideoSenders = [];
    var RTPAudioSenders = [];
    var _ServerFunction;
    var VideoStates = { None: 0, Camera: 1, ScreenShare: 2 };
    var _VideoState = VideoStates.None;
    var _VideoCamerasTrack;
    var _ISAudioMute = true;
    var _MyConnectionID = '';
    document.getElementById("btnMuteUnmute").style.background = "#a2ed68"


    // Initializing the RTC
    async function _init(ServerFunctionVarible, MyConnectID, LogState) {
        if (LogState == true) {Log = true} else if (LogState == false) {Log = false}
        _MyConnectionID = MyConnectID;
        _ServerFunction = ServerFunctionVarible;
        _LocalVideoPlayer = document.getElementById('localVideoCtr');

        EventBinding();
    }

    async function AudioToggle() {

        if (!_AudioTrack) {
            await startwithAudio();
        }

        if (!_AudioTrack) {
            alert('problem with audio permission')
            return;
        }
        

        if (_ISAudioMute) {
            _AudioTrack.enabled = true;
            if (Log == true) {console.log("Audio enabled!!")}
            AddUpdateAudioVideoSenders(_AudioTrack, RTPAudioSenders);
            document.getElementById("btnMuteUnmute").style.background = "#fff"
        } else {
            _AudioTrack.enabled = false;
            if (Log == true) {console.log("Audio disabled!!")}
            RemoveAudioVideoSenders(RTPAudioSenders);
            document.getElementById("btnMuteUnmute").style.background = "#a2ed68"
        }
        _ISAudioMute = !_ISAudioMute;

        console.log(_AudioTrack);
    };

    async function CameraToggle() {
        if (_VideoState == VideoStates.Camera) { //Stop case
            if (Log == true) {console.log("Camera disable!!")}
            await ManageVideo(VideoStates.None);
        } else {
            if (Log == true) {console.log("Camera disable!!")}
            await ManageVideo(VideoStates.Camera);
        }
    }

    async function ScreenShareToggle() {
        if (_VideoState == VideoStates.ScreenShare) { //Stop case
            if (Log == true) {console.log("ScreenShare disable!!")}
            await ManageVideo(VideoStates.None);
        } else {
            if (Log == true) {console.log("ScreenShare disable!!")}
            await ManageVideo(VideoStates.ScreenShare);
        }
    }

    document.getElementById('btnStartStopCam').addEventListener('click', async function () {

        if (_VideoState == VideoStates.Camera) { //Stop case
            await ManageVideo(VideoStates.None);
        } else {
            await ManageVideo(VideoStates.Camera);
        }
    });

    function EventBinding() {

        

        document.getElementById('btnStartStopScreenshare').addEventListener('click', async function () {

            if (_VideoState == VideoStates.ScreenShare) { //Stop case
                await ManageVideo(VideoStates.None);
            } else {
                await ManageVideo(VideoStates.ScreenShare);
            }
        });
    }

    // Camera or Screen Share or None
    async function ManageVideo(_NewVideoState) {
        if (_NewVideoState == VideoStates.None) {
            document.getElementById('btnStartStopCam').style.background = "#a2ed68";
            document.getElementById('btnStartStopScreenshare').style.background = "#fff";
            _VideoState = _NewVideoState;

            ClearCurrentVideoCamStream(_RTPVideoSenders);
            return;
        }

        try {
            var vstream = null;

            if (_NewVideoState == VideoStates.Camera) {
                vstream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: 720,
                        height: 480
                    },
                    frameRate: { ideal: 30 },
                    videoBitsPerSecond: 1000000,
                    audio: true
                });
            } else if (_NewVideoState == VideoStates.ScreenShare) {
                vstream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        width: 720,
                        height: 480
                    },
                    audio: true
                });

                vstream.oninactive = e => {
                    ClearCurrentVideoCamStream(_RTPVideoSenders);
                    document.getElementById('btnStartStopScreenshare').style.background = "#fff";
                };
            }

            ClearCurrentVideoCamStream(_RTPVideoSenders);

            _VideoState = _NewVideoState;

            if (_NewVideoState == VideoStates.Camera) {
                document.getElementById('btnStartStopCam').style.background = "#fff";
                document.getElementById('btnStartStopScreenshare').style.background = "#fff";
            } else if (_NewVideoState == VideoStates.ScreenShare) {
                document.getElementById('btnStartStopCam').style.background = "#fff";
                document.getElementById('btnStartStopScreenshare').style.background = "#a2ed68";
            }

            if (vstream && vstream.getVideoTracks().length > 0) {
                _VideoCamerasTrack = vstream.getVideoTracks()[0];

                if (_VideoCamerasTrack) {
                    _LocalVideoPlayer.srcObject = new MediaStream([_VideoCamerasTrack]);

                    AddUpdateAudioVideoSenders(_VideoCamerasTrack, _RTPVideoSenders);
                }
            }
        } catch (e) {
            console.log(e);
            return;
        }
    }

    function ClearCurrentVideoCamStream(RTPVideoSenders) {
        if (_VideoCamerasTrack) {
            _VideoCamerasTrack.stop();
            _VideoCamerasTrack = null;
            _LocalVideoPlayer.srcObject = null;

            RemoveAudioVideoSenders(RTPVideoSenders);
        }
    }

    async function RemoveAudioVideoSenders(RTPSenders) {
        for (var ConnectionID in PeerConnectionIDS) {
            var connection = PeerConnections[ConnectionID];
            if (RTPSenders[ConnectionID] && IsConnectionAvailable(connection)) {
                connection.removeTrack(RTPSenders[ConnectionID]);
                RTPSenders[ConnectionID] = null;
            }
        }
    }

    async function AddUpdateAudioVideoSenders(track, RTPSenders) {
        for (var ConnectionID in PeerConnectionIDS) {
            if (IsConnectionAvailable(PeerConnections[ConnectionID])) {
                if (RTPSenders[ConnectionID] && RTPSenders[ConnectionID].track) {
                    RTPSenders[ConnectionID].replaceTrack(track);
                } else {
                    RTPSenders[ConnectionID] = PeerConnections[ConnectionID].addTrack(track);
                }
            }
        }
    }

    async function startwithAudio() {
        try {
            var ASTREAM = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            _AudioTrack = ASTREAM.getAudioTracks()[0];

            _AudioTrack.onmute = function (e) {
                console.log(e);
            }
            _AudioTrack.onunmute = function (e) {
                console.log(e);
            }

            _AudioTrack.enabled = false;

        } catch (e) {
            console.log(e);
            return;
        }
    }

    async function CreatePeerConnection(ConnectID) {
        var connection = new RTCPeerConnection(iceConfiguration);
        connection.onicecandidate = function (event) {
            console.log('onicecandidate', event.candidate);
            if (event.candidate) {
                _ServerFunction(JSON.stringify({ 'iceCandidate': event.candidate }), ConnectID);
            }
        }
        connection.onicecandidateerror = function (event) {
            console.log('onicecandidateerror', event);

        }

        connection.onicegatheringstatechange = function (event) {
            console.log('onicegatheringstatechange', event);
        };
        connection.onnegotiationneeded = async function (event) {
            console.log('onnegotiationneeded', event);
            await _createOffer(ConnectID);
        }
        connection.onconnectionstatechange = function (event) {
            console.log('onconnectionstatechange', event.currentTarget.connectionState)
            if (event.currentTarget.connectionState === "connected") {
                console.log('connected')
            }
            if (event.currentTarget.connectionState === "disconnected") {
                console.log('disconnected');
            }
        }

        // New remote media stream was added
        connection.ontrack = function (event) {
            if (!_RemoteVideoStreams[ConnectID]) {
                _RemoteVideoStreams[ConnectID] = new MediaStream();
            }

            if (!_RemoteAudioStreams[ConnectID])
                _RemoteAudioStreams[ConnectID] = new MediaStream();

            if (event.track.kind == 'video') {
                _RemoteVideoStreams[ConnectID].getVideoTracks().forEach(t => _RemoteVideoStreams[ConnectID].removeTrack(t));
                _RemoteVideoStreams[ConnectID].addTrack(event.track);

                var _remoteVideoPlayer = document.getElementById('v_' + ConnectID)
                _remoteVideoPlayer.srcObject = null;
                _remoteVideoPlayer.srcObject = _RemoteVideoStreams[ConnectID];
                _remoteVideoPlayer.load();
            } else if (event.track.kind == 'audio') {
                var _remoteAudioPlayer = document.getElementById('a_' + ConnectID)
                _RemoteAudioStreams[ConnectID].getVideoTracks().forEach(t => _RemoteAudioStreams[ConnectID].removeTrack(t));
                _RemoteAudioStreams[ConnectID].addTrack(event.track);
                _remoteAudioPlayer.srcObject = null;
                _remoteAudioPlayer.srcObject = _RemoteAudioStreams[ConnectID];
                _remoteAudioPlayer.load();
            }
        };

        PeerConnectionIDS[ConnectID] = ConnectID;
        PeerConnections[ConnectID] = connection;

        if (_VideoState == VideoStates.Camera || _VideoState == VideoStates.ScreenShare) {
            if (_VideoCamerasTrack) {
                AddUpdateAudioVideoSenders(_VideoCamerasTrack, _RTPVideoSenders);
            }
        }

        return connection;
    }

    async function _createOffer(ConnectID) {
        var connection = PeerConnections[ConnectID];
        console.log('connection.signalingState:' + connection.signalingState);
        var offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        // Send offer to Server
        _ServerFunction(JSON.stringify({ 'offer': connection.localDescription }), ConnectID);
    }

    async function ExchangeSDP(Message, FromConnectionID) {
        console.log('messag', Message);
        Message = JSON.parse(Message);

        if (Message.answer) {
            console.log('answer', Message.answer);
            await PeerConnections[FromConnectionID].setRemoteDescription(new RTCSessionDescription(Message.answer));
            console.log('connection', PeerConnections[FromConnectionID]);
        } else if (Message.offer) {
            console.log('offer', Message.offer);

            if (!PeerConnections[FromConnectionID]) {
                await CreatePeerConnection(FromConnectionID);
            }

            await PeerConnections[FromConnectionID].setRemoteDescription(new RTCSessionDescription(Message.offer));
            var answer = await PeerConnections[FromConnectionID].createAnswer();
            await PeerConnections[FromConnectionID].setLocalDescription(answer);
            _ServerFunction(JSON.stringify({ 'answer': answer }), FromConnectionID, _MyConnectionID);
        } else if (Message.iceCandidate) {
            console.log('iceCandidate', Message.iceCandidate);
            if (!PeerConnections[FromConnectionID]) {
                await CreatePeerConnection(FromConnectionID);
            }

            try {
                await PeerConnections[FromConnectionID].addIceCandidate(Message.iceCandidate);
            } catch (e) {
                console.log(e);
            }
        }
    }

    function IsConnectionAvailable(connection) {
        if (connection &&
            (connection.connectionState == "new"
                || connection.connectionState == "connecting"
                || connection.connectionState == "connected"
            )) {
            return true;
        } else
            return false;
    }

    function ClosePeerConnection(ConnectID) {
        PeerConnectionIDS[ConnectID] = null;

        if (PeerConnections[ConnectID]) {
            PeerConnections[ConnectID].close();
            PeerConnections[ConnectID] = null;
        }
        if (_RemoteAudioStreams[ConnectID]) {
            _RemoteAudioStreams[ConnectID].getTracks().forEach(t => {
                if (t.stop)
                    t.stop();
            });
            _RemoteAudioStreams[ConnectID] = null;
        }

        if (_RemoteVideoStreams[ConnectID]) {
            _RemoteVideoStreams[ConnectID].getTracks().forEach(t => {
                if (t.stop)
                    t.stop();
            });
            _RemoteVideoStreams[ConnectID] = null;
        }
    }

    return {
        init: async function (ServerFunction, MyConnectionID, log = false) {
            await _init(ServerFunction, MyConnectionID, log);
        },
        ExecuteClientFunction: async function (data, FromConnectionID) {
            await ExchangeSDP(data, FromConnectionID);
        },
        CreateNewConnection: async function (ConnectID) {
            await CreatePeerConnection(ConnectID);
        },
        CloseExistingConnection: function (ConnectID) {
            ClosePeerConnection(ConnectID);
        },
        AudioToggle: function (element) {
            AudioToggle(element)
        }
    };
})();
