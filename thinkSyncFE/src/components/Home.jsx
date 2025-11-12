import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import PostCreator from "./PostCreator";
import PostCard from "./PostCard/PostCard";
import { useAuth } from "../contexts/AuthContext";
import useLike from "../hooks/useLike";
import useBookmark from "../hooks/useBookmark";
import { staggerContainer, pageVariants } from "../utils/animations";
import PostTrackerWrapper from "./PostCard/PostTrackerWrapper";
import io from "socket.io-client";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toggleLike } = useLike();
  const { toggleBookmark } = useBookmark();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Reduced to 10 posts per page for better performance
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch posts from API
  const fetchPosts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/?page=${pageNum}&limit=${limit}`);
      const newPosts = res.data.data?.feed || [];

      setPosts((prevPosts) => {
        const updatedPosts =
          pageNum === 1 ? newPosts : [...prevPosts, ...newPosts];
        setHasMore(newPosts.length === limit);
        return updatedPosts;
      });

      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    // Initialize socket
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket"], // ✅ force websocket transport
      path: "/socket.io",
    });

    // ✅ Wait for connection before listening or emitting
    socket.on("connect", () => {
      console.log("✅ Socket connected (Home):", socket.id);
    });

    // ✅ Listen for new posts
    socket.on("newPost", (newPost) => {
      consolelog("📩 newPost event received:", newPost);
      const transformedPost = {
        ...newPost,
        author: newPost.author || {
          displayName: newPost.author?.displayName || "User",
          username: newPost.author?.username || "@user",
          avatar: newPost.author?.details?.avatar,
        },
        isLiked: false,
        isBookmarked: false,
        likesCount: 0,
        commentsCount: 0,
      };

      setPosts((prev) => {
        if (prev.some((p) => p.id === transformedPost.id)) return prev;
        return [transformedPost, ...prev];
      });
    });

    // ✅ Listen for postFlagged
    socket.on("postFlagged", ({ postId }) => {
      console.log("🚩 postFlagged:", postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected (Home):", reason);
    });

    // cleanup
    return () => socket.disconnect();
  }, []);

  // Handle liking a post
  const handleLike = async (postId) => {
    // Optimistic update
    const prevPost = posts.find((p) => p.id === postId);
    const prevLiked = prevPost?.isLiked || false;
    const prevLikesCount = prevPost?.likesCount || 0;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likesCount: (post.likesCount || 0) + (post.isLiked ? -1 : 1),
              isLiked: !post.isLiked,
            }
          : post
      )
    );

    const result = await toggleLike(postId);
    if (result?.error) {
      // Rollback if error
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: prevLikesCount,
                isLiked: prevLiked,
              }
            : post
        )
      );
    } else if (result?.data) {
      // Update with server response if available
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: result.data?.likesCount ?? post.likesCount,
                isLiked: result.action === "like",
              }
            : post
        )
      );
    }
  };

  // Handle bookmarking a post
  const handleBookmark = async (postId) => {
    // Optimistic update
    const prevPost = posts.find((p) => p.id === postId);
    const prevBookmarked = prevPost?.isBookmarked || false;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );

    const result = await toggleBookmark(postId);
    if (result?.error) {
      // Rollback if error
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, isBookmarked: prevBookmarked } : post
        )
      );
    }
  };

  // Handle creating a new post - refresh feed after creation
  const handleNewPost = () => {
    // Refresh the feed to get the newly created post
    fetchPosts(1);
  };

  // Handle post deletion
  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  // Load more posts
  const handleLoadMore = () => {
    if (!loading && hasMore) fetchPosts(page + 1);
  };

  const memoizedPosts = useMemo(() => posts, [posts]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      style={{ willChange: "transform, opacity" }}
    >
      <PostCreator onNewPost={handleNewPost} />

      <motion.div
        className="space-y-4 mt-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {memoizedPosts.map((post) => (
          <PostTrackerWrapper
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
            onBookmark={() => handleBookmark(post.id)}
            onClick={() => !isAuthenticated && navigate("/login")}
            userId={user?.id}
            extraClass={{ onDelete: handlePostDelete }}
          />
        ))}
      </motion.div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default Home;
