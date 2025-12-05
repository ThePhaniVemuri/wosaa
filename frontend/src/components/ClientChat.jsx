import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { API_BASE } from "../api/config";

function ClientChat() {
  const location = useLocation();
  const clientId = location.state?.clientId;          // Sender = client
  const freelancerId = location.state?.freelancerId;
  const gigId = location.state?.gigId;
  const gigTitle = location.state?.gigTitle;
  console.log("client ID from client chat:", clientId);

  const socketRef = useRef(null);

  const [chatRoomId, setChatRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 1️⃣ Get or create chat room
  const getChatRoomId = async () => {
    const res = await fetch(`${API_BASE}/users/get-or-create-chat-room`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, freelancerId, gigId }),
    });

    const data = await res.json();
    if (!data.success) throw new Error("Failed to get/create chat room");

    return data;
  };

  // 2️⃣ Load existing messages on first render
  useEffect(() => {
    async function loadChat() {
      const result = await getChatRoomId();

      const roomId = result?.chatRoom?._id;
      setChatRoomId(roomId);
      const loadedmessages = result.messages.map(msg => ({
            roomId: msg.roomId,
            sender: msg.senderId,
            text: msg.message,
        }));

      setMessages(loadedmessages || []);
      console.log("Messages are loaded");
    //   console.log("Loaded messages:", loadedmessages);
    }

    if (clientId && freelancerId && gigId) loadChat();
  }, [clientId, freelancerId, gigId]);

  // 3️⃣ Connect to socket AFTER chatRoomId is available
  useEffect(() => {
    if (!chatRoomId) return;

    const backendOrigin = API_BASE.replace(/\/api\/v1\/?$/i, "");
    const socket = io(backendOrigin, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔗 Client connected:", socket.id);
      socket.emit("join-room", { roomId: chatRoomId });
    });

    socket.on("receive-message", (msg) => { // msg = { sender, text, createdAt }
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatRoomId]);

  // 4️⃣ Send message
  const handleSend = () => {
    if (!socketRef.current || !socketRef.current.connected) return;
    if (!chatRoomId || input.trim() === "") return;

    console.log("sending by: ", clientId);

    const msg = {
      roomId: chatRoomId,
      sender: clientId,    
      text: input,
    };

    console.log("client sending message:", msg);

    socketRef.current.emit("send-message", msg);        

    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Gig: {gigTitle}</h2>

      {/* MESSAGE BOX */}
      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx}>
            <b>{String(msg.sender) == String(clientId) ? "You" : "Freelancer"}:</b> {msg.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "70%", padding: "5px" }}
      />
      <button onClick={handleSend} style={{ marginLeft: "10px" }}>
        Send
      </button>
    </div>
  );
}

export default ClientChat;
