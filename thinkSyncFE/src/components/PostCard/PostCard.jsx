import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import Header from "./Header";
import MediaGrid from "./MediaGrid";
import BoxModel from "./BoxModel";
import Actions from "./Actions";
import { formatTimeAgo, getTypeColor } from "./Utils.js";

const PostCard = ({ post, onLike, onBookmark, extraClass }) => {
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
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/70 transition-colors duration-200 cursor-pointer ${
        extraClass || ""
      }`}
    >
      <div className="flex gap-3 p-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Link to={`/profile/${post.author.username}`}>
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={post.author.details?.avatar}
              alt={`${post.author.displayName}'s avatar`}
              className="w-12 h-12 rounded-full hover:brightness-95 transition-all"
            />
          </Link>
        </div>

        <div className="flex-1 min-w-0">
          <Header
            post={post}
            showOptions={showOptions}
            setShowOptions={setShowOptions}
            getTypeColor={getTypeColor}
            formatTimeAgo={formatTimeAgo}
            optionsRef={optionsRef}
          />

          {/* Content */}
          <div className="mt-1">
            <div className="text-gray-900 dark:text-gray-100 leading-relaxed text-[15px] break-words">
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
            </div>

            {/* Mentions */}
            {post.mentions?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {post.mentions.map((m, idx) => (
                  <Link
                    key={idx}
                    to={`/profile/${m.user.username}`}
                    className="text-blue-500 dark:text-blue-400 hover:underline text-[15px]"
                  >
                    @{m.user.displayName}
                  </Link>
                ))}
              </div>
            )}

            {/* Topics */}
            {post.topics?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {post.topics.map((t) => (
                  <Link
                    key={t.id}
                    to={`/topic/${t.topic.name}`}
                    className="text-blue-500 dark:text-blue-400 hover:underline text-[15px]"
                  >
                    #{t.topic.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Media */}

            <BoxModel
              post={post}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
            <MediaGrid post={post} setActiveIndex={setActiveIndex} />
          </div>

          <Actions post={post} onLike={onLike} onBookmark={onBookmark} />
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
