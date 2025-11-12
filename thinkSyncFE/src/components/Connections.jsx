import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaUserPlus,
  FaMapMarkerAlt,
  FaBriefcase,
  FaStar,
  FaUsers,
  FaUserFriends,
} from "react-icons/fa";
import { BiMessage } from "react-icons/bi";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import useAIRecommendations from "../hooks/useAIRecommendations";
import { showToast } from "../utils/toast";

const Connections = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("my");
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { getRecommendedUsers } = useAIRecommendations();

  // Fetch connections and suggestions
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch following (My Connections)
        const followingRes = await api.get("/follower/following");
        const following = followingRes.data?.data || [];
        setConnections(following);

        // Fetch suggested users
        const recommended = await getRecommendedUsers(20);
        setSuggestions(recommended);
      } catch (err) {
        console.error("Failed to fetch connections:", err);
        showToast.error("Failed to load connections");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, getRecommendedUsers]);

  const tabs = [
    { id: "my", label: "My Connections", count: connections.length },
    { id: "suggestions", label: "Suggestions", count: suggestions.length },
  ];

  const handleConnect = async (userId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await api.post(`/follower/follow/${userId}`);
      showToast.success("User followed successfully!");
      // Refresh suggestions
      const recommended = await getRecommendedUsers(20);
      setSuggestions(recommended);
    } catch (err) {
      console.error("Failed to follow user:", err);
      showToast.error("Failed to follow user");
    }
  };

  const handleMessage = (connection) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const connectionId = connection.id || connection.user_id;
    if (!connectionId) {
      showToast.error("Unable to open chat for this user");
      return;
    }

    const userData = {
      id: connectionId,
      username:
        connection.username ||
        connection.handle ||
        connection.displayName ||
        (connection.profile?.username ?? "user"),
      displayName:
        connection.displayName ||
        connection.name ||
        connection.profile?.displayName ||
        connection.username,
    };

    // 🔥 Call the global chat opener defined in FloatingChatButton
    if (window.handleOpenChat) {
      window.handleOpenChat(userData);
    } else {
      console.error("Chat system not ready");
      showToast.error("Chat system not ready. Please try again.");
    }
  };

  const handleCloseChat = () => setActiveChatUser(null);

  return (
    <div className="w-full">
      <div className="">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-3 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Tabs (pills) */}
          <div className="mb-4 overflow-x-auto">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs bg-white/20 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Connections Grid */}
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading connections...
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Please log in to view connections
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Log In
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(activeTab === "my" ? connections : suggestions)
                .filter((conn) => {
                  if (!searchQuery.trim()) return true;
                  const query = searchQuery.trim().toLowerCase();
                  const textFields = [
                    conn.displayName,
                    conn.username,
                    conn.name,
                    conn.details?.bio,
                    conn.details?.occupation,
                    conn.details?.company,
                    conn.meta?.summary,
                    conn.reason,
                  ];
                  if (
                    textFields.some((field) =>
                      typeof field === "string"
                        ? field.toLowerCase().includes(query)
                        : false
                    )
                  ) {
                    return true;
                  }
                  const topicList =
                    conn.topics ||
                    conn.common_topics ||
                    conn.commonTopics ||
                    conn.meta?.topics ||
                    [];
                  if (
                    Array.isArray(topicList) &&
                    topicList.some((topic) => {
                      if (!topic) return false;
                      if (typeof topic === "string")
                        return topic.toLowerCase().includes(query);
                      const name =
                        topic.name ||
                        topic.title ||
                        topic.topic ||
                        topic.label ||
                        "";
                      return name.toLowerCase().includes(query);
                    })
                  ) {
                    return true;
                  }
                  return false;
                })
                .map((connection, index) => {
                  const connectionId = connection.id || connection.user_id;
                  const username =
                    connection.username ||
                    connection.handle ||
                    connection.profile?.username ||
                    connection.displayName ||
                    "user";
                  const displayName =
                    connection.displayName ||
                    connection.name ||
                    connection.profile?.displayName ||
                    username;
                  const initial = (displayName || username || "U")
                    .charAt(0)
                    .toUpperCase();
                  const avatar =
                    connection.details?.avatar ||
                    connection.avatar ||
                    connection.profile?.avatar ||
                    `https://placehold.co/60x60/667eea/ffffff?text=${initial}`;
                  const bio =
                    connection.details?.bio ||
                    connection.summary ||
                    connection.meta?.summary ||
                    connection.ai_summary ||
                    "";
                  const location =
                    connection.details?.location ||
                    connection.profile?.location ||
                    connection.meta?.location ||
                    connection.city;
                  const occupation =
                    connection.details?.occupation ||
                    connection.profile?.occupation ||
                    connection.meta?.role ||
                    connection.title;
                  const company =
                    connection.details?.company ||
                    connection.profile?.company ||
                    connection.meta?.company;
                  const matchScore =
                    typeof connection.score === "number"
                      ? Math.round(
                          Math.min(Math.max(connection.score, 0), 1) * 100
                        )
                      : null;
                  const reason =
                    connection.reason ||
                    connection.match_reason ||
                    connection.meta?.reason;
                  const mutualTopicsCount =
                    connection.common_topics_count ??
                    connection.meta?.commonTopicsCount ??
                    0;
                  const mutualConnections =
                    connection.mutualConnections ??
                    connection.mutual_connections ??
                    connection.meta?.mutualConnections ??
                    0;
                  const followersCount =
                    connection.stats?.followers ??
                    connection.metrics?.followers ??
                    connection.followersCount ??
                    connection.ai_metrics?.followers;
                  const followingCount =
                    connection.stats?.following ??
                    connection.metrics?.following ??
                    connection.followingCount ??
                    connection.ai_metrics?.following;
                  const postsCount =
                    connection.stats?.posts ??
                    connection.metrics?.posts ??
                    connection.postsCount ??
                    connection.ai_metrics?.posts;
                  const rawTopics =
                    connection.topics ||
                    connection.common_topics ||
                    connection.commonTopics ||
                    connection.meta?.topics ||
                    [];
                  const topTopics = Array.isArray(rawTopics)
                    ? rawTopics
                        .map((topic) => {
                          if (!topic) return null;
                          if (typeof topic === "string") return topic;
                          return (
                            topic.name ||
                            topic.title ||
                            topic.topic ||
                            topic.label ||
                            null
                          );
                        })
                        .filter(Boolean)
                        .slice(0, 4)
                    : [];
                  const expertise =
                    connection.details?.expertise ||
                    connection.meta?.expertise ||
                    connection.ai_profile?.expertise ||
                    connection.focus;

                  return (
                    <motion.div
                      key={`${username}-${connectionId || index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
                    >
                      {/* Connection Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatar}
                            alt={displayName}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                              {displayName}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              @{username}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-xs sm:text-sm">
                          {matchScore !== null && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium">
                              <FaStar className="text-[10px]" />
                              {matchScore}% match
                            </span>
                          )}
                          {reason && (
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 text-right">
                              {reason}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {location && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700/60">
                            <FaMapMarkerAlt className="text-blue-500" />
                            {location}
                          </span>
                        )}
                        {(occupation || company) && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700/60">
                            <FaBriefcase className="text-indigo-500" />
                            {[occupation, company].filter(Boolean).join(" • ")}
                          </span>
                        )}
                        {mutualConnections > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                            <FaUserFriends className="text-[10px]" />
                            {mutualConnections} mutual connections
                          </span>
                        )}
                        {mutualTopicsCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                            <FaUsers className="text-[10px]" />
                            {mutualTopicsCount} shared interests
                          </span>
                        )}
                      </div>

                      {/* Bio / Summary */}
                      {(bio || expertise) && (
                        <div className="mb-3 space-y-2">
                          {bio && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                              {bio}
                            </p>
                          )}
                          {expertise && (
                            <p className="text-xs text-blue-600 dark:text-blue-300 font-medium uppercase tracking-wide">
                              Focus: {expertise}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      {(followersCount || followingCount || postsCount) && (
                        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                          {followersCount !== undefined && (
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {followersCount ?? 0}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Followers
                              </p>
                            </div>
                          )}
                          {followingCount !== undefined && (
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {followingCount ?? 0}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Following
                              </p>
                            </div>
                          )}
                          {postsCount !== undefined && (
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {postsCount ?? 0}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Posts
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Top topics */}
                      {topTopics.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            Shared interests
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {topTopics.map((topic) => (
                              <span
                                key={topic}
                                className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-200 text-xs font-medium"
                              >
                                #{topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action */}
                      <div>
                        {activeTab === "my" ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMessage(connection)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                          >
                            <BiMessage />
                            Message
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConnect(connectionId)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                          >
                            <FaUserPlus />
                            Follow
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              {(activeTab === "my" ? connections : suggestions).length ===
                0 && (
                <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                  {activeTab === "my"
                    ? "No connections yet. Start following users to build your network!"
                    : "No suggestions available at the moment."}
                </div>
              )}
            </div>
          )}

          {/* (Optional) Footer spacing */}
        </motion.div>
      </div>
    </div>
  );
};

export default Connections;
