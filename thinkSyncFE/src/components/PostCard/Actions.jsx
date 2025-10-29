import { FaComment, FaHeart, FaBookmark, FaShare } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { buttonVariants } from "../../utils/animations";
import ShareModal from "./ShareModel";

const Actions = ({ post, onLike, onBookmark }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  return (
    <div className="flex items-center justify-between max-w-md mt-3 -ml-2">
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={(e) => {
          e.stopPropagation();
          if (typeof onLike === "function") onLike();
        }}
        className={`flex items-center gap-2 transition-colors p-2 rounded-full group ${
          post.isLiked
            ? "text-red-500 dark:text-red-400"
            : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
        }`}
        style={{ willChange: "transform" }}
      >
        <FaHeart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
        <span className="text-sm font-medium">{post.likesCount || 0}</span>
      </motion.button>

      <Link to={`/post/${post.id}`}>
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="flex items-center gap-2 text-blue-500 dark:text-blue-400  transition-colors p-2 rounded-full group"
          style={{ willChange: "transform" }}
        >
          <FaComment className="w-4 h-4" />
          <span className="text-sm font-medium">
            {post.comments?.length || 0}
          </span>
        </motion.div>
      </Link>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={(e) => {
          e.stopPropagation();
          setIsShareOpen(true);
        }}
        className="flex items-center gap-2 text-green-500 dark:text-green-400  transition-colors p-2 rounded-full group"
        style={{ willChange: "transform" }}
      >
        <FaShare className="w-4 h-4" />
      </motion.button>
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={(e) => {
          e.stopPropagation();
          if (typeof onBookmark === "function") onBookmark();
        }}
        className={`transition-colors p-2 rounded-full ${
          post.isBookmarked
            ? "text-blue-500 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
        }`}
        style={{ willChange: "transform" }}
      >
        <FaBookmark
          className={`w-4 h-4 ${post.isBookmarked ? "fill-current" : ""}`}
        />
      </motion.button>
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        post={post}
      />
    </div>
  );
};

export default Actions;
