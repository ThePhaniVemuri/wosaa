import { Server } from "socket.io";
import { Message } from "../models/Message.models.js";

export default function startChatServer(httpServer) {
  console.log("io function called");
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
  console.log("Socket.io server initialized.");

  io.on("connection", (socket) => {
    console.log("io function called");
    console.log("⚡ User connected:", socket.id);

    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);      

      console.log(`All users in room ${roomId}`, io.sockets.adapter.rooms.get(roomId));
    });    

    socket.on("send-message", async ({ roomId, sender, text }) => {  // msg = { roomId, sender, text }
      console.log("Received message to save:", { roomId, sender, text }); 
      const message = await Message.create({
        roomId,
        senderId: sender,
        message: text,
        isRead: false,
      });

      io.to(roomId).emit("receive-message", {
        sender,
        text,
        createdAt: message.createdAt,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
}
