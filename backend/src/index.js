import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import startChatServer from "./chat/chatServer.js";
import http from "http";

dotenv.config();

async function startServer() {
  try {
    await connectDB();

    // Create HTTP server for both Express + Socket.io
    const httpServer = http.createServer(app);

    // Attach socket.io to httpServer
    startChatServer(httpServer);
    console.log("✅ Chat server started.");

    // Start listening
    httpServer.listen(process.env.PORT, () => {
      console.log(`🚀 Server + Socket running on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("DB Connection Failed:", error);
  }
}

startServer();
