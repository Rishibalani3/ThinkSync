import { useState } from "react";
import { motion } from "framer-motion";
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
  FaUserFriends,
} from "react-icons/fa";
import { BiMessage } from "react-icons/bi";
const Connections = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const tabs = [
    { id: "my", label: "My Connections", count: 156 },
    { id: "suggestions", label: "Suggestions", count: 45 },
  ];

  const connections = [
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "https://placehold.co/60x60/667eea/ffffff?text=SC",
      username: "@sarahchen",
      bio: "AI Researcher at Stanford",
      location: "San Francisco, CA",
      company: "Stanford University",
      mutualConnections: 12,
      isConnected: true,
      isPending: false,
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      avatar: "https://placehold.co/60x60/667eea/ffffff?text=MR",
      username: "@marcusrod",
      bio: "Product Designer at Figma",
      location: "New York, NY",
      company: "Figma",
      mutualConnections: 8,
      isConnected: true,
      isPending: false,
      lastActive: "1 day ago",
    },
    {
      id: 3,
      name: "Emma Thompson",
      avatar: "https://placehold.co/60x60/667eea/ffffff?text=ET",
      username: "@emmathompson",
      bio: "Data Scientist at Google",
      location: "Mountain View, CA",
      company: "Google",
      mutualConnections: 15,
      isConnected: false,
      isPending: true,
      lastActive: "3 hours ago",
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "https://placehold.co/60x60/667eea/ffffff?text=DK",
      username: "@davidkim",
      bio: "Startup Founder",
      location: "Austin, TX",
      company: "TechStart Inc.",
      mutualConnections: 5,
      isConnected: false,
      isPending: false,
      lastActive: "5 hours ago",
    },
  ];

  const handleConnect = (userId) => {
    console.log("Connect with user:", userId);
  };

  const handleMessage = (userId) => {
    console.log("Message user:", userId);
  };

  const handleRemove = (userId) => {
    console.log("Remove connection:", userId);
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {connections.map((connection, index) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                {/* Connection Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={connection.avatar}
                      alt={connection.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {connection.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
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
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
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
                  </div>
                </div>

                <div>
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMessage(connection.id)}
                      className="w-full flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <BiMessage />
                      Message
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* (Optional) Footer spacing */}
        </motion.div>
      </div>
    </div>
  );
};

export default Connections;
