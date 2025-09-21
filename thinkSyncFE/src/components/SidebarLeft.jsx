import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaBookmark, FaHistory, FaStar } from "react-icons/fa";

const SidebarLeft = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    { label: "Bookmarks", icon: FaBookmark, count: 12 },
    { label: "Recent", icon: FaHistory, count: 8 },
    { label: "Favorites", icon: FaStar, count: 5 },
  ];

  const trendingTopics = [
    { tag: "AI", count: 156 },
    { tag: "Sustainability", count: 89 },
    { tag: "Innovation", count: 234 },
    { tag: "Technology", count: 445 },
    { tag: "Future", count: 123 },
  ];

  const handleGuestAction = () => {
    if (!isAuthenticated) {
      alert("Please log in to access this feature.");
      navigate("/login");
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGuestAction}
                className="flex items-center justify-between w-full px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="text-lg" />
                  {action.label}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {action.count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Trending Topics
        </h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.tag}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
              className="flex items-center justify-between cursor-pointer"
              onClick={handleGuestAction}
            >
              <span className="text-blue-600 dark:text-blue-400 hover:underline">
                #{topic.tag}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {topic.count}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SidebarLeft;
