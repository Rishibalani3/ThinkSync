import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaEye,
  FaHeart,
  FaComment,
  FaBookmark,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../utils/axios";

const PostStatisticsModal = ({ isOpen, onClose, postId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && postId) fetchStatistics();
  }, [isOpen, postId]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${postId}/statistics`);
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to fetch post statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FaChartLine className="text-blue-500" />
              Post Statistics
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <FaTimes className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Main Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Metric
                    icon={<FaEye />}
                    color="blue"
                    label="Views"
                    value={stats.views}
                  />
                  <Metric
                    icon={<FaHeart />}
                    color="red"
                    label="Likes"
                    value={stats.likes}
                  />
                  <Metric
                    icon={<FaComment />}
                    color="green"
                    label="Comments"
                    value={stats.comments}
                  />
                  <Metric
                    icon={<FaBookmark />}
                    color="purple"
                    label="Bookmarks"
                    value={stats.bookmarks}
                  />
                </div>

                {/* Engagement Score */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Engagement Score</p>
                      <p className="text-3xl font-bold">
                        {stats.engagementScore || 0}
                      </p>
                    </div>
                    <FaChartLine className="text-4xl opacity-80" />
                  </div>
                </div>

                {/* Recent Viewers */}
                {stats.recentViewers?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaUsers className="text-blue-500" />
                      Recent Viewers
                    </h3>
                    <div className="space-y-2">
                      {stats.recentViewers.map((viewer) => (
                        <div
                          key={viewer.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <img
                            src={
                              viewer.details?.avatar ||
                              `https://placehold.co/40x40/667eea/ffffff?text=${
                                viewer.displayName?.[0] || "U"
                              }`
                            }
                            alt={viewer.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {viewer.displayName || viewer.username}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{viewer.username}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Failed to load statistics
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // ✅ Use portal correctly
  return createPortal(modalContent, document.body);
};

// Small reusable component for metrics
const Metric = ({ icon, color, label, value }) => (
  <div
    className={`bg-${color}-50 dark:bg-${color}-900/20 rounded-lg p-4 text-center`}
  >
    <div className={`text-${color}-500 mx-auto mb-2 text-2xl`}>{icon}</div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">
      {value || 0}
    </p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);

export default PostStatisticsModal;
