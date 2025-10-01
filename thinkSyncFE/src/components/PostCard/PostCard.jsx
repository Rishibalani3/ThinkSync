import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import Header from "./Header";
import MediaGrid from "./MediaGrid";
import BoxModel from "./BoxModel";
import Actions from "./Actions";
import { formatTimeAgo, getTypeColor } from "./Utils.js";
import useLike from "../../hooks/useLike";

const PostCard = ({ post, onLike, onBookmark, extraClass }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const optionsRef = useRef(null);
  const { toggleLike } = useLike();
  const [localLiked, setLocalLiked] = useState(post.isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount || 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // sync local like state when post changes
  useEffect(() => {
    setLocalLiked(post.isLiked);
    setLocalLikesCount(post.likesCount || 0);
  }, [post.id, post.isLiked, post.likesCount]);

  //for keyboard navigation for preview images
  useEffect(() => {
    const handleKey = (e) => {
      if (activeIndex === null) return;
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight" && activeIndex < post.media.length - 1)
        setActiveIndex((i) => i + 1);
      if (e.key === "ArrowLeft" && activeIndex > 0)
        setActiveIndex((i) => i - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, post.media]);

  const shouldTruncate = post.content.length > 280;
  const displayContent =
    shouldTruncate && !isExpanded
      ? post.content.slice(0, 280) + "..."
      : post.content;

  const handleLikeClick = async () => {
    if (typeof onLike === "function") {
      onLike(post.id);
      return;
    }
    const prevLiked = localLiked;
    const delta = prevLiked ? -1 : 1;
    setLocalLiked(!prevLiked);
    setLocalLikesCount((c) => (c || 0) + delta);
    const result = await toggleLike(post.id);
    if (result?.error) {
      setLocalLiked(prevLiked);
      setLocalLikesCount((c) => (c || 0) - delta);
    }
  };

  const displayPost = {
    ...post,
    isLiked: localLiked,
    likesCount: localLikesCount,
  };

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
            <MediaGrid post={post} setActiveIndex={setActiveIndex} />
            <BoxModel
              post={post}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          </div>

          <Actions post={displayPost} onLike={handleLikeClick} onBookmark={onBookmark} />
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
