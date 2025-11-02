import { motion } from "framer-motion";
import PostCard from "./PostCard";
import { useRef } from "react";

import { cardVariants } from "../../utils/animations";
import useViewTracker from "../../hooks/useViewTracker";


const PostTrackerWrapper = ({ post, onLike, onBookmark, onClick, userId }) => {
  const postRef = useRef(null);
  useViewTracker(post.id, postRef, userId);

  return (
    <motion.div
      key={post.id}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      style={{ willChange: "transform, opacity" }}
      ref={postRef}
    >
      <PostCard
        post={post}
        onLike={onLike}
        onBookmark={onBookmark}
        onClick={onClick}
      />
    </motion.div>
  );
};

export default PostTrackerWrapper;
