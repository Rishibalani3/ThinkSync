import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFire,
  FaClock,
  FaStar,
  FaUsers,
  FaHashtag,
} from "react-icons/fa";
import { BiTrendingUp } from "react-icons/bi";
import PostCard from "./PostCard/PostCard";
import { useAuth } from "../contexts/AuthContext";
import useAIRecommendations from "../hooks/useAIRecommendations";
import useTopics from "../hooks/useTopics";
import useLike from "../hooks/useLike";
import useBookmark from "../hooks/useBookmark";
import PostTrackerWrapper from "./PostCard/PostTrackerWrapper";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { getAITrendingPosts } = useAIRecommendations();
  const { getTrendingPosts } = useTopics();
  const { toggleLike } = useLike();
  const { toggleBookmark } = useBookmark();

  const filters = [
    { id: "trending", label: "Trending", icon: FaFire },
    { id: "latest", label: "Latest", icon: FaClock },
    { id: "top", label: "Top", icon: FaStar },
  ];

  const [trendingTopics, setTrendingTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const { getTrendingTopics } = useTopics();

  // Fetch trending topics for categories
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topics = await getTrendingTopics();
        const topicCategories = topics.map((topic, idx) => ({
          id: topic.name?.toLowerCase() || `topic-${idx}`,
          label: topic.name || "Topic",
          count: topic._count?.posts || 0,
        }));
        setTrendingTopics(topics);
        setCategories([
          { id: "all", label: "All", count: topics.reduce((sum, t) => sum + (t._count?.posts || 0), 0) },
          ...topicCategories.slice(0, 5),
        ]);
      } catch (err) {
        console.error("Failed to fetch trending topics:", err);
      }
    };
    fetchTopics();
  }, [getTrendingTopics]);

  // Fetch trending posts when filter is set to trending
  useEffect(() => {
    const fetchPosts = async () => {
      if (activeFilter !== "trending") {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let posts = await getAITrendingPosts(10);

        if (!posts || posts.length === 0) {
          posts = await getTrendingPosts();
        }

        setTrendingPosts(posts);
      } catch (error) {
        console.error("Error fetching trending posts:", error);
        setTrendingPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeFilter, getAITrendingPosts, getTrendingPosts]);

  const handleBookmark = async (postId) => {
    if (!isAuthenticated) {
      alert("Please log in first to bookmark a post.");
      navigate("/login");
      return;
    }
    const prevPost = trendingPosts.find((p) => p.id === postId);
    const prevBookmarked = prevPost?.isBookmarked || false;
    
    // Optimistic update
    setTrendingPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
    
    const result = await toggleBookmark(postId);
    if (result?.error) {
      // Rollback on error
      setTrendingPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, isBookmarked: prevBookmarked } : post
        )
      );
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      alert("Please log in first to like a post.");
      navigate("/login");
      return;
    }
    const prevPost = trendingPosts.find((p) => p.id === postId);
    const prevLiked = prevPost?.isLiked || false;
    const prevLikesCount = prevPost?.likesCount || 0;
    
    // Optimistic update
    setTrendingPosts((prev) =>
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
      // Rollback on error
      setTrendingPosts((prev) =>
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
      // Update with server response
      setTrendingPosts((prev) =>
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

  const handlePostClick = (postId) => {
    if (!isAuthenticated) {
      alert("Please log in first to view post details.");
      navigate("/login");
      return;
    }
    navigate(`/post/${postId}`);
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 space-y-6">
          <div className="relative mb-6">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for ideas, questions, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-3 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === filter.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Icon /> {filter.label}
                </motion.button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {category.label}
                <span className="ml-2 text-xs opacity-75">
                  {category.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Trending Posts */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <BiTrendingUp className="text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Trending Now
                </h2>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading trending posts...
                  </div>
                ) : trendingPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No trending posts available
                  </div>
                ) : (
                  trendingPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <PostTrackerWrapper
                        post={post}
                        onLike={() => handleLike(post.id)}
                        onBookmark={() => handleBookmark(post.id)}
                        onClick={() => handlePostClick(post.id)}
                        userId={user?.id}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Secondary info (now stacked under trending) */}
          <div className="space-y-6 col-span-1">
            {/* Hot Topics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaFire className="text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Hot Topics
                </h3>
              </div>
              <div className="space-y-3">
                {trendingTopics.length > 0 ? (
                  trendingTopics.slice(0, 5).map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/topic/${topic.name}`)}
                    >
                      <div className="flex items-center gap-2">
                        <FaHashtag className="text-blue-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {topic.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {topic._count?.posts || 0} posts
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No trending topics available
                  </p>
                )}
              </div>
            </motion.div>

            {/* Popular Thinkers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaUsers className="text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Popular Thinkers
                </h3>
              </div>
              <div className="space-y-3">
                {isAuthenticated ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    User recommendations coming soon
                  </p>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    <button
                      onClick={() => navigate("/login")}
                      className="text-blue-500 hover:underline"
                    >
                      Log in
                    </button>{" "}
                    to see recommended users
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Explore;
