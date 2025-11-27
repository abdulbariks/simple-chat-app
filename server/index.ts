import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001"],
    methods: ["GET", "POST"],
  },
});

let onlineUsers: Record<string, string> = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username: string) => {
    onlineUsers[socket.id] = username;
    io.emit("userList", Object.values(onlineUsers));
    io.emit("serverMessage", `${username} joined the chat`);
  });

  socket.on("chatMessage", (msg: { text: string; username: string }) => {
    io.emit("newMessage", {
      id: Date.now(),
      username: msg.username,
      text: msg.text,
      time: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    io.emit("userList", Object.values(onlineUsers));
    io.emit("serverMessage", `${username} left the chat`);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
