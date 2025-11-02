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
import PostTrackerWrapper from "./PostCard/PostTrackerWrapper";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { getAITrendingPosts } = useAIRecommendations();
  const { getTrendingPosts } = useTopics();

  const filters = [
    { id: "trending", label: "Trending", icon: FaFire },
    { id: "latest", label: "Latest", icon: FaClock },
    { id: "top", label: "Top", icon: FaStar },
  ];

  const categories = [
    { id: "all", label: "All", count: 1250 },
    { id: "ai", label: "AI", count: 234 },
    { id: "sustainability", label: "Sustainability", count: 156 },
    { id: "innovation", label: "Innovation", count: 189 },
    { id: "technology", label: "Technology", count: 445 },
    { id: "future", label: "Future", count: 123 },
  ];

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

  console.log("Trending Posts:", trendingPosts);
  const handleBookmark = (postId) => {
    if (!isAuthenticated) {
      alert("Please log in first to bookmark a post.");
      navigate("/login");
      return;
    }
    console.log("Bookmarked post:", postId);
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
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

          <div className="flex gap-2 mb-6">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
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
                        onBookmark={() => handleBookmark(post.id)}
                        onClick={() => handlePostClick(post.id)}
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
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaFire className="text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Hot Topics
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  "AI",
                  "Sustainability",
                  "Innovation",
                  "Technology",
                  "Future",
                ].map((tag, i) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => !isAuthenticated && navigate("/login")}
                  >
                    <div className="flex items-center gap-2">
                      <FaHashtag className="text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Popular Thinkers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaUsers className="text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Popular Thinkers
                </h3>
              </div>
              <div className="space-y-3">
                {["Sarah Chen", "Marcus Rodriguez", "Emma Thompson"].map(
                  (thinker, i) => (
                    <div
                      key={thinker}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => !isAuthenticated && navigate("/login")}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                        {thinker
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {thinker}
                        </h4>
                      </div>
                    </div>
                  )
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
