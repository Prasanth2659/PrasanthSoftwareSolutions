require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const { verifyToken } = require('./middlewares/auth');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./modules/auth/authRoutes'));
app.use('/api/users', verifyToken, require('./modules/users/userRoutes'));
app.use('/api/projects', verifyToken, require('./modules/projects/projectRoutes'));
app.use('/api/services', verifyToken, require('./modules/services/serviceRoutes'));
app.use('/api/companies', verifyToken, require('./modules/services/companyRoutes'));
app.use('/api/service-requests', verifyToken, require('./modules/serviceRequests/serviceRequestRoutes'));
app.use('/api/messages', verifyToken, require('./modules/messaging/messageRoutes'));

// Create HTTP server
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: { origin: '*' } // Allow all origins for the assignment
});

// Middleware to authenticate socket connections
io.use((socket, next) => {
  if (socket.handshake.auth && socket.handshake.auth.token) {
    jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded;
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
});

// Store connected users mapping: userId -> socketId
const connectedUsers = new Map();
app.set('io', io);
app.set('connectedUsers', connectedUsers);

io.on('connection', (socket) => {
  const userId = socket.user.id;
  connectedUsers.set(userId, socket.id);
  console.log(`User connected via socket: ${userId}`);

  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
    console.log(`User disconnected: ${userId}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Modular Monolith Server running on port ${PORT}`);
});
