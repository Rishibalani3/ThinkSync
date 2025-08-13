import { motion } from 'framer-motion';
import { BiTrendingUp } from 'react-icons/bi';
import { 
  FaUsers,
  FaLightbulb,
  FaQuestion,
  FaComment,
  FaStar,
  FaPlus,
  FaBell
} from 'react-icons/fa';

const SidebarRight = () => {
  const trendingPosts = [
    {
      id: 1,
      title: 'The future of remote work',
      author: 'Alex Chen',
      likes: 234,
      type: 'idea'
    },
    {
      id: 2,
      title: 'How to stay productive?',
      author: 'Maria Garcia',
      likes: 189,
      type: 'question'
    },
    {
      id: 3,
      title: 'AI in education thoughts',
      author: 'David Kim',
      likes: 156,
      type: 'thought'
    }
  ];

  const suggestedConnections = [
    {
      id: 1,
      name: 'Sarah Wilson',
      avatar: 'https://placehold.co/40x40/667eea/ffffff?text=SW',
      bio: 'AI Researcher',
      mutualConnections: 3
    },
    {
      id: 2,
      name: 'Mike Johnson',
      avatar: 'https://placehold.co/40x40/667eea/ffffff?text=MJ',
      bio: 'Product Designer',
      mutualConnections: 5
    },
    {
      id: 3,
      name: 'Lisa Park',
      avatar: 'https://placehold.co/40x40/667eea/ffffff?text=LP',
      bio: 'Data Scientist',
      mutualConnections: 2
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'idea':
        return <FaLightbulb className="text-yellow-500" />;
      case 'question':
        return <FaQuestion className="text-blue-500" />;
      case 'thought':
        return <FaComment className="text-green-500" />;
      default:
        return <FaLightbulb className="text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Trending Posts */}
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
          {trendingPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
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
                  {post.likes} likes
                </span>
              </div>
            </motion.div>
          ))}
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
          {suggestedConnections.map((connection, index) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <img
                src={connection.avatar}
                alt={connection.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {connection.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {connection.bio}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {connection.mutualConnections} mutual connections
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
              >
                <FaPlus className="text-xs" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 mb-4">
          <FaBell className="text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your Activity
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Posts this week</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">12</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Connections made</span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">8</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Ideas shared</span>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">5</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-lg text-white"
      >
        <h3 className="text-lg font-semibold mb-3">This Week</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm opacity-90">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">23</div>
            <div className="text-sm opacity-90">Likes</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SidebarRight; 