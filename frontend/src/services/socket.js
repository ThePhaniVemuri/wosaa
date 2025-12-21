import { io } from "socket.io-client";

export default function enableClientSocketConnection() {
  // console.log("Client socket enabled");

  const socket = io(process.env.CORS_ORIGIN);

  socket.on("connect", () => {
    // console.log("Connected to socket server:", socket.id);
  });

}
