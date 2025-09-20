import { motion } from "framer-motion";
import { FaBell, FaCheck, FaPalette } from "react-icons/fa";
import { HiOutlineColorSwatch } from "react-icons/hi";
import { useDarkMode } from "../../contexts/DarkModeContext";
import ToggleSwitch from "./ToggleSwitch";
const PreferencesSection = ({ userData, setUserData }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-white">
          <FaPalette size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your experience and notifications
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <HiOutlineColorSwatch className="text-purple-500" />
          Theme Preference
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(value) => {
              toggleDarkMode();
              setUserData({
                ...userData,
                themePreference: "dark",
              });
            }}
            className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
              userData.themePreference === "dark"
                ? "border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900 shadow-lg"
                : "border-gray-300 dark:border-gray-500 hover:border-gray-300 dark:hover:border-gray-500"
            } bg-gray-100 dark:bg-gray-800`}
          >
            <div className="text-center space-y-2">
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Dark Mode
              </div>
              {isDarkMode && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <FaCheck className="mx-auto text-blue-500" size={16} />
                </motion.div>
              )}
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              toggleDarkMode();
              setUserData({
                ...userData,
                themePreference: "light",
              });
            }}
            className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
              userData.themePreference === "light"
                ? "border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900 shadow-lg"
                : "border-gray-300 dark:border-gray-500 hover:border-gray-300 dark:hover:border-gray-500"
            } bg-gray-100 dark:bg-gray-800`}
          >
            <div className="text-center space-y-2">
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Light Mode
              </div>

              {!isDarkMode && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <FaCheck className="mx-auto text-blue-500" size={16} />
                </motion.div>
              )}
            </div>
          </motion.button>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FaBell className="text-yellow-500" />
          Notification Settings
        </h3>
        <div className="space-y-3">
          <ToggleSwitch
            enabled={userData.Mailnotification}
            onChange={(e) =>
              setUserData({
                ...userData,
                Mailnotification: e,
              })
            }
            label="Email Notifications"
            description="Receive updates and alerts via email"
          />
          <ToggleSwitch
            enabled={userData.MessageNotification}
            onChange={(e) =>
              setUserData({
                ...userData,
                MessageNotification: e,
              })
            }
            label="Push Notifications"
            description="Get real-time browser notifications"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PreferencesSection;
