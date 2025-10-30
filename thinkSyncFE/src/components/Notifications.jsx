import { useState } from "react";
import { motion } from "framer-motion";
import useNotifications from '../hooks/useNotifications';
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaHeart,
  FaComment,
  FaUserCheck,
  FaCheck,
  FaTrash,
} from "react-icons/fa";
import { timeAgo } from "../utils/FormatTime";

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const getNotifType = (notif) => {
    if (notif.content?.includes("like")) return "like";
    if (notif.content?.includes("comment")) return "comment";
    if (notif.content?.includes("follow")) return "follow";
    return "other";
  };
  const getNotificationIcon = (notif) => {
    const type = getNotifType(notif);
    switch (type) {
      case "like": return <FaHeart className="text-red-500" />;
      case "comment": return <FaComment className="text-blue-500" />;
      case "follow": return <FaUserCheck className="text-blue-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };
  const getNotificationColor = (notif) => {
    const type = getNotifType(notif);
    switch (type) {
      case "like": return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "comment": return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "follow": return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      default: return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const handleNotificationClick = (notif) => {
    const type = getNotifType(notif);
    if ((type === "comment" || type === "like") && notif.post?.id) {
      navigate(`/post/${notif.post.id}`);
    } else if (type === "follow" && notif.sender?.username) {
      navigate(`/profile/${notif.sender.username}`);
    }
  };

  const handleSenderClick = (e, notif) => {
    e.stopPropagation();
    if (notif.sender?.username) {
      navigate(`/profile/${notif.sender.username}`);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "unread") return !notification.seen;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex gap-2">
            <div className="flex gap-2">
            {[{ id: "all", label: "All", count: notifications.length },
              { id: "unread", label: "Unread", count: notifications.filter((n) => !n.seen).length },
            ].map((filter) => (
              <motion.button key={filter.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter(filter.id)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeFilter === filter.id ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
                {filter.label}
                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">{filter.count}</span>
              </motion.button>
            ))}
            </div>
            <div className="flex gap-2 fixed right-4">
            {filteredNotifications.length > 0 && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={markAllAsRead} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                <FaCheck />Mark All Read
              </motion.button>
            )}
          </div>
          </div>
        </div>
        <div className="space-y-4">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <FaBell className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Loading notifications...</h3>
            </motion.div>
          ) : filteredNotifications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <FaBell className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No notifications</h3>
              <p className="text-gray-500 dark:text-gray-400">You're all caught up! Check back later for new updates.</p>
            </motion.div>
          ) : (
            filteredNotifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`bg-white dark:bg-gray-800 rounded-lg border p-4 transition-all duration-200 cursor-pointer ${notif.seen ? "border-gray-200 dark:border-gray-700" : `${getNotificationColor(notif)} border-l-4 border-l-blue-500`}`}
                onClick={(e) => {
                  // prevent click if it was an action button
                  if (e.target.closest('.notif-action-btn')) return;
                  handleNotificationClick(notif);
                }}
                role="button"
                tabIndex={0}
                style={{ outline: "none" }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {getNotificationIcon(notif)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Avatar clickable for sender profile */}
                        <img
                          src={notif.sender?.details?.avatar || "https://placehold.co/40x40/667eea/fff?text=U"}
                          alt={notif.sender?.displayName || "User"}
                          className="w-6 h-6 rounded-full cursor-pointer hover:underline"
                          onClick={(e) => handleSenderClick(e, notif)}
                        />
                        <span
                          className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                          onClick={(e) => handleSenderClick(e, notif)}
                        >
                          {notif.sender?.displayName}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                         onClick={(e) => handleSenderClick(e, notif)}
                        >@{notif.sender?.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{timeAgo(notif.createdAt)}</span>
                        {!notif.seen && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{notif.content}</p>
                  </div>  
                  <div className="flex items-center gap-2">
                    {!notif.seen && (
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-gray-400 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors notif-action-btn" title="Mark as read" type="button" tabIndex={-1} onClick={async (e) => { e.stopPropagation(); await markAsRead(notif.id); }}><FaCheck /></motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors notif-action-btn" title="Delete notification" type="button" tabIndex={-1} onClick={async (e) => { e.stopPropagation(); await deleteNotification(notif.id); }}><FaTrash /></motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Notifications;
