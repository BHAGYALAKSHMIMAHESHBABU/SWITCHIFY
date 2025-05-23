const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const profileRoutes = require('./routes/profile');
const uploadRoute = require('./routes/upload');
require('dotenv').config();
const path = require('path');


const app = express();
const server = http.createServer(app);

// Enable CORS for Express HTTP requests
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// REST API Routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
app.use('/api/auth', authRoutes);

app.use('/api/contact', contactRoutes);

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // Frontend URL
    methods: ["GET", "POST"]
  }
});

// Socket.IO authentication middleware using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id; // Attach user ID to socket
    next();
  } catch (err) {
    console.error('❌ Socket authentication failed:', err);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO logic (chat, typing, messages, etc.)
const socketSetup = require('./socket/socket');
socketSetup(io);


// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const userRoutes = require('./routes/user');
console.log('Mounting user routes at /api/user');

app.use('/api/user', userRoutes);


app.use('/api', uploadRoute);
app.use('/api/profile', profileRoutes);

// app.use('/api', require('./routes/auth'));


// Start the server
server.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
