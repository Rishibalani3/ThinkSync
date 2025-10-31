import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoChatbubbles, IoClose } from "react-icons/io5";
import ChatModal from "./ChatModel";
import api from "../../utils/axios";

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => setMounted(true), []);
  const fetchUsers = async () => {
    try {
      const recentRes = await api.get("/messages/recent");
      const recentUsers = recentRes.data.map((u) => ({
        ...u,
        unreadCount: u.lastMessage?.read === false ? 1 : 0,
      }));

      const followRes = await api.get("/follower/following", {
        withCredentials: true,
      });

      const followingUsers = followRes.data.data
        .filter((u) => !recentUsers.find((r) => r.id === u.id))
        .map((u) => ({ ...u, lastMessage: null, unreadCount: 0 }));

      setUsers([...recentUsers, ...followingUsers]);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Memoized mark read callback
  const handleMarkRead = useCallback((userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, unreadCount: 0 } : u))
    );
  }, []);

  if (!mounted) return null;
  const portalRoot = document.getElementById("floating-chat-root");
  if (!portalRoot) return null;

  return createPortal(
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-blue-600 hover:scale-110 active:scale-95 transition"
        >
          <IoChatbubbles size={24} />
        </button>
      )}

      {/* Chat list modal */}
      {isOpen && !selectedUser && (
        <div className="fixed bottom-24 right-6 w-96 max-h-[500px] rounded-2xl shadow-2xl flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 z-[9999]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-2xl">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <IoChatbubbles size={22} className="text-blue-500" />
              Messages
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Users list */}
          <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-900">
            {users.length > 0 ? (
              users.map((user, idx) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    idx === users.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      [
                        "bg-blue-500",
                        "bg-purple-500",
                        "bg-green-500",
                        "bg-pink-500",
                      ][idx % 4]
                    }`}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{user.displayName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.lastMessage?.content || "Start a new chat"}
                    </p>
                  </div>
                  {user.unreadCount > 0 && (
                    <div className="min-w-[20px] h-5 px-1 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.unreadCount}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No users available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat modal */}
      {selectedUser && (
        <ChatModal
          user={selectedUser}
          goBack={() => setSelectedUser(null)}
          onMarkRead={handleMarkRead}
        />
      )}
    </>,
    portalRoot
  );
}
