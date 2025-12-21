import { io } from "socket.io-client";

export default function enableClientSocketConnection() {
  // console.log("Client socket enabled");

  const socket = io("http://localhost:3000");

  socket.on("connect", () => {
    // console.log("Connected to socket server:", socket.id);
  });

}
