import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FaEllipsisH, FaTrash, FaChartLine } from "react-icons/fa";
import MediaGrid from "../PostCard/MediaGrid";
import Actions from "../PostCard/Actions";
import PostStatisticsModal from "../PostStatisticsModal";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/axios";
import { showToast } from "../../utils/toast";

const PostCard = ({ post, onLike, onBookmark, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const optionsRef = useRef(null);
  const { user } = useAuth();
  const isOwnPost = user?.id === post.authorId || user?.id === post.author?.id;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      setShowOptions(false);
      return;
    }

    try {
      await api.post(`/posts/delete/${post.id}`);
      showToast.success("Post deleted successfully");
      setShowOptions(false);
      if (typeof onDelete === "function") {
        onDelete(post.id);
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      showToast.error("Failed to delete post. Please try again.");
      setShowOptions(false);
    }
  };

  const shouldTruncate = post.content.length > 280;
  const displayContent =
    shouldTruncate && !isExpanded
      ? post.content.slice(0, 280) + "..."
      : post.content;

  return (
    <motion.article
      whileHover={{ scale: 1.01 }}
      className="group bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md  transition-all duration-500 cursor-pointer overflow-hidden"
    >
      <div className="flex gap-3 p-4 sm:p-6 relative">
        <Link to={`/profile/${post.author.username}`}>
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={post.author?.details?.avatar}
            alt={`${post.author.name}'s avatar`}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-white dark:border-gray-800 shadow-sm"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
                {post.author.displayName}
              </h4>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {post.author.username} • {post.createdAt.slice(0, 10)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`px-2 py-1 text-xs sm:text-sm rounded-full font-medium flex items-center gap-1 ${
                  post.type === "idea"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                }`}
              >
                <span>
                  {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </span>
              </div>
              {isOwnPost && (
                <div className="relative" ref={optionsRef}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptions(!showOptions);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-all"
                  >
                    <FaEllipsisH className="w-4 h-4" />
                  </motion.button>
                  <AnimatePresence>
                    {showOptions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-20 min-w-[180px]"
                      >
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStats(true);
                            setShowOptions(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                        >
                          <FaChartLine />
                          View Statistics
                        </motion.button>
                        <motion.button
                          onClick={handleDelete}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                        >
                          <FaTrash />
                          Delete post
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base leading-relaxed break-words">
            {displayContent}
            {shouldTruncate && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-blue-500 dark:text-blue-400 hover:underline ml-1 font-medium"
              >
                {isExpanded ? "Show less" : "Show more"}
              </motion.button>
            )}
          </p>

          {/* Mentions & Topics */}
          <div className="flex flex-wrap gap-1 mb-2">
            {post.mentions?.map((m, idx) => (
              <Link
                key={idx}
                to={`/profile/${m.user.username}`}
                className="text-blue-500 dark:text-blue-400 hover:underline text-sm"
              >
                @{m.user.displayName}
              </Link>
            ))}
            {post.topics?.map((t) => (
              <Link
                key={t.id}
                to={`/topic/${t.topic.name}`}
                className="text-blue-500 dark:text-blue-400 hover:underline text-sm"
              >
                #{t.topic.name}
              </Link>
            ))}
          </div>

          <MediaGrid post={post} setActiveIndex={setActiveIndex} />

          {/* Actions */}
          <Actions post={post} onLike={onLike} onBookmark={onBookmark} />
        </div>
      </div>

      {/* Post Statistics Modal */}
      <PostStatisticsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        postId={post.id}
      />
    </motion.article>
  );
};

export default PostCard;
