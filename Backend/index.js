import express from "express";
import http from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3009;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CORS_ORIGIN } });

app.get("/", (req, res) => {
  res.send("Hello I'm Running");
});

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("send-data", (data) => {
    console.log(data);
    socket.emit("receive-data", { id: socket.id, pos: data });
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected");
    socket.broadcast.emit("remove-position", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is Running at PORT: ${PORT}`);
});
