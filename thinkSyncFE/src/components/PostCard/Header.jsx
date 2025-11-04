import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEllipsisH } from "react-icons/fa";
import ReportPost from "./ReportPost";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/axios";
import { showToast } from "../../utils/toast";

const Header = ({
  post,
  showOptions,
  setShowOptions,
  getTypeColor,
  optionsRef,
  onDelete,
}) => {
  const { user } = useAuth();
  const isOwnPost = user?.id === post.author?.id || user?.id === post.authorId;
  const [showReportModal, setShowReportModal] = useState(false);

  const handleCopyLink = () => {
    const postLink = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postLink).then(() => {
      showToast.success("Post link copied to clipboard!");
      setShowOptions(false);
    });
  };

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
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <Link
          to={`/profile/${post.author.username}`}
          className="flex items-center gap-1 hover:underline min-w-0"
        >
          <span className="font-bold text-gray-900 dark:text-gray-100 text-[15px] truncate">
            {post.author.displayName}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-[15px] truncate">
            @{post.author.username}
          </span>
        </Link>

        <span className="text-gray-500 dark:text-gray-400 text-[15px] mx-1">
          ·
        </span>

        <Link
          to={`/post/${post.id}`}
          className="text-gray-500 dark:text-gray-400 hover:underline text-[15px] whitespace-nowrap"
        >
          {post.timestamp}
        </Link>

        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${getTypeColor(
            post.type
          )}`}
        >
          {post.type}
        </span>
      </div>

      {/* Options */}
      <div className="relative ml-2" ref={optionsRef}>
        <motion.button
          whileHover={{
            scale: 1.1,
            backgroundColor: "rgba(29, 161, 242, 0.1)",
          }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-all duration-200 group"
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
              {isOwnPost && (
                <motion.button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete post
                </motion.button>
              )}
              {!isOwnPost && (
                <motion.button
                  onClick={() => {
                    setShowReportModal(true);
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Report post
                </motion.button>
              )}
              <motion.button
                onClick={handleCopyLink}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Copy link
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showReportModal && (
        <ReportPost
          postId={post.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default Header;
