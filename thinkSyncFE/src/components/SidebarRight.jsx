import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BiTrendingUp } from "react-icons/bi";
import {
  FaUsers,
  FaLightbulb,
  FaQuestion,
  FaComment,
  FaStar,
  FaPlus,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import useAIRecommendations from "../hooks/useAIRecommendations";
import useTopics from "../hooks/useTopics";
import api from "../utils/axios";

const SidebarRight = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { getAITrendingPosts } = useAIRecommendations();
  const { getTrendingPosts } = useTopics();
  const { getRecommendedUsers } = useAIRecommendations();
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedConnections, setSuggestedConnections] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // Fetch trending posts
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      setLoadingPosts(true);
      try {
        let posts = await getAITrendingPosts(3); // Limit to top 3
        
        if (!posts || posts.length === 0) {
          posts = await getTrendingPosts();
        }

        // Transform posts to match component format
        const transformedPosts = posts.slice(0, 3).map((post) => ({ // Top 3 only
          id: post.id,
          title: post.content?.substring(0, 50) + (post.content?.length > 50 ? "..." : ""),
          author: post.author?.displayName || post.author?.username || "Anonymous",
          likes: post.likesCount || post.score || 0,
          type: post.type || "idea",
        }));

        setTrendingPosts(transformedPosts);
      } catch (error) {
        console.error("Error fetching trending posts:", error);
        setTrendingPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchTrendingPosts();
  }, [getAITrendingPosts, getTrendingPosts]);

  // Fetch recommended users (suggested connections)
  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingConnections(false);
      return;
    }

    const fetchRecommendedUsers = async () => {
      setLoadingConnections(true);
      try {
        const users = await getRecommendedUsers(5); // Get 5 suggestions

        let transformedUsers = (users || []).map((rec) => {
          const displayName = rec.displayName || rec.username || "User";
          const initial = displayName.charAt(0).toUpperCase();
          return {
            id: rec.user_id || rec.id,
            name: displayName,
            avatar:
              rec.avatar ||
              rec.details?.avatar ||
              `https://placehold.co/40x40/667eea/ffffff?text=${initial}`,
            bio: rec.bio || rec.summary || rec.reason || "",
            mutualConnections:
              rec.commonTopicsCount ??
              rec.common_topics_count ??
              rec.mutualConnections ??
              0,
            username: rec.username,
            isFollowing: rec.isFollowing || false,
            matchScore:
              typeof rec.score === "number"
                ? Math.round(Math.min(Math.max(rec.score, 0), 1) * 100)
                : null,
            reason: rec.reason,
          };
        });

        if (!transformedUsers.length) {
          const fallbackRes = await api.get("/follower/following");
          const fallbackUsers = fallbackRes.data?.data || [];
          transformedUsers = fallbackUsers.slice(0, 5).map((u) => {
            const displayName = u.displayName || u.username || "User";
            const initial = displayName.charAt(0).toUpperCase();
            return {
              id: u.id,
              name: displayName,
              avatar:
                u.details?.avatar ||
                `https://placehold.co/40x40/667eea/ffffff?text=${initial}`,
              bio: u.details?.bio || "From your network",
              mutualConnections: u.details?.mutualConnections || 0,
              username: u.username,
              isFollowing: true,
              matchScore: null,
              reason: "Already in your network",
            };
          });
        }

        setSuggestedConnections(transformedUsers);
      } catch (error) {
        console.error("Error fetching recommended users:", error);
        setSuggestedConnections([]);
      } finally {
        setLoadingConnections(false);
      }
    };

    fetchRecommendedUsers();
  }, [isAuthenticated, getRecommendedUsers]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "idea":
        return <FaLightbulb className="text-yellow-500" />;
      case "question":
        return <FaQuestion className="text-blue-500" />;
      case "thought":
        return <FaComment className="text-green-500" />;
      default:
        return <FaLightbulb className="text-yellow-500" />;
    }
  };

  const handleGuestAction = () => {
    if (!isAuthenticated) {
      alert("Please log in to access this feature.");
      navigate("/login");
    }
  };

  return (
    <div className="space-y-6">
      {/* Trending */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 mb-4">
          <BiTrendingUp className="text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Trending
          </h3>
        </div>
        <div className="space-y-3">
          {loadingPosts ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Loading...
            </div>
          ) : trendingPosts.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No trending posts
            </div>
          ) : (
            trendingPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => {
                  if (isAuthenticated) {
                    navigate(`/post/${post.id}`);
                  } else {
                    handleGuestAction();
                  }
                }}
              >
                <div className="flex items-start gap-2">
                  {getTypeIcon(post.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      by {post.author}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(post.likes)} likes
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Suggested Connections */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 mb-4">
          <FaUsers className="text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Suggested Connections
          </h3>
        </div>
        <div className="space-y-3">
          {!isAuthenticated ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              <p>Sign in to see suggestions</p>
            </div>
          ) : loadingConnections ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Loading...
            </div>
          ) : suggestedConnections.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No suggestions available
            </div>
          ) : (
            suggestedConnections.map((connection, index) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => navigate(`/profile/${connection.username}`)}
              >
                <img
                  src={connection.avatar}
                  alt={connection.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {connection.name}
                  </h4>
                  {connection.matchScore !== null && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {connection.matchScore}% match
                    </p>
                  )}
                  {connection.reason && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {connection.reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {connection.bio}
                  </p>
                  {connection.mutualConnections > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {connection.mutualConnections} common {connection.mutualConnections === 1 ? 'interest' : 'interests'}
                    </p>
                  )}
                </div>
                {!connection.isFollowing && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${connection.username}`);
                    }}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  >
                    <FaPlus className="text-xs" />
                  </motion.button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SidebarRight;
