import { FaComment, FaHeart, FaBookmark, FaShare } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Actions = ({ post, onLike, onBookmark }) => (
  <div className="flex items-center justify-between max-w-md mt-3 -ml-2">
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onLike(post.id);
      }}
      className={`flex items-center gap-2 transition-colors p-2 rounded-full group ${
        post.isLiked
          ? "text-red-500 dark:text-red-400"
          : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
      }`}
    >
      <FaHeart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
      <span className="text-sm font-medium">{post.likesCount || 0}</span>
    </motion.button>

    <Link to={`/post/${post.id}`}>
      <motion.div
        whileHover={{ scale: 1.05, backgroundColor: "rgba(29, 161, 242, 0.1)" }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-full group"
      >
        <FaComment className="w-4 h-4" />
        <span className="text-sm font-medium">
          {post.comments?.length || 0}
        </span>
      </motion.div>
    </Link>

    {/* Like */}

    {/* Share */}
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: "rgba(29, 161, 242, 0.1)" }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-full group"
    >
      <FaShare className="w-4 h-4" />
    </motion.button>

    {/* Bookmark */}
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: "rgba(29, 161, 242, 0.1)" }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onBookmark(post.id);
      }}
      className={`transition-colors p-2 rounded-full ${
        post.isBookmarked
          ? "text-blue-500 dark:text-blue-400"
          : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
      }`}
    >
      <FaBookmark
        className={`w-4 h-4 ${post.isBookmarked ? "fill-current" : ""}`}
      />
    </motion.button>
  </div>
);

export default Actions;
