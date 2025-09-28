import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MediaGrid from "../PostCard/MediaGrid";
import Actions from "../PostCard/Actions";

const PostCard = ({ post, onLike, onBookmark }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    </motion.article>
  );
};

export default PostCard;
