const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql');

// Create MySQL connection
const dbConnection = mysql.createConnection({
    host: '0.0.0.0', // Add your SQL Server host 
    user: 'username', // Add username to access database
    password: 'password', // Add password
    database: 'db', // Add database name
    port: 3306 // 3306 is default SQL port but you can change
});

dbConnection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

const server = http.createServer();

let _userConnections = [];

const io = new Server(server, {
    cors: {
        origin: ['http://localhost', 'https://yousite.com'], // Add more website to allow only yours specific site
        methods: ['GET', 'POST'],
        credentials: true,
    },
    path: "/group/"
});

// Function to update members list and count
function updateMembersList(room_id, new_members_list, callback) {
    const members_count = new_members_list.length;
    const sql = 'UPDATE GroupCallingRooms SET members_list = ?, members_count = ? WHERE room_id = ?';
    dbConnection.query(sql, [JSON.stringify(new_members_list), members_count, room_id], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, 'pass');
    });
}

// Function to update users IPs
function updateUsersIPs(room_id, new_users_ips, callback) {
    const sql = 'UPDATE GroupCallingRooms SET users_ips = ? WHERE room_id = ?';
    dbConnection.query(sql, [JSON.stringify(new_users_ips), room_id], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, 'pass');
    });
}

// Function to add a member
function addMember(room_id, member_to_add, callback) {
    const sql = 'SELECT members_list FROM GroupCallingRooms WHERE room_id = ?';
    dbConnection.query(sql, [room_id], (err, result) => {
        if (err || result.length === 0) {
            return callback(err || 'Room not found');
        }
        let members_list = JSON.parse(result[0].members_list || "[]");
        if (!members_list.includes(member_to_add)) {
            members_list.push(member_to_add);
            updateMembersList(room_id, members_list, callback);
        } else {
            callback(null, 'member already exists');
        }
    });
}

// Function to add a user IP
function addUserIP(room_id, user_ip_to_add, callback) {
    const sql = 'SELECT users_ips FROM GroupCallingRooms WHERE room_id = ?';
    dbConnection.query(sql, [room_id], (err, result) => {
        if (err || result.length === 0) {
            return callback(err || 'Room not found');
        }
        let users_ips = JSON.parse(result[0].users_ips || "[]");
        if (!users_ips.includes(user_ip_to_add)) {
            users_ips.push(user_ip_to_add);
            updateUsersIPs(room_id, users_ips, callback);
        } else {
            callback(null, 'IP already exists');
        }
    });
}

// Function to remove a member
function removeMember(room_id, member_to_remove, callback) {
    const sql = 'SELECT members_list FROM GroupCallingRooms WHERE room_id = ?';
    dbConnection.query(sql, [room_id], (err, result) => {
        if (err || result.length === 0) {
            return callback(err || 'Room not found');
        }
        let members_list = JSON.parse(result[0].members_list || "[]");
        members_list = members_list.filter(member => member !== member_to_remove);
        updateMembersList(room_id, members_list, callback);
    });
}

// Function to remove a user IP
function removeUserIP(room_id, ip_to_remove, callback) {
    const sql = 'SELECT users_ips FROM GroupCallingRooms WHERE room_id = ?';
    dbConnection.query(sql, [room_id], (err, result) => {
        if (err || result.length === 0) {
            return callback(err || 'Room not found');
        }
        let users_ips = JSON.parse(result[0].users_ips || "[]");
        users_ips = users_ips.filter(ip => ip !== ip_to_remove);
        updateUsersIPs(room_id, users_ips, callback);
    });
}

