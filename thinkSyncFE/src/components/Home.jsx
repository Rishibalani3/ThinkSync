import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

import PostCreator from "./PostCreator";
import PostCard from "./PostCard/PostCard";
import { useAuth } from "../contexts/AuthContext";
import useLike from "../hooks/useLike";
import useBookmark from "../hooks/useBookmark";
const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toggleLike } = useLike();
  const { toggleBookmark } = useBookmark();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

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

  const handleLike = async (postId) => {
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
    }
  };

  const handleBookmark = async (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );

    await toggleBookmark(postId);
  };

  const handleNewPost = (newPost) => {
    if (!isAuthenticated) {
      alert("Please log in first to create a post.");
      navigate("/login");
      return;
    }
    const post = {
      id: Date.now(),
      author: {
        name: "John Doe",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=JD",
        username: "@johndoe",
      },
      content: newPost.content,
      type: newPost.type,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
    };
    setPosts([post, ...posts]);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  return (
    <div className="">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PostCreator onNewPost={handleNewPost} />

        <div className="space-y-4 mt-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
            >
              <PostCard
                post={post}
                onLike={() => handleLike(post.id)}
                onBookmark={() => handleBookmark(post.id)}
                onClick={() => !isAuthenticated && navigate("/login")}
              />
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
