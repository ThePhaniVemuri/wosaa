import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";
import { Message } from "../models/Message.models.js";

/**
 * Parse cookies manually (works for socket.handshake.headers.cookie)
 */
// function parseCookies(cookieHeader = "") {
//   return cookieHeader
//     .split(";")
//     .map(c => c.trim())
//     .filter(Boolean)
//     .reduce((acc, cur) => {
//       const idx = cur.indexOf("=");
//       if (idx === -1) return acc;
//       acc[cur.slice(0, idx)] = decodeURIComponent(cur.slice(idx + 1));
//       return acc;
//     }, {});
// }

export default function startChatServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  console.log("✅ Socket.io server initialized");

  /* ===============================
     🔐 SOCKET AUTH MIDDLEWARE
     =============================== */
  // io.use(async (socket, next) => {
  //   console.log("Middleware called")
  //   try {
  //     const cookieHeader = socket.handshake.headers.cookie;
  //     if (!cookieHeader) {
  //       return next(new Error("Authentication required"));
  //     }

  //     const cookies = parseCookies(cookieHeader);
  //     const token = cookies.accessToken;

  //     if (!token) {
  //       return next(new Error("Access token missing"));
  //     }

  //     const decoded = jwt.verify(
  //       token,
  //       process.env.ACCESS_TOKEN_SECRET
  //     );

  //     const user = await User.findById(decoded._id).select("-password");
  //     if (!user) {
  //       return next(new Error("User not found"));
  //     }
  //     console.log("Middleware success")

  //     // attach user to socket
  //     socket.user = user;
  //     next();
  //   } catch (err) {
  //     console.error("Socket auth error:", err.message);
  //     next(new Error("Invalid or expired token"));
  //   }
  // });

  io.use(async (socket, next) => {
    console.log("Socket Middleware called")
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Access token missing"));
      }
      console.log("token is there", token)

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log("decoded the token")
      const user = await User.findById(decoded._id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  /* ===============================
     🔌 SOCKET CONNECTION
     =============================== */
  io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.user._id.toString());

    socket.on("join-room", ({ roomId }) => {
      if (!roomId) return;

      socket.join(roomId);
      // console.log(`User ${socket.user._id} joined room ${roomId}`);
    });

    socket.on("send-message", async ({ roomId, text }) => {
      if (!roomId || !text) return;

      const message = await Message.create({
        roomId,
        senderId: socket.user._id,
        message: text,
        isRead: false,
      });

      io.to(roomId).emit("receive-message", {
        sender: socket.user._id,
        text,
        createdAt: message.createdAt,
      });
    });

    socket.on("disconnect", () => {
      // console.log("❌ User disconnected:", socket.user._id.toString());
    });
  });
}
