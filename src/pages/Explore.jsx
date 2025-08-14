import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaFire,
  FaClock,
  FaStar,
  FaUsers,
  FaHashtag,
} from "react-icons/fa";
import { BiTrendingUp } from "react-icons/bi";
import ThoughtCard from "../components/ThoughtCard";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  const trendingPosts = [
    {
      id: 1,
      author: {
        name: "Alex Chen",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=AC",
        username: "@alexchen",
      },
      content:
        "The future of remote work isn't just about working from home—it's about creating a new paradigm of productivity that combines flexibility, technology, and human connection. What if we could design workspaces that adapt to our needs in real-time? 🏠💻",
      type: "idea",
      timestamp: "1 hour ago",
      likes: 156,
      comments: 23,
      shares: 12,
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: 2,
      author: {
        name: "Maria Garcia",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=MG",
        username: "@mariagarcia",
      },
      content:
        "How do we stay productive in an increasingly distracted world? Are traditional productivity methods still relevant, or do we need to completely rethink our approach to getting things done? 🤔",
      type: "question",
      timestamp: "3 hours ago",
      likes: 89,
      comments: 34,
      shares: 8,
      isLiked: true,
      isBookmarked: false,
    },
    {
      id: 3,
      author: {
        name: "David Kim",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=DK",
        username: "@davidkim",
      },
      content:
        'Random thought: The best ideas often come when you\'re not actively trying to think of them. Maybe we need more "thinking breaks" in our daily routines. The shower, the walk, the quiet moments—these are where creativity thrives. 💭',
      type: "thought",
      timestamp: "5 hours ago",
      likes: 234,
      comments: 15,
      shares: 45,
      isLiked: false,
      isBookmarked: true,
    },
  ];

  const handleLike = (postId) => {
    // Handle like functionality
    console.log("Liked post:", postId);
  };

  const handleBookmark = (postId) => {
    // Handle bookmark functionality
    console.log("Bookmarked post:", postId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-6xl mx-auto p-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Explore
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover new ideas, questions, and thoughts from the ThinkSync
              community
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            {/* Search Bar */}
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

            {/* Filter Tabs */}
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
                    <Icon />
                    {filter.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Category Pills */}
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

          {/* Trending Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BiTrendingUp className="text-orange-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Trending Now
                  </h2>
                </div>
                <div className="space-y-4">
                  {trendingPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <ThoughtCard
                        post={post}
                        onLike={handleLike}
                        onBookmark={handleBookmark}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
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
                    { tag: "AI", count: 156, trend: "up" },
                    { tag: "Sustainability", count: 89, trend: "up" },
                    { tag: "Innovation", count: 234, trend: "up" },
                    { tag: "Technology", count: 445, trend: "down" },
                    { tag: "Future", count: 123, trend: "up" },
                  ].map((topic, index) => (
                    <motion.div
                      key={topic.tag}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FaHashtag className="text-blue-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {topic.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {topic.count}
                        </span>
                        <BiTrendingUp
                          className={`text-xs ${
                            topic.trend === "up"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        />
                      </div>
                    </motion.div>
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
                  {[
                    {
                      name: "Sarah Chen",
                      avatar: "SC",
                      followers: 1234,
                      bio: "AI Researcher",
                    },
                    {
                      name: "Marcus Rodriguez",
                      avatar: "MR",
                      followers: 987,
                      bio: "Product Designer",
                    },
                    {
                      name: "Emma Thompson",
                      avatar: "ET",
                      followers: 756,
                      bio: "Data Scientist",
                    },
                  ].map((thinker, index) => (
                    <motion.div
                      key={thinker.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      <img
                        src={`https://placehold.co/40x40/667eea/ffffff?text=${thinker.avatar}`}
                        alt={thinker.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {thinker.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {thinker.bio}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {thinker.followers} followers
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Explore;
