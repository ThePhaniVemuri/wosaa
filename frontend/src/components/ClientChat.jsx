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
  // console.log("client ID from client chat:", clientId);

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
      auth: {
        token: localStorage.getItem("accessToken"),
      },
      transports: ["websocket"],
    });


    socketRef.current = socket;

    socket.on("connect", () => {
      // console.log("🔗 Client connected:", socket.id);
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

    // console.log("sending by: ", clientId);

    const msg = {
      roomId: chatRoomId,
      sender: clientId,    
      text: input,
    };

    // console.log("client sending message:", msg);

    socketRef.current.emit("send-message", msg);        

    setInput("");
  };

 return (
    <div className="p-6 bg-neutral-950 text-gray-100 font-serif min-h-screen flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-white">
        Gig: {gigTitle}
        </h2>

        {/* MESSAGE BOX */}
        <div
        className="w-full max-w-2xl border border-gray-700 rounded-xl p-4 h-80 overflow-y-auto mb-6 bg-neutral-900 shadow-lg"
        >
        {messages.map((msg, idx) => (
            <div
            key={idx}
            className={`mb-3 ${
                String(msg.sender) === String(clientId)
                ? "text-gray-300 text-right"
                : "text-gray-400 text-left"
            }`}
            >
            <b className="text-white">
                {String(msg.sender) === String(clientId) ? "You" : "Freelancer"}:
            </b>{" "}
            {msg.text}
            </div>
        ))}
        </div>

        {/* INPUT */}
        <div className="w-full max-w-2xl flex items-center">
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
            onClick={handleSend}
            className="ml-4 px-6 py-2 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition-all"
        >
            Send
        </button>
        </div>
    </div>
  );
}

export default ClientChat;
