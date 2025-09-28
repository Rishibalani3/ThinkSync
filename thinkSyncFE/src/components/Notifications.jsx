import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaBell,
  FaHeart,
  FaComment,
  FaUserPlus,
  FaUserCheck,
  FaComment as FaThought,
  FaCheck,
  FaTrash,
  FaEnvelope,
  FaStar,
} from "react-icons/fa";

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "like",
      user: {
        name: "Sarah Chen",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=SC",
        username: "@sarahchen",
      },
      content: "liked your idea about AI and sustainable energy",
      timestamp: "2 minutes ago",
      isRead: false,
      postId: 123,
    },
    {
      id: 2,
      type: "comment",
      user: {
        name: "Marcus Rodriguez",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=MR",
        username: "@marcusrod",
      },
      content: "commented on your question about productivity",
      timestamp: "15 minutes ago",
      isRead: false,
      postId: 124,
    },
    {
      id: 3,
      type: "connection",
      user: {
        name: "Emma Thompson",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=ET",
        username: "@emmathompson",
      },
      content: "wants to connect with you",
      timestamp: "1 hour ago",
      isRead: true,
      postId: null,
    },
    {
      id: 4,
      type: "mention",
      user: {
        name: "David Kim",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=DK",
        username: "@davidkim",
      },
      content: "mentioned you in a thought about innovation",
      timestamp: "2 hours ago",
      isRead: true,
      postId: 125,
    },
    {
      id: 5,
      type: "follow",
      user: {
        name: "Lisa Park",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=LP",
        username: "@lisapark",
      },
      content: "started following you",
      timestamp: "3 hours ago",
      isRead: true,
      postId: null,
    },
  ]);

  const filters = [
    { id: "all", label: "All", count: notifications.length },
    {
      id: "unread",
      label: "Unread",
      count: notifications.filter((n) => !n.isRead).length,
    },
    {
      id: "mentions",
      label: "Mentions",
      count: notifications.filter((n) => n.type === "mention").length,
    },
    {
      id: "connections",
      label: "Connections",
      count: notifications.filter(
        (n) => n.type === "connection" || n.type === "follow"
      ).length,
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <FaHeart className="text-red-500" />;
      case "comment":
        return <FaComment className="text-blue-500" />;
      case "connection":
        return <FaUserPlus className="text-green-500" />;
      case "mention":
        return <FaEnvelope className="text-purple-500" />;
      case "follow":
        return <FaUserCheck className="text-blue-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "like":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "comment":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "connection":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "mention":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      case "follow":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== notificationId)
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "unread") return !notification.isRead;
    if (activeFilter === "mentions") return notification.type === "mention";
    if (activeFilter === "connections")
      return (
        notification.type === "connection" || notification.type === "follow"
      );
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-4xl mx-auto p-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with your latest activity
              </p>
            </div>
            <div className="flex gap-2">
              {filteredNotifications.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FaCheck />
                  Mark All Read
                </motion.button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex gap-2">
              {filters.map((filter) => (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === filter.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                    {filter.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FaBell className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  You're all caught up! Check back later for new updates.
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`bg-white dark:bg-gray-800 rounded-lg border p-4 transition-all duration-200 ${
                    notification.isRead
                      ? "border-gray-200 dark:border-gray-700"
                      : `${getNotificationColor(
                          notification.type
                        )} border-l-4 border-l-blue-500`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={notification.user.avatar}
                            alt={notification.user.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {notification.user.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {notification.user.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {notification.timestamp}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {notification.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                          title="Mark as read"
                        >
                          <FaCheck />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="Delete notification"
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
