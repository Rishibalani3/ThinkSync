import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useAdmin from "../../hooks/useAdmin";
import { FaCheck, FaTrash, FaFilter } from "react-icons/fa";
import { timeAgo } from "../../utils/FormatTime";
import { showToast } from "../../utils/toast";

const FlaggedContent = () => {
  const { getFlaggedContent, unflagContent, deleteFlaggedContent } = useAdmin();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, post, comment
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchFlaggedContent();
  }, [filter]);

  const fetchFlaggedContent = async () => {
    setLoading(true);
    try {
      const data = await getFlaggedContent({ type: filter === "all" ? "" : filter, page: 1, limit: 50 });
      setContent(data.content || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error("Failed to fetch flagged content", error);
      showToast.error("Failed to fetch flagged content");
    } finally {
      setLoading(false);
    }
  };

  const handleUnflag = async (contentId, contentType) => {
    if (!confirm(`Are you sure you want to unflag this ${contentType}?`)) return;
    try {
      await unflagContent(contentId, contentType);
      showToast.success(`${contentType} unflagged successfully`);
      fetchFlaggedContent();
    } catch (error) {
      showToast.error("Failed to unflag content");
    }
  };

  const handleDelete = async (contentId, contentType) => {
    if (!confirm(`Are you sure you want to delete this flagged ${contentType}? This action cannot be undone.`)) return;
    try {
      await deleteFlaggedContent(contentId, contentType);
      showToast.success(`${contentType} deleted successfully`);
      fetchFlaggedContent();
    } catch (error) {
      showToast.error("Failed to delete content");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredContent = filter === "all" 
    ? content 
    : content.filter((item) => item.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Flagged Content</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review and manage flagged posts and comments</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <FaFilter className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Content</option>
            <option value="post">Posts Only</option>
            <option value="comment">Comments Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.totalPosts || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Flagged Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.totalComments || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Flagged Comments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Flagged</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredContent.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No flagged content found</p>
          </div>
        ) : (
          filteredContent.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      item.type === "post"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        : "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                    }`}>
                      {item.type === "post" ? "Post" : "Comment"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.timestamp}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={item.author?.avatar || `https://placehold.co/32x32/667eea/ffffff?text=${item.author?.username?.[0] || "U"}`}
                        alt={item.author?.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.author?.displayName || item.author?.username}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        @{item.author?.username}
                      </span>
                    </div>
                    {item.post && (
                      <div className="ml-10 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">On post by:</span> {item.post.author?.displayName || item.post.author?.username}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {item.content}
                    {item.content.length >= 200 && "..."}
                  </p>
                  {item.type === "post" && (
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>❤️ {item.likesCount || 0} likes</span>
                      <span>💬 {item.commentsCount || 0} comments</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUnflag(item.id, item.type)}
                    className="px-4 py-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2"
                  >
                    <FaCheck /> Unflag
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.type)}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default FlaggedContent;

