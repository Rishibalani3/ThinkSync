import { useState } from "react";
import { BiBookmark, BiHelpCircle, BiTrendingUp } from "react-icons/bi";
import {
  FaCalendar,
  FaCamera,
  FaEdit,
  FaGithub,
  FaHeart,
  FaIcons,
  FaLightbulb,
  FaLink,
  FaLinkedin,
  FaMapPin,
  FaShare,
  FaStar,
  FaTwitter,
} from "react-icons/fa";
import { FiMessageCircle, FiZap } from "react-icons/fi";
import { GiSparkles } from "react-icons/gi";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([
    {
      id: 1,
      author: {
        name: "John Doe",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=JD",
        username: "@johndoe",
      },
      content:
        "Just had a breakthrough idea about combining AI with sustainable energy systems. What if we could use machine learning to optimize solar panel efficiency in real-time based on weather patterns? 🌱⚡",
      type: "idea",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: 2,
      author: {
        name: "John Doe",
        avatar: "https://placehold.co/40x40/667eea/ffffff?text=JD",
        username: "@johndoe",
      },
      content:
        "Question: How do we balance technological advancement with preserving human connection? Are we becoming more connected or more isolated? 🤔",
      type: "question",
      timestamp: "4 hours ago",
      likes: 15,
      comments: 12,
      shares: 2,
      isLiked: true,
      isBookmarked: false,
    },
  ]);

  const { user } = useAuth();

  const handleLike = (postId) => {
    setUserPosts(
      userPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  const handleBookmark = (postId) => {
    setUserPosts(
      userPosts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const tabs = [
    {
      id: "posts",
      label: "Posts",
      count: userPosts.length,
      icon: FiMessageCircle,
    },
    { id: "ideas", label: "Ideas", count: 8, icon: FaLightbulb },
    { id: "questions", label: "Questions", count: 5, icon: BiHelpCircle },
    { id: "thoughts", label: "Thoughts", count: 12, icon: GiSparkles },
  ];

  const ThoughtCard = ({ post, onLike, onBookmark }) => (
    <div className="group bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-400 dark:group-hover:ring-blue-500 transition-all duration-300"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
              {post.author.name}
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
              {post.author.username} • {post.timestamp}
            </p>
          </div>
          <div
            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              post.type === "idea"
                ? "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200 ring-1 ring-yellow-200 dark:ring-yellow-700"
                : "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 ring-1 ring-blue-200 dark:ring-blue-700"
            }`}
          >
            <div className="flex items-center gap-1">
              {post.type === "idea" ? (
                <FaLightbulb size={10} className="sm:w-3 sm:h-3" />
              ) : (
                <BiHelpCircle size={10} className="sm:w-3 sm:h-3" />
              )}
              <span className="hidden sm:inline">
                {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
              </span>
              <span className="sm:hidden">
                {post.type.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-sm sm:text-base">
          {post.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 ${
                post.isLiked
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              }`}
            >
              <FaHeart
                size={16}
                className="sm:w-5 sm:h-5"
                fill={post.isLiked ? "currentColor" : "none"}
              />
              <span className="hidden sm:inline">{post.likes}</span>
              <span className="sm:hidden text-xs">{post.likes}</span>
            </button>
            <button className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 hover:scale-105">
              <FiMessageCircle size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{post.comments}</span>
              <span className="sm:hidden text-xs">{post.comments}</span>
            </button>
            <button className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-all duration-300 hover:scale-105">
              <FaShare size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{post.shares}</span>
              <span className="sm:hidden text-xs">{post.shares}</span>
            </button>
          </div>
          <button
            onClick={() => onBookmark(post.id)}
            className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 ${
              post.isBookmarked
                ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                : "text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            }`}
          >
            <BiBookmark
              size={14}
              className="sm:w-4 sm:h-4"
              fill={post.isBookmarked ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-16 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-10 sm:-right-20 w-32 h-32 sm:w-72 sm:h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-10 sm:-left-20 w-32 h-32 sm:w-72 sm:h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto p-3 sm:p-5 relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden mb-6 sm:mb-8 shadow-xl sm:shadow-2xl shadow-blue-500/5 dark:shadow-blue-400/5">
          <div className="relative h-32 sm:h-48 md:h-56  overflow-hidden">
            <img
              src="https://media.licdn.com/dms/image/sync/v2/D4E27AQEo5TeLjgO3lQ/articleshare-shrink_800/articleshare-shrink_800/0/1711517383801?e=2147483647&v=beta&t=UYTn5T4fXCc9XqzYDmz2M3CCTWMzoYwdtFS9h2rm9WE"
              alt="Profile"
              className="w-full h-full object-cover object-center"
            />
            <button className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:rotate-12 group">
              <FaCamera
                size={16}
                className="sm:w-5 sm:h-5 group-hover:animate-pulse"
              />
            </button>

            {/* Profile stats floating badges - responsive */}
            <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="px-2 py-1 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                <BiTrendingUp size={12} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Top Creator</span>
                <span className="sm:hidden">Top</span>
              </div>
              <div className="px-2 py-1 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                <FaStar size={12} className="sm:w-4 sm:h-4" />
                <span>4.8</span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="relative px-4 pb-4 sm:px-8 sm:pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
              <div className="relative -mt-12 sm:-mt-20 self-center sm:self-auto">
                <div className="relative group">
                  {console.log(user.details.avatar)}
                  <img
                    src={user.details.avatar}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 md:w-36 sm:h-32 md:h-36 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-white dark:border-gray-800 shadow-xl sm:shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-lg">
                    <FaCamera size={12} className="sm:w-4 sm:h-4" />
                  </button>

                  {/* Status indicator */}
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 sm:border-3 border-white dark:border-gray-800 animate-pulse" />
                </div>
              </div>

              <div className="flex-1 pt-2 sm:pt-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-3">
                  <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      {user.displayName}
                    </h1>
                  </div>
                  <button className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 group mx-auto sm:mx-0">
                    <FaEdit
                      size={16}
                      className="sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300"
                    />
                    <span className="text-sm sm:text-base">Edit Profile</span>
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium text-sm sm:text-base">
                  @{user.username}
                </p>

                <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  {user.details.bio}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                  {user.location ? (
                    <div className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                      <FaMapPin size={14} className="sm:w-4 sm:h-4" />
                      {user.location}
                    </div>
                  ) : (
                    ""
                  )}
                  {user.link ? (
                    <div className="flex items-center gap-2">
                      <FaLink size={14} className="sm:w-4 sm:h-4" />
                      <a
                        href="#"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                      >
                        {user.website || ""}
                      </a>
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="flex items-center gap-2">
                    <FaCalendar size={14} className="sm:w-4 sm:h-4" />
                    {user.createdAt
                      .split("T")[0]
                      .split("-")
                      .reverse()
                      .join("/") || ""}
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
                  {[
                    {
                      icon: FaTwitter,
                      color:
                        "hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                      href: user.githubLink,
                    },
                    {
                      icon: FaLinkedin,
                      color:
                        "hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                      href: user.linkedinLink,
                    },
                    {
                      icon: FaGithub,
                      color:
                        "hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700",
                      href: user.githubLink,
                    },
                  ].map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className={`p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${social.color}`}
                      >
                        <Icon size={16} className="sm:w-5 sm:h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 mb-6 sm:mb-8 shadow-xl sm:shadow-2xl shadow-blue-500/5 dark:shadow-blue-400/5 overflow-hidden">
          <div className="flex border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-fit px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-300 relative group ${
                    activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <Icon
                      size={16}
                      className={`sm:w-5 sm:h-5 transition-all duration-300 ${
                        activeTab === tab.id
                          ? "scale-110"
                          : "group-hover:scale-105"
                      }`}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.slice(0, 1)}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 sm:w-16 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {activeTab === "posts" && (
              <div className="space-y-4 sm:space-y-6">
                {userPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ThoughtCard
                      post={post}
                      onLike={handleLike}
                      onBookmark={handleBookmark}
                    />
                  </div>
                ))}
              </div>
            )}
            {activeTab === "ideas" && (
              <div className="text-center py-12 sm:py-16 relative">
                <div className="relative inline-block">
                  <FaLightbulb className="text-4xl sm:text-6xl mx-auto mb-4 sm:mb-6 text-yellow-500 animate-pulse" />
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-ping" />
                </div>
                <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                  Your brilliant ideas will shine here ✨
                </p>
              </div>
            )}
            {activeTab === "questions" && (
              <div className="text-center py-12 sm:py-16 relative">
                <div className="relative inline-block">
                  <BiHelpCircle className="text-4xl sm:text-6xl mx-auto mb-4 sm:mb-6 text-blue-500 animate-bounce" />
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
                </div>
                <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                  Your curious questions await answers 🤔
                </p>
              </div>
            )}
            {activeTab === "thoughts" && (
              <div className="text-center py-12 sm:py-16 relative">
                <div className="relative inline-block">
                  <GiSparkles className="text-4xl sm:text-6xl mx-auto mb-4 sm:mb-6 text-purple-500 animate-spin" />
                  <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl animate-pulse" />
                </div>
                <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                  Your creative thoughts will sparkle here ✨
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