// Listen on every connection
io.on('connection', (socket) => {
    let RoomID;

    socket.on('userconnect', (data) => {
        try {
            RoomID = data.roomId;
            console.log(RoomID);
            console.log('userconnect', data.displayName, data.meetingid, data.userIP);

            const existingConnection = _userConnections.find(p => p.connectionId === socket.id);
            if (existingConnection) {
                // If connection already exists, update user info
                existingConnection.user_id = data.displayName;
                existingConnection.meeting_id = data.meetingid;
                existingConnection.userIP = data.userIP;
            } else {
                // Otherwise, push new connection
                _userConnections.push({
                    connectionId: socket.id,
                    user_id: data.displayName,
                    meeting_id: data.meetingid,
                    userIP: data.userIP
                });
            }

            const other_users = _userConnections.filter((p) => p.meeting_id == data.meetingid);

            other_users.forEach((v) => {
                socket.to(v.connectionId).emit('informAboutNewConnection', {
                    other_user_id: data.displayName,
                    connId: socket.id,
                });
            });

            // Add the new user and its IP to the database JSON lists
            addMember(data.meetingid, data.displayName, (err, result) => {
                if (err) {
                    console.error('Error adding member:', err);
                } else if (result !== 'member already exists') {
                    console.log(`Added member ${data.displayName} to room ${data.meetingid}`);
                }
            });

            addUserIP(data.meetingid, data.userIP, (err, result) => {
                if (err) {
                    console.error('Error adding user IP:', err);
                } else if (result !== 'IP already exists') {
                    console.log(`Added IP ${data.userIP} to room ${data.meetingid}`);
                }
            });

            socket.emit('userconnected', other_users);
        } catch (error) {
            console.error('Error in userconnect:', error);
        }
    });

    socket.on('exchangeSDP', (data) => {
        try {
            socket.to(data.to_connid).emit('exchangeSDP', {
                message: data.message,
                from_connid: socket.id,
            });
        } catch (error) {
            console.error('Error in exchangeSDP:', error);
        }
    });

    socket.on('reset', (data) => {
        try {
            const userObj = _userConnections.find((p) => p.connectionId == socket.id);
            if (userObj) {
                const meetingid = userObj.meeting_id;
                const list = _userConnections.filter((p) => p.meeting_id == meetingid);
                _userConnections = _userConnections.filter((p) => p.meeting_id != meetingid);

                list.forEach((v) => {
                    socket.to(v.connectionId).emit('reset');
                });

                socket.emit('reset');
            }
        } catch (error) {
            console.error('Error in reset:', error);
        }
    });

    socket.on('disconnect', () => {
        try {
            console.log('Got disconnect!');

            const userObj = _userConnections.find((p) => p.connectionId == socket.id);
            if (userObj) {
                const meetingid = userObj.meeting_id;
                const userIP = userObj.userIP;
                const userID = userObj.user_id;

                _userConnections = _userConnections.filter((p) => p.connectionId != socket.id);
                const list = _userConnections.filter((p) => p.meeting_id == meetingid);

                list.forEach((v) => {
                    socket.to(v.connectionId).emit('informAboutConnectionEnd', socket.id);
                });

                // Remove the user and its IP from the database JSON lists
                removeMember(meetingid, userID, (err, result) => {
                    if (err) {
                        console.error('Error removing member:', err);
                    } else {
                        console.log(`Removed member ${userID} from room ${meetingid}`);
                    }
                });

                removeUserIP(meetingid, userIP, (err, result) => {
                    if (err) {
                        console.error('Error removing user IP:', err);
                    } else {
                        console.log(`Removed IP ${userIP} from room ${meetingid}`);
                    }
                });
            }
        } catch (error) {
            console.error('Error in disconnect:', error);
        }
    });
});

// Listen on port 3001
server.listen(3001, () => {
    console.log('Listening on port 3001...');
});

// Graceful shutdown
const gracefulShutdown = () => {
    server.close(() => {
        console.log('Closed out remaining connections.');
        dbConnection.end(() => {
            console.log('Closed MySQL connection.');
            process.exit(0);
        });
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        dbConnection.end(() => {
            console.log('Closed MySQL connection.');
            process.exit(1);
        });
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
