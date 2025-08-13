import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaEdit,
  FaCamera,
  FaMapMarkerAlt,
  FaLink,
  FaCalendarAlt,
  FaLightbulb,
  FaQuestion,
  FaComment,
  FaHeart,
  FaShare,
  FaBookmark,
  FaEllipsisH,
  FaTwitter,
  FaLinkedin,
  FaGithub
} from 'react-icons/fa';
import ThoughtCard from '../components/ThoughtCard';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([
    {
      id: 1,
      author: {
        name: 'John Doe',
        avatar: 'https://placehold.co/40x40/667eea/ffffff?text=JD',
        username: '@johndoe'
      },
      content: 'Just had a breakthrough idea about combining AI with sustainable energy systems. What if we could use machine learning to optimize solar panel efficiency in real-time based on weather patterns? 🌱⚡',
      type: 'idea',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 2,
      author: {
        name: 'John Doe',
        avatar: 'https://placehold.co/40x40/667eea/ffffff?text=JD',
        username: '@johndoe'
      },
      content: 'Question: How do we balance technological advancement with preserving human connection? Are we becoming more connected or more isolated? 🤔',
      type: 'question',
      timestamp: '4 hours ago',
      likes: 15,
      comments: 12,
      shares: 2,
      isLiked: true,
      isBookmarked: false
    }
  ]);

  const handleLike = (postId) => {
    setUserPosts(userPosts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handleBookmark = (postId) => {
    setUserPosts(userPosts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const tabs = [
    { id: 'posts', label: 'Posts', count: userPosts.length },
    { id: 'ideas', label: 'Ideas', count: 8 },
    { id: 'questions', label: 'Questions', count: 5 },
    { id: 'thoughts', label: 'Thoughts', count: 12 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-4xl mx-auto p-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            {/* Cover Photo */}
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <FaCamera />
              </motion.button>
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              <div className="flex items-end gap-6">
                <div className="relative -mt-16">
                  <img
                    src="https://placehold.co/120x120/667eea/ffffff?text=JD"
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  >
                    <FaCamera className="text-sm" />
                  </motion.button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      John Doe
                    </h1>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <FaEdit />
                      Edit Profile
                    </motion.button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    @johndoe
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Product Designer & Creative Thinker. Passionate about innovation, sustainability, and human-centered design.
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt />
                      San Francisco, CA
                    </div>
                    <div className="flex items-center gap-2">
                      <FaLink />
                      <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                        johndoe.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt />
                      Joined March 2023
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center gap-3">
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href="#"
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full transition-colors"
                    >
                      <FaTwitter />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href="#"
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full transition-colors"
                    >
                      <FaLinkedin />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href="#"
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full transition-colors"
                    >
                      <FaGithub />
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Posts', value: 25, icon: FaComment },
              { label: 'Ideas', value: 8, icon: FaLightbulb },
              { label: 'Questions', value: 5, icon: FaQuestion },
              { label: 'Connections', value: 156, icon: FaHeart }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
                >
                  <Icon className="text-2xl text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {userPosts.map((post, index) => (
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
              )}
              {activeTab === 'ideas' && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaLightbulb className="text-4xl mx-auto mb-4 text-yellow-500" />
                  <p>Your ideas will appear here</p>
                </div>
              )}
              {activeTab === 'questions' && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaQuestion className="text-4xl mx-auto mb-4 text-blue-500" />
                  <p>Your questions will appear here</p>
                </div>
              )}
              {activeTab === 'thoughts' && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaComment className="text-4xl mx-auto mb-4 text-green-500" />
                  <p>Your thoughts will appear here</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
