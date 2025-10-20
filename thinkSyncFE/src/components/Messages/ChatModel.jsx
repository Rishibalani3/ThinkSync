import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { IoArrowBack, IoSend } from "react-icons/io5";

const socket = io("http://localhost:3000", { withCredentials: true });

export default function ChatModal({ user, goBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const { user: currentUser } = useAuth();
  const roomId = [user.id, currentUser.id].sort().join("_");

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("joinRoom", roomId);
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => socket.off("receiveMessage");
  }, [roomId]);

  // Fetch chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/messages/${user.id}`,
          {
            withCredentials: true,
          }
        );
        console.log(`http://localhost:3000/messages/${user.id}`);
        console.log(res.data);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [user.id]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      senderId: currentUser.id,
      receiverId: user.id,
      content: input,
    };

    try {
      const res = await axios.post(
        "http://localhost:3000/messages/send",
        newMessage,
        { withCredentials: true }
      );

      socket.emit("sendMessage", { roomId, message: res.data });
      setMessages((prev) => [...prev, res.data]);
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-2 rounded-lg transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <IoArrowBack size={20} />
          </button>
          <div>
            <h4 className="font-bold text-lg">{user.username}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900">
        {messages.map((msg, idx) => {
          const isMine = msg.senderId === currentUser.id; // check per message
          return (
            <div
              key={idx}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  isMine
                    ? "bg-blue-500 dark:bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none"
                }`}
              >
                <p className="text-sm font-medium">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isMine
                      ? "text-blue-100"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-2xl">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 px-4 py-2 rounded-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="p-2.5 rounded-full transition transform hover:scale-110 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50"
        >
          <IoSend size={18} />
        </button>
      </div>
    </div>
  );
}
