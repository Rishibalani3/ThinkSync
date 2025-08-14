import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSearch,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,

  FaMapMarkerAlt,
  FaBriefcase,

  FaEllipsisH,
  
  FaStar,
  FaUsers,
  FaUserFriends
} from 'react-icons/fa';
import { BiMessage } from 'react-icons/bi';
const Connections = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const tabs = [
    { id: 'all', label: 'All Connections', count: 156 },
    { id: 'mutual', label: 'Mutual', count: 89 },
    { id: 'pending', label: 'Pending', count: 12 },
    { id: 'suggestions', label: 'Suggestions', count: 45 }
  ];

  const connections = [
    {
      id: 1,
      name: 'Sarah Chen',
      avatar: 'https://placehold.co/60x60/667eea/ffffff?text=SC',
      username: '@sarahchen',
      bio: 'AI Researcher at Stanford',
      location: 'San Francisco, CA',
      company: 'Stanford University',
      mutualConnections: 12,
      isConnected: true,
      isPending: false,
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      avatar: 'https://placehold.co/60x60/667eea/ffffff?text=MR',
      username: '@marcusrod',
      bio: 'Product Designer at Figma',
      location: 'New York, NY',
      company: 'Figma',
      mutualConnections: 8,
      isConnected: true,
      isPending: false,
      lastActive: '1 day ago'
    },
    {
      id: 3,
      name: 'Emma Thompson',
      avatar: 'https://placehold.co/60x60/667eea/ffffff?text=ET',
      username: '@emmathompson',
      bio: 'Data Scientist at Google',
      location: 'Mountain View, CA',
      company: 'Google',
      mutualConnections: 15,
      isConnected: false,
      isPending: true,
      lastActive: '3 hours ago'
    },
    {
      id: 4,
      name: 'David Kim',
      avatar: 'https://placehold.co/60x60/667eea/ffffff?text=DK',
      username: '@davidkim',
      bio: 'Startup Founder',
      location: 'Austin, TX',
      company: 'TechStart Inc.',
      mutualConnections: 5,
      isConnected: false,
      isPending: false,
      lastActive: '5 hours ago'
    }
  ];

  const handleConnect = (userId) => {
    console.log('Connect with user:', userId);
  };

  const handleMessage = (userId) => {
    console.log('Message user:', userId);
  };

  const handleRemove = (userId) => {
    console.log('Remove connection:', userId);
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
              Connections
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your network and discover new connections
            </p>
          </div>

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

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                >
                  <option value="recent">Most Recent</option>
                  <option value="name">Name</option>
                  <option value="mutual">Most Mutual</option>
                  <option value="active">Most Active</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
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
          </div>

          {/* Connections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection, index) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Connection Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={connection.avatar}
                      alt={connection.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {connection.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {connection.username}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <FaEllipsisH />
                    </motion.button>
                  </div>
                </div>

                {/* Connection Info */}
                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                    {connection.bio}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaBriefcase className="text-blue-500" />
                      {connection.company}
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-green-500" />
                      {connection.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-purple-500" />
                      {connection.mutualConnections} mutual connections
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      Last active {connection.lastActive}
                    </div>
                  </div>
                </div>

                {/* Connection Actions */}
                <div className="flex gap-2">
                  {connection.isConnected ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMessage(connection.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <BiMessage />
                        Message
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemove(connection.id)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                      >
                        <FaUserTimes />
                      </motion.button>
                    </>
                  ) : connection.isPending ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <FaUserCheck />
                        Accept
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                      >
                        <FaUserTimes />
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleConnect(connection.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <FaUserPlus />
                      Connect
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'Total Connections', value: 156, icon: FaUserFriends, color: 'text-blue-500' },
              { label: 'Mutual Connections', value: 89, icon: FaUsers, color: 'text-green-500' },
              { label: 'Pending Requests', value: 12, icon: FaUserPlus, color: 'text-yellow-500' },
              { label: 'Suggestions', value: 45, icon: FaStar, color: 'text-purple-500' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
                >
                  <Icon className={`text-2xl mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Connections;
