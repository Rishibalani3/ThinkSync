import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaHeart, FaComment, FaShare, FaBookmark, FaEllipsisH, FaLightbulb, FaQuestion, FaComment as FaThought } from "react-icons/fa";

const ThoughtCard = ({ post, onLike, onBookmark, extraClass }) => {
  const [showOptions, setShowOptions] = useState(false);

  const getTypeColor = (type) => {
    switch (type) {
      case "idea": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
      case "question": return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
      case "thought": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      default: return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <motion.div whileHover={{ y: -2 }} className={`bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 ${extraClass || ""}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={post.author.details?.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{post.author.displayName}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">@{post.author.username}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(post.type)}`}>{post.type}</span>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="relative">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowOptions(!showOptions)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <FaEllipsisH />
          </motion.button>

          {showOptions && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-10 min-w-[150px]">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Report</button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Copy Link</button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {post.content}
        </p>

        {/* Mentions */}
        {post.mentions?.length > 0 && (
          <div className="mt-2 text-sm text-blue-500 dark:text-blue-400">
            {post.mentions.map(m => `@${m.user.displayName}`).join(", ")}
          </div>
        )}

        {/* Topics */}
        {post.topics?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {post.topics.map(t => (
              <span key={t.id} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                #{t.topic.name}
              </span>
            ))}
          </div>
        )}

        {/* Media */}
        {post.media?.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {post.media.map(m => (
              <div key={m.id}>
                {m.type === "image" && <img src={m.url} alt="media" className="rounded max-h-80 w-full object-cover" />}
                {m.type === "video" && <video src={m.url} controls className="rounded max-h-80 w-full" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-6">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onLike(post.id)} className={`flex items-center gap-2 text-sm transition-colors ${post.isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"}`}>
            <FaHeart className={post.isLiked ? "fill-current" : ""} /> {post.likesCount || 0}
          </motion.button>

          <Link to={`/post/${post.id}`} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            <FaComment /> {post.comments?.length || 0}
          </Link>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors">
            <FaShare /> {post.shares || 0}
          </motion.button>
        </div>

        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onBookmark(post.id)} className={`p-2 rounded-full transition-colors ${post.isBookmarked ? "text-blue-500 bg-blue-50 dark:bg-blue-900/30" : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
          <FaBookmark className={post.isBookmarked ? "fill-current" : ""} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ThoughtCard;
