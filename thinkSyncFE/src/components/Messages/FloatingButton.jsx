import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoChatbubbles, IoClose } from "react-icons/io5";
import ChatModal from "./ChatModel";

export default function FloatingChatButton({ connections = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const portalRoot = document.getElementById("floating-chat-root");
  if (!portalRoot) return null;

  const content = (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center font-bold text-xl transition-all duration-300 transform hover:scale-110 active:scale-95 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white"
      >
        <IoChatbubbles size={24} />
      </button>

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
              className="p-2 rounded-lg transition bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Connections list */}
          <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-900">
            {Array.isArray(connections) && connections.length > 0 ? (
              connections.map((userObj, idx) => {
                const user = userObj.follower;
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      idx === connections.length - 1 ? "border-b-0" : ""
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
                      <p className="font-semibold text-sm">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Click to chat
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No connections yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat modal for selected user */}
      {isOpen && selectedUser && (
        <ChatModal user={selectedUser} goBack={() => setSelectedUser(null)} />
      )}
    </>
  );

  return createPortal(content, portalRoot);
}
