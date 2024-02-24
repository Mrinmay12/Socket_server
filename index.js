// Import necessary modules
import fastify from "fastify";
import { Server as SocketServer } from 'socket.io';
import cors from '@fastify/cors';
import http from 'http';


// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Initialize Fastify app
const app = fastify();

// Register CORS middleware
app.register(cors);



app.get('/', async (req, res) => {
  return { message: 'Welcome to FirstConnect server' };
});

// Connect to the database
const start = async () => {
  try {

    // Create a plain HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io server
    const io = new SocketServer(server, {
      cors: {
        origin: process.env.REACT_PORT,
        credentials: true
      }
    });

    // Socket.io logic
    global.onlineUsers = new Map();
    let activeUsers = [];
    
    io.on("connection", (socket) => {
      global.chatSocket = socket;
      socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        if (!activeUsers.some((user) => user.userId === userId)) {
          activeUsers.push({ userId: userId, socketId: socket.id });
        }
        io.emit("get-users", activeUsers);
      });
    
      socket.on("disconnect", () => {
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        io.emit("get-users", activeUsers);
      });
    
      socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("msg-recieve", data.messagetext, data.messageid);
        }
      });
    });

    // Start the server
    server.listen(process.env.PORT , (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`Server listening on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Start the server
start();
