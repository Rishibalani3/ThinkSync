import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaBookmark, FaHistory, FaStar } from "react-icons/fa";
import useTopics from "../hooks/useTopics";
import useAIRecommendations from "../hooks/useAIRecommendations";

const SidebarLeft = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { getTrendingTopics } = useTopics();
  const { getAITrendingTopics } = useAIRecommendations();
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const quickActions = [
    {
      label: "Bookmarks",
      icon: FaBookmark,

      redirection: "/bookmarks",
    },
    { label: "Recent", icon: FaHistory },
  ];

  // Fetch trending topics on component mount
  useEffect(() => {
    const fetchTrendingTopics = async () => {
      setLoading(true);
      try {
        // Try AI-powered trending topics first, fallback to regular
        let topics = await getAITrendingTopics(5); // Limit to top 5

        // If AI returns empty, use regular trending
        if (!topics || topics.length === 0) {
          topics = await getTrendingTopics();
        }

        // Transform topics to match component format
        const transformedTopics = topics.map((topic) => ({
          id: topic.id,
          tag: topic.name,
          count: topic.metrics?.posts || topic.score || 0,
        }));

        setTrendingTopics(transformedTopics.slice(0, 5)); // Top 5 only
      } catch (error) {
        console.error("Error fetching trending topics:", error);
        setTrendingTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTopics();
  }, [getAITrendingTopics, getTrendingTopics]);

  const handleTopicClick = (selectedTopic) => {
    if (!isAuthenticated) {
      alert("Please log in to access this feature.");
      navigate("/login");
    } else {
      navigate(`/topic/${selectedTopic}`);
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
                onClick={() => navigate(action.redirection)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="text-lg" />
                  {action.label}
                </div>
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
          {loading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Loading...
            </div>
          ) : trendingTopics.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No trending topics
            </div>
          ) : (
            trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.id || topic.tag}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                onClick={() => handleTopicClick(topic.tag)}
              >
                <span className="text-blue-600 dark:text-blue-400 hover:underline">
                  #{topic.tag}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(topic.count)}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SidebarLeft;
