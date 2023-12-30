const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Create an HTTP server with Express
const express = require("express");
const app = express();
const httpServer = createServer(app);

app.use(cors());

const activeUsers = new Set();

const url = process.env.IS_PRODUCTION
  ? process.env.CLIENT_URL
  : process.env.LOCAL_CLIENT_URL;
const io = new Server(httpServer, {
  cors: {
    origin: "https://real-time-chat-app-pi-gold.vercel.app", // Replace with your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("socket is connected");

  socket.on("new_user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new_user", [...activeUsers]);
  });

  socket.on("chat_message", (data) => {
    io.emit("chat_message", data);
  });
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
  socket.on("not_typing", function (data) {
    socket.broadcast.emit("not_typing", data);
  });
  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user_disconnected", socket.userId); // Corrected event name
  });
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});
