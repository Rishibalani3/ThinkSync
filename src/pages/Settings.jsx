import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser,
  FaBell,
  FaShieldAlt,
  FaPalette,
  FaGlobe,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaTrash,
  FaDownload,
  FaUpload
} from 'react-icons/fa';
import { useDarkMode } from '../contexts/DarkModeContext';

const Settings = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Product Designer & Creative Thinker. Passionate about innovation, sustainability, and human-centered design.',
    location: 'San Francisco, CA',
    website: 'johndoe.com',
    notifications: {
      email: true,
      push: true,
      mentions: true,
      connections: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      allowMessages: true
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'privacy', label: 'Privacy', icon: FaShieldAlt },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'account', label: 'Account', icon: FaGlobe }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (key) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [key]: !formData.notifications[key]
      }
    });
  };

  const handlePrivacyChange = (key, value) => {
    setFormData({
      ...formData,
      privacy: {
        ...formData.privacy,
        [key]: value
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-4xl mx-auto p-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Settings
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Profile Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(formData.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive notifications for {key}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleNotificationChange(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Privacy Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={formData.privacy.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="friends">Friends Only</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Show Email Address
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Allow others to see your email address
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePrivacyChange('showEmail', !formData.privacy.showEmail)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.privacy.showEmail ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Dark Mode
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleDarkMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isDarkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isDarkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Account Management
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        <FaSave />
                        Save Changes
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                      >
                        <FaTrash />
                        Delete Account
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
