import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { BiHelpCircle } from "react-icons/bi";
import { FaLightbulb } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { GiSparkles } from "react-icons/gi";
import ProfileHeader from "./Header";
import Tabs from "./ProfileTabs";
import PostCard from "./PostCard";
const Profile = () => {
  const { user } = useAuth();
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-16">
      <div className="max-w-5xl mx-auto p-3 sm:p-5">
        <ProfileHeader user={user} />

        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl sm:shadow-2xl shadow-blue-500/5 dark:shadow-blue-400/5 overflow-hidden">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-4 sm:p-6 md:p-8 min-h-[50vh]">
            {activeTab === "posts" && (
              <div className="space-y-4 sm:space-y-6">
                {userPosts.map((post, index) => (
                  <div key={post.id} className="">
                    <PostCard
                      post={post}
                      onLike={handleLike}
                      onBookmark={handleBookmark}
                    />
                  </div>
                ))}
              </div>
            )}
            {/* Ideas, Questions, Thoughts Content */}
            {activeTab === "ideas" && (
              <div className="text-center py-12 sm:py-16 relative">
                <FaLightbulb className="text-4xl sm:text-6xl mx-auto mb-4 sm:mb-6 text-yellow-500 animate-pulse" />
                <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                  Your brilliant ideas will shine here ✨
                </p>
              </div>
            )}
            {activeTab === "questions" && (
              <div className="text-center py-12 sm:py-16 relative">
                <BiHelpCircle className="text-4xl sm:text-6xl mx-auto mb-4 sm:mb-6 text-blue-500 animate-bounce" />
                <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                  Your curious questions await answers 🤔
                </p>
              </div>
            )}
            {activeTab === "thoughts" && (
              <div className="text-center py-12 sm:py-16 relative">
                <GiSparkles className="text-4xl sm:text-6xl mx-auto mb-4 sm:mb-6 text-purple-500 animate-spin" />
                <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                  Your creative thoughts will sparkle here ✨
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
