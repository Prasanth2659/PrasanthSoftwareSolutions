const socketIo = require('socket.io');

let io;
const userSocketMap = new Map(); // Map<userId, socketId>

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Or specify exact frontend URL
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);
    
    // In a real app, authenticate here via middleware.
    // We expect the client to send their userId when they connect.
    const userId = socket.handshake.query.userId || socket.handshake.auth?.userId;
    
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`[Socket] Mapped User ${userId} -> Socket ${socket.id}`);
    }

    // Handle explicit registration if they want to connect first then authenticate
    socket.on('register', (id) => {
      if (id) {
        userSocketMap.set(id, socket.id);
        console.log(`[Socket] Registered User ${id} -> Socket ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      // Remove from map
      for (const [key, val] of userSocketMap.entries()) {
        if (val === socket.id) {
          userSocketMap.delete(key);
          console.log(`[Socket] Unmapped User ${key}`);
          break;
        }
      }
    });
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

const getReceiverSocketId = (userId) => {
  return userSocketMap.get(userId);
};

module.exports = {
  initializeSocket,
  getIo,
  getReceiverSocketId
};
