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
        console.log('ðŸ”Œ [SOCKET]: New connection:', socket.id);

        socket.on('join', (userId) => {
            if (userId) {
                userSockets.set(userId.toString(), socket.id);
                console.log(`ðŸ‘¤ [SOCKET]: User ${userId} joined with socket ${socket.id}`);
            }
        });

        socket.on('disconnect', () => {
            // Find and remove user from Map
            for (let [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`ðŸ‘‹ [SOCKET]: User ${userId} disconnected`);
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
            console.log(`âœ‰ï¸ [SOCKET]: Sent notification to user ${userId}`);
        } else {
            console.log(`ðŸ“´ [SOCKET]: User ${userId} is offline, skipping real-time delivery`);
        }
    }
};

const broadcast = (event, data) => {
    if (io) {
        io.emit(event, data);
        console.log(`ðŸ“¢ [SOCKET]: Broadcasted event: ${event}`);
    }
};

module.exports = { initSocket, sendToUser, broadcast };
