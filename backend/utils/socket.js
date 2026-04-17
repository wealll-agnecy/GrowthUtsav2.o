const socketio = require('socket.io');

let io;
const userSockets = new Map(); // Store userId -> socketId

const initSocket = (server) => {
    io = socketio(server, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 [SOCKET]: New connection:', socket.id);

        socket.on('join', (userId) => {
            if (userId) {
                userSockets.set(userId.toString(), socket.id);
                console.log(`👤 [SOCKET]: User ${userId} joined with socket ${socket.id}`);
            }
        });

        socket.on('disconnect', () => {
            // Find and remove user from Map
            for (let [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`👋 [SOCKET]: User ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    return io;
};

const sendToUser = (userId, event, data) => {
    if (io) {
        const socketId = userSockets.get(userId.toString());
        if (socketId) {
            io.to(socketId).emit(event, data);
            console.log(`✉️ [SOCKET]: Sent notification to user ${userId}`);
        } else {
            console.log(`📴 [SOCKET]: User ${userId} is offline, skipping real-time delivery`);
        }
    }
};

const broadcast = (event, data) => {
    if (io) {
        io.emit(event, data);
        console.log(`📢 [SOCKET]: Broadcasted event: ${event}`);
    }
};

module.exports = { initSocket, sendToUser, broadcast };
