import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { API_BASE } from "../api/config";

function Chat() {
  const location = useLocation();
  const clientId = location.state?.clientId;
  const freelancerId = location.state?.freelancerId;
  const gigId = location.state?.gigId;
  const gigTitle = location.state?.gigTitle;

  const socketRef = useRef(null);

  const [chatRoomId, setChatRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // get or create chat room
  const getChatRoomId = async (clientId, freelancerId, gigId) => {
    const res = await fetch(`${API_BASE}/users/get-or-create-chat-room`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, freelancerId, gigId }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error("Failed to get or create chat room");
    }

    return data; 
  };

  // load chat on just first render
  useEffect(() => {
    async function loadChat() {
      try {
        const result = await getChatRoomId(clientId, freelancerId, gigId);
        // console.log("Chat Room Data:", result);

        // backend returns { success: true, chatRoom, messages }
        const roomId = result?.chatRoom?._id || result?.chatRoomId;
        // console.log("Chat Room ID:", roomId);
        if (!roomId) throw new Error("No chatRoom id returned from server");

        setChatRoomId(roomId);

        const loadedmessages = result.messages.map(msg => ({
            roomId: msg.roomId,
            sender: msg.senderId,
            text: msg.message,
        }));

        setMessages(loadedmessages || []);
        // console.log("Loaded messages:", loadedmessages);
        // console.log(messages)        
        
        // console.log("Loaded messages:", result.messages);
      } catch (err) {
        // console.error("Failed to get/create chat room:", err);
      }
    }

    if (clientId && freelancerId && gigId) loadChat();
  }, [clientId, freelancerId, gigId]);

  // create chatroom connection
  useEffect(() => {
    if (!chatRoomId) return;

    // derive backend origin from API_BASE (strip "/api/v1")
    const backendOrigin = API_BASE.replace(/\/api\/v1\/?$/i, "");
    // console.log("Connecting to chat server at:", backendOrigin);

    const socket = io(backendOrigin, {
      withCredentials: true,
      transports: ["websocket"],      
    });

    // console.log("Socket object:", socket);

    socketRef.current = socket;

    socket.on("connect", () => {
      // console.log("🔗 Connected to chat server with ID:", socket.id);
      // join once connected
      socket.emit("join-room", { roomId: chatRoomId });
    });

    socket.on("connect_error", (err) => {
      console.error("SOCKET CONNECT ERROR:", err);
    });

    socket.on("receive-message", (msg) => {
      // msg = { sender, text, createdAt } from client
      // console.log("Received message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive-message");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [chatRoomId]);

  // send message (guard socketRef and chatRoomId)
  const handleSend = () => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("Socket not connected");
      return;
    }
    if (!chatRoomId) {
      console.warn("No chat room id");
      return;
    }
    if (input.trim() === "") return;

    const msg = { roomId: chatRoomId, sender: freelancerId, text: input };
    socketRef.current.emit("send-message", msg);
    setInput("");
  };

  return (
  <div className="p-6 bg-neutral-950 text-gray-100 font-serif min-h-screen flex flex-col items-center">
    <h2 className="text-2xl font-bold mb-4 text-white">
      Gig : {gigTitle}
    </h2>

    {/* SHOW ALL MESSAGES */}
    <div
      className="w-full max-w-2xl border border-gray-700 rounded-xl p-4 h-80 overflow-y-auto mb-6 bg-neutral-900 shadow-lg"
    >
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`mb-3 ${
            msg.sender === freelancerId
              ? "text-gray-300 text-right"
              : "text-gray-400 text-left"
          }`}
        >
          <b className="text-white">
            {msg.sender === freelancerId ? "You" : "Client"}:
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

export default Chat;
