import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import api from "../../utils/axios";
import { useAuth } from "../../contexts/AuthContext";
import { IoArrowBack, IoSend } from "react-icons/io5";

const socket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true });

export default function ChatModal({ user, goBack, onMarkRead }) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const roomId = [user.id, currentUser.id].sort().join("_");

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join room & listen for messages
  useEffect(() => {
    if (!currentUser?.id || !user?.id) return;

    socket.emit("joinRoom", roomId);

    const handleReceiveMessage = (message) => {
      setMessages((prev) =>
        prev.some((m) => m.id === message.id) ? prev : [...prev, message]
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.emit("leaveRoom", roomId);
    };
  }, [roomId, currentUser?.id, user?.id]);

  // Fetch messages & mark as read (runs only once per user)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/messages/${user.id}`, {
          withCredentials: true,
        });
        setMessages(res.data);

        // Optimistically mark messages as read
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === user.id ? { ...msg, read: true } : msg
          )
        );

        // Mark unread messages in backend
        const resMark = await api.post(
          `/messages/${user.id}/mark-read`,
          {},
          { withCredentials: true }
        );

        onMarkRead(user.id);
      } catch (err) {
        console.error(" Failed to fetch messages:", err);
      }
    };
    fetchMessages();
  }, [user?.id]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const res = await api.post(
        "/messages/send",
        { receiverId: user.id, content: input },
        { withCredentials: true }
      );

      // socket emits message to room (backend sends back to everyone)
      socket.emit("sendMessage", { roomId, message: res.data });
      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 z-[9999]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <IoArrowBack size={20} />
          </button>
          <h4 className="font-bold text-lg">{user.username}</h4>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  isMine
                    ? "bg-blue-500 dark:bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none"
                }`}
              >
                <p className="text-sm font-medium break-words">{msg.content}</p>
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-2xl">
        <textarea
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          className="flex-1 px-4 py-2 rounded-full text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="p-2.5 rounded-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50 transition transform hover:scale-110"
        >
          <IoSend size={18} />
        </button>
      </div>
    </div>
  );
}
